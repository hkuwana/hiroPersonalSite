import fs from 'node:fs/promises';
import {selectFacts,validate} from './engine.mjs';
const root=new URL('.',import.meta.url).pathname;
const data=JSON.parse(await fs.readFile(root+'proof-data.json','utf8'));
let html=await fs.readFile(root+'index.template.html','utf8');
const encoded=async name=>(await fs.readFile(root+name)).toString('base64');
const replacements={__SERIF__:await encoded('source/fraunces.woff2'),__SANS__:await encoded('source/plex.woff2'),__EXCERPT__:'data:image/png;base64,'+await encoded('source/statement-excerpt.png'),__PAGE__:'data:image/png;base64,'+await encoded('source/statement-page.png'),__DATA__:JSON.stringify(data),__ENGINE__:(await fs.readFile(root+'engine.mjs','utf8')).replace(/^export /gm,'')};
replacements.__AUDIO__='data:audio/wav;base64,'+await encoded('proof-audio.wav');
for(const [key,value]of Object.entries(replacements))html=html.replaceAll(key,value);
await fs.writeFile(root+'index.html',html);
const quarter=validate(data,selectFacts(data,'quarter')),seeded=validate(data,selectFacts(data,'seeded'));
if(!quarter.ok||quarter.difference!==0||seeded.ok||seeded.difference!==52985)throw Error('Core reconciliation failed');
for(const [name,mutate]of [
  ['missing value',s=>{s[1].value=null}],['wrong date',s=>{s[1].periodEnd='2024-06-29'}],
  ['wrong units',s=>{s[1].unit='USD thousands'}],['duplicate metric',s=>s.push(s[0])],
  ['wrong value',s=>{s[1].value+=1}],['changed period with correct amount',s=>{s[1].months=9}]
]){const s=selectFacts(data,'quarter');mutate(s);if(validate(data,s).ok)throw Error('Failed to catch '+name)}
await fs.writeFile(root+'checks.json',JSON.stringify({sourceSha256:data.sha256,quarter,seeded,additionalChecks:['missing value','wrong date','wrong units','duplicate metric','wrong value','changed period with correct amount']},null,2));
console.log('Standalone example built. Quarter reconciles; seeded error and six additional invalid inputs fail.');
