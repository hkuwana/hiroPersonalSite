# Ambient audio credits

Every source recording below is dedicated to the public domain under
**Creative Commons 0** (CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/).
CC0 requires no attribution, but we keep this record of where each sound came from.
Licenses were checked on each Freesound page on 2026-10-24. The source audio was
the public Freesound HQ preview (128 kbps MP3) of each sound.

All four output files are 45.0 s seamless loops, stereo, 44.1 kHz. The loop seam
is baked in: each mix was built 48 s long, then the last 3 s were crossfaded
(equal-power) over the first 3 s, and 45 s were kept. The files have no fade-in or
fade-out. Loudness was set by one fixed gain to about -26 LUFS integrated; true peak
stays well under -3 dBTP. Processing used only ffmpeg.

- `.m4a` is AAC-LC at 80 kbps (ffmpeg native encoder, chosen because it writes
  gapless priming/padding info: it decodes to exactly 45.000 s).
- `.ogg` is Vorbis. It uses ffmpeg's built-in Vorbis encoder at `-q:a 0.9`, which
  gives about 85 kbps, because libvorbis was not installed.

## village-day.m4a / village-day.ogg

Calm daytime countryside: a quiet stream, wind in bamboo leaves, a Japanese bush
warbler (uguisu) calling every 10-15 s, and faint small songbirds. No cicadas.

1. **Birds, wind through bamboo and a little waterstream - Japan - Binaural**
   - Author: tomasloos
   - Source: https://freesound.org/people/tomasloos/sounds/843520/
   - License: Creative Commons 0
   - Recorded in Iwami District, Tottori, Japan.
   - Used twice:
     - 0:02-0:50 is the main bed (stream, uguisu calls). Two-stage 150 Hz
       high-pass and a 9 kHz low-pass, at 0 dB.
     - 1:35-2:23 is wind through the bamboo and includes one more uguisu call.
       Two-stage 220 Hz high-pass (to remove mic wind rumble) and an 8 kHz
       low-pass, at -13 dB.
   - The source description does not name the bird. It was identified as uguisu
     because its spectrogram matches the labeled CC0 recording "Japanese bush
     warbler (uguisu) in a city ambiance" by warukunai
     (https://freesound.org/people/warukunai/sounds/524526/). That recording was
     used only as a reference, not in the mix.

2. **singing birds in the forest**
   - Author: florianreichelt
   - Source: https://freesound.org/people/florianreichelt/sounds/440604/
   - License: Creative Commons 0
   - Recorded in Fujinomiya, Shizuoka, Japan, near Mount Fuji.
   - Used 0:05-0:53. A two-stage 2.5 kHz high-pass keeps only the distant songbird
     phrases and removes the low background. Also a 9 kHz low-pass, at -12 dB.

Mix: the three layers were summed without normalization, then the 48 s mix was
looped (3 s crossfade, 45 s kept). The gain was +32.7 dB.

## village-night.m4a / village-night.ogg

Calm summer night: field crickets, a distant frog chorus from the paddies, and
soft wind in leaves.

1. **Japan_Kashiwa_Field_Crickets_Midnight.wav**
   - Author: RutgerMuller
   - Source: https://freesound.org/people/RutgerMuller/sounds/364860/
   - License: Creative Commons 0
   - Recorded in rural Kashiwa, Chiba, Japan.
   - Used 1:10-1:58. A two-stage 350 Hz high-pass removes distant rumble. A
     -5 dB bell cut at 3 kHz softens the strongest cricket tone, and a -4 dB
     high-shelf at 6 kHz softens the top. Level 0 dB.

2. **Frogs by night in summer.**
   - Author: kynodelia
   - Source: https://freesound.org/people/kynodelia/sounds/829170/
   - License: Creative Commons 0
   - Recorded in Ansan-si, South Korea, which shares paddy frog species with Japan.
   - Used 0:08-0:56. The mono source was sent to both channels. Two-stage 500 Hz
     high-pass and a 4.5 kHz low-pass, at -4 dB.

3. **Birds, wind through bamboo and a little waterstream - Japan - Binaural**
   - Author: tomasloos
   - Source: https://freesound.org/people/tomasloos/sounds/843520/ (the same
     recording as the day loop)
   - License: Creative Commons 0
   - Used 2:37-3:25, a stretch that is mostly wind in the bamboo. Two-stage 150 Hz
     high-pass and a 4 kHz low-pass, at +19 dB because the source is very quiet.
     It sits about 10 dB under the crickets.

Mix: the three layers were summed without normalization, then the 48 s mix was
looped (3 s crossfade, 45 s kept). The gain was -4.5 dB.
