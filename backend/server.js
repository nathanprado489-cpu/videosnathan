import express from 'express';
import cors from 'cors';

const app=express();
app.use(cors());
app.use(express.json());

const videos=[
 {id:'1',title:'Brasil: os melhores gols da rodada',channel:'Na Cara do Gol',views:1200000},
 {id:'2',title:'Construindo um jogo do zero na Unreal Engine 5',channel:'Dev Brasil',views:428000}
];

app.get('/api/health',(req,res)=>res.json({ok:true,name:'VideoSnathan API'}));
app.get('/api/videos',(req,res)=>res.json(videos));
app.get('/api/videos/:id',(req,res)=>{const video=videos.find(v=>v.id===req.params.id);video?res.json(video):res.status(404).json({error:'Vídeo não encontrado'});});
app.listen(process.env.PORT||3000,()=>console.log('VideoSnathan API running'));
