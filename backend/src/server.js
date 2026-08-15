import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 4000);
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 5 * 1024 * 1024 * 1024 } });

app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/media', express.static(uploadDir));

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Autenticação necessária' });
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Token inválido' }); }
};

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'VideoSnathan API' }));

app.post('/api/auth/register', async (req, res) => {
  const parsed = z.object({ email:z.string().email(), password:z.string().min(8), name:z.string().min(2).max(80) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'Dados inválidos' });
  const { email, password, name } = parsed.data;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data:{ email, passwordHash, name } });
    const token = jwt.sign({ id:user.id, email:user.email }, process.env.JWT_SECRET, { expiresIn:'7d' });
    res.status(201).json({ token, user:{ id:user.id, email:user.email, name:user.name } });
  } catch { res.status(409).json({ error:'E-mail já cadastrado' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const parsed = z.object({ email:z.string().email(), password:z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'Dados inválidos' });
  const user = await prisma.user.findUnique({ where:{ email:parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ error:'E-mail ou senha incorretos' });
  const token = jwt.sign({ id:user.id, email:user.email }, process.env.JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user:{ id:user.id, email:user.email, name:user.name, avatarUrl:user.avatarUrl } });
});

app.get('/api/videos', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const videos = await prisma.video.findMany({ where:{ status:'ready', visibility:'public', ...(q ? { OR:[{title:{contains:q,mode:'insensitive'}},{description:{contains:q,mode:'insensitive'}}]} : {}) }, include:{ author:{ select:{id:true,name:true,avatarUrl:true} } }, orderBy:{ createdAt:'desc' }, take:50 });
  res.json(videos);
});

app.get('/api/videos/:id', async (req,res) => {
  const video = await prisma.video.findUnique({ where:{id:req.params.id}, include:{author:{select:{id:true,name:true,avatarUrl:true}},comments:{include:{user:{select:{id:true,name:true,avatarUrl:true}}},orderBy:{createdAt:'desc'}}} });
  if (!video) return res.status(404).json({error:'Vídeo não encontrado'});
  await prisma.video.update({ where:{id:video.id}, data:{views:{increment:1}} });
  res.json(video);
});

app.post('/api/videos', auth, upload.single('video'), async (req,res) => {
  if (!req.file) return res.status(400).json({error:'Arquivo de vídeo obrigatório'});
  const parsed = z.object({title:z.string().min(1).max(120),description:z.string().max(5000).optional(),visibility:z.enum(['public','private','unlisted']).default('public')}).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({error:'Título ou dados inválidos'});
  const video = await prisma.video.create({ data:{ ...parsed.data, description:parsed.data.description || '', storageKey:req.file.filename, authorId:req.user.id } });
  res.status(201).json(video);
});

app.post('/api/videos/:id/comments', auth, async (req,res) => {
  const parsed = z.object({body:z.string().min(1).max(2000)}).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({error:'Comentário inválido'});
  const comment = await prisma.comment.create({data:{body:parsed.data.body,userId:req.user.id,videoId:req.params.id},include:{user:{select:{id:true,name:true,avatarUrl:true}}}});
  res.status(201).json(comment);
});

app.post('/api/videos/:id/like', auth, async (req,res) => {
  const existing = await prisma.like.findUnique({where:{userId_videoId:{userId:req.user.id,videoId:req.params.id}}});
  if (existing) await prisma.like.delete({where:{id:existing.id}}); else await prisma.like.create({data:{userId:req.user.id,videoId:req.params.id}});
  res.json({liked:!existing});
});

app.post('/api/channels/:id/subscribe', auth, async (req,res) => {
  if (req.params.id === req.user.id) return res.status(400).json({error:'Não é possível se inscrever no próprio canal'});
  const existing = await prisma.subscription.findUnique({where:{subscriberId_creatorId:{subscriberId:req.user.id,creatorId:req.params.id}}});
  if (existing) await prisma.subscription.delete({where:{id:existing.id}}); else await prisma.subscription.create({data:{subscriberId:req.user.id,creatorId:req.params.id}});
  res.json({subscribed:!existing});
});

app.use((err,_,res,next)=>{ console.error(err); if (res.headersSent) return next(err); res.status(500).json({error:'Erro interno'}); });
app.listen(port, ()=>console.log(`VideoSnathan API rodando na porta ${port}`));
