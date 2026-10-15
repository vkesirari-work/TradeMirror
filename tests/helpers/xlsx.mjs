export function zip(files){const locals=[],centrals=[];let offset=0;for(const [name,text] of files){const n=Buffer.from(name),data=Buffer.from(text);let crc=0xffffffff;for(const b of data){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(n.length,26);const local=Buffer.concat([h,n,data]);locals.push(local);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);centrals.push(Buffer.concat([c,n]));offset+=local.length;}const central=Buffer.concat(centrals),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,central,end]);}

// Small synthetic OOXML fixture: no user workbook or private financial data.
export function workbook(sheets){
 const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const files=[];let index=0;const descriptions=[];const relationships=[];
 for(const [name,rows] of sheets){index++;descriptions.push(`<sheet name="${escape(name)}" r:id="rId${index}"/>`);relationships.push(`<Relationship Id="rId${index}" Target="worksheets/sheet${index}.xml"/>`);
  const content=rows.map((row,i)=>`<row r="${i+1}">${Object.entries(row).map(([column,value])=>`<c r="${column}${i+1}"${/^-?\d+(?:\.\d+)?$/.test(value)?`><v>${value}</v>`:` t="inlineStr"><is><t>${escape(value)}</t></is>`}</c>`).join('')}</row>`).join('');
  files.push([`xl/worksheets/sheet${index}.xml`,`<worksheet><sheetData>${content}</sheetData></worksheet>`]);
 }
 files.push(['xl/workbook.xml',`<workbook><sheets>${descriptions.join('')}</sheets></workbook>`],['xl/_rels/workbook.xml.rels',`<Relationships>${relationships.join('')}</Relationships>`]);
 return zip(files);
}
