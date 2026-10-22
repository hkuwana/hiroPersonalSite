"""Build the single-take Jerry B. / Eleven v4 version; preserves prior exports."""
import json
from pathlib import Path
import render as film

ROOT=Path(__file__).resolve().parent
film.DURATION=80.8
film.CAPTIONS=json.loads((ROOT/'captions-boston.json').read_text())
film.SCENES=[(0,8.35),(8.35,20.8),(20.8,24.15),(24.15,29.8),
             (29.8,63.0),(63.0,70.0),(70.0,73.85),(73.85,80.8)]
film.LANE_DELAYS=(1.23,9.56,21.84)

service,calendar,brief,sharing,build,async_scene,closing=film.DRAW_SCENE[1:]

def build_with_deadline(c,t):
    build(c,t)
    c.pill(800,703,'Brief due November 6',film.ROSE,film.BLUSH,22,center=True)

film.DRAW_SCENE=[film.scene0,lambda c,t:service(c,t*1.25),calendar,
                 lambda c,t:brief(c,t*1.65),sharing,build_with_deadline,
                 lambda c,t:async_scene(c,t*1.45),closing]

if __name__=='__main__':
    (ROOT/'captions-boston.srt').write_text('\n\n'.join(
        f'{i+1}\n{film.srt_time(a)} --> {film.srt_time(b)}\n{text}'
        for i,(a,b,text) in enumerate(film.CAPTIONS))+'\n')
    film.frame(56,1920).save(ROOT/'boston-examples-preview.png')
    film.frame(79,1920,False).save(ROOT/'boston-poster.png')
    film.render(1920,'narration-boston.mp3','otterd-greywolf-boston-review.mp4')
