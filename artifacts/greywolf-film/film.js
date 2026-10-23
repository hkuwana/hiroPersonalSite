const SCENES=__SCENES__,CUES=__CUES__;
__EXAMPLES__
const MONEY=n=>'$'+(n/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
function fade(p,fn){ctx.save();ctx.globalAlpha=clamp(p);fn();ctx.restore()}
function dash(x,y,w,h,color=C.rose){ctx.save();ctx.setLineDash([7,7]);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);ctx.restore()}
function wrap(s,x,y,maxWidth,size=23,color=C.ink,font='Plex',leading=1.4){ctx.font=`${font==='Fraunces'?500:400} ${size}px ${font}`;let row='',yy=y;for(const word of s.split(' ')){const next=row?row+' '+word:word;if(ctx.measureText(next).width>maxWidth&&row){text(row,x,yy,size,color,font);row=word;yy+=size*leading}else row=next}text(row,x,yy,size,color,font);return yy+size*leading}
function route(x1,y1,x2,y2,p=1,color=C.ink,curve=0){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(x1+(x2-x1)*.45,y1+curve,x1+(x2-x1)*.55,y2+curve,x2,y2);ctx.stroke();const s=smooth(p),x=mix(x1,x2,s),y=mix(y1,y2,s)+curve*Math.sin(Math.PI*s);ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore()}
function tag(s,x,y,color=C.soft,fill=C.paper){ctx.font='13px Plex';const w=ctx.measureText(s).width+22;box(x,y,w,27,fill,null);text(s,x+11,y+6,13,color);return w}
function paper(x,y,w,h,label,accent=C.ink){ctx.save();ctx.shadowColor='#1e2a5a15';ctx.shadowBlur=15;ctx.shadowOffsetY=6;box(x,y,w,h,C.sheet,C.line);ctx.shadowBlur=0;ctx.shadowOffsetY=0;line(x+20,y+56,x+w-20,y+56,C.line);text(label,x+20,y+20,18,accent);ctx.restore()}
function miniDoc(x,y,w,h,label,kind,color=C.ink){paper(x,y,w,h,label,color);if(kind==='filing'){text('10-Q',x+22,y+83,33,C.ink,'Fraunces');for(let j=0;j<4;j++){line(x+22,y+145+j*17,x+w-25-(j%2)*30,y+145+j*17,C.line,2)}text('66,613',x+w-22,y+h-42,23,color,'Plex','right')}else if(kind==='reports'){for(let j=0;j<4;j++){line(x+20,y+84+j*31,x+w-20,y+84+j*31);text('INV-10'+(j+1),x+22,y+93+j*31,12,C.soft);text(['1,200','480','875','360'][j],x+w-24,y+93+j*31,14,color,'Plex','right')}}else{for(let j=0;j<3;j++){box(x+22,y+87+j*48,12,12,C.paper,C.line);line(x+45,y+92+j*48,x+w-22,y+92+j*48,C.line,2);if(j<2)line(x+45,y+107+j*48,x+w-50,y+107+j*48,C.line)}}}
function hello(t){
 const exit=ease((t-8.5)/1.7);
 fade(1-ease((t-2.1)/.7),()=>{text('Hey, Greywolf.',78,165,76,C.ink,'Fraunces');text('Let’s make something useful.',81,258,30,C.soft)});
 fade(ease((t-2.3)/.7),()=>{text('Your tools.',78,165,67,C.ink,'Fraunces');text('Less busywork.',78,238,67,C.ink,'Fraunces');wrap('AI workflows, built around the way your team works.',82,343,560,27,C.soft)});
 const p=ease((t-.6)/1.1);
 for(const [i,label,kind]of [[0,'Research','filing'],[1,'Back office','reports'],[2,'Questionnaires','questionnaire']]){
 const x=735+i*205,y=270+i*27;ctx.save();ctx.translate(x,mix(680,y,ease((t-.8-i*.35)/1.0)));ctx.rotate((i-1)*.045*(1-exit));miniDoc(0,0,210,270,label,kind,[C.ink,C.moss,C.rose][i]);ctx.restore();}
 const stages=['Your sources','AI draft','Code checks','Your review','Yours to run'];
 for(let i=0;i<5;i++){const x=98+i*342;fade(ease((t-3.5-i*.75)/.65),()=>{if(i<4)route(x+130,663,x+326,663,clamp((t-4-i*.75)/.6),C.line);ctx.beginPath();ctx.arc(x+45,662,25,0,Math.PI*2);ctx.fillStyle=i===4?C.ink:C.sheet;ctx.fill();ctx.strokeStyle=C.ink;ctx.stroke();text(String(i+1),x+45,650,22,i===4?C.sheet:C.ink,'Plex','center');text(stages[i],x+45,707,19,C.ink,'Plex','center')})}
 if(t>8.5)fade(exit,()=>{tag('LET’S TRY THREE SMALL EXAMPLES',81,470,C.rose,C.paper)})
}
function report(x,y,w,rows,label,side,t){
 paper(x,y,w,380+(rows.length-4)*58,label,C.soft);tag('SYNTHETIC DATA',x+w-160,y+17,C.rose,C.sheet);text('Reference',x+25,y+77,14,C.soft);text('USD',x+w-25,y+77,14,C.soft,'Plex','right');
 rows.forEach((r,i)=>{const yy=y+107+i*58;const status=reconcile(ADMIN,BROKER).find(z=>z.id===r.id)?.status;let color=status==='matched'?C.moss:status==='duplicate'?C.ochre:C.rose;let shown=t>(side==='left'?1:1.35)+i*.25;line(x+20,yy+46,x+w-20,yy+46);text(r.id,x+25,yy+12,22);text(MONEY(r.amount),x+w-25,yy+10,25,shown&&t>3?color:C.ink,'Plex','right');if(shown&&t>3)box(x+10,yy+8,3,29,color,null);});
}
function backoffice(t){
 const focus=ease((t-5.1)/.75);fade(1-focus*.73,()=>{
 const leftX=mix(-620,65,ease(t/.8)),rightX=mix(1670,975,ease((t-.3)/.8));
 report(leftX,240,550,ADMIN,'administrator_report.csv','left',t);report(rightX,240,550,BROKER,'broker_report.csv','right',t);
 if(t>2.1){for(const [i,id]of ['INV-101','INV-104'].entries()){const row=ADMIN.findIndex(r=>r.id===id),yy=240+132+row*58;fade(ease((t-2.1-i*.5)/.6),()=>route(615,yy,975,yy,clamp((t-2.1-i*.5)/.9),C.moss))}text('2 matched',795,458,24,C.moss,'Fraunces','center');}
 });
 if(t>5.1)fade(focus,()=>{
 paper(360,233,880,446,'Two things for a person.',C.ink);tag('REVIEW REQUIRED',1038,251,C.rose,C.sheet);
 text('INV-102',392,321,27,C.ochre,'Fraunces');text('Duplicate reference',620,323,24,C.ochre);text('2 broker rows × $480.00',620,363,22,C.soft);tag('administrator: 1 row',392,365,C.soft);line(390,418,1210,418);
 text('INV-103',392,452,27,C.rose,'Fraunces');text('$25.00 difference',620,454,24,C.rose);text('Administrator  $875.00',620,495,22,C.ink);text('Broker               $850.00',620,528,22,C.ink);
 if(t>8)fade(ease((t-8)/.5),()=>{line(390,580,1210,580,C.line);text('Both originals attached. Your team decides.',392,609,24,C.ink,'Fraunces');ctx.beginPath();ctx.arc(1198,620,17,0,Math.PI*2);ctx.strokeStyle=C.ink;ctx.lineWidth=2;ctx.stroke();text('↗',1198,605,24,C.ink,'Plex','center')});
 });
 text('Match by reference, currency and date. Duplicate and differing rows stay open.',78,726,20,C.soft);
}
function questionnaire(t){
 const leftX=mix(-600,75,ease(t/.8)),rightX=mix(1700,815,ease((t-.3)/.9));
 paper(leftX,228,555,466,'Approved policies — fictional',C.ink);tag('SYNTHETIC',leftX+389,246,C.rose,C.sheet);
 for(let i=0;i<2;i++){const p=POLICIES[i],yy=328+i*166;tag(p.id+' '+p.section,leftX+28,yy-30,C.moss,C.green);wrap(p.text,leftX+28,yy+10,485,27,C.ink,'Fraunces',1.25);}
 paper(rightX,228,710,466,'questionnaire_draft.docx',C.ink);
 const qs=draftAnswers(QUESTIONS,POLICIES);
 qs.forEach((q,i)=>{const yy=312+i*123;text(q.text,rightX+25,yy,20,C.ink);if(i<2&&t>1.8+i*1.5){const p=ease((t-1.8-i*1.5)/.65);fade(p,()=>{wrap(q.answer,rightX+25,yy+34,620,21,C.moss,'Plex',1.22);tag(q.source.id+' '+q.source.section+' • source',rightX+473,yy+78,C.moss,C.green)});route(630,330+i*166,815,yy+54,clamp((t-1.8-i*1.5)/.8),C.moss,i===0?0:-30)}else if(i===2&&t>5.3){fade(ease((t-5.3)/.7),()=>{dash(rightX+25,yy+32,658,55,C.ochre);text('No approved source. Leave open.',rightX+40,yy+47,23,C.ochre,'Fraunces')})}});
 if(t>7.2)fade(ease((t-7.2)/.7),()=>{text('2 sourced drafts. 1 question for someone who knows.',78,728,25,C.ink,'Fraunces')});
}
function handover(t){
 const three=[['Research','filing'],['Back office','reports'],['Questionnaires','questionnaire']];
 for(let i=0;i<3;i++){const x=90+i*235;fade(1-ease((t-2)/.8)*.72,()=>{miniDoc(x,238,205,250,...three[i]);})}
 const p=ease((t-1.5)/1),x=mix(1060,890,p);paper(x,234,570,422,'Your team’s workflow',C.ink);
 const bundle=[['The workflow','source files + steps'],['The checks','inputs, outputs, exceptions'],['The handover','runbook + team walkthrough']];
 bundle.forEach((r,i)=>{const yy=330+i*92;fade(ease((t-2.3-i*.7)/.6),()=>{check(x+36,yy+12,ease((t-2.4-i*.7)/.5));text(r[0],x+74,yy-3,29,C.ink,'Fraunces');text(r[1],x+74,yy+37,19,C.soft)})});
 if(t>1.5){route(774,446,x-20,446,clamp((t-1.5)/1),C.rose);text('Map → Build → Test',80,580,28,C.ink,'Fraunces');text('Together, on one useful task.',80,627,23,C.soft)}
 if(t>5)fade(ease((t-5)/.5),()=>text('Made with AI. Checked by people.',80,723,27,C.rose,'Fraunces'));
}
function lanePaper(x,y,w,h,label,color,lines){paper(x,y,w,h,label,color);lines.forEach((s,i)=>{text(s,x+23,y+87+i*38,19,C.soft);line(x+23,y+115+i*38,x+w-23,y+115+i*38,C.line)})}
function lanes(t){
 const active=t<4.9?0:t<9.8?1:2;
 const titles=['Open','Describe','Keep'],subs=['Public or routine','Internal, but not the edge','Your edge'];
 const examples=[['10-K · 10-Q · 8-K pulls','Websites · press releases','Templates · scheduling'],['Admin · broker reports','Invoices · reconciliations','Compliance checklists · DDQs'],['Positions · sizing · P&L','Your read on a covenant','Why a trade works']];
 for(let i=0;i<3;i++){
 const x=77+i*510,color=[C.moss,C.ochre,C.rose][i];fade(i===active?1:.4,()=>{
 text(titles[i],x,227,44,color,'Fraunces');text(subs[i],x,286,22,C.ink);
 const yy=348;lanePaper(x,yy,455,208,['public_filing.pdf','internal_report.csv','investment_notes'][i],color,examples[i]);
 if(i===0){const p=ease((t-1.7)/1.7);route(x+227,582,x+227,662,p,color);box(x+100,660,255,55,p>.9?C.green:C.sheet,color);text('Public / sanitized',x+227,676,20,color,'Plex','center');if(t>3.4)check(x+384,689,ease((t-3.4)/.5),color)}
 if(i===1){const p=ease((t-6.2)/.9);fade(p,()=>{text('Describe the steps + layout',x+227,581,20,color,'Fraunces','center');text('Real names → Example A',x+227,614,17,C.soft,'Plex','center')});route(x+227,642,x+227,662,ease((t-6.7)/1.7),color);box(x+100,660,255,55,C.sheet,color);text('Build on a stand-in',x+227,676,20,color,'Plex','center')}
 if(i===2){const p=ease((t-13.0)/.7);if(p>0){ctx.save();ctx.globalAlpha=p;box(x+17,407,421,132,C.ink,null);for(let j=0;j<3;j++)line(x+40,435+j*27,x+388-j*45,435+j*27,C.sheet,8);ctx.restore()}line(x,611,x+455,611,color,2);text('Stays with your team.',x+227,660,25,color,'Fraunces','center');if(t>12.8)fade(ease((t-12.8)/.6),()=>text('Don’t send it.',x+227,701,19,color,'Plex','center'))}
 });}
}
function invitation(t){
 const p=ease(t/.7);fade(p,()=>{
 text('Let’s arrive with something to try.',78,199,48,C.ink,'Fraunces');
 paper(83,302,613,387,'Your task brief',C.ink);
 const rows=[['One recurring task','Which steps would you love to skip?'],['How often? How long?','A rough estimate is plenty.'],['What does good look like?','A usable output, not just a chatbot.']];
 rows.forEach((r,i)=>{fade(ease((t-1.3-i*.65)/.5),()=>{text(r[0],111,393+i*90,27,C.ink,'Fraunces');text(r[1],111,433+i*90,19,C.soft)})});
 const x=823;line(x,356,1472,356,C.line,2);const marks=[[x,'NOV 6','Send your brief'],[x+300,'BEFORE THE VISIT','First version'],[x+610,'NOV 10 + 12','Hiro + Eric']];
 marks.forEach((m,i)=>{const pp=ease((t-2-i*2.5)/.7);fade(pp,()=>{ctx.beginPath();ctx.arc(m[0],356,8,0,Math.PI*2);ctx.fillStyle=i===2?C.rose:C.ink;ctx.fill();text(m[1],m[0],304,14,i===2?C.rose:C.soft,'Plex','center');text(m[2],m[0],389,24,C.ink,'Fraunces','center')})});
 if(t>5.5)fade(ease((t-5.5)/.8),()=>{route(700,530,824,530,ease((t-5.5)/1.2),C.rose);paper(823,493,653,195,'Built ahead on public or dummy data',C.ink);text('A first version to react to.',851,589,31,C.ink,'Fraunces');text('Then office hours, together.',851,635,22,C.soft)});
 });
 if(t>11)fade(ease((t-11)/.5),()=>text('Open the task-brief link in your invitation. Copy it and email it to us.',83,738,23,C.rose));
}
function ending(t){
 text('Bring a task.',78,218,78,C.ink,'Fraunces');text('Let’s make something useful.',78,319,64,C.ink,'Fraunces');
 const p=ease(t/.8);for(let i=0;i<3;i++){ctx.save();ctx.translate(1000+i*106,mix(640,440,ease((t-.1-i*.1)/.9)));ctx.rotate((i-1)*.08);miniDoc(0,0,210,250,['Research','Back office','Questionnaires'][i],['filing','reports','questionnaire'][i],[C.ink,C.moss,C.rose][i]);ctx.restore()}
 text('Greywolf × Otterd',82,488,30,C.rose,'Fraunces');text('Office hours · November 10 & 12',82,547,26,C.ink);text('Briefs by November 6',82,594,23,C.soft);text('This film was built with AI-assisted code.',82,714,20,C.soft);
}
function frame(t){
 t=Math.max(0,Math.min(88,t));const i=Math.max(0,SCENES.findIndex(s=>t<s.end));const s=SCENES[t===88?7:i],u=t-s.start;
 if(s.name==='research'){
 renderResearch(2+(u/15)*15);ctx.setTransform(1.2,0,0,1.2,0,0);box(0,0,1600,145,C.paper,null);box(0,735,1600,165,C.paper,null);
 }else{
 ctx.setTransform(1.2,0,0,1.2,0,0);box(0,0,1600,900,C.paper,null);
 const f={hello,research:()=>{},backoffice,questionnaire,handover,lanes,invitation,end:ending}[s.name];f(u);
 }
 // A page turn carries the workbench between examples, with no hard slideshow wipe.
 if(u<.45&&t>0){ctx.save();ctx.globalAlpha=.25*(1-ease(u/.45));box(mix(-1600,1600,ease(u/.45)),145,1600,610,C.sheet,null);ctx.restore()}
 text('otterd × Greywolf',78,36,25,C.ink,'Fraunces');text('LET’S MAKE THE USEFUL STUFF',1522,42,13,C.soft,'Plex','right');line(78,81,1522,81);
 const titles={hello:'',research:'Three numbers. One wrong period.',backoffice:u<5.1?'Match the routine. Surface the rest.':'A duplicate. A difference. Both visible.',questionnaire:'Answer with a source. Or leave it open.',handover:'Built with you. Yours to run.',lanes:'Bring a task. Keep your edge.',invitation:'Two days. Something concrete.',end:''};
 if(titles[s.name])text(titles[s.name],78,108,38,C.ink,'Fraunces');
 const footnotes={hello:'Illustrative workflows, built around your existing tools.',research:'Public Apple FY25 Q3 10-Q • USD millions • deliberately seeded period error',backoffice:'Fictional administrator and broker reports • no Greywolf files or data',questionnaire:'Fictional policy excerpts • source matching shown; answers still need human approval',handover:'Illustrative handover • actual scope and operating environment agreed together',lanes:'Routine work can contain sensitive information. Use public or sanitized examples.',invitation:'Review invitation • November 2026 • use the brief link supplied with your invitation',end:'Review cut • public and fictional examples • temporary local narration'};
 text(footnotes[s.name],78,769,14,C.soft);
 const cue=CUES.find(c=>t>=c.start&&t<c.end);
 if(cue){ctx.font='23px Plex';const words=cue.text.split(' ');let rows=[],row='';for(const word of words){const next=(row?row+' ':'')+word;if(ctx.measureText(next).width>1390&&row){rows.push(row);row=word}else row=next}if(row)rows.push(row);rows.forEach((r,j)=>{const w=ctx.measureText(r).width;box(800-w/2-10,801+j*29,w+20,28,C.sheet,null);text(r,800,804+j*29,23,C.ink,'Plex','center')})}
 let total=0;for(const scene of SCENES){const w=1444*(scene.end-scene.start)/88;line(78+total,863,78+total+w-5,863,C.line,2);line(78+total,863,78+total+Math.min(w-5,Math.max(0,1444*(t-scene.start)/88)),863,C.rose,2);total+=w}
 text('AI-assisted animation • checked examples • review prototype',78,877,12,C.soft);text(`${Math.floor(t/60)}:${String(Math.floor(t)%60).padStart(2,'0')} / 1:28`,1522,877,12,C.soft,'Plex','right');
 return {scene:s.name,t};
}
window.film={render:frame,reconcile:()=>reconcile(ADMIN,BROKER),answers:()=>draftAnswers(QUESTIONS,POLICIES),scenes:SCENES};
window.filmReady=Promise.all([document.fonts.ready,pageImage.decode(),excerptImage.decode()]).then(()=>{frame(0);return true});
