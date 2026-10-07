'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { validateDisplayName } from '@/lib/auth/profile';
export async function saveProfile(_previous:{message:string;success?:boolean},form:FormData):Promise<{message:string;success?:boolean}> {
 const {name,error:validationError}=validateDisplayName(form.get('name'));
 if(validationError)return {message:validationError};
 const client=await createClient();
 if(!client)return {message:'Account settings are not configured.'};
 const {data,error:authError}=await client.auth.getUser();
 if(authError||!data.user)return {message:'Your session has expired. Log in again before saving.'};
 const {data:profile,error}=await client.from('profiles').update({display_name:name}).eq('id',data.user.id).select('display_name').single();
 if(error||!profile)return {message:'Unable to save your profile. Please try again.'};
 revalidatePath('/','layout');
 return {success:true,message:'Your display name has been saved.'};
}
