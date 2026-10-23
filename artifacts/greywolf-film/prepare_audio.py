from pathlib import Path
import subprocess,json,wave
import numpy as np
ROOT=Path(__file__).resolve().parent
paragraphs=(ROOT/'narration.txt').read_text().strip().split('\n\n')
texts=[paragraphs[0]+' '+paragraphs[1],*paragraphs[2:]]
lengths=[11,15,12,10,7,15,14,4]
assert len(texts)==len(lengths)
rate=44100;voice=np.zeros(sum(lengths)*rate,dtype=np.float64)
start=0;scenes=[];cues=[]
for i,(s,seconds) in enumerate(zip(texts,lengths)):
    (ROOT/f'voice-{i}.txt').write_text(s)
    subprocess.run(['say','-v','Samantha','-r','174','-f',str(ROOT/f'voice-{i}.txt'),'-o',str(ROOT/f'voice-{i}.aiff')],check=True)
    raw=subprocess.run(['ffmpeg','-v','error','-i',str(ROOT/f'voice-{i}.aiff'),'-ac','1','-ar',str(rate),'-f','f32le','-'],check=True,capture_output=True).stdout
    a=np.frombuffer(raw,dtype='<f4');nz=np.flatnonzero(np.abs(a)>.004)
    if len(nz):a=a[max(0,nz[0]-int(.06*rate)):min(len(a),nz[-1]+int(.12*rate))]
    available=seconds-.65
    # Fixed picture timings, continuous paragraph delivery, modest fit per scene.
    speed=len(a)/rate/available
    subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar',str(rate),'-ac','1','-i','pipe:0','-af',f'atempo={speed:.8f}','-ar',str(rate),'-f','f32le',str(ROOT/f'fit-{i}.f32'),'-y'],input=a.tobytes(),check=True)
    a=np.fromfile(ROOT/f'fit-{i}.f32',dtype='<f4');at=round((start+.25)*rate);voice[at:at+len(a)]+=a*.9
    import re
    sentences=re.split(r'(?<=[.?!])\s+',s)
    weights=[max(3,len(x.split())) for x in sentences];total=sum(weights);p=start+.25
    for sentence,w in zip(sentences,weights):
        d=len(a)/rate*w/total;cues.append({'start':round(p,3),'end':round(p+d-.03,3),'text':sentence});p+=d
    scenes.append({'name':['hello','research','backoffice','questionnaire','handover','lanes','invitation','end'][i],'start':start,'end':start+seconds,'text':s,'voice':'Samantha (temporary local review voice)','fitSpeed':round(speed,3)})
    start+=seconds
# Original quiet plucked notes, paper movement and check sounds; no external music.
rng=np.random.default_rng(44)
def put(at,s,gain):
    i=round(at*rate);n=min(len(s),len(voice)-i)
    if n>0:voice[i:i+n]+=s[:n]*gain
for i,(at,hz) in enumerate([(0,220),(3,330),(7,440),(11,330),(15,440),(19,293.66),(24,554.37),(26,330),(29,440),(31,440),(34,293.66),(36,554.37),(38,659.25),(45,440),(48,293.66),(52,330),(55,440),(56,554.37),(59,330),(61,440),(65,330),(68,293.66),(70,220),(74,330),(78,440),(82,554.37),(85,659.25)]):
    t=np.arange(round(.6*rate))/rate;sig=(np.sin(2*np.pi*hz*t)+.1*np.sin(4*np.pi*hz*t))*np.exp(-9*t)*np.minimum(1,t/.01);put(at,sig,.035)
for at in [1.7,5.4,12,15,17,22,26,28,30,33,38,40,43,45,49,52,55,58,61,64,67,70,73,76,80,84]:
    n=round(rate*.25);t=np.arange(n)/rate;noise=np.convolve(rng.normal(size=n),np.ones(12)/12,mode='same')*np.sin(np.pi*t/.25)**2;put(at,noise,.018)
peak=np.max(np.abs(voice));voice*=min(1,.92/peak)
with wave.open(str(ROOT/'review-audio.wav'),'wb') as w:w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes((voice*32767).astype('<i2').tobytes())
(ROOT/'scenes.json').write_text(json.dumps(scenes,indent=2));(ROOT/'captions.json').write_text(json.dumps(cues,indent=2))
def stamp(t):
    ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(ROOT/'captions.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(cues)))
print(json.dumps({'duration':start,'scenes':scenes},indent=2))
