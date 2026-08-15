# VideoSnathan

Plataforma de vídeos com identidade visual própria e arquitetura preparada para crescer para produção.

## Recursos implementados

- Autenticação JWT e senhas com bcrypt
- Upload de vídeos com limite de 5 GB
- PostgreSQL + Prisma
- Worker FFmpeg para transcodificação H.264/AAC
- Armazenamento S3-compatible/MinIO
- Player de mídia e URLs de playback
- Busca, categorias, Shorts e vídeos públicos
- Curtidas e comentários persistentes
- Inscrições e notificações
- Playlists
- Studio com métricas de vídeos, inscritos, likes, views e ganhos
- API de monetização para registrar receitas
- Live streaming com RTMP + HLS via nginx-rtmp
- Docker Compose para PostgreSQL, MinIO e gateway RTMP

## Arquitetura

`frontend/` — interface web

`backend/src/server.js` — API HTTP

`backend/src/worker.js` — processamento assíncrono de vídeo

`backend/src/storage.js` — adaptador S3-compatible

`backend/prisma/` — modelo PostgreSQL

`infra/nginx.conf` — gateway RTMP/HLS

## Executar localmente

1. Copie `backend/.env.example` para `backend/.env` e altere `JWT_SECRET`.
2. Inicie os serviços:

```bash
docker compose up -d
```

3. Instale e prepare a API:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name platform
npm run dev
```

4. Em outro terminal, rode o processador:

```bash
cd backend
npm run worker
```

O PostgreSQL fica em `5432`, MinIO em `9000` e seu console em `9001`. O RTMP recebe streams em `1935`.

## Produção

Para produção, use armazenamento S3/CDN gerenciado, HTTPS, secrets fora do repositório, filas (Redis/SQS), múltiplas instâncias do worker, observabilidade, rate limiting, antivírus/moderação de uploads e uma política de direitos autorais.
