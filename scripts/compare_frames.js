import { execSync } from 'child_process';
import path from 'path';

const ffmpegBin = 'C:\\Users\\user\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';

export function compareFrame(masterPng, generatedWebp) {
  const cmd = `"${ffmpegBin}" -v error -i "${generatedWebp}" -i "${masterPng}" -filter_complex "[0:v][1:v]psnr=stats_file=-;[0:v][1:v]ssim=stats_file=-" -f null -`;
  try {
    const out = execSync(cmd, { encoding: 'utf-8' });
    return out;
  } catch (err) {
    return (err.stdout || '') + '\n' + (err.stderr || '');
  }
}

// Test on smoke frame 120
const master = path.resolve('inputs_and_frames/01_martini_reveal/frame_0120.png');
const webp = path.resolve('public/frames/01_martini_reveal/0120.webp');
console.log('Comparing master:', master);
console.log('Against webp  :', webp);
const result = compareFrame(master, webp);
console.log('Result:\n', result);
