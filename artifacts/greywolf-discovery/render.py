from pathlib import Path
import json,math,re,subprocess,sys,wave
from functools import lru_cache
from PIL import Image,ImageDraw,ImageFont
from fontTools.ttLib import TTFont
import numpy as np
R=Path(__file__).resolve().parent;OLD=R.parent/'greywolf-film';S=1.2;W,H=1920,1080;FPS=30
C={'paper':'#f1eee8','sheet':'#fffdf9','ink':'#1e2a5a','soft':'#4a5378','line':'#d6d8d0','rose':'#a83f5a','moss':'#55663f','ochre':'#aa741b','green':'#e2e7db'}
for name in ['plex','fraunces']:
 p=R/(name+'.ttf')
 if not p.exists():
  f=TTFont(R.parent/'greywolf-proof/source'/f'{name}.woff2');f.flavor=None;f.save(p)
LENS=[10,10,14,10,14,10,12]
NAMES=['Hello','Start where you are','Compare notes','Possibilities','Scope the snag','Share safely','One useful test']
paras=(R/'narration.txt').read_text().strip().split('\n\n');SCENES=[];CUES=[];at=0
for i,(para,dur) in enumerate(zip(paras,LENS)):
 SCENES.append({'id':i,'name':NAMES[i],'start':at,'end':at+dur,'text':para})
 sentences=re.split(r'(?<=[.?!])\s+',para);weights=[len(x.split()) for x in sentences];p=at+.25
 for phrase,weight in zip(sentences,weights):
  dd=(dur-.6)*weight/sum(weights);CUES.append({'start':round(p,3),'end':round(p+dd-.04,3),'text':phrase});p+=dd
 at+=dur
DURATION=at
(R/'scenes.json').write_text(json.dumps(SCENES,indent=2));(R/'captions.json').write_text(json.dumps(CUES,indent=2))
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(R/'captions.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(CUES)))
@lru_cache(None)
def font(size,serif=False):return ImageFont.truetype(str(R/('fraunces.ttf' if serif else 'plex.ttf')),round(size*S))
def xy(p):return tuple(round(v*S) for v in p)
def blend(color,a=1):
 color=C.get(color,color);bg=C['paper'];a=min(1,max(0,a));return tuple(round(int(bg[i:i+2],16)*(1-a)+int(color[i:i+2],16)*a) for i in [1,3,5])
@lru_cache(maxsize=2048)
def measure(s,size,serif=False):return font(size,serif).getlength(s)/S
@lru_cache(maxsize=2048)
def glyph(s,size,serif,fill):
 f=font(size,serif);b=f.getbbox(s,anchor='lt');im=Image.new('RGBA',(max(1,b[2]+3),max(1,b[3]+3)),(0,0,0,0));ImageDraw.Draw(im).text((0,0),s,font=f,fill=fill+(255,),anchor='lt');return im

def txt(s,x,y,size=24,color='ink',serif=False,anchor='left',alpha=1):
 length=measure(s,size,serif)
 if anchor=='center':x-=length/2
 elif anchor=='right':x-=length
 im=glyph(s,size,serif,blend(color,alpha));I.paste(im,xy((x,y)),im)
 return length

def wrap(s,x,y,width,size=24,color='ink',serif=False,leading=1.35):
 words=s.split();line='';yy=y
 for word in words:
  nxt=(line+' '+word).strip()
  if measure(nxt,size,serif)>width and line:
   txt(line,x,yy,size,color,serif);yy+=size*leading;line=word
  else:line=nxt
 if line:txt(line,x,yy,size,color,serif)
 return yy+size*leading

def box(x,y,w,h,fill='sheet',border='line',alpha=1):
 D.rectangle(xy((x,y,x+w,y+h)),fill=blend(fill,alpha),outline=blend(border,alpha) if border else None,width=1)
def line(x1,y1,x2,y2,color='line',width=1,alpha=1):D.line(xy((x1,y1,x2,y2)),fill=blend(color,alpha),width=max(1,round(width*S)))
def circle(x,y,r,color='ink',fill=None,width=1):D.ellipse(xy((x-r,y-r,x+r,y+r)),outline=blend(color),fill=blend(fill) if fill else None,width=max(1,round(width*S)))
def ease(x):return 1-(1-min(1,max(0,x)))**4
def mix(a,b,p):return a+(b-a)*p

def route(points,p=1,color='ink',width=2,dot=None):
 p=min(1,max(0,p));ls=[math.dist(a,b) for a,b in zip(points,points[1:])];length=sum(ls);left=length*p;out=[points[0]]
 for a,b,ll in zip(points,points[1:],ls):
  if left>=ll:out.append(b);left-=ll
  else:
   if ll:out.append((mix(a[0],b[0],left/ll),mix(a[1],b[1],left/ll)))
   break
 if len(out)>1:D.line([xy(q) for q in out],fill=blend(color),width=max(1,round(width*S)),joint='curve')
 if dot is not None:
  left=length*min(1,max(0,dot))
  for a,b,ll in zip(points,points[1:],ls):
   if left>ll:left-=ll
   else:
    q=(mix(a[0],b[0],left/ll),mix(a[1],b[1],left/ll));circle(*q,5,color,color);break

def curve(a,b,bend=0):return [(mix(a[0],b[0],i/45),mix(a[1],b[1],i/45)+bend*math.sin(math.pi*i/45)) for i in range(46)]
def tag(s,x,y,color='soft',fill='paper'):
 w=measure(s,14)+22;box(x,y,w,29,fill,None);txt(s,x+11,y+7,14,color);return w

def paper(x,y,w,h,label,color='ink'):
 box(x+4,y+5,w,h,'line',None,.32);box(x,y,w,h);txt(label,x+22,y+20,19,color);line(x+20,y+56,x+w-20,y+56)

def doc(x,y,w,h,label,color='ink',rows=4):
 paper(x,y,w,h,label,color)
 for i in range(rows):line(x+23,y+87+i*25,x+w-24-(i%2)*35,y+87+i*25,'line',2)

def node(x,y,label,color='ink',small=None):
 box(x-118,y-51,236,102,'sheet',color);txt(label,x,y-18,25,color,True,'center')
 if small:txt(small,x,y+65,18,'soft',anchor='center')

def workmap(t,break_at=True):
 xs=[190,590,990,1390];ys=[420]*4;labels=['Inputs','Your tools','Review','Useful output?']
 for i,x in enumerate(xs):node(x,420,labels[i],['ink','ink','ochre','ink'][i])
 for i in range(3):
  if i==1 and break_at:
   line(xs[i]+118,420,795,420,'rose',2);line(845,420,xs[i+1]-118,420,'rose',2);txt('?',820,397,38,'rose',True,'center')
  else:route(curve((xs[i]+118,420),(xs[i+1]-118,420)),1,'moss',2,((t*.23-i*.3)%1))
 return xs

def hello(t):
 if t<2.5:
  txt('Hey, Greywolf.',80,190,76,'ink',True);txt('We’re Otterd.',84,295,35,'rose',True)
 else:
  txt('Start where you are.',80,190,64,'ink',True);wrap('AI workflows around your tools. Built with you. Handed over to your team.',84,282,660,30,'soft')
 for i,(label,color) in enumerate([('Your sources','ink'),('Your tools','moss'),('Your way of working','rose')]):
  yy=mix(700,238+i*68,ease((t-.5-i*.35)/1.2));doc(935+i*42,yy,400,230,label,color,3)
 if t>6.5:
  route(curve((90,620),(1110,620),45),ease((t-6.5)/1),'rose',2, min(1,max(0,(t-6.5)/2)))
  txt('How are you using AI today?',84,688,36,'ink',True)

def current(t):
 workmap(t,t>=3.1)
 if t<3.1:
  txt('A setup that works?',80,208,44,'moss',True)
  route(curve((190,552),(1390,552),65),ease(t/1.1),'moss',3,(t/3.1)%1)
  tag('Keep what is useful',640,655,'moss','green')
 elif t<6.5:
  txt('Promising—but too much checking?',80,208,44,'ochre',True)
  for i in range(3):doc(890+i*35,548+i*18,220,128,'Check again?', 'ochre',1)
 else:
  txt('One step you can’t get past?',80,208,44,'rose',True)
  route(curve((710,420),(795,420)),1,'rose',3,min(1,(t-6.5)/1.7));tag('Where does it stop?',675,575,'rose')
 txt('Tell us what you have actually tried.',80,728,27,'ink',True)

def questions(t):
 q=[('TRIED','What have you tried?',190,360),('TRUST','Which parts do you trust?',590,525),('SNAG','Where does it break down?',990,360),('WORTH IT','What would make it worth using?',1390,525)]
 active=min(3,int(t/3.5))
 for i,(label,question,x,y) in enumerate(q):
  color='rose' if i==active else 'soft';circle(x,y,36,color,'sheet',2);txt(str(i+1),x,y-17,30,color,True,'center');txt(label,x,y+65,16,color,anchor='center')
  if i<3:
   _,_,xx,yy=q[i+1];route(curve((x+45,y),(xx-45,yy),-35),ease((t-i*3.5)/1.3),'rose' if i<=active else 'line',2,min(1,max(0,(t-i*3.5)/3.5)))
 txt('30 minutes to compare notes.',80,208,45,'ink',True)
 txt(q[active][1],800,674,36,'ink',True,'center');tag('The question list is a starting point—not a test.',80,738,'soft')

def possibilities(t):
 active=min(3,int(t/2.5));u=t-active*2.5
 titles=['Research with a source trail','Repeatable report checks','Reuse approved work','Connect the handoffs']
 txt(titles[active],80,208,44,'ink',True);tag('POSSIBILITIES TO EXPLORE',80,164,'rose')
 if active==0:
  doc(150,330,330,300,'Source material');doc(1050,330,390,300,'Research memo')
  for i in range(3):
   points=curve((470,425+i*25),(1050,425+i*25),-60+i*30);route(points,ease((u-i*.2)/1),'rose',2,min(1,max(0,(u-i*.2)/1.8)))
   if u>.7+i*.2:tag('source ↗',1290,414+i*43,'moss','green')
  txt('Could the evidence stay attached?',800,711,31,'ink',True,'center')
 elif active==1:
  doc(100,330,400,300,'Report A');doc(1100,330,400,300,'Report B')
  for i in range(4):
   yy=420+i*38;color='rose' if i==2 else 'moss';route(curve((480,yy),(1100,yy)),ease((u-i*.15)/.8),color,2,min(1,max(0,(u-i*.15)/1.6)))
  paper(630,515,340,133,'Exception queue','rose');txt('A person decides.',800,594,22,'rose',True,'center')
  txt('Could the routine be checked consistently?',800,711,31,'ink',True,'center')
 elif active==2:
  doc(160,330,430,300,'Approved material','moss');paper(1010,330,430,300,'Recurring request')
  for i in range(3):
   route(curve((590,427+i*45),(1010,427+i*45)),ease((u-i*.2)/1),'moss',2,min(1,max(0,(u-i*.2)/1.8)))
   line(1040,427+i*45,1395,427+i*45,'moss',2)
  txt('Could an answer carry its source?',800,711,31,'ink',True,'center')
 else:
  for x,label in [(240,'Your tool'),(800,'A handoff'),(1360,'Another tool')]:node(x,456,label,'rose' if x==800 else 'ink')
  route(curve((358,456),(682,456),-25),ease(u/.9),'rose',3,min(1,u/1.5));route(curve((918,456),(1242,456),-25),ease((u-.6)/1),'rose',3,min(1,max(0,(u-.6)/1.5)))
  txt('Could the useful parts work together?',800,711,31,'ink',True,'center')


def scope(t):
 txt('The opportunity might be in something',80,205,41,'ink',True);txt('you have already built.',80,257,41,'ink',True)
 workmap(t, t<8)
 if t>3:
  tag('Keep the parts that work',130,555,'moss','green');tag('Describe the snag',700,555,'rose')
 if t>6:
  p=ease((t-6)/2);box(760,360,120,120,'sheet','rose');txt('A small',820,382,23,'rose',True,'center');txt('test',820,420,30,'rose',True,'center')
  route(curve((710,420),(760,420)),p,'rose',3,p);route(curve((880,420),(872,420)),p,'rose',3)
 if t>9:
  paper(1020,556,440,170,'How would we know it works?');txt('A useful output. A real check.',1045,644,24,'ink',True)
 txt('Your steps. Your tools. Your sticking point.',80,730,29,'ink',True)

def sharing(t):
 active=min(2,int(t/(10/3)));labels=['Open','Describe','Keep'];subs=['Public or sanitized','Internal process, without the edge','Your edge stays with you']
 examples=[['10-K · 10-Q · 8-K','Websites · press releases','Templates · formatting · scheduling'],['Fund admin · broker reports','Invoices · expenses · reconciliations','Compliance checklists · DDQ answers'],['Positions · sizing · P&L','Covenant or capital-structure judgment','Why a trade works']]
 for i in range(3):
  x=76+i*510;color=['moss','ochre','rose'][i];alpha=1 if i==active else .48
  txt(labels[i],x,223,44,color,True,alpha=alpha);txt(subs[i],x,283,19,'ink',alpha=alpha)
  paper(x,345,455,224,['Public example','Describe steps + file layout','Investment judgment'][i],color)
  for j,label in enumerate(examples[i]):txt(label,x+22,433+j*36,17,'soft',alpha=alpha)
  u=t-i*10/3
  if i==0 and t>=0:
   route(curve((x+227,586),(x+227,672)),ease(u/.9),color,2,min(1,max(0,u/1.4)));tag('Share freely',x+158,682,color,'green')
  if i==1:
   if t>10/3:route(curve((x+227,586),(x+227,672)),ease(u/1.2),color,2,min(1,max(0,u/1.6)))
   tag('We build on a stand-in',x+122,682,color)
  if i==2:
   line(x,620,x+455,620,color,2);txt('Don’t send it.',x+227,685,27,color,True,'center')
   if t>8.3:
    box(x+18,407,419,144,'ink',None);txt('Stays inside your team.',x+227,461,24,'sheet',True,'center')


def nextstep(t):
 if t<8.5:
  txt('Agree one useful thing to test.',80,208,49,'ink',True)
  paper(85,322,670,356,'A jointly scoped next step')
  for i,(label,detail) in enumerate([('Input + output','What should go in—and come out?'),('Success check','What evidence would make it useful?'),('People + access','Who needs to be involved?')]):
   yy=420+i*80;box(112,yy+1,17,17,'sheet','ink');txt(label,151,yy-3,27,'ink',True);txt(detail,151,yy+34,20,'soft')
  node(1110,425,'Your team','ink');node(1110,624,'Otterd','rose');route(curve((755,500),(990,425),-40),ease(t/1.5),'ink',2);route(curve((755,500),(990,624),40),ease((t-1)/1.5),'rose',2)
  txt('Decide together what is worth building.',80,728,28,'ink',True)
 else:
  txt('Let’s compare notes.',80,220,76,'ink',True);txt('Bring a task, an experiment, or a question.',84,327,34,'rose',True);txt('A 30-minute conversation before the visit.',84,414,29,'soft')
  for i,label in enumerate(['What works','What you tried','Where it sticks']):doc(905+i*54,345+i*44,380,235,label,['moss','ink','rose'][i],3)
  tag('GREYWOLF × OTTERD',84,617,'rose')

FUNCS=[hello,current,questions,possibilities,scope,sharing,nextstep]
def render(t):
 global D,I
 img=Image.new('RGB',(W,H),C['paper']);I=img;D=ImageDraw.Draw(img)
 i=min(6,next((s['id'] for s in SCENES if t<s['end']),6));scene=SCENES[i];u=t-scene['start'];FUNCS[i](u);D.rectangle((0,round(760*S),W,H),fill=C['paper'])
 txt('otterd × Greywolf',78,36,25,'ink',True);txt('LET’S START WITH YOUR QUESTIONS',1522,42,13,'soft',anchor='right');line(78,81,1522,81)
 titles=['','What is your starting point?','Your experience shapes the scope.','What might be possible?','Find the next useful step.','Bring the process. Keep your edge.','Scope it together.']
 if titles[i]:txt(titles[i],78,108,37,'ink',True)
 notes=['AI workflows • built around your tools • handed over to your team','Illustrative map • no assumption about Greywolf’s current AI use','A proposed pre-visit conversation • meeting time to be agreed','Possibilities for discussion • not an agreed scope or delivered client work','Keep what works • scope the unresolved step • define acceptance evidence','Public or sanitized examples only • proprietary judgment stays with your team','Pre-visit discussion • question list • wider team timing to be coordinated']
 txt(notes[i],78,774,14,'soft')
 cue=next((c for c in CUES if c['start']<=t<c['end']),None)
 if cue:
  words=cue['text'].split();rows=[];r=''
  for word in words:
   n=(r+' '+word).strip()
   if measure(n,23)>1400 and r:rows.append(r);r=word
   else:r=n
  if r:rows.append(r)
  for j,row in enumerate(rows):
   w=measure(row,23);box(800-w/2-12,805+j*28,w+24,27,'sheet',None);txt(row,800,807+j*28,23,'ink',anchor='center')
 for s in SCENES:
  x=78+1444*s['start']/DURATION;ww=1444*(s['end']-s['start'])/DURATION;line(x,865,x+ww-5,865,'line',2);p=min(1,max(0,(t-s['start'])/(s['end']-s['start'])));line(x,865,x+(ww-5)*p,865,'rose',2)
 txt('Captioned visual review • narration pending • no Greywolf data',78,879,12,'soft');txt(f'{int(t)//60}:{int(t)%60:02} / 1:20',1522,879,12,'soft',anchor='right')
 return img

def audio():
 rate=44100;a=np.zeros(rate*DURATION);rng=np.random.default_rng(72)
 for sc in SCENES:
  for j,hz in enumerate([220,330,440]):
   at=sc['start']+j*.19;t=np.arange(int(.5*rate))/rate;sig=(np.sin(2*np.pi*hz*t)+.12*np.sin(4*np.pi*hz*t))*np.exp(-10*t)*np.minimum(1,t/.008);n=len(sig);idx=int(at*rate);a[idx:idx+n]+=sig*.025
 for at in [2.5,7,13,16.5,22,25.5,29,34,36.5,39,41.5,47,52,55,59,62,65.5,69,72,76.5]:
  n=int(.28*rate);t=np.arange(n)/rate;noise=np.convolve(rng.normal(size=n),np.ones(13)/13,mode='same')*np.sin(np.pi*t/.28)**2;i=int(at*rate);a[i:i+n]+=noise*.022
 with wave.open(str(R/'review-sound.wav'),'wb') as w:w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes((a*32767).astype('<i2').tobytes())

def main():
 if '--preview' in sys.argv:
  for t,name in [(1,'hello'),(7.5,'otterd'),(12.5,'working'),(18.5,'stuck'),(27,'questions'),(35.5,'sources'),(38,'reports'),(40.5,'requests'),(43,'handoffs'),(53.5,'scope'),(62,'open'),(65.5,'describe'),(67.5,'keep'),(72,'next'),(78.7,'end')]:render(t).save(R/('frame-'+name+'.png'))
  print('15 decisive frames rendered.');return
 audio();cmd=['ffmpeg','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart','-y',str(R/'visual-silent.mp4')]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 for i in range(DURATION*FPS):
  p.stdin.write(render(i/FPS).tobytes())
  if i%(10*FPS)==0:print(f'Rendered {i//FPS}/{DURATION} seconds',flush=True)
 p.stdin.close();code=p.wait()
 if code:raise SystemExit(code)
 print('Visual render complete.',flush=True)
if __name__=='__main__':main()
