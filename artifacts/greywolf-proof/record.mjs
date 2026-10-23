import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const root=new URL('.',import.meta.url).pathname;
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1100},deviceScaleFactor:1});
await page.goto('file://'+root+'index.html');await page.evaluate(()=>window.proofReady);
console.log('Recording 20-second live canvas sequence.');
const recording=await page.evaluate(async()=>{
  const canvas=document.getElementById('film');
  const stream=canvas.captureStream(30);
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:14000000});
  const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const finished=new Promise(resolve=>recorder.onstop=resolve);
  window.proof.render(0);recorder.start();
  let frames=0;const start=performance.now();
  await new Promise(resolve=>{function step(now){const t=Math.min(20,(now-start)/1000);window.proof.render(t);frames++;if(t<20)requestAnimationFrame(step);else resolve()}requestAnimationFrame(step)});
  recorder.stop();await finished;stream.getTracks().forEach(t=>t.stop());
  const bytes=new Uint8Array(await new Blob(chunks,{type:mime}).arrayBuffer());
  let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
  return {base64:btoa(binary),frames,elapsed:(performance.now()-start)/1000};
});
await fs.writeFile(root+'proof-silent.webm',Buffer.from(recording.base64,'base64'));
await fs.writeFile(root+'recording-checks.json',JSON.stringify({frames:recording.frames,elapsed:recording.elapsed},null,2));
for(const [time,name]of [[4.6,'proof-source.png'],[9.6,'proof-flag.png'],[12,'proof-source-detail.png'],[16.6,'proof-checked.png'],[19.7,'poster.png']]){
  await page.evaluate(t=>window.proof.render(t),time);
  await fs.writeFile(root+name,await page.locator('#film').screenshot());
}
await browser.close();console.log(`Recorded ${recording.frames} frames in ${recording.elapsed.toFixed(2)}s.`);
