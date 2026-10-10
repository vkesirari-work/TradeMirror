begin;
-- Narrow transactional writer: ownership always comes from auth.uid(), never caller input.
create function public.import_zerodha_executions(p_file_name text, p_records jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog as $$
declare
 owner_id uuid := auth.uid(); batch_id uuid; v_fingerprint text; record jsonb;
 execution_key text; raw_id uuid; existing public.orders%rowtype;
 inserted_count integer := 0; duplicate_count integer := 0; normalized jsonb;
begin
 if owner_id is null then raise exception 'Authentication required'; end if;
 if p_file_name is null or char_length(p_file_name) not between 1 and 255 then raise exception 'Invalid file name'; end if;
 if p_records is null or jsonb_typeof(p_records) <> 'array' then raise exception 'Invalid execution array'; end if;
 if jsonb_array_length(p_records) not between 1 and 10000 or octet_length(p_records::text)>10485760 then raise exception 'Invalid batch size'; end if;
 -- Serialize all imports for this account, including overlapping files.
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
 select jsonb_agg(value - 'key' order by value->>'exchange',value->>'segment',value->>'executedAt',value->>'tradeId') into normalized from jsonb_array_elements(p_records);
 v_fingerprint := encode(sha256(convert_to(normalized::text,'UTF8')),'hex');
 select id into batch_id from public.broker_imports where user_id=owner_id and broker='ZERODHA' and broker_imports.fingerprint=v_fingerprint;
 if batch_id is not null then return jsonb_build_object('import_id',batch_id,'inserted',0,'duplicates',jsonb_array_length(p_records),'already_imported',true); end if;
 insert into public.broker_imports(user_id,broker,source,file_name,fingerprint,status,row_count)
 values(owner_id,'ZERODHA','CSV',p_file_name,v_fingerprint,'PROCESSING',jsonb_array_length(p_records)) returning id into batch_id;
 for record in select value from jsonb_array_elements(p_records) loop
  if jsonb_typeof(record)<>'object' or coalesce(record->>'symbol','')='' or char_length(record->>'symbol')>120
   or coalesce(record->>'exchange','')='' or coalesce(record->>'segment','')='' or coalesce(record->>'tradeId','')=''
   or coalesce(record->>'orderId','')='' or coalesce(record->>'side','') not in ('BUY','SELL')
   or coalesce(record->>'quantity','') !~ '^\d{1,14}(\.\d{1,4})?$' or (record->>'quantity')::numeric<=0
   or coalesce(record->>'price','') !~ '^\d{1,14}(\.\d{1,4})?$'
   or coalesce(record->>'executedAt','') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$'
  then raise exception 'Invalid execution'; end if;
  -- Recompute identity in the database. Caller-supplied keys cannot bypass deduplication.
  execution_key := jsonb_build_array(record->>'exchange',record->>'segment',left(record->>'executedAt',10),record->>'tradeId')::text;
  select * into existing from public.orders where user_id=owner_id and broker='ZERODHA' and execution_id=execution_key;
  if found then
   if existing.instrument <> record->>'symbol' or existing.side <> record->>'side'
    or existing.quantity <> (record->>'quantity')::numeric or existing.price <> (record->>'price')::numeric
    or existing.executed_at <> (record->>'executedAt')::timestamptz or existing.broker_order_id <> record->>'orderId'
   then raise exception 'Conflicting execution ID'; end if;
   duplicate_count := duplicate_count+1;
  else
   insert into public.raw_broker_records(user_id,import_id,record_key,payload)
   values(owner_id,batch_id,execution_key,record) returning id into raw_id;
   insert into public.orders(user_id,broker,broker_order_id,execution_id,raw_data_id,instrument,side,quantity,price,executed_at)
   values(owner_id,'ZERODHA',record->>'orderId',execution_key,raw_id,record->>'symbol',record->>'side',(record->>'quantity')::numeric,(record->>'price')::numeric,(record->>'executedAt')::timestamptz);
   inserted_count := inserted_count+1;
  end if;
 end loop;
 update public.broker_imports set status='COMPLETED' where id=batch_id;
 return jsonb_build_object('import_id',batch_id,'inserted',inserted_count,'duplicates',duplicate_count,'already_imported',false);
end;
$$;
revoke all on function public.import_zerodha_executions(text,jsonb) from public,anon;
grant execute on function public.import_zerodha_executions(text,jsonb) to authenticated;
commit;
