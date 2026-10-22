"""Deterministic Otterd explainer. Pillow >=10, ffmpeg, system fonts.

python3 render.py --stills      # storyboard/contact sheet
python3 render.py               # narrated 1920x1080 H.264 film
python3 render.py --width 1280  # quicker 720p edit
All coordinates use a 1600x900 design space. No site files are changed.
"""
from __future__ import annotations
import argparse
import functools
import json
import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
PAPER = '#f1eee8'
SHEET = '#fffdf9'
INK = '#1e2a5a'
SOFT = '#4a5378'
RULE = '#d6d8d0'
ROSE = '#a83f5a'
MOSS = '#55663f'
OCHRE = '#b27b19'
BLUE = '#477e9b'
CELADON = '#e2e7db'
BLUSH = '#ece0dd'
SAND = '#eae2d4'
FONTDIR = Path('/System/Library/Fonts/Supplemental')
FONT_FILES = {'sans': FONTDIR/'Arial.ttf', 'bold': FONTDIR/'Arial Bold.ttf',
              'serif': FONTDIR/'Georgia.ttf', 'italic': FONTDIR/'Georgia Italic.ttf',
              'mono': FONTDIR/'Courier New.ttf'}
DURATION = 85.0
FPS = 24
CAPTIONS = json.loads((ROOT/'captions.json').read_text())
SCENES = [(0, 9.2), (9.2, 26), (26, 34.8), (34.8, 44.2),
          (44.2, 63.2), (63.2, 70.3), (70.3, 76.2), (76.2, DURATION)]
LANE_DELAYS = (1.7, 6.2, 12.8)


def clamp(x, a=0.0, b=1.0):
    return min(b, max(a, x))


def ease(x):
    x = clamp(x)
    return 1-(1-x)**3


def smooth(x):
    x = clamp(x)
    return x*x*(3-2*x)


def mix(a, b, p):
    return a+(b-a)*p


def rgb(c):
    return tuple(int(c[i:i+2], 16) for i in (1, 3, 5))


class Canvas:
    def __init__(self, width=1920):
        self.width = width
        self.height = round(width*9/16)
        self.s = width/1600
        self.image = Image.new('RGB', (self.width, self.height), PAPER)
        self.d = ImageDraw.Draw(self.image)
        self.a = 1.0

    def c(self, c):
        return tuple(round(mix(x, y, self.a)) for x, y in zip(rgb(PAPER), rgb(c)))

    def pts(self, p):
        return tuple(round(v*self.s) for v in p)

    @functools.lru_cache(maxsize=100)
    def font(self, size, kind='sans'):
        return ImageFont.truetype(str(FONT_FILES[kind]), round(size*self.s))

    def text(self, x, y, txt, size=30, color=INK, kind='sans', align='left'):
        f = self.font(size, kind)
        anchor = {'left':'lt','center':'mt','right':'rt'}[align]
        self.d.text(self.pts((x,y)), txt, font=f, fill=self.c(color), anchor=anchor,
                    stroke_width=0)

    def multiline(self, x, y, lines, size=30, color=INK, kind='sans', align='left', gap=1.32):
        for n, line in enumerate(lines):
            self.text(x, y+n*size*gap, line, size, color, kind, align)

    def line(self, points, color=INK, width=2):
        points = [self.pts(p) for p in points]
        self.d.line(points, fill=self.c(color), width=max(1,round(width*self.s)), joint='curve')

    def path(self, points, p=1, color=INK, width=2):
        p = clamp(p)
        if p <= 0:
            return
        lengths=[math.dist(a,b) for a,b in zip(points,points[1:])]
        left=sum(lengths)*p
        result=[points[0]]
        for a,b,length in zip(points,points[1:],lengths):
            if left>=length:
                result.append(b)
                left-=length
            else:
                f=left/length if length else 0
                result.append((mix(a[0],b[0],f),mix(a[1],b[1],f)))
                break
        self.line(result,color,width)

    def rect(self, x, y, w, h, fill=None, outline=INK, width=2, radius=0):
        box=self.pts((x,y,x+w,y+h))
        kw={'fill':self.c(fill) if fill else None,'outline':self.c(outline) if outline else None,
            'width':max(1,round(width*self.s))}
        if radius:
            self.d.rounded_rectangle(box,radius=round(radius*self.s),**kw)
        else:
            self.d.rectangle(box,**kw)

    def circle(self, x, y, r, fill=None, outline=INK, width=2):
        self.d.ellipse(self.pts((x-r,y-r,x+r,y+r)),fill=self.c(fill) if fill else None,
                       outline=self.c(outline) if outline else None,width=max(1,round(width*self.s)))

    def polygon(self, pts, fill=PAPER, outline=None, width=2):
        pp=[self.pts(p) for p in pts]
        self.d.polygon(pp,fill=self.c(fill))
        if outline:
            self.d.line(pp+[pp[0]],fill=self.c(outline),width=max(1,round(width*self.s)),joint='curve')

    def arrow(self, x1,y1,x2,y2,p=1,color=INK,width=2):
        p=clamp(p)
        if p<=0:
            return
        x,y=mix(x1,x2,p),mix(y1,y2,p)
        self.line([(x1,y1),(x,y)],color,width)
        if p>.12:
            angle=math.atan2(y2-y1,x2-x1)
            self.line([(x-12*math.cos(angle-.5),y-12*math.sin(angle-.5)),(x,y),
                       (x-12*math.cos(angle+.5),y-12*math.sin(angle+.5))],color,width)

    def check(self,x,y,p=1,color=MOSS,scale=1):
        self.path([(x-10*scale,y),(x-2*scale,y+8*scale),(x+15*scale,y-12*scale)],p,color,3)

    def paper(self,x,y,w=108,h=144,label='PDF',color=INK):
        self.polygon([(x,y),(x+w-22,y),(x+w,y+22),(x+w,y+h),(x,y+h)],SHEET,color)
        self.line([(x+w-22,y),(x+w-22,y+22),(x+w,y+22)],color)
        self.text(x+15,y+37,label,18,color,'bold')
        for n,f in enumerate([.7,.86,.62,.8]):
            self.line([(x+15,y+73+n*15),(x+15+(w-30)*f,y+73+n*15)],RULE,2)

    def envelope(self,x,y,w=150,h=95,color=INK):
        self.rect(x,y,w,h,SHEET,color)
        self.path([(x,y),(x+w/2,y+h*.53),(x+w,y)],1,color)
        self.line([(x,y+h),(x+w*.35,y+h*.43)],RULE)
        self.line([(x+w,y+h),(x+w*.65,y+h*.43)],RULE)

    def pill(self,x,y,txt,color=ROSE,fill=BLUSH,size=22,center=False):
        w=self.d.textlength(txt,font=self.font(size,'bold'))/self.s+32
        if center:x-=w/2
        self.rect(x,y,w,size+22,fill,None,radius=3)
        self.text(x+16,y+11,txt,size,color,'bold')
        return w

    def title(self,eyebrow,title,subtitle=None):
        self.text(110,102,eyebrow.upper(),17,ROSE,'bold')
        self.text(110,143,title,53,INK,'serif')
        if subtitle:
            self.text(112,215,subtitle,25,SOFT)


def base(c,t,chapter):
    # A quiet diagram grid: enough spatial structure, no distracting particles.
    for x in range(110,1510,40):
        for y in range(287,737,40):
            c.circle(x,y,.7,fill='#dcded6',outline=None)
    c.text(65,39,'otterd',30,INK,'serif')
    c.line([(171,43),(171,68)],RULE,1)
    c.text(190,47,'A WORKING SESSION FOR GREYWOLF',14,SOFT,'bold')
    c.text(1535,47,'REVIEW DRAFT',13,SOFT,align='right')
    c.line([(65,88),(1535,88)],RULE,1)
    c.line([(65,812),(1535,812)],RULE,1)
    c.text(65,851,f'{chapter:02d}  /  08',14,SOFT,'mono')
    c.text(1535,851,'OTTERD  ×  GREYWOLF',14,SOFT,'bold',align='right')
    c.line([(230,858),(1370,858)],RULE,2)
    c.line([(230,858),(230+1140*clamp(t/DURATION),858)],ROSE,3)


def scene0(c,t):
    c.title('The recurring work','Where does the week go?', 'Different files. The same work, again.')
    # The repeated work literally traces a loop; the following scene straightens it.
    points=[]
    for i in range(101):
        a=math.tau*i/100
        points.append((800+470*math.cos(a),492+135*math.sin(a)))
    c.path(points,ease(t/2),RULE,2)
    labels=[('FILINGS',305,388,0.4),('RECONCILIATION',746,388,3.0),('REPEAT QUESTIONS',1185,388,5.4)]
    for n,(label,x,y,delay) in enumerate(labels):
        p=ease((t-delay)/.9)
        old=c.a;c.a*=p
        c.paper(x,y+25*(1-p),110,148,['10-K','XLS','Q & A'][n], [BLUE,MOSS,OCHRE][n])
        c.text(x+55,y+176,label,17,SOFT,'bold','center')
        c.a=old
    if t>1:
        a=math.tau*((t-1)/7-.25)
        c.circle(800+470*math.cos(a),492+135*math.sin(a),6,ROSE,None)
    c.text(800,655,'Read  →  copy  →  reconcile  →  repeat',29,INK,'mono','center')


def scene1(c,t):
    c.title('What Otterd does','Build it around your tools.', 'Sources → draft → code checks → your review → your workflow')
    # Diagram objects arrive with the narration, then stay as a coherent system.
    xs=[180,465,785,1105,1390]
    labels=['Your sources','AI draft','Code checks','Your review','Your team']
    reveals=[.8,2.2,3.3,4.2,13.4]
    for n,x in enumerate(xs):
        p=ease((t-reveals[n])/.75)
        old=c.a;c.a*=p
        c.circle(x,335,34,SHEET,ROSE if n==4 else INK)
        c.text(x,320,f'{n+1:02}',23,ROSE if n==4 else INK,'mono','center')
        c.text(x,391,labels[n],24,INK,'bold','center')
        c.a=old
        if n:
            c.arrow(xs[n-1]+48,335,x-48,335,ease((t-reveals[n]-.15)/.7),ROSE if n==4 else SOFT)
    p=ease((t-1.4)/1)
    c.a*=p
    c.paper(118,475,95,130,'PDF',BLUE)
    c.paper(143,500,95,130,'XLS',MOSS)
    c.text(180,663,'Already in use',18,SOFT,align='center')
    c.a=1
    # Arithmetic example: the AI's value is not its own proof.
    if t>5:
        c.a=ease((t-5)/.7)
        c.rect(332,478,266,163,SHEET,RULE)
        c.text(351,496,'ILLUSTRATIVE · DUMMY DATA',13,SOFT,'bold')
        for y,label,value in [(531,'Region A','125'),(563,'Region B','55'),(603,'Draft total','182')]:
            c.text(351,y,label,20,INK if y<600 else ROSE)
            c.text(579,y,value,22,INK if y<600 else ROSE,'mono','right')
        c.line([(351,591),(580,591)],RULE,1)
        c.a=1
    if 7.25<t<8.75:
        # A value visibly travels from the source to the draft as it is assembled.
        p=smooth((t-7.25)/1.5)
        c.circle(mix(214,329,p),mix(508,542,p),7,BLUE,None)
    if t>8.8:
        c.a=ease((t-8.8)/.6)
        c.text(785,498,'125 + 55 = 180',24,INK,'mono','center')
        c.text(785,545,'182 ≠ 180',31,ROSE,'mono','center')
        c.pill(785,599,'FLAG: TOTAL',OCHRE,SAND,18,center=True)
        c.a=1
    if t>11:
        c.a=ease((t-11)/.6)
        c.circle(1105,542,35,BLUSH,ROSE)
        c.text(1105,520,'!',43,ROSE,'serif','center')
        c.multiline(1105,608,['Review the flag.','Make the decision.'],19,SOFT,align='center')
        c.a=1
    if t>13.4:
        c.a=ease((t-13.4)/.6)
        c.multiline(1390,491,['Code','Prompts','Tests','Runbook'],22,INK,align='center',gap=1.55)
        c.path([(1325,475),(1310,475),(1310,646),(1325,646)],ease((t-13.6)/.8),ROSE)
        c.a=1
    c.text(112,739,'A checked first version. Then a workflow you can run.',24,SOFT)


def scene2(c,t):
    c.title('Greywolf office hours','Let’s bring something concrete.', 'Hiro + Eric · November 2026')
    c.line([(310,485),(1290,485)],RULE,2)
    for x,day,delay in [(485,'10',.2),(1115,'12',.7)]:
        p=ease((t-delay)/.9)
        old=c.a;c.a*=p
        c.circle(x,485,112,SHEET,INK,2)
        c.text(x,416,'NOV',22,SOFT,'bold','center')
        c.text(x,453,day,86,INK,'serif','center')
        c.a=old
    c.text(800,470,'&',36,ROSE,'italic','center')
    c.a=ease((t-4.8)/1)
    c.text(800,656,'Tell us about one task before we arrive.',34,INK,'serif','center')
    c.a=1


def scene3(c,t):
    c.title('Your task brief','Start with one task.', 'Research · compliance · back office')
    # A real-looking brief assembles from three questions; no invented client details.
    c.rect(310,305,980,400,SHEET,RULE)
    c.text(350,332,'TASK',14,ROSE,'bold')
    c.text(350,360,'The recurring job you want help with',29,INK,'serif')
    c.line([(350,415),(1250,415)],RULE,1)
    entries=[(2.5,463,'01','How often?','Frequency'),
             (5.6,545,'02','How long?','Time per run'),
             (7.0,627,'03','What does good look like?','A usable result')]
    for delay,y,n,title,desc in entries:
        p=ease((t-delay)/.6);c.a=p
        c.circle(367,y+12,19,CELADON,None)
        c.text(367,y+2,n,15,MOSS,'mono','center')
        c.text(410,y,title,28,INK)
        c.text(1228,y+5,desc,21,SOFT,align='right')
        c.a=1


def scene4(c,t):
    c.title('Choose a sharing lane','Share the task. Protect your edge.',
            'Public examples · stand-ins for internal work · your edge stays with you')
    lanes=[
        (110,330,'OPEN','Public or routine',
         ['Share public or sanitized','examples freely.'],
         [['10-K, 10-Q and 8-K pulls'],['Company websites','and press releases'],
          ['Templates, formatting,','scheduling']],MOSS,LANE_DELAYS[0]),
        (580,800,'DESCRIBE','Internal, but not the edge',
         ['Describe the steps and file layout.','We build on a stand-in; your team','connects the real files.'],
         [['Fund admin and broker reports'],['Invoices, expenses, reconciliations'],
          ['Compliance checklists,','DDQ answers']],OCHRE,LANE_DELAYS[1]),
        (1050,1270,'KEEP','Your edge',
         ["Don't share it. We can help your",'team build a tool inside','your own environment.'],
         [['Positions, sizing, P&L'],['Your read on a covenant','or a capital structure'],
          ['Why a trade works']],ROSE,LANE_DELAYS[2])
    ]
    # All examples stay readable; narration highlights one lane at a time.
    for left,x,label,sub,instructions,examples,color,delay in lanes:
        c.a=ease((t-.25)/.65)
        c.line([(left,289),(left+430,289)],RULE,2)
        active=(LANE_DELAYS[0]<=t<LANE_DELAYS[1] if label=='OPEN' else
                LANE_DELAYS[1]<=t<LANE_DELAYS[2] if label=='DESCRIBE' else t>=LANE_DELAYS[2])
        if active:
            c.path([(left,289),(left+430,289)],ease((t-delay)/.6),color,4)
        c.circle(left+24,332,20,SHEET,color)
        if label=='OPEN':
            c.check(left+24,332,1,color,.7)
        elif label=='DESCRIBE':
            c.line([(left+16,326),(left+32,326)],color)
            c.line([(left+16,338),(left+28,338)],color)
        else:
            c.rect(left+15,330,18,14,None,color,radius=2)
            c.path([(left+18,329),(left+18,322),(left+30,322),(left+30,329)],1,color)
        c.text(left+62,316,label,27,color,'bold')
        c.text(left,375,sub,26,INK,'serif')
        c.multiline(left,426,instructions,20,SOFT,gap=1.38)
        c.text(left,531,'EXAMPLES',13,color,'bold')
        for i,lines in enumerate(examples):
            y=562+i*62
            c.circle(left+4,y+10,2.4,color,None)
            c.multiline(left+20,y,lines,21,INK,gap=1.22)
        c.a=1


def scene5(c,t):
    c.title('Before we arrive','A first version, built before the visit.', 'Public or dummy data · a starting point for discussion')
    # A brief travels into an email, then into the prototype workbench.
    c.paper(175,406,112,150,'BRIEF',BLUE)
    c.text(231,600,'Copy your brief',22,INK,align='center')
    c.arrow(310,481,550,481,ease((t-.6)/.9),SOFT)
    c.envelope(595,431,168,104)
    c.text(679,600,'Email it to us',22,INK,align='center')
    if t<2.8:
        p=smooth((t-.6)/1.7)
        c.circle(mix(330,557,p),481,7,ROSE,None)
    c.arrow(800,481,1020,481,ease((t-2.3)/.9),SOFT)
    c.a=ease((t-2.5)/.8)
    c.rect(1060,385,330,190,SHEET,INK)
    c.rect(1060,385,330,35,CELADON,INK)
    for i in range(3):c.circle(1079+i*15,402,3,MOSS,None)
    for i in range(3):
        c.line([(1086,452+i*32),(1250+i*23,452+i*32)],RULE,3)
        c.check(1347,452+i*32,ease((t-3.2-i*.6)/.5),MOSS,.7)
    c.text(1225,600,'First version',22,INK,align='center')
    c.text(1225,644,'THE WEEK BEFORE',15,ROSE,'bold','center')
    c.a=1


def scene6(c,t):
    c.title('When the week gets busy','You can skip your slot.', 'The work still reaches you.')
    c.circle(470,495,110,SHEET,INK)
    c.polygon([(445,451),(445,539),(516,495)],ROSE)
    c.text(470,640,'3-minute recording',28,INK,align='center')
    c.text(800,473,'+',43,SOFT,'serif','center')
    c.a=ease((t-.9)/.8)
    c.paper(1050,385,160,214,'NOTES',INK)
    c.text(1130,640,'1-page note',28,INK,align='center')
    c.a=1
    # Playback arc draws without looping or making an unsubstantiated result claim.
    points=[]
    for i in range(101):
        a=-math.pi/2+math.tau*i/100
        points.append((470+120*math.cos(a),495+120*math.sin(a)))
    c.path(points,ease((t-.5)/4.5),ROSE,3)


def scene7(c,t):
    c.title('Before the office hours','Bring us one recurring task.')
    c.text(800,309,'Send your brief by',30,SOFT,align='center')
    c.text(800,365,'November 6',104,INK,'serif','center')
    c.path([(480,503),(1120,503)],ease(t/1.1),ROSE,3)
    c.a=ease((t-2.2)/.8)
    c.text(800,554,'10 minutes now.',38,INK,'serif','center')
    c.text(800,613,'Something concrete when we arrive.',32,SOFT,align='center')
    c.a=1
    c.pill(800,703,'Open the brief link in your invitation',ROSE,BLUSH,25,center=True)


DRAW_SCENE=[scene0,scene1,scene2,scene3,scene4,scene5,scene6,scene7]


def caption(c,t):
    found=next((txt for start,end,txt in CAPTIONS if start<=t<=end),None)
    if not found:return
    # Separate subtitle rail, always readable at phone width.
    maxw=1310
    words=found.split();lines=[];current=''
    for word in words:
        test=(current+' '+word).strip()
        if c.d.textlength(test,font=c.font(25))/c.s>maxw:
            lines.append(current);current=word
        else:current=test
    if current:lines.append(current)
    top=797-len(lines)*32
    for i,line in enumerate(lines):
        w=c.d.textlength(line,font=c.font(25))/c.s
        c.rect(800-w/2-18,top+i*32-3,w+36,33,SHEET,None,radius=2)
        c.text(800,top+i*32,line,25,INK,align='center')


def frame(t,width=1920,subtitles=True):
    c=Canvas(width)
    idx=next((i for i,(start,end) in enumerate(SCENES) if start<=t<end),7)
    start,end=SCENES[idx]
    base(c,t,idx+1)
    DRAW_SCENE[idx](c,t-start)
    # A short paper dissolve keeps scene changes deliberate, and the brand rail fixed.
    alpha=min(smooth((t-start)/.28),smooth((end-t)/.25) if idx<7 else 1)
    if alpha<1:
        region=(0,round(91*c.s),c.width,round(753*c.s))
        crop=c.image.crop(region)
        blank=Image.new('RGB',crop.size,PAPER)
        c.image.paste(Image.blend(blank,crop,alpha),region)
    if subtitles:caption(c,t)
    # Hold the final call to action instead of fading it to nothing.
    return c.image


def srt_time(t):
    ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'


def write_srt():
    (ROOT/'captions.srt').write_text('\n\n'.join(f'{i+1}\n{srt_time(a)} --> {srt_time(b)}\n{txt}'
                                             for i,(a,b,txt) in enumerate(CAPTIONS))+'\n')


def stills():
    stamps=[7.6,24.7,33,43,61.5,69,75.5,83]
    montage=Image.new('RGB',(1600,4*490),PAPER)
    d=ImageDraw.Draw(montage)
    f=ImageFont.truetype(str(FONT_FILES['mono']),18)
    for i,t in enumerate(stamps):
        im=frame(t,800,False)
        x=(i%2)*800;y=(i//2)*490
        montage.paste(im,(x,y))
        d.text((x+30,y+458),f'{i+1:02}  |  {t:04.1f}s',fill=INK,font=f)
        im.save(ROOT/f'scene-{i+1:02}.png')
    montage.save(ROOT/'storyboard.jpg',quality=93)
    frame(83,1920,False).save(ROOT/'poster.png')
    print('Storyboard and scene stills saved.',flush=True)


def render(width, audio_name='narration-expanded.mp3', output_name='otterd-greywolf-examples-review.mp4'):
    output=ROOT/output_name
    cmd=['ffmpeg','-hide_banner','-loglevel','warning','-y','-f','rawvideo','-vcodec','rawvideo',
         '-pix_fmt','rgb24','-s',f'{width}x{round(width*9/16)}','-r',str(FPS),'-i','-',
         '-i',str(ROOT/audio_name),'-map','0:v','-map','1:a','-c:v','libx264','-preset','fast',
         '-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af','apad',
         '-t',str(DURATION),'-movflags','+faststart','-metadata','title=Otterd × Greywolf — office hours (review draft)',
         '-metadata','comment=Illustrative dummy-data workflow. User-supplied dates. Not published.',str(output)]
    process=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    total=round(DURATION*FPS)
    try:
        for i in range(total):
            process.stdin.write(frame(i/FPS,width).tobytes())
            if i%240==0:print(f'Rendered {i/FPS:.0f}s / {DURATION:.0f}s',flush=True)
    finally:
        process.stdin.close()
    if process.wait()!=0:raise RuntimeError('Video encoding failed')
    print(f'Video saved: {output}',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--stills',action='store_true')
    parser.add_argument('--width',type=int,default=1920)
    args=parser.parse_args()
    write_srt()
    if args.stills:stills()
    else:render(args.width)
