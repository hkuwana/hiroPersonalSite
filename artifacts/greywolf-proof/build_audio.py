from pathlib import Path
import subprocess,wave
import numpy as np
ROOT=Path(__file__).resolve().parent
rate=44100;duration=20
audio=np.zeros(rate*duration,dtype=np.float64)
rng=np.random.default_rng(21)
def put(start,sound,gain=1):
    i=round(start*rate);n=min(len(sound),len(audio)-i)
    if n>0:audio[i:i+n]+=sound[:n]*gain
def pluck(at,hz,level=.028,seconds=.45):
    t=np.arange(round(rate*seconds))/rate
    s=(np.sin(2*np.pi*hz*t)+.17*np.sin(4*np.pi*hz*t))*np.exp(-t*12)*np.minimum(1,t/.006)
    put(at,s,level)
for at,hz in [(0,220),(1.5,330),(4.95,440),(6.35,440),(7.55,440),(8.1,293.66),(8.32,261.63),(14.9,440),(15.17,554.37),(15.44,659.25),(18.1,330)]:pluck(at,hz)
for at,seconds in [(1.05,.38),(3.8,.24),(5.2,.24),(6.4,.24),(10.2,.38),(13.4,.38)]:
    t=np.arange(round(rate*seconds))/rate;n=rng.normal(size=len(t));n=np.convolve(n,np.ones(11)/11,mode='same')
    put(at,n*np.sin(np.pi*t/seconds)**2,.023)
source=ROOT.parent/'greywolf-video/narration-boston.mp3'
raw=subprocess.run(['ffmpeg','-v','error','-i',str(source),'-ar',str(rate),'-ac','1','-f','f32le','-'],check=True,capture_output=True).stdout
voice=np.frombuffer(raw,dtype='<f4')
for at,a,b in [(.15,8.48,9.34),(2.8,13.36,15.55),(8.7,15.6,18.2),(18,75.04,76.8)]:
    clip=voice[round(a*rate):round(b*rate)].copy();fade=min(220,len(clip)//2)
    clip[:fade]*=np.linspace(0,1,fade);clip[-fade:]*=np.linspace(1,0,fade)
    put(at,clip,.85)
peak=np.max(np.abs(audio))
if peak>.91:audio*=.91/peak
with wave.open(str(ROOT/'proof-audio.wav'),'wb') as w:
    w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes((audio*32767).astype('<i2').tobytes())
print('20-second sound edit built from the existing Boston narration and original synthesized foley.')
