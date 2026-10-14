// ===== Engine: canvas rendering, sprites, input, UI windows =====
const VW=320,VH=240,TS=16;
const cvs=document.getElementById('cv'),ctx=cvs.getContext('2d');cvs.width=VW;cvs.height=VH;ctx.imageSmoothingEnabled=false;
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]};
let hashSeed=0;const hrand=(x,y,k=0)=>{let h=(x*374761393+y*668265263+k*982451653)|0;h=(h^(h>>13))*1274126177;return((h^(h>>16))>>>0)/4294967296};
// ---- Tiles ----
const PAL={
 world:{'.':'#3c9c3c',':':'#c9a15f','s':'#e2cc7c'},
 town:{'.':'#48a848','_':'#b07840',':':'#b8a890','=':'#a06a38'},
 cave:{'.':'#5a4632',',':'#4a3828'},
 tower:{'.':'#9a9aa8',',':'#3858b8'},
 castle:{'.':'#b8b0a0',',':'#c02828'},
 demon:{'.':'#3a2840',',':'#801838'},
};
const tileCache={};
function drawTile(style,ch,x,y,frame,gateLook){const key=style+ch+frame+(gateLook||'');let t=tileCache[key];
 if(!t){const[c,g]=mk(TS,TS);paintTile(g,style,ch,frame,gateLook);t=tileCache[key]=c}ctx.drawImage(t,x,y)}
function speck(g,base,dark,n,seed){R(g,0,0,16,16,base);for(let i=0;i<n;i++){const px=(hrand(i,seed)*16)|0,py=(hrand(seed,i,3)*16)|0;R(g,px,py,1,1,dark)}}
function paintTile(g,style,ch,f,look){
 const P=PAL[style]||{};
 const grass=()=>{speck(g,'#3c9c3c','#2f7f2f',10,1);R(g,4,5,1,2,'#58b858');R(g,11,11,1,2,'#58b858')};
 const water=()=>{R(g,0,0,16,16,'#2050c0');g.fillStyle='#6090f0';for(let i=0;i<3;i++){const ox=(i*6+f*3)%16;g.fillRect(ox,3+i*5,4,1);g.fillRect((ox+8)%16,5+i*5,3,1)}};
 if(style=='world'){
  if(ch=='~')return water();
  if(ch=='.')return grass();
  if(ch==':'){speck(g,'#c9a15f','#a8844a',12,2);return}
  if(ch=='s'){speck(g,'#e2cc7c','#c8b060',10,3);return}
  if(ch=='T'){grass();for(const[ox,oy]of[[1,2],[8,0],[4,7]]){g.fillStyle='#1d6b2a';g.beginPath();g.arc(ox+4,oy+4,4.5,0,7);g.fill();R(g,ox+2,oy+2,2,2,'#3a9a48');R(g,ox+3,oy+8,2,2,'#5a3a1a')}return}
  if(ch=='^'){grass();g.fillStyle='#8a7050';g.beginPath();g.moveTo(0,15);g.lineTo(8,1);g.lineTo(16,15);g.fill();g.fillStyle='#b09070';g.beginPath();g.moveTo(8,1);g.lineTo(3,10);g.lineTo(8,8);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(8,1);g.lineTo(6,5);g.lineTo(10,5);g.fill();return}
  if(ch=='=')return(R(g,0,0,16,16,'#2050c0'),R(g,0,2,16,12,'#a06a38'),[3,7,11].forEach(y=>R(g,0,y+2,16,1,'#704818')));
  if(ch=='g'){if(look=='rock'){speck(g,'#c9a15f','#a8844a',12,2);g.fillStyle='#777';g.beginPath();g.arc(8,9,7,0,7);g.fill();R(g,4,5,4,3,'#999');R(g,9,11,4,2,'#555');return}
   if(look=='bridge'){R(g,0,0,16,16,'#2050c0');R(g,2,0,12,16,'#a06a38');[2,6,10,14].forEach(y=>R(g,2,y,12,1,'#704818'));return}
   if(look=='bridgeX'){R(g,0,0,16,16,'#2050c0');R(g,2,0,12,16,'#a06a38');R(g,1,6,14,3,'#d02020');R(g,3,6,2,3,'#fff');R(g,11,6,2,3,'#fff');return}
   if(look=='light'){R(g,0,0,16,16,'#2050c0');R(g,0,3,16,10,'#e8f0ff');R(g,0,3,16,1,'#ffe060');R(g,0,12,16,1,'#ffe060');R(g,(f*5)%16,7,3,2,'#fff');return}
   return water()}
  return grass()}
 // interior styles
 const floor=(ch2)=>{const c=P[ch2]||'#888';
  if(style=='town'&&ch2=='.')return grass();
  if(style=='town'&&ch2=='_'){R(g,0,0,16,16,'#b07840');[0,4,8,12].forEach(y=>R(g,0,y,16,1,'#8a5a2a'));R(g,(hrand(1,2)*16)|0,1,1,3,'#8a5a2a');return}
  if(style=='town'&&ch2==':'){R(g,0,0,16,16,'#b8a890');R(g,0,0,8,8,'#c8b8a0');R(g,8,8,8,8,'#c8b8a0');R(g,0,0,16,1,'#988870');R(g,0,8,16,1,'#988870');return}
  if(style=='town'&&ch2=='='){R(g,0,0,16,16,'#a06a38');[3,7,11,15].forEach(y=>R(g,0,y,16,1,'#704818'));return}
  if(style=='town'&&ch2==','){grass();[[3,3,'#f44'],[11,6,'#ff4'],[6,11,'#f8f'],[12,13,'#fff']].forEach(([x,y,cc])=>{R(g,x,y,2,2,cc);R(g,x,y+2,1,2,'#262')});return}
  if(ch2==','&&(style=='castle'||style=='demon'||style=='tower')){R(g,0,0,16,16,c);R(g,0,0,1,16,style=='tower'?'#fff4':'#ffd04080');R(g,15,0,1,16,style=='tower'?'#fff4':'#ffd04080');return}
  speck(g,c,'#0003',14,5);if(style!='cave'){g.fillStyle='#0002';g.fillRect(0,0,16,1);g.fillRect(0,0,1,16)}};
 if(ch=='#'){
  if(style=='town'){R(g,0,0,16,16,'#c8a878');g.fillStyle='#8a6a48';for(let y=0;y<16;y+=4){g.fillRect(0,y,16,1);for(let x=(y/4%2)*4;x<16;x+=8)g.fillRect(x,y,1,4)}R(g,0,0,16,2,'#a03020');return}
  if(style=='cave'){R(g,0,0,16,16,'#2a1e14');g.fillStyle='#4a3828';g.beginPath();g.arc(5,6,5,0,7);g.arc(12,11,5,0,7);g.fill();R(g,3,3,3,2,'#6a5038');return}
  if(style=='tower'||style=='castle'){R(g,0,0,16,16,style=='tower'?'#606070':'#8a8a98');g.fillStyle=style=='tower'?'#404050':'#5a5a68';for(let y=0;y<16;y+=4){g.fillRect(0,y,16,1);for(let x=(y/4%2)*4;x<16;x+=8)g.fillRect(x,y,1,4)}return}
  if(style=='demon'){R(g,0,0,16,16,'#3a1848');g.fillStyle='#200c28';for(let y=0;y<16;y+=4){g.fillRect(0,y,16,1);for(let x=(y/4%2)*4;x<16;x+=8)g.fillRect(x,y,1,4)}R(g,6,6,2,2,'#a02040');return}}
 if(ch=='T'){grass();g.fillStyle='#1d6b2a';g.beginPath();g.arc(8,7,7,0,7);g.fill();R(g,4,3,3,3,'#3a9a48');R(g,7,13,3,3,'#5a3a1a');return}
 if(ch=='~'){if(style=='town')return water();if(style=='tower'){R(g,0,0,16,16,'#7090e0');R(g,(f*4+3)%16,5,6,2,'#fff');return}if(style=='demon'){R(g,0,0,16,16,'#300');R(g,(f*5)%16,8,4,2,'#f40');R(g,(f*5+8)%16,3,3,2,'#c20');return}R(g,0,0,16,16,'#000');return}
 if(ch=='C'){floor('_');R(g,0,2,16,12,'#7a4a20');R(g,0,2,16,2,'#a06a38');return}
 if(ch=='k'){floor('.');R(g,2,0,12,16,'#6a3a10');R(g,2,0,12,1,'#000');R(g,7,0,1,16,'#3a1a00');R(g,10,7,2,3,'#fd4');return}
 if(ch=='S'){floor('.');for(let i=0;i<4;i++){R(g,0,i*4,16,3,style=='demon'?'#5a3a68':'#c8c0b0');R(g,0,i*4+3,16,1,'#000a')}return}
 if(ch=='D'){floor(style=='town'?'.':'.');R(g,3,0,10,16,'#4a2a10');R(g,3,0,10,2,'#888');R(g,7,0,2,16,'#2a1000');return}
 if(ch=='E'){floor(style=='town'?':':'.');return}
 floor(ch)}
function drawWorldIcon(type,x,y){const g=ctx;
 if(type=='town'){[[1,6],[8,3]].forEach(([ox,oy])=>{R(g,x+ox,y+oy+4,7,6,'#f0e0c0');g.fillStyle='#c03020';g.beginPath();g.moveTo(x+ox-1,y+oy+5);g.lineTo(x+ox+3.5,y+oy);g.lineTo(x+ox+8,y+oy+5);g.fill();R(g,x+ox+3,y+oy+7,2,3,'#6a3a10')});return}
 if(type=='cave'){g.fillStyle='#8a7050';g.beginPath();g.moveTo(x,y+16);g.lineTo(x+8,y+1);g.lineTo(x+16,y+16);g.fill();g.fillStyle='#000';g.beginPath();g.arc(x+8,y+14,4,Math.PI,0);g.fill();R(g,x+4,y+14,8,2,'#000');return}
 if(type=='tower'){R(g,x+5,y+1,6,15,'#a0a0b0');R(g,x+4,y,8,3,'#707080');R(g,x+7,y+5,2,2,'#223');R(g,x+7,y+12,2,4,'#223');return}
 if(type=='castle'){R(g,x+1,y+5,14,11,'#d0d0d8');[1,6,11].forEach(o=>R(g,x+o,y+2,4,4,'#d0d0d8'));R(g,x+6,y+11,4,5,'#334');R(g,x+7,y,1,3,'#f22');return}
 if(type=='demon'){R(g,x+1,y+5,14,11,'#402050');[1,6,11].forEach(o=>{g.fillStyle='#602070';g.beginPath();g.moveTo(x+o,y+6);g.lineTo(x+o+2,y);g.lineTo(x+o+4,y+6);g.fill()});R(g,x+6,y+11,4,5,'#000');R(g,x+4,y+8,2,2,'#f22');R(g,x+10,y+8,2,2,'#f22');return}}
// ---- Character sprites (procedural 16x16 pixel art) ----
const SPR={
 hero:{hair:'#5a3010',skin:'#f8c898',body:'#2850d0',legs:'#303050',cape:'#c02020',band:'#e0e0e0'},
 elder:{hair:'#f0f0f0',skin:'#f0c090',body:'#7a4a2a',legs:'#5a3a1a',beard:1},
 merchant:{hair:'#3a2a10',skin:'#f8c898',body:'#30a050',legs:'#604020',hat:'#d0b060'},
 inn:{hair:'#8a3010',skin:'#f8c898',body:'#e08030',legs:'#704020',apron:'#fff'},
 kid:{hair:'#d0a020',skin:'#f8d0a8',body:'#e04040',legs:'#3050a0',small:1},
 woman:{hair:'#c05020',skin:'#f8d0a8',body:'#e070a0',legs:'#e070a0',long:1},
 priest:{hair:'#404040',skin:'#f8c898',body:'#f0f0f0',legs:'#f0f0f0',hat:'#7040a0'},
 man:{hair:'#2a1a0a',skin:'#e8b080',body:'#8a6a3a',legs:'#4a3a2a'},
 guard:{hair:'#888',skin:'#f8c898',body:'#9090a8',legs:'#505060',helm:'#b0b0c0'},
 king:{hair:'#a07030',skin:'#f8c898',body:'#c02030',legs:'#c02030',crown:1,beard:1},
 sailor:{hair:'#2a1a0a',skin:'#d8a070',body:'#f0f0f0',legs:'#2040a0',stripe:'#2040a0'},
};
const sprCache={};
function personSprite(type,dir,fr){const key=type+dir+fr;if(sprCache[key])return sprCache[key];const[c,g]=mk(16,16);const p=SPR[type]||SPR.man;const P=(x,y,w,h,col)=>R(g,x,y,w,h,col);
 const sy=p.small?2:0;
 // legs
 const lo=fr?1:0;if(dir<2){P(5,13,2,3-lo,p.legs);P(9,13,2,2+lo,p.legs)}else{P(6+(fr?-1:1),13,2,3,p.legs);P(8+(fr?1:-1),13,2,3,p.legs)}
 // cape (behind)
 if(p.cape&&dir!=0){P(dir==1?3:dir==2?9:3,7+sy,dir==1?10:4,6,p.cape)}
 // body
 P(4,7+sy,8,6-sy,p.body);if(p.long||p.legs==p.body)P(3,10+sy,10,4-sy,p.body);if(p.apron&&dir!=1)P(5,9+sy,6,4,p.apron);if(p.stripe){P(4,9+sy,8,1,p.stripe);P(4,11+sy,8,1,p.stripe)}
 // arms
 P(dir==3?7:3,8+sy,2,4,p.skin);P(dir==2?7:11,8+sy,2,4,p.skin);if(dir<2){P(3,8+sy,1,3,p.body);P(12,8+sy,1,3,p.body)}
 // head
 P(4,1+sy,8,7,p.skin);P(4,0+sy,8,3,p.hair);
 if(dir==1)P(4,0+sy,8,7,p.hair);else{if(dir==0){P(4,3+sy,1,2,p.hair);P(11,3+sy,1,2,p.hair);P(6,4+sy,1,2,'#000');P(9,4+sy,1,2,'#000')}else{const e=dir==2?5:10;P(dir==2?10:4,2+sy,2,4,p.hair);P(e,4+sy,1,2,'#000')}}
 if(p.long&&dir!=0)P(4,2+sy,8,6,p.hair);if(p.long&&dir==0){P(3,2+sy,2,7,p.hair);P(11,2+sy,2,7,p.hair)}
 if(p.beard&&dir!=1)P(5,6+sy,6,3,'#f0f0f0');if(p.hat)P(3,0+sy,10,2,p.hat);if(p.helm){P(3,0+sy,10,3,p.helm);P(7,0,2,1,'#e33')}if(p.band&&dir!=1)P(4,2+sy,8,1,p.band);
 if(p.crown){P(4,-1+2,8,2,'#fd2');P(4,0,1,1,'#fd2');P(7,0,2,1,'#fd2');P(11,0,1,1,'#fd2');P(7,1,1,1,'#e22')}
 return sprCache[key]=c}
function drawPetSprite(g,x,y,stage,fr,dir,scale=1){const cols=['#fff3d8','#6ccf6c','#4a8cf0','#ffc838'];g.save();g.translate(x,y);g.scale(scale,scale);
 if(stage==0){R(g,4,4+fr,8,11,'#fff3d8');R(g,3,6+fr,10,7,'#fff3d8');R(g,6,7+fr,2,2,'#e8a040');R(g,9,10+fr,2,2,'#e8a040');R(g,5,14,6,1,'#0003');g.restore();return}
 const c=cols[stage];const b=fr?1:0;
 if(stage>=2){R(g,0,4-b,4,5,'#fff8');R(g,12,4-b,4,5,'#fff8')}
 R(g,4,5,8,9,c);R(g,3,7,10,6,c);R(g,6,9,4,4,'#fff6');R(g,4,14,3,2,c);R(g,9,14,3,2,c);
 R(g,dir==2?11:2,10,3,2,c);
 R(g,4,2+b,2,3,stage==3?'#fd2':'#fff');R(g,10,2+b,2,3,stage==3?'#fd2':'#fff');
 if(dir!=1){R(g,5,7,2,2,'#000');R(g,9,7,2,2,'#000');R(g,6,7,1,1,'#fff');R(g,10,7,1,1,'#fff')}
 g.restore()}
// ---- Monster drawing (battle) ----
function drawMonster(g,m,x,y,t,flash,alpha){const s=m.scale||1;g.save();g.globalAlpha=alpha;g.translate(x,y);g.scale(s,s);const c=flash?'#fff':m.c;const bob=Math.sin(t/12)*2;
 const eye=(ex,ey,r=3,pc='#000')=>{g.fillStyle='#fff';g.beginPath();g.arc(ex,ey,r,0,7);g.fill();g.fillStyle=flash?'#fff':pc;g.beginPath();g.arc(ex+.5,ey+.5,r*.5,0,7);g.fill()};
 const sh=()=>{g.fillStyle='#0004';g.beginPath();g.ellipse(0,22,16,4,0,0,7);g.fill();g.fillStyle=c};
 g.fillStyle=c;
 switch(m.sh){
 case'blob':sh();g.beginPath();g.moveTo(-18,20);g.quadraticCurveTo(-20,-4+bob,0,-18+bob);g.quadraticCurveTo(20,-4+bob,18,20);g.closePath();g.fill();g.fillStyle='#fff6';g.beginPath();g.ellipse(-7,-6+bob,4,6,-.5,0,7);g.fill();eye(-6,4+bob);eye(6,4+bob);g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.arc(0,10+bob,5,.2,2.9);g.stroke();
  if(m.crown){g.fillStyle='#fd2';g.beginPath();g.moveTo(-9,-15+bob);g.lineTo(-9,-25+bob);g.lineTo(-4,-19+bob);g.lineTo(0,-27+bob);g.lineTo(4,-19+bob);g.lineTo(9,-25+bob);g.lineTo(9,-15+bob);g.fill()}break;
 case'bat':{const w=Math.sin(t/4)*8;g.beginPath();g.moveTo(-4,-2+bob);g.lineTo(-24,-10+w+bob);g.lineTo(-18,4+bob);g.lineTo(-12,0+bob);g.lineTo(-6,8+bob);g.fill();g.beginPath();g.moveTo(4,-2+bob);g.lineTo(24,-10+w+bob);g.lineTo(18,4+bob);g.lineTo(12,0+bob);g.lineTo(6,8+bob);g.fill();g.beginPath();g.arc(0,2+bob,8,0,7);g.fill();g.beginPath();g.moveTo(-6,-4+bob);g.lineTo(-4,-12+bob);g.lineTo(-1,-5+bob);g.moveTo(6,-4+bob);g.lineTo(4,-12+bob);g.lineTo(1,-5+bob);g.fill();eye(-3,1+bob,2,'#f00');eye(3,1+bob,2,'#f00');R(g,-2,6+bob,1,2,'#fff');R(g,1,6+bob,1,2,'#fff');break}
 case'plant':sh();R(g,-2,0,4,20,'#3a7a2a');g.fillStyle='#3a9a3a';g.beginPath();g.ellipse(-10,14,9,4,-.4,0,7);g.ellipse(10,14,9,4,.4,0,7);g.fill();g.fillStyle=c;g.beginPath();for(let i=0;i<8;i++){const a=i/8*6.28+t/40;g.ellipse(Math.cos(a)*9,-6+bob+Math.sin(a)*9,6,4,a,0,7)}g.fill();g.fillStyle=flash?'#fff':'#fd4';g.beginPath();g.arc(0,-6+bob,7,0,7);g.fill();eye(-3,-7+bob,2);eye(3,-7+bob,2);break;
 case'ghost':g.globalAlpha=alpha*.85;g.beginPath();g.moveTo(-16,18+bob);g.lineTo(-16,-4+bob);g.quadraticCurveTo(-16,-22+bob,0,-22+bob);g.quadraticCurveTo(16,-22+bob,16,-4+bob);g.lineTo(16,18+bob);for(let i=0;i<4;i++)g.lineTo(12-i*8,(i%2?18:12)+bob+Math.sin(t/5+i)*2);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(-6,-6+bob,3,5,0,0,7);g.ellipse(6,-6+bob,3,5,0,0,7);g.ellipse(0,6+bob,4,3,0,0,7);g.fill();break;
 case'beast':sh();g.beginPath();g.ellipse(2,6,18,11,0,0,7);g.fill();g.beginPath();g.ellipse(-14,-6+bob,10,9,0,0,7);g.fill();g.beginPath();g.moveTo(-20,-12+bob);g.lineTo(-18,-24+bob);g.lineTo(-14,-14+bob);g.moveTo(-10,-14+bob);g.lineTo(-8,-24+bob);g.lineTo(-5,-12+bob);g.fill();[-12,-2,8,16].forEach(lx=>R(g,lx,14,4,8,c));g.beginPath();g.moveTo(18,2);g.lineTo(30,-8+bob);g.lineTo(20,8);g.fill();eye(-16,-7+bob,2.5,'#f00');eye(-9,-7+bob,2.5,'#f00');g.fillStyle='#fff';g.beginPath();g.moveTo(-20,0+bob);g.lineTo(-18,4+bob);g.lineTo(-16,0+bob);g.moveTo(-12,0+bob);g.lineTo(-10,4+bob);g.lineTo(-8,0+bob);g.fill();break;
 case'bird':{const w=Math.sin(t/5)*10;g.beginPath();g.moveTo(-6,-2+bob);g.lineTo(-30,-14+w+bob);g.lineTo(-24,0+bob);g.lineTo(-28,6+bob);g.lineTo(-6,8+bob);g.fill();g.beginPath();g.moveTo(6,-2+bob);g.lineTo(30,-14+w+bob);g.lineTo(24,0+bob);g.lineTo(28,6+bob);g.lineTo(6,8+bob);g.fill();g.beginPath();g.ellipse(0,4+bob,10,14,0,0,7);g.fill();g.fillStyle=flash?'#fff':'#fc2';g.beginPath();g.moveTo(-3,-4+bob);g.lineTo(0,4+bob);g.lineTo(3,-4+bob);g.fill();eye(-4,-8+bob,2.5,'#f00');eye(4,-8+bob,2.5,'#f00');R(g,-5,17+bob,3,6,'#fc2');R(g,2,17+bob,3,6,'#fc2');break}
 case'golem':sh();R(g,-16,-6,32,26,c);R(g,-10,-22+bob/2,20,16,c);R(g,-24,-4,8,20,c);R(g,16,-4,8,20,c);g.fillStyle='#0003';g.fillRect(-16,4,32,2);g.fillRect(-2,-6,2,26);g.fillStyle=flash?'#fff':'#f80';g.fillRect(-6,-16+bob/2,4,3);g.fillRect(3,-16+bob/2,4,3);g.font='bold 9px serif';g.fillStyle='#0006';g.fillText('A',-12,14);g.fillText('Z',6,14);break;
 case'mage':sh();g.beginPath();g.moveTo(-14,22);g.lineTo(-8,-6+bob);g.lineTo(8,-6+bob);g.lineTo(14,22);g.fill();g.beginPath();g.moveTo(-12,-6+bob);g.lineTo(2,-32+bob);g.lineTo(12,-6+bob);g.fill();g.fillStyle='#000';g.beginPath();g.arc(0,-6+bob,7,0,7);g.fill();g.fillStyle=flash?'#fff':'#ff4';g.fillRect(-4,-8+bob,2,2);g.fillRect(2,-8+bob,2,2);R(g,14,-14+bob,2,36,'#a86');g.fillStyle=`hsl(${t*4%360},90%,60%)`;g.beginPath();g.arc(15,-16+bob,4,0,7);g.fill();break;
 case'knight':sh();R(g,-12,-4+bob/2,24,20,c);R(g,-9,-20+bob/2,18,16,c);R(g,-7,-14+bob/2,14,3,'#000');R(g,-3,-14+bob/2,2,3,'#f22');R(g,2,-14+bob/2,2,3,'#f22');R(g,-10,16,8,6,c);R(g,2,16,8,6,c);R(g,-22,-6,10,18,'#888');R(g,-20,-4,6,14,c);R(g,14,-26,3,36,'#ccd');R(g,11,6,9,2,'#a80');break;
 case'dragon':sh();g.beginPath();g.ellipse(4,8,18,13,0,0,7);g.fill();g.beginPath();g.moveTo(-6,0);g.quadraticCurveTo(-14,-16,-8,-26+bob);g.lineTo(2,-22+bob);g.quadraticCurveTo(-2,-10,6,-2);g.fill();g.beginPath();g.ellipse(-8,-26+bob,9,6,0,0,7);g.fill();{const w=Math.sin(t/6)*6;g.globalAlpha=alpha*.8;g.beginPath();g.moveTo(8,-2);g.lineTo(30,-24+w);g.lineTo(26,4);g.fill();g.globalAlpha=alpha}eye(-10,-28+bob,2,'#f00');R(g,-12,14,6,8,c);R(g,10,14,6,8,c);g.fillStyle='#fff8';g.beginPath();g.ellipse(2,12,9,6,0,0,7);g.fill();break;
 case'book':{const f=Math.sin(t/5)*.5;sh();g.save();g.translate(0,bob-4);g.fillStyle=flash?'#fff':'#222';g.fillRect(-2,-12,4,24);g.fillStyle=c;g.beginPath();g.moveTo(-2,-12);g.lineTo(-22,-14+f*10);g.lineTo(-22,12+f*10);g.lineTo(-2,12);g.fill();g.beginPath();g.moveTo(2,-12);g.lineTo(22,-14-f*10);g.lineTo(22,12-f*10);g.lineTo(2,12);g.fill();
  g.fillStyle=flash?'#fff':'#f4ecd0';g.fillRect(-19,-9+f*8,15,18);g.fillRect(4,-9-f*8,15,18);g.fillStyle='#0006';for(let i=0;i<4;i++){g.fillRect(-17,-6+i*4+f*8,11,1);g.fillRect(6,-6+i*4-f*8,11,1)}eye(-10,-2+f*8,2.5,'#c00');eye(11,-2-f*8,2.5,'#c00');g.restore();break}
 case'eye':sh();g.beginPath();g.arc(0,-2+bob,16,0,7);g.fill();g.fillStyle=flash?'#fff':'#fff';g.beginPath();g.arc(0,-2+bob,12,0,7);g.fill();g.fillStyle=flash?'#fff':c=='#fdd'?'#3a6':'#600';g.beginPath();g.arc(Math.sin(t/20)*4,-2+bob,6,0,7);g.fill();g.fillStyle='#000';g.beginPath();g.arc(Math.sin(t/20)*4,-2+bob,3,0,7);g.fill();
  g.strokeStyle=c;g.lineWidth=2;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-8+i*4,12+bob);g.quadraticCurveTo(-10+i*5,20,-8+i*4+Math.sin(t/6+i)*3,26);g.stroke()}break;
 case'snake':sh();g.lineWidth=9;g.lineCap='round';g.strokeStyle=c;g.beginPath();g.moveTo(-18,18);g.bezierCurveTo(-4,24,18,16,10,6);g.bezierCurveTo(2,-4,-12,-6,-4,-16+bob);g.stroke();g.beginPath();g.ellipse(-2,-18+bob,9,6,.2,0,7);g.fill();eye(-4,-20+bob,2,'#fc0');eye(3,-19+bob,2,'#fc0');g.strokeStyle='#e22';g.lineWidth=1.5;g.beginPath();g.moveTo(5,-15+bob);g.lineTo(11,-13+bob+Math.sin(t/3)*2);g.stroke();g.fillStyle='#0003';for(let i=0;i<4;i++)g.fillRect(-12+i*7,15-i*2,3,3);break;
 case'chest':{sh();const o=Math.abs(Math.sin(t/14))*8;R(g,-18,0,36,20,c);R(g,-18,0,36,3,'#0004');R(g,-3,2,6,7,'#fd4');g.save();g.translate(0,0);g.fillStyle=c;g.fillRect(-18,-12-o,36,12);g.fillStyle='#0004';g.fillRect(-18,-3-o,36,2);g.restore();g.fillStyle='#600';g.fillRect(-15,-o,30,o+1);g.fillStyle='#fff';for(let i=0;i<5;i++){g.beginPath();g.moveTo(-14+i*7,-o);g.lineTo(-11+i*7,-o+5);g.lineTo(-8+i*7,-o);g.fill();g.beginPath();g.moveTo(-14+i*7,1);g.lineTo(-11+i*7,-4);g.lineTo(-8+i*7,1);g.fill()}eye(-7,-8-o,2.5,'#f00');eye(7,-8-o,2.5,'#f00');break}
 case'lord':sh();g.fillStyle=flash?'#fff':'#201028';g.beginPath();g.moveTo(-26,24);g.lineTo(-30,-10+bob);g.lineTo(-14,-2+bob);g.lineTo(0,-8+bob);g.lineTo(14,-2+bob);g.lineTo(30,-10+bob);g.lineTo(26,24);g.fill();g.fillStyle=c;g.beginPath();g.moveTo(-14,24);g.lineTo(-10,-6+bob);g.lineTo(10,-6+bob);g.lineTo(14,24);g.fill();g.beginPath();g.arc(0,-14+bob,9,0,7);g.fill();g.fillStyle=flash?'#fff':'#ddd';g.beginPath();g.moveTo(-8,-18+bob);g.lineTo(-16,-32+bob);g.lineTo(-4,-22+bob);g.moveTo(8,-18+bob);g.lineTo(16,-32+bob);g.lineTo(4,-22+bob);g.fill();g.fillStyle='#ff2';g.fillRect(-5,-16+bob,3,2);g.fillRect(3,-16+bob,3,2);g.fillStyle='#000';g.fillRect(-4,-10+bob,8,2);g.fillStyle=`rgba(200,80,255,${.4+.3*Math.sin(t/8)})`;g.beginPath();g.arc(0,4+bob,5,0,7);g.fill();break;
 }
 if(m.metal&&!flash){g.fillStyle=`rgba(255,255,255,${.5+.5*Math.sin(t/6)})`;g.fillRect(-6,-10+bob,3,3);g.fillRect(4,-4+bob,2,2)}
 g.restore()}
// ---- Input ----
const Input={held:{up:0,down:0,left:0,right:0},stack:[],
 push(h){this.stack.push(h)},pop(h){const i=this.stack.lastIndexOf(h);if(i>=0)this.stack.splice(i,1)},
 press(k){Audio8.init();const h=this.stack[this.stack.length-1];if(h&&h(k))return}};
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',Enter:'a',' ':'a',x:'b',X:'b',Escape:'b',Backspace:'b'};
addEventListener('keydown',e=>{if(document.activeElement&&document.activeElement.tagName=='INPUT')return;const k=KEYMAP[e.key];if(!k)return;e.preventDefault();if(k in Input.held){if(!Input.held[k]){Input.held[k]=1;Input.press(k)}}else if(!e.repeat)Input.press(k)});
addEventListener('keyup',e=>{const k=KEYMAP[e.key];if(k in Input.held)Input.held[k]=0});
function bindPad(){const pad=document.getElementById('dpad');let active=null;
 const dirAt=(t)=>{const r=pad.getBoundingClientRect(),x=t.clientX-r.left-r.width/2,y=t.clientY-r.top-r.height/2;if(Math.hypot(x,y)<r.width*.12)return null;return Math.abs(x)>Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up')};
 const setDir=d=>{if(d==active)return;for(const k in Input.held)Input.held[k]=0;active=d;if(d){Input.held[d]=1;Input.press(d)}pad.dataset.d=d||''};
 const tm=e=>{e.preventDefault();const t=[...e.touches].find(t=>{const r=pad.getBoundingClientRect();return t.clientX>=r.left-40&&t.clientX<=r.right+40&&t.clientY>=r.top-40&&t.clientY<=r.bottom+40});setDir(t?dirAt(t):null)};
 pad.addEventListener('touchstart',tm,{passive:false});pad.addEventListener('touchmove',tm,{passive:false});pad.addEventListener('touchend',tm,{passive:false});pad.addEventListener('touchcancel',tm,{passive:false});
 let md=false;pad.addEventListener('mousedown',e=>{md=true;setDir(dirAt(e))});addEventListener('mousemove',e=>{if(md)setDir(dirAt(e))});addEventListener('mouseup',()=>{if(md){md=false;setDir(null)}});
 for(const id of['ba','bb']){const b=document.getElementById(id),k=id=='ba'?'a':'b';const f=e=>{e.preventDefault();b.classList.add('on');Input.press(k)};b.addEventListener('touchstart',f,{passive:false});b.addEventListener('touchend',e=>{e.preventDefault();b.classList.remove('on')});b.addEventListener('mousedown',f);b.addEventListener('mouseup',()=>b.classList.remove('on'))}}
// ---- UI windows ----
const UIroot=document.getElementById('ui');
const UI={
 el(cls,html,style){const d=document.createElement('div');d.className='win '+(cls||'');if(html!=null)d.innerHTML=html;if(style)Object.assign(d.style,style);UIroot.appendChild(d);return d},
 // typewriter message pages; returns when all done
 say(pages,opt={}){if(typeof pages=='string')pages=[pages];return new Promise(res=>{const w=this.el('msg');let pi=0,ci=0,full=false,tm=null;const sp=document.createElement('span'),arrow=document.createElement('i');arrow.className='arrow';arrow.textContent='▼';w.append(sp,arrow);
  const page=()=>{ci=0;full=false;arrow.style.display='none';const txt=pages[pi];clearInterval(tm);tm=setInterval(()=>{ci+=1;sp.innerHTML=esc(txt.slice(0,ci)).replace(/\n/g,'<br>');if(ci%3==0&&txt[ci-1]!=' ')Audio8.se('talk');if(ci>=txt.length){clearInterval(tm);full=true;arrow.style.display=''}},opt.fast?8:28)};
  const adv=()=>{if(!full){clearInterval(tm);sp.innerHTML=esc(pages[pi]).replace(/\n/g,'<br>');full=true;arrow.style.display='';return}pi++;if(pi>=pages.length){close();return}page()};
  const close=()=>{clearInterval(tm);Input.pop(h);w.remove();res()};
  const h=k=>{if(k=='a'||k=='b')adv();return true};Input.push(h);w.addEventListener('click',adv);page()})},
 // menu: items [{t,dis,sub}] → index or -1
 menu(items,opt={}){return new Promise(res=>{const w=this.el('menu '+(opt.cls||''),null,opt.style);if(opt.title){const t=document.createElement('div');t.className='mt';t.textContent=opt.title;w.appendChild(t)}
  const list=document.createElement('div');list.className='ml'+(opt.cols?' c2':'');w.appendChild(list);let idx=opt.start||0;
  const rows=items.map((it,i)=>{const r=document.createElement('div');r.className='mi'+(it.dis?' dis':'');r.innerHTML=`<b>▶</b><span>${it.t}</span>`+(it.sub?`<small>${it.sub}</small>`:'');r.onclick=e=>{e.stopPropagation();idx=i;upd();pick()};list.appendChild(r);return r});
  const upd=()=>{rows.forEach((r,i)=>r.classList.toggle('cur',i==idx));if(opt.onMove)opt.onMove(idx);rows[idx]&&rows[idx].scrollIntoView({block:'nearest'})};
  const done=v=>{Input.pop(h);if(!opt.keep)w.remove();res(v)};
  const pick=()=>{if(items[idx].dis){Audio8.se('bump');return}Audio8.se('ok');done(idx)};
  const c=opt.cols?2:1;const h=k=>{if(k=='up'){idx=(idx-c+items.length)%items.length;Audio8.se('cursor');upd()}else if(k=='down'){idx=(idx+c)%items.length;Audio8.se('cursor');upd()}else if(k=='left'&&c>1){idx=idx-1<0?items.length-1:idx-1;upd()}else if(k=='right'&&c>1){idx=(idx+1)%items.length;upd()}else if(k=='a')pick();else if(k=='b'&&!opt.noCancel){Audio8.se('cancel');done(-1)}return true};
  Input.push(h);upd();res.win=w})},
 async yesno(q){if(q)await this.sayKeep(q);const r=await this.menu([{t:'はい'},{t:'いいえ'}],{cls:'yn'});this.clearKeep();return r==0},
 sayKeep(t){this.clearKeep();this._keep=this.el('msg',esc(t).replace(/\n/g,'<br>'))},
 clearKeep(){if(this._keep){this._keep.remove();this._keep=null}},
 clear(){UIroot.innerHTML='';this._keep=null},
};
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function fade(out,ms=250){const f=document.getElementById('fade');f.style.transition=`opacity ${ms}ms`;f.style.opacity=out?1:0;return new Promise(r=>setTimeout(r,ms))}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
