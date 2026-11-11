# Scroll film — frames

The "Interlude" section scrubs a frame sequence with scroll (canvas + GSAP ScrollTrigger). It reads
`public/frames/manifest.json` and loads frames named `frame-0001.webp`, `frame-0002.webp`, ...

The 96 frames currently committed are a slow placeholder built from the stills. Replace them with
your own film at any time — no component changes needed.

## 1. Generate the clip

Use this prompt with your video model (Veo / Runway / Kling / Sora). One continuous take, no cuts —
the scrubbing makes cuts read as glitches.

> Cinematic fashion film, 6 seconds, 16:9, 24fps, one continuous take, seamless loop.
> Scene: a sunlit Lisbon atelier with warm plaster walls and a single large window. A model in
> flowing ivory silk walks slowly across the frame; the fabric lifts and settles in slow motion.
> Camera: locked-off tripod with a very slow push-in (5% over the full shot), eye level, 50mm lens,
> shallow depth of field. Lighting: soft north-window light, warm highlights, deep quiet shadows.
> Grade: desaturated bone, ivory and charcoal palette with a warm film print feel, fine 35mm grain,
> subtle halation. Mood: quiet, sculptural, expensive.
> Motion must be slow and continuous; the model turns once, fabric moves throughout. No cuts, no
> camera shake, no fast movement, no text, no logos, no extra people, no props.
> End on a composition that can crossfade back into the first frame.

Keep the model mid-distance (waist-up or full-body): faces rendered close-up in AI video tend to
morph when scrubbed.

## 2. Convert to frames

Requires [ffmpeg](https://ffmpeg.org/) (`winget install Gyan.FFmpeg` on Windows, `brew install ffmpeg`
on macOS).

```bash
npm run frames -- path/to/film.mp4 --fps 24 --width 1440 --quality 74
```

This replaces `public/frames/` with numbered WebP frames and writes a fresh `manifest.json`
(count, fps, source). The site picks the new count up automatically.

- **Frame count:** 96–144 is the sweet spot. A 6s clip at 24fps gives 144.
- **Weight:** target under ~8 MB total. Lower `--quality` (60–70) or `--width` (1080–1280) if needed.
- **Aspect:** any; the canvas crops to `cover`, so 16:9 is ideal and portrait also works.
- **Loop:** prefer a clip whose last frame is close to the first, so the scrub loops cleanly.

## 3. Tune the section

- `src/components/Sequence.tsx` — chapter titles/copy, frame path, poster fallback.
- `src/styles.css` (`.sequence`) — the scroll length (`height: 320vh`; less = faster scrub).

If no frames or manifest are present, the section falls back to the poster image and still animates
its chapter copy, so the site never breaks.
