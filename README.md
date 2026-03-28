# LaunchLoop

LaunchLoop is an AI-powered event promo generator that turns a single event brief into a complete launch kit in minutes.

From one form submission, it creates:
- a square event poster
- an Instagram Story poster
- a short promo reel
- an AI voiceover
- background music
- a downloadable zip of final assets

It is built for hackathons, college events, product launches, and demo-day style campaigns where speed matters more than running a full creative pipeline by hand.


<img width="1496" height="333" alt="image" src="https://github.com/user-attachments/assets/600f758c-f9a4-4eb4-9641-9649a5b984a1" />
<img width="1494" height="701" alt="image" src="https://github.com/user-attachments/assets/e0c5dcd8-ee41-4bb8-8fea-4cfce5c4dc1c" />
<img width="1496" height="618" alt="image" src="https://github.com/user-attachments/assets/05e507d1-ab94-4174-8993-09c4c0713333" />
<img width="1454" height="663" alt="image" src="https://github.com/user-attachments/assets/64da8c89-9f0b-4ad0-879b-89eb769ab95d" />



## What It Does

Users enter their event details once, optionally upload a logo and QR code, and LaunchLoop automatically:

1. generates a creative plan and storyboard
2. creates branded poster assets
3. generates a vertical promo reel
4. creates voiceover and soundtrack
5. stitches final media together
6. packages everything into a downloadable kit

## Demo Flow

The app is designed to feel like a single end-to-end creative workflow:

1. Fill out the event brief on the home page
2. Upload optional brand/logo and registration QR assets
3. Generate a creative plan
4. Watch posters, video, voice, and music render in parallel
5. Review the storyboard and preview cards
6. Download the final promo kit as a zip

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Framer Motion`
- `Google GenAI SDK`
- `nanoBanana` poster generation module
- `UUID` for job IDs
- `Archiver` for zip export
- local filesystem storage for jobs, uploads, and generated assets
- `FFmpeg` and `ffprobe` for media stitching

## AI Pipeline

LaunchLoop uses a multi-stage AI pipeline rather than a single chatbot flow. Each stage is handled by the tool best suited for that part of the campaign:

- `Gemini` for creative planning and structured campaign output
- `nanoBanana` as the app's poster-generation layer, backed by `Gemini image generation`
- `Veo` for short live-action style promo clips
- `Gemini TTS` for voiceover
- `Lyria` for background music

This is what keeps the product consistent across formats: one brief becomes one shared creative plan, and that plan drives every generated asset.

If `GOOGLE_AI_API_KEY` is missing or a generation step fails, the app falls back to mock outputs so the UI can still be demoed locally.

## Project Structure

```text
app/
  api/
    plan/         # creative plan generation
    poster/       # square + story poster generation
    video/        # reel generation
    voice/        # voiceover generation
    music/        # soundtrack generation
    stitch/       # video/audio merge and QR overlay
    download/     # zip export
    upload-logo/  # logo + QR upload
  results/[jobId]/ # generated asset review page

components/       # UI cards, previews, pipeline states
lib/              # model wrappers, prompts, file helpers, job storage
tmp/jobs/         # persisted job JSON records
public/generated/ # generated assets served by the app
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create a local env file and add:

```bash
GOOGLE_AI_API_KEY=your_key_here
```

### 3. Make sure media tools are installed

LaunchLoop uses `ffmpeg` and `ffprobe` during the stitch step.

Check they are available:

```bash
ffmpeg -version
ffprobe -version
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How Data Is Stored

- Job state is stored locally in `tmp/jobs`
- Uploaded files are stored in `tmp/uploads`
- Generated assets are written to `public/generated`

This makes local demos easy because each generation run leaves behind inspectable artifacts and job records.

## Key Features

- Single-form event brief input
- Optional logo and QR upload
- Auto-generated campaign title, tagline, script, and storyboard
- Poster generation in square and story formats
- Short-form vertical reel generation
- Voice and music generation as separate assets
- Final stitched media outputs for preview and download
- Zip export for the full promo kit

## API Overview

- `POST /api/plan` creates a job and generates the creative plan
- `POST /api/poster` generates poster assets
- `POST /api/video` generates the base reel
- `POST /api/voice` generates narration
- `POST /api/music` generates soundtrack
- `POST /api/stitch` merges media and overlays QR where available
- `GET /api/download?jobId=...` returns a zip file of generated assets

## Why This Project Exists

LaunchLoop is meant to compress the usual event marketing workflow into one fast loop:

- brief
- generate
- review
- ship

Instead of juggling separate tools for copy, design, video, audio, and export, the project demonstrates how a single AI-native workflow can produce a launch-ready promo kit from one input.

## What Makes It Different

LaunchLoop is not just a chatbot and not just a thin wrapper around one model API.

- It does not stop at text responses; it generates real campaign assets
- It orchestrates multiple generation steps across planning, posters, video, voice, and music
- It stores job state, uploaded assets, and generated outputs across the workflow
- It post-processes media with `FFmpeg` to create final previewable and downloadable deliverables
- It keeps outputs aligned by using one shared creative plan for the whole campaign

That is what makes it feel like a product pipeline, not just a prompt box.

## Notes

- Do not commit real API keys or secrets to GitHub
- Generated quality depends on model availability and API access
- Without a valid Google AI key, the app still runs with mock fallback assets for presentation purposes

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
