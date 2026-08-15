const videos=[
 {title:'Brasil: os melhores gols da rodada',channel:'Na Cara do Gol',views:'1,2 mi visualizações',time:'há 2 horas',duration:'10:24',icon:'⚽'},
 {title:'Construindo um jogo do zero na Unreal Engine 5',channel:'Dev Brasil',views:'428 mil visualizações',time:'há 5 horas',duration:'18:42',icon:'🎮'},
 {title:'A história da tecnologia em 15 minutos',channel:'Mundo Tech',views:'892 mil visualizações',time:'há 1 dia',duration:'15:07',icon:'💻'},
 {title:'Música para estudar e relaxar',channel:'Som Livre',views:'3,8 mi visualizações',time:'há 2 dias',duration:'1:02:15',icon:'🎵'},
 {title:'Como criar seu primeiro canal de vídeo',channel:'Criadores',views:'211 mil visualizações',time:'há 3 dias',duration:'12:30',icon:'🎥'},
 {title:'Gameplay: sobrevivência em mundo aberto',channel:'Nexus Games',views:'675 mil visualizações',time:'há 4 dias',duration:'26:18',icon:'🕹️'},
 {title:'Notícias do mundo — resumo do dia',channel:'Agora News',views:'1,7 mi visualizações',time:'há 6 horas',duration:'08:55',icon:'📰'},
 {title:'Aprenda programação de forma simples',channel:'Código Fácil',views:'334 mil visualizações',time:'há 1 semana',duration:'21:03',icon:'⌨️'}
];
const grid=document.querySelector('#videoGrid');
function render(list=videos){grid.innerHTML=list.map((v,i)=>`<article class="card" data-index="${i}"><div class="thumb"><span>${v.icon}</span><span class="duration">${v.duration}</span></div><h3>${v.title}</h3><div class="meta"><b>${v.channel}</b><br>${v.views} • ${v.time}</div></article>`).join('');}
render();
document.querySelector('#searchForm').addEventListener('submit',e=>{e.preventDefault();const q=document.querySelector('#searchInput').value.trim().toLowerCase();render(q?videos.filter(v=>(v.title+' '+v.channel).toLowerCase().includes(q)):videos);});
document.querySelector('#menuBtn').addEventListener('click',()=>document.querySelector('#sidebar').classList.toggle('hidden'));
document.querySelector('#exploreBtn').addEventListener('click',()=>document.querySelector('#videoGrid').scrollIntoView({behavior:'smooth'}));
document.querySelector('#chips').addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('active'));e.target.classList.add('active');});
