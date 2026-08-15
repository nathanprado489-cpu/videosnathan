import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs';

const enabled = Boolean(process.env.S3_ENDPOINT && process.env.S3_BUCKET);
const client = enabled ? new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY }
}) : null;

export async function putFile(filePath, key, contentType='application/octet-stream') {
  if (!client) return false;
  await client.send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:key,Body:fs.createReadStream(filePath),ContentType:contentType}));
  return true;
}

export function publicObjectUrl(key) {
  if (!enabled) return null;
  const base = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
  return `${base.replace(/\/$/,'')}/${process.env.S3_BUCKET}/${key}`;
}
