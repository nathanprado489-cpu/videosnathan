import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs';

const enabled = Boolean(process.env.S3_BUCKET);
const client = enabled ? new S3Client({
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || 'us-east-1',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: process.env.S3_ACCESS_KEY ? { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY } : undefined
}) : null;

export async function putFile(filePath, key, contentType='application/octet-stream') {
  if (!client) return false;
  await client.send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:key,Body:fs.createReadStream(filePath),ContentType:contentType}));
  return true;
}

export function publicObjectUrl(key) {
  if (!key) return null;
  if (process.env.CDN_BASE_URL) return `${process.env.CDN_BASE_URL.replace(/\/$/,'')}/${key}`;
  if (!enabled) return null;
  const base = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
  return base ? `${base.replace(/\/$/,'')}/${process.env.S3_BUCKET}/${key}` : null;
}
