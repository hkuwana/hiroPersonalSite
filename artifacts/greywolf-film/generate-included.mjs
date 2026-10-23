import {spawnSync,spawn} from 'node:child_process';
import fs from 'node:fs';import crypto from 'node:crypto';
const root=new URL('.',import.meta.url).pathname;
const voices=JSON.parse(fs.readFileSync(root+'included-voices.json','utf8'));
const voice=voices.find(v=>v.name.startsWith('Chris -')&&v.category==='premade');
if(!voice)throw Error('Selected included voice not present in live account results.');
if(fs.existsSync(root+'narration-chris-cli.mp3'))throw Error('Completed audio exists. Refusing to generate another take.');
const text=fs.readFileSync(root+'narration.txt','utf8').trim();const body=JSON.stringify({text,model_id:'eleven_v4'});
const args=['-y','@elevenlabs/cli@latest','text-to-speech','convert_with_timestamps','--voice-id',voice.voice_id,'--output-format','mp3_44100_128','--no-retry','--format','json','--json','-'];
const dry=spawnSync('npx',[...args,'--dry-run'],{input:body,encoding:'utf8',maxBuffer:1024*1024});if(dry.status!==0){console.error(dry.stdout,dry.stderr);process.exit(1)}
console.log('Validated. Sending one full-script take with '+voice.name+'.');
const child=spawn('npx',args,{stdio:['pipe','pipe','pipe']});let output='',errors='';child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>errors+=x);child.stdin.end(body);
child.on('close',code=>{const receipt={route:'Official ElevenLabs CLI / direct convert_with_timestamps',model_id:'eleven_v4',voice,script_sha256:crypto.createHash('sha256').update(text).digest('hex'),script_characters:text.length,takes:1,automatic_retries:false,exit_code:code,completed_at:new Date().toISOString()};
if(code!==0){receipt.error_stdout=output;receipt.error_stderr=errors;fs.writeFileSync(root+'included-cli-request.json',JSON.stringify(receipt,null,2));console.error(output,errors);process.exitCode=code;return;}
try{const d=JSON.parse(output);if(!d.audio_base64)throw Error('No audio in response.');const a=Buffer.from(d.audio_base64,'base64');fs.writeFileSync(root+'narration-chris-cli.mp3',a);delete d.audio_base64;fs.writeFileSync(root+'narration-chris-alignment.json',JSON.stringify(d,null,2));receipt.audio_bytes=a.length;receipt.response_keys=Object.keys(d);fs.writeFileSync(root+'included-cli-request.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));}catch(e){fs.writeFileSync(root+'included-cli-unparsed.json',output);console.error(e.message);process.exitCode=1;}});
