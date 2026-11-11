# Trim and verify the video

Run from the per-demo scratch directory. Keep `raw.webm`; write the edited result
to a separate file. The examples assume ffmpeg supports VP9 and the named filters.

## Find dead air

```sh
ffmpeg -i raw.webm -vf "freezedetect=n=0.001:d=1.5" -map 0:v -f null -
```

Long freezes often correspond to gaps between tool calls. Caption holds and
intentional pauses also look frozen; match intervals to the visuals before cutting.

Generate numbered contact sheets, not just the first sheet of a long raw video:

```sh
ffmpeg -y -i raw.webm -vf "fps=1,scale=320:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x5" -fps_mode vfr raw-sheet-%03d.png
```

Inspect every sheet. If `drawtext` is unavailable, omit that filter and use the
one-frame-per-second sample order to locate intervals. Open frames around uncertain
boundaries. Cut the lead-in before the first beat, unnecessary gaps between beats,
and the static tail. Preserve enough time to read each caption.

## Export

Replace `A,B,C,D` with measured interval boundaries in seconds (or remove unused
intervals). Normalize to 30 fps before selecting frames so output duration is not
incorrectly calculated from a variable-frame-rate source:

```sh
ffmpeg -y -i raw.webm -vf "fps=30,select='not(between(t,A,B)+between(t,C,D))',setpts=N/(30*TB)" -r 30 -an -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -cpu-used 4 demo.webm
```

These demos are silent, with captions. If narration is requested, preserve the
audio and trim audio/video together; do not use `-an` or the video-only recipe.

## Verify the complete output

```sh
ffmpeg -y -i demo.webm -vf "fps=1,scale=320:-1,tile=6x5" -fps_mode vfr final-sheet-%03d.png
ffprobe -v error -show_entries format=duration,size -of json demo.webm
ffmpeg -v error -i demo.webm -f null -
```

Inspect all final sheets and any frames needed to verify readability and transitions.
Decoding checks file integrity but does not replace visual inspection. If a WebM
header lacks duration, count decoded frames in the **30 fps final export** and
divide by 30:

```sh
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 demo.webm
```

Do not apply that division to an arbitrary raw stream. Remove only old sheet files
from this run before regenerating, or use a new output prefix so stale pages are
not mistaken for frames of the latest edit.
