import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const prisma = new PrismaClient();
const inputDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
const outputDir = path.resolve(process.env.PROCESSED_DIR || './processed');
fs.mkdirSync(outputDir, { recursive: true });

function ffmpeg(input, output) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.env.FFMPEG_BIN || 'ffmpeg', ['-y','-i',input,'-c:v','libx264','-preset','veryfast','-crf','23','-c:a','aac','-movflags','+faststart',output], { stdio:'ignore' });
    p.on('error', reject); p.on('close', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)));
  });
}

async function processOne(video) {
  const input = path.join(inputDir, video.storageKey);
  if (!fs.existsSync(input)) throw new Error(`Arquivo ausente: ${input}`);
  const key = `${video.id}.mp4`;
  const output = path.join(outputDir, key);
  await ffmpeg(input, output);
  await prisma.video.update({ where:{id:video.id}, data:{ status:'ready', playbackKey:key } });
}

async function loop() {
  const jobs = await prisma.video.findMany({ where:{status:'processing'}, take:2, orderBy:{createdAt:'asc'} });
  for (const video of jobs) {
    try { await processOne(video); console.log(`Processado ${video.id}`); }
    catch (err) { console.error(err); await prisma.video.update({where:{id:video.id},data:{status:'failed'}}).catch(()=>{}); }
  }
}

console.log('VideoSnathan media worker iniciado');
setInterval(loop, Number(process.env.WORKER_INTERVAL_MS || 5000));
loop();
