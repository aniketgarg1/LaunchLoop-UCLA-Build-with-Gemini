// TODO: Wire real FFmpeg for video stitching
// This module provides helpers for:
//   1. Concatenating video clips into a single reel
//   2. Overlaying voiceover audio onto video
//   3. Mixing background music
//
// Requires ffmpeg installed on the system.
// Install via: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)

// import { exec } from "child_process";
// import { promisify } from "util";
// const execAsync = promisify(exec);

export async function concatVideos(
  _clipPaths: string[],
  _outputPath: string
): Promise<string> {
  // TODO: Implement with real FFmpeg
  // const listFile = outputPath + ".txt";
  // const listContent = clipPaths.map(p => `file '${p}'`).join("\n");
  // await fs.writeFile(listFile, listContent);
  // await execAsync(`ffmpeg -f concat -safe 0 -i ${listFile} -c copy ${outputPath}`);
  // return outputPath;

  throw new Error("FFmpeg concat not yet implemented — using mock reel instead");
}

export async function overlayAudio(
  _videoPath: string,
  _audioPath: string,
  _outputPath: string
): Promise<string> {
  // TODO: Implement with real FFmpeg
  // await execAsync(
  //   `ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -shortest ${outputPath}`
  // );
  // return outputPath;

  throw new Error("FFmpeg audio overlay not yet implemented");
}

export async function mixAudioTracks(
  _voicePath: string,
  _musicPath: string,
  _outputPath: string
): Promise<string> {
  // TODO: Implement with real FFmpeg
  // await execAsync(
  //   `ffmpeg -i ${voicePath} -i ${musicPath} -filter_complex amix=inputs=2:duration=first ${outputPath}`
  // );
  // return outputPath;

  throw new Error("FFmpeg audio mix not yet implemented");
}
