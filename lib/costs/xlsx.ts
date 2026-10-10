import {inflateRawSync} from 'node:zlib';
import {XMLParser,XMLValidator} from 'fast-xml-parser';
const MAX=8*1024*1024;
function crc32(data:Buffer){let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
export function unzipWorkbook(bytes:Buffer){
 if(bytes.length<22||bytes.length>5*1024*1024)throw new Error('Use an XLSX report up to 5 MB.');let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(bytes.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0||bytes.readUInt16LE(end+4)!==0||bytes.readUInt16LE(end+6)!==0)throw new Error('Unsupported XLSX archive.');
 const count=bytes.readUInt16LE(end+10),size=bytes.readUInt32LE(end+12),offset=bytes.readUInt32LE(end+16);if(count>100||offset+size>end)throw new Error('Workbook archive exceeds supported limits.');
 const entries=new Map<string,Buffer>();let at=offset,total=0;
 for(let i=0;i<count;i++){
  if(at+46>bytes.length||bytes.readUInt32LE(at)!==0x02014b50)throw new Error('Invalid workbook directory.');const flags=bytes.readUInt16LE(at+8),method=bytes.readUInt16LE(at+10),crc=bytes.readUInt32LE(at+16),compressed=bytes.readUInt32LE(at+20),length=bytes.readUInt32LE(at+24),nameLength=bytes.readUInt16LE(at+28),extra=bytes.readUInt16LE(at+30),comment=bytes.readUInt16LE(at+32),local=bytes.readUInt32LE(at+42);
  if(at+46+nameLength+extra+comment>offset+size||flags&1||![0,8].includes(method)||length>MAX||compressed>bytes.length)throw new Error('Unsupported or oversized workbook entry.');const name=bytes.subarray(at+46,at+46+nameLength).toString('utf8');at+=46+nameLength+extra+comment;
  if(entries.has(name)||name.includes('..')||name.startsWith('/'))throw new Error('Invalid workbook entry path.');
  if(local+30>bytes.length||bytes.readUInt32LE(local)!==0x04034b50)throw new Error('Invalid workbook entry.');const localName=bytes.readUInt16LE(local+26);if(bytes.readUInt16LE(local+8)!==method||bytes.readUInt16LE(local+6)!==flags||bytes.subarray(local+30,local+30+localName).toString('utf8')!==name)throw new Error('Workbook headers do not match.');const start=local+30+localName+bytes.readUInt16LE(local+28);if(start+compressed>offset)throw new Error('Workbook entry is truncated.');
  total+=length;if(total>MAX)throw new Error('Expanded workbook exceeds 8 MB.');const source=bytes.subarray(start,start+compressed);const data=method===0?source:inflateRawSync(source,{maxOutputLength:MAX});if(data.length!==length||crc32(data)!==crc)throw new Error('Workbook data failed its integrity check.');entries.set(name,data);
 }return entries;
}
const parser=new XMLParser({ignoreAttributes:false,parseTagValue:false,parseAttributeValue:false,removeNSPrefix:true,isArray:name=>['row','c','si','r','sheet','Relationship'].includes(name)});
function xml(buffer:Buffer|undefined){if(!buffer)throw new Error('Workbook XML is missing.');const source=buffer.toString('utf8');if(/<!DOCTYPE|<!ENTITY/i.test(source)||XMLValidator.validate(source)!==true)throw new Error('Unsupported workbook XML.');return parser.parse(source);}
function content(value:unknown):string{if(typeof value==='string')return value;if(value&&typeof value==='object'&&'#text' in value)return String((value as Record<string,unknown>)['#text']);return '';}
export function workbookRows(bytes:Buffer){
 const entries=unzipWorkbook(bytes),book=xml(entries.get('xl/workbook.xml')),rels=xml(entries.get('xl/_rels/workbook.xml.rels'));
 const strings=entries.has('xl/sharedStrings.xml')?(xml(entries.get('xl/sharedStrings.xml')).sst.si||[]).map((s:{t?:unknown;r?:{t:unknown}[]})=>s.r?s.r.map(r=>content(r.t)).join(''):content(s.t)):[];
 const result=new Map<string,Record<string,string>[]>();for(const sheet of book.workbook.sheets.sheet){const rel=rels.Relationships.Relationship.find((r:Record<string,string>)=>r['@_Id']===sheet['@_id']);if(!rel||rel['@_TargetMode']==='External')throw new Error('Unsupported workbook sheet relationship.');const target=rel['@_Target'].startsWith('/')?rel['@_Target'].slice(1):'xl/'+rel['@_Target'];if(!/^xl\/worksheets\/sheet\d+\.xml$/.test(target))throw new Error('Unsupported sheet path.');
 const rows:Record<string,string>[]=[];const sheetXml=xml(entries.get(target));for(const row of sheetXml.worksheet.sheetData.row||[]){const cells:Record<string,string>={};for(const c of row.c||[]){if(c.f!==undefined)throw new Error('Formula cells are not supported; use the original broker export.');const col=String(c['@_r']).replace(/\d/g,'');if(!/^[A-Z]{1,3}$/.test(col))throw new Error('Unsupported cell reference.');let value=content(c.v);if(c['@_t']==='s'){if(!/^\d+$/.test(value)||Number(value)>=strings.length)throw new Error('Invalid shared string reference.');value=strings[Number(value)];}else if(c['@_t']==='inlineStr')value=c.is?.r?c.is.r.map((r:{t:unknown})=>content(r.t)).join(''):content(c.is?.t);else if(c['@_t']==='e')throw new Error('Workbook contains an error cell.');cells[col]=value;}rows.push(cells);}result.set(sheet['@_name'],rows);
 }return result;
}
