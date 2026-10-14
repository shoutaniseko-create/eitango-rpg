// ===== Main game: field, menus, events, saves =====
let WORDS=[],DAYS=[];
const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const Game={S:null,state:'title',map:null,mapId:'',grid:null,npcs:[],P:{x:0,y:0,dir:0,mv:0,fx:0,fy:0,tx:0,ty:0,fr:0},trail:[],steps:0,safe:0,t:0,busy:false,
 get mode(){return LS.get('eiq_mode','4')},set mode(v){LS.set('eiq_mode',v)},
 range(){const r=LS.get('eiq_range',null)||LS.get('vqrange',null);return r||[DAYS[0],DAYS[DAYS.length-1]]},
 pool(){const[a,b]=this.range();return WORDS.filter(w=>w.day>=Math.min(a,b)&&w.day<=Math.max(a,b))},
 maxHP(){return 28+this.S.lv*9},maxMP(){return 8+this.S.lv*3},atk(){return 6+Math.floor(this.S.lv*2.5)+WEAPONS[this.S.wpn].v},def(){return 3+Math.floor(this.S.lv*1.5)+ARMORS[this.S.arm].v},
 needExp(l){return Math.round(4*Math.pow(l,1.6))+4},spells(){return SPELLS.filter(s=>this.S.lv>=s.lv)},
 hasPet(){return !!this.S.flags.egg},petStage(){if(!this.hasPet())return -1;let s=0;PET_STAGES.forEach((p,i)=>{if(this.S.pet.lv>=p[0])s=i});return s},
 petAtk(){return 5+this.S.pet.lv*3},petSkills(){return this.hasPet()?PET_SKILLS.filter(s=>this.S.pet.lv>=s.lv):[]},petNeed(l){return 8+l*6},
 async log(t){if(Battle.on)await blog(t,600);else await UI.say([t])},
 async gainExp(n){const S=this.S;S.exp+=n;while(S.exp>=this.needExp(S.lv)){S.exp-=this.needExp(S.lv);const before=this.spells().length;S.lv++;await Audio8.jingle('lv');await this.log(`${S.name}は　レベル${S.lv}に　あがった！`);
  S.hp=Math.min(this.maxHP(),S.hp+9);S.mp=Math.min(this.maxMP(),S.mp+3);const ns=this.spells();if(ns.length>before)await this.log(`${ns[ns.length-1].n}を　おぼえた！`)}},
 async petExp(n){const P=this.S.pet,st0=this.petStage(),sk0=this.petSkills().length;P.exp+=n;let up=false;while(P.exp>=this.petNeed(P.lv)){P.exp-=this.petNeed(P.lv);P.lv++;up=true}
  if(!up)return;const st=this.petStage();if(st>st0){Audio8.jingle('item');await this.log(st0==0?`タマゴが　われて…　${P.name}が　うまれた！`:`${P.name}は　${PET_STAGES[st][1]}に　しんかした！`)}else await this.log(`${P.name}は　レベル${P.lv}に　なった！`);
  const sk=this.petSkills();if(sk.length>sk0)await this.log(`${P.name}は　${sk[sk.length-1].n}を　おぼえた！`)},
};
function newSave(){return{v:1,name:'ゆうしゃ',lv:1,exp:0,hp:37,mp:11,gold:30,food:0,wpn:0,arm:0,inv:{herb:3},flags:{},opened:{},map:'village',x:4,y:4,dir:1,church:{map:'village',x:18,y:11},pet:{name:'ポチ',lv:1,exp:0},stats:{ok:0,ng:0,battles:0},time:0}}
// ---- Map loading ----
function loadMap(id,digit,pos){const m=MAPS[id];Game.map=m;Game.mapId=id;const rows=m.rows,H=rows.length,W=rows[0].length;
 const grid=rows.map(r=>[...r]);Game.npcs=[];m.chestPos=[];m.boss&&(m.bossPos=null);let ci=0;
 const floorAt=(x,y)=>{const cnt={};for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0],[1,1],[-1,-1]]){const c=(rows[y+dy]||'')[x+dx];if(c&&/[._,:=s~]/.test(c)&&c!='~')cnt[c]=(cnt[c]||0)+1}return Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]?.[0]||'.'};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=rows[y][x];
  if(m.npcs&&m.npcs[c]){grid[y][x]=floorAt(x,y);Game.npcs.push({id:c,def:m.npcs[c],x,y,ox:x,oy:y,dir:0,mv:0,fx:x,fy:y,tx:x,ty:y,wt:Math.random()*3})}
  else if(c=='$'){grid[y][x]=floorAt(x,y);m.chestPos.push({x,y,i:ci++})}
  else if(c=='X'){grid[y][x]=floorAt(x,y);m.bossPos={x,y}}
  else if(c=='k'){/* keep */}}
 Game.grid=grid;Game.W=W;Game.H=H;
 let px,py;if(pos){[px,py]=pos}else{for(let y=0;y<H;y++){const x=rows[y].indexOf(digit);if(x>=0){px=x;py=y}}}
 Object.assign(Game.P,{x:px,y:py,fx:px,fy:py,mv:0});Game.onWarp=!pos||rows[py][px]>='0'&&rows[py][px]<='9';Game.trail=[{x:px,y:py},{x:px,y:py}];Game.safe=4;
 Audio8.play(m.bgm);showPlace(m.name)}
function showPlace(n){const e=document.getElementById('place');e.textContent=n;e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>e.style.opacity=0,1800)}
const gateAt=(x,y)=>(Game.map.gates||[]).find(g=>g.x==x&&g.y==y);
function tileAt(x,y){if(x<0||y<0||x>=Game.W||y>=Game.H)return null;return Game.grid[y][x]}
function blocked(x,y,ignoreNpc){const c=tileAt(x,y);if(c==null)return true;const st=Game.map.style;
 if(c=='#'||c=='~'||c=='C')return true;if(c=='^')return true;if(c=='T'&&st!='world')return true;
 if(c=='k'&&!Game.S.opened['door:'+Game.mapId+x+','+y])return true;if(c=='g'){const g=gateAt(x,y);if(!Game.S.flags[g.flag])return true}
 if(Game.map.chestPos.some(p=>p.x==x&&p.y==y&&!Game.S.opened[Game.mapId+':'+p.i]))return true;
 if(Game.map.bossPos&&Game.map.bossPos.x==x&&Game.map.bossPos.y==y&&!Game.S.flags[Game.map.bossFlag])return true;
 if(!ignoreNpc&&Game.npcs.some(n=>(n.x==x&&n.y==y)||(n.tx==x&&n.ty==y)))return true;return false}
// ---- Field update/render ----
const DIRS=[[0,1],[0,-1],[-1,0],[1,0]],DK=['down','up','left','right'];
let bumpT=0;
function fieldUpdate(dt){const P=Game.P;Game.t+=dt;if(Game.S)Game.S.time+=dt;
 const free=Input.stack[Input.stack.length-1]===fieldHandler&&!Game.busy;
 // NPC wander
 for(const n of Game.npcs){if(n.mv>0){n.mv=Math.max(0,n.mv-dt*3);const k=1-n.mv;n.fx=n.x+(n.tx-n.x)*k;n.fy=n.y+(n.ty-n.y)*k;if(n.mv==0){n.x=n.tx;n.y=n.ty;n.fx=n.x;n.fy=n.y}continue}
  if(!n.def.walk||!free)continue;n.wt-=dt;if(n.wt>0)continue;n.wt=1.5+Math.random()*2.5;const d=(Math.random()*4)|0;const[dx,dy]=DIRS[d];const nx=n.x+dx,ny=n.y+dy;n.dir=d;
  if(Math.abs(nx-n.ox)>2||Math.abs(ny-n.oy)>2||blocked(nx,ny)||(nx==P.x&&ny==P.y)||(nx==P.tx&&ny==P.ty&&P.mv))continue;const c=tileAt(nx,ny);if(c>='0'&&c<='9')continue;n.tx=nx;n.ty=ny;n.mv=1}
 if(P.mv>0){P.mv=Math.max(0,P.mv-dt*5.5);const k=1-P.mv;P.fx=P.x+(P.tx-P.x)*k;P.fy=P.y+(P.ty-P.y)*k;if(P.mv==0){P.x=P.tx;P.y=P.ty;P.fx=P.x;P.fy=P.y;arrive()}return}
 if(!free)return;let d=-1;for(let i=0;i<4;i++)if(Input.held[DK[i]])d=i;if(d<0)return;P.dir=d;const[dx,dy]=DIRS[d];const nx=P.x+dx,ny=P.y+dy;
 if(blocked(nx,ny)){bumpT-=dt;if(bumpT<=0){bumpT=.3;Audio8.se('bump');const g=tileAt(nx,ny)=='g'?gateAt(nx,ny):null;if(g||(Game.map.bossPos&&Game.map.bossPos.x==nx&&Game.map.bossPos.y==ny)||Game.map.chestPos.some(p=>p.x==nx&&p.y==ny)||tileAt(nx,ny)=='k')interact()}return}
 bumpT=0;Game.trail.unshift({x:P.x,y:P.y});Game.trail.length=3;P.tx=nx;P.ty=ny;P.mv=1;P.fr^=1;Game.onWarp=false}
async function arrive(){const P=Game.P,c=tileAt(P.x,P.y);Game.steps++;
 if(c>='0'&&c<='9'&&!Game.onWarp){const l=Game.map.links[c];if(l){Game.busy=true;Audio8.se(Game.map.style=='world'?'door':'stairs');await fade(true,200);loadMap(l[0],l[1]);await fade(false,200);Game.busy=false;return}}
 // encounter
 const m=Game.map;if(!m.enc||Game.safe-->0)return;let rate=m.rate;if(c=='T')rate*=.7;if(c==':')rate*=1.6;if(Math.random()*rate<1){const z=m.enc=='zone'?zoneAt(P.x,P.y):m.enc;const pool=ZONES[z];
  const n=Math.random()<.5?1:Math.random()<.7?2:3;const ids=[];for(let i=0;i<n;i++)ids.push(pool[(Math.random()*pool.length)|0]);await encounter(ids)}}
async function encounter(ids,opt={}){Game.busy=true;Audio8.stop();Audio8.se('encounter');for(let i=0;i<3;i++){await fade(true,60);await fade(false,60)}
 Game.state='battle';const bg=Game.map.style=='world'?'world':Game.map.style;const r=await runBattle(ids,{...opt,bg});Game.state='field';Game.safe=5;
 if(r=='lose'){await defeat();Game.busy=false;return r}Audio8.play(Game.map.bgm);Game.busy=false;return r}
async function defeat(){const S=Game.S;await fade(true,600);S.gold=Math.floor(S.gold/2);S.hp=Game.maxHP();S.mp=Game.maxMP();loadMap(S.church.map,null,[S.church.x,S.church.y]);Game.P.dir=1;await fade(false,600);
 await UI.say(['おお　ゆうしゃよ。しんでしまうとは　なさけない…','……というのは　じょうだんじゃ。','かみの　ちからで　いきかえらせて　おいたぞ。（ゴールドが　はんぶんに　なった）'])}
let camX=0,camY=0;
function fieldRender(){const P=Game.P,m=Game.map,st=m.style;const vw=VW/TS,vh=VH/TS;
 let cx=P.fx*TS+8-VW/2,cy=P.fy*TS+8-VH/2;const mw=Game.W*TS,mh=Game.H*TS;
 cx=mw<=VW?(mw-VW)/2:Math.max(0,Math.min(mw-VW,cx));cy=mh<=VH?(mh-VH)/2:Math.max(0,Math.min(mh-VH,cy));cx=Math.round(cx);cy=Math.round(cy);
 ctx.fillStyle=st=='world'?'#2050c0':st=='town'?'#1d6b2a':'#000';ctx.fillRect(0,0,VW,VH);
 const fr=((Game.t*2)|0)%2,x0=Math.floor(cx/TS),y0=Math.floor(cy/TS);
 for(let y=y0;y<=y0+vh+1;y++)for(let x=x0;x<=x0+vw+1;x++){const c=tileAt(x,y);if(c==null)continue;const sx=x*TS-cx,sy=y*TS-cy;
  if(c>='0'&&c<='9'){const l=m.links[c];if(st=='world'){drawTile('world','.',sx,sy,0);drawWorldIcon(l[2],sx,sy)}else if(st=='town'){drawTile(st,Game.mapId=='capital'&&c=='2'?'D':'E',sx,sy,0)}else drawTile(st,c=='1'&&st!='castle'?'S':'S',sx,sy,0);continue}
  if(c=='g'){const g=gateAt(x,y),open=Game.S.flags[g.flag];if(g.look=='rock'){drawTile('world',open?':':'g',sx,sy,0,open?null:'rock')}else drawTile('world','g',sx,sy,fr,g.look=='bridge'?(open?'bridge':'bridgeX'):(open?'light':'water'));continue}
  drawTile(st,c,sx,sy,fr)}
 // chests
 for(const p of m.chestPos){const sx=p.x*TS-cx,sy=p.y*TS-cy,op=Game.S.opened[Game.mapId+':'+p.i];R(ctx,sx+2,sy+5,12,10,op?'#5a3a1a':'#a0601a');R(ctx,sx+2,sy+5,12,3,op?'#2a1a0a':'#c88030');R(ctx,sx+2,sy+9,12,1,'#ffd040');if(!op)R(ctx,sx+7,sy+8,2,3,'#ffd040')}
 // boss
 if(m.bossPos&&!Game.S.flags[m.bossFlag]){const b=BOSSES[m.boss];ctx.save();drawMonster(ctx,{...b,scale:.45},m.bossPos.x*TS-cx+8,m.bossPos.y*TS-cy+6,Game.t*60,false,1);ctx.restore()}
 // entities sorted by y
 const ents=[];for(const n of Game.npcs)ents.push({y:n.fy,d:()=>ctx.drawImage(personSprite(n.def.spr,n.dir,((Game.t*3)|0)%2),Math.round(n.fx*TS-cx),Math.round(n.fy*TS-cy)-2)});
 if(Game.hasPet()){const tp=Game.trail[0],k=P.mv,px=P.mv?tp.x+(P.x-tp.x)*(1-k):Game.trail[0].x,py=P.mv?tp.y+(P.y-tp.y)*(1-k):Game.trail[0].y;
  if(!(Math.round(px)==P.x&&Math.round(py)==P.y&&!P.mv)||true){const pdx=P.x-tp.x;ents.push({y:py-.01,d:()=>drawPetSprite(ctx,Math.round(px*TS-cx),Math.round(py*TS-cy),Game.petStage(),((Game.t*4)|0)%2,pdx<0?2:3)})}}
 ents.push({y:P.fy,d:()=>ctx.drawImage(personSprite('hero',P.dir,P.mv?(P.mv>.5?P.fr:P.fr^1):((Game.t*2)|0)%2),Math.round(P.fx*TS-cx),Math.round(P.fy*TS-cy)-2)});
 ents.sort((a,b)=>a.y-b.y).forEach(e=>e.d());
 if(st=='cave'||st=='demon'){const gx=P.fx*TS-cx+8,gy=P.fy*TS-cy+8;const gr=ctx.createRadialGradient(gx,gy,40,gx,gy,st=='cave'?150:190);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.85)');ctx.fillStyle=gr;ctx.fillRect(0,0,VW,VH)}
 hud()}
let hudCache='';function hud(){const S=Game.S,el=document.getElementById('hud');const s=`<b>${esc(S.name)}</b> Lv${S.lv}<br>H ${S.hp}<br>M ${S.mp}<br>G ${S.gold}`;if(s!=hudCache){el.innerHTML=s;hudCache=s}}
// ---- Interaction ----
const facing=()=>{const[dx,dy]=DIRS[Game.P.dir];return[Game.P.x+dx,Game.P.y+dy]};
const G={say:l=>UI.say(l),has:f=>!!Game.S.flags[f],set:f=>{Game.S.flags[f]=1},jingle:n=>Audio8.jingle(n),joinPet:()=>{},giveWeapon:i=>{Game.S.wpn=Math.max(Game.S.wpn,i)}};
async function interact(){if(Game.busy)return;Game.busy=true;try{await interact2()}finally{Game.busy=false}}
async function interact2(){const S=Game.S;let[x,y]=facing();let c=tileAt(x,y);
 let n=Game.npcs.find(n=>n.x==x&&n.y==y);if(!n&&c=='C'){const[dx,dy]=DIRS[Game.P.dir];n=Game.npcs.find(n=>n.x==x+dx&&n.y==y+dy)}
 if(n){n.dir=[1,0,3,2][Game.P.dir];const d=n.def;
  if(d.shop)return shop(d.shop);if(d.inn)return inn(d.inn);if(d.church)return church();
  if(typeof d.talk=='string')return SCRIPTS[d.talk](G);const t=d.talk2&&S.flags.stone1?d.talk2:d.talk;return UI.say(t)}
 const ch=Game.map.chestPos.find(p=>p.x==x&&p.y==y);if(ch){const k=Game.mapId+':'+ch.i;if(S.opened[k])return UI.say(['からっぽの　たからばこだ。']);S.opened[k]=1;Audio8.se('door');const it=Game.map.chests[ch.i];
  await Audio8.jingle('item');if(it.gold){S.gold+=it.gold;return UI.say([`たからばこを　あけた！`,`${it.gold}ゴールドを　手に入れた！`])}
  if(it.item){S.inv[it.item]=(S.inv[it.item]||0)+1;return UI.say(['たからばこを　あけた！',`${ITEMS[it.item].n}を　手に入れた！`])}
  if(it.key){S.inv[it.key]=1;return UI.say(['たからばこを　あけた！',`${ITEMS[it.key].n}を　手に入れた！`])}
  if(it.weapon!=null){const wq=WEAPONS[it.weapon];const better=it.weapon>S.wpn;if(better)S.wpn=it.weapon;else S.gold+=Math.round(wq.p/2);return UI.say(['たからばこを　あけた！',`${wq.n}を　手に入れた！`,better?`${wq.n}を　そうびした！`:`いまの　ぶきの　ほうが　つよいので　うりはらった。（${Math.round(wq.p/2)}G）`])}
  if(it.armor!=null){const aq=ARMORS[it.armor];const better=it.armor>S.arm;if(better)S.arm=it.armor;else S.gold+=Math.round((aq.p||600)/2);return UI.say(['たからばこを　あけた！',`${aq.n}を　手に入れた！`,better?`${aq.n}を　そうびした！`:`いまの　よろいの　ほうが　つよいので　うりはらった。`])}}
 if(c=='k'&&!S.opened['door:'+Game.mapId+x+','+y]){if(S.inv.key){S.opened['door:'+Game.mapId+x+','+y]=1;Audio8.se('door');return UI.say(['とうのカギで　とびらを　あけた！'])}return UI.say(['とびらには　カギが　かかっている。'])}
 if(c=='g'){const g=gateAt(x,y);if(!S.flags[g.flag])return UI.say(g.msg)}
 const bp=Game.map.bossPos;if(bp&&bp.x==x&&bp.y==y&&!S.flags[Game.map.bossFlag])return bossEvent();
 const here=tileAt(Game.P.x,Game.P.y);if(c==null||c=='#')return UI.say(['なにも　ない。'])}
async function bossEvent(){const m=Game.map,b=BOSSES[m.boss],S=Game.S;await UI.say(b.lines.map(l=>`${b.n}「${l}`));
 const r=await encounter([m.boss],{boss:true});if(r!='win')return;S.flags[m.bossFlag]=1;if(m.boss=='b1')S.inv.stone1=1;if(m.boss=='b2')S.inv.stone2=1;
 await SCRIPTS['boss_'+m.boss](G);if(b.final)await ending()}
// ---- Town services ----
async function shop(list){const S=Game.S;await UI.say(['いらっしゃい！　なにを　かうかね？']);
 while(true){const rows=list.map(id=>{if(/^w\d$/.test(id)){const i=+id.slice(1),w=WEAPONS[i];return{id,t:`⚔ ${w.n}`,sub:`${w.p}G 攻+${w.v}`,dis:S.wpn>=i||S.gold<w.p,p:w.p}}if(/^a\d$/.test(id)){const i=+id.slice(1),a=ARMORS[i];return{id,t:`🛡 ${a.n}`,sub:`${a.p}G 守+${a.v}`,dis:S.arm>=i||S.gold<a.p,p:a.p}}const it=ITEMS[id];return{id,t:it.n,sub:`${it.p}G`,dis:S.gold<it.p,p:it.p}});
  rows.push({t:'やめる'});UI.sayKeep(`もちきん: ${S.gold}G　（${WEAPONS[S.wpn].n} / ${ARMORS[S.arm].n}）`);const k=await UI.menu(rows,{cls:'shop',title:'ショップ'});UI.clearKeep();if(k<0||k==rows.length-1)break;const r=rows[k];S.gold-=r.p;Audio8.se('ok');
  if(/^w\d$/.test(r.id)){S.wpn=+r.id.slice(1);await UI.say([`${WEAPONS[S.wpn].n}を　そうびした！`])}else if(/^a\d$/.test(r.id)){S.arm=+r.id.slice(1);await UI.say([`${ARMORS[S.arm].n}を　そうびした！`])}else S.inv[r.id]=(S.inv[r.id]||0)+1}
 await UI.say(['また　どうぞ！'])}
async function inn(p){const S=Game.S;if(!await UI.yesno(`たびびとの　やどやへ　ようこそ。\nひとばん　${p}ゴールドですが　おとまりに　なりますか？`))return UI.say(['またの　おこしを　おまちしております。']);
 if(S.gold<p)return UI.say(['おや、ゴールドが　たりない　ようですね。']);S.gold-=p;await fade(true,500);S.hp=Game.maxHP();S.mp=Game.maxMP();await Audio8.jingle('inn');await fade(false,500);await UI.say(['おはよう　ございます。','ゆうべは　よく　おやすみに　なれましたか？','（HPと　MPが　ぜんかいふくした！）'])}
async function church(){const S=Game.S;const k=await UI.menu([{t:'きろくする（セーブ）'},{t:'Day範囲・モードの　せってい'},{t:'やめる'}],{title:'教会'});
 if(k==0){S.church={map:Game.mapId,x:Game.P.x,y:Game.P.y};const sl=await pickSlot('どの　ぼうけんのしょに　きろくしますか？',true);if(sl){saveTo(sl);Audio8.jingle('item');await UI.say([`ぼうけんのしょ${sl}に　きろくしました。`,'まだ　ぼうけんを　つづけますか？　かみの　ごかごが　ありますように。'])}}
 if(k==1)await settings()}
// ---- Save ----
let curSlot=0;
function saveTo(sl){const S=Game.S;if(Game.mapId&&Game.state!="title"){S.map=Game.mapId;S.x=Game.P.x;S.y=Game.P.y;S.dir=Game.P.dir}S.saved=Date.now();curSlot=sl;LS.set('eiq_slot'+sl,S)}
function slotSum(sl){const s=LS.get('eiq_slot'+sl,null);if(!s)return'－ からっぽ －';const t=Math.floor(s.time/60);return`${esc(s.name)} Lv${s.lv}　${MAPS[s.map]?.name||''}　${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}${s.flags.clear?' ★クリア':''}`}
async function pickSlot(title,save){const k=await UI.menu([1,2,3].map(i=>({t:`ぼうけんのしょ${i}`,sub:slotSum(i),dis:!save&&!LS.get('eiq_slot'+i,null)})),{title,cls:'slots'});return k<0?0:k+1}
// ---- Field menu ----
async function fieldMenu(){if(Game.busy||Game.P.mv)return;Game.busy=true;try{await fieldMenu2()}finally{Game.busy=false}}
async function fieldMenu2(){const S=Game.S;while(true){const k=await UI.menu([{t:'つよさ'},{t:'じゅもん'},{t:'どうぐ'},{t:'あいぼう'},{t:'ふくしゅう'},{t:'せってい'},{t:'きろく'},{t:'とじる'}],{cols:true,cls:'fmenu',title:'コマンド'});
 if(k<0||k==7)return;
 if(k==0){const P=S.pet;await UI.say([`${S.name}　Lv${S.lv}\nHP ${S.hp}/${Game.maxHP()}　MP ${S.mp}/${Game.maxMP()}\nこうげき ${Game.atk()}　まもり ${Game.def()}`,`けいけんち ${S.exp}/${Game.needExp(S.lv)}　ゴールド ${S.gold}\nぶき: ${WEAPONS[S.wpn].n}\nよろい: ${ARMORS[S.arm].n}`,`正解 ${S.stats.ok}　ミス ${S.stats.ng}　せんとう ${S.stats.battles}\nだいじな もの: ${Object.keys(S.inv).filter(i=>ITEMS[i]?.key&&S.inv[i]).map(i=>ITEMS[i].n).join('、')||'なし'}`])}
 if(k==1){const sp=Game.spells();const j=await UI.menu(sp.map(s=>({t:s.n,sub:`MP${s.mp} ${s.d}`,dis:s.type!='heal'||S.mp<s.mp})),{title:'じゅもん'});if(j>=0){const s=sp[j];S.mp-=s.mp;const h=Math.min(Math.round(s.pow*(1+S.lv*.02)),Game.maxHP()-S.hp);S.hp+=h;Audio8.se('heal');await UI.say([`${s.n}を　となえた！　HPが　${h}　かいふくした！`])}}
 if(k==2)await itemMenu();
 if(k==3)await petMenu();
 if(k==4){const miss=JSON.parse(localStorage.vqmiss||'{}');const ks=Object.keys(miss);await UI.say(ks.length?[`まちがえた　ことば：${ks.length}こ`,ks.slice(0,30).map(w=>{const x=WORDS.find(v=>v.word==w);return`${w}＝${x?x.meaning:''}`}).join('\n').slice(0,400),'まちがえた　ことばは　せんとうで　よく　でるよ。2回　正解すると　リストから　きえる！']:['まちがえた　ことばは　ないよ！'])}
 if(k==5)await settings();
 if(k==6){const sl=curSlot||await pickSlot('どこに　きろくしますか？',true);if(sl){saveTo(sl);await UI.say([`ぼうけんのしょ${sl}に　きろくしました。`])}}}}
async function itemMenu(){const S=Game.S;const its=Object.entries(S.inv).filter(([k,n])=>n>0&&ITEMS[k]);if(!its.length)return UI.say(['どうぐを　もっていない。']);
 const j=await UI.menu(its.map(([id,n])=>({t:ITEMS[id].n,sub:(ITEMS[id].key?'だいじなもの':'×'+n)+' '+ITEMS[id].d})),{title:'どうぐ',cls:'items'});if(j<0)return;const[id]=its[j],it=ITEMS[id];
 if(it.key)return UI.say([it.d||'だいじな　ものだ。']);S.inv[id]--;
 if(it.use=='heal'){const h=Math.min(it.v,Game.maxHP()-S.hp);S.hp+=h;Audio8.se('heal');return UI.say([`${it.n}を　つかった！　HPが　${h}　かいふくした！`])}
 if(it.use=='mp'){const h=Math.min(it.v,Game.maxMP()-S.mp);S.mp+=h;Audio8.se('heal');return UI.say([`MPが　${h}　かいふくした！`])}
 if(it.use=='food'){S.food+=it.v;return UI.say([`エサが　${it.v}こ　ふえた！`])}
 if(it.use=='return'){if(Game.map.style!='world'&&Game.map.style!='town'&&Game.map.style!='castle'){S.inv[id]++;return UI.say(['ここでは　つかえない！'])}await UI.say([`${it.n}を　空に　なげた！`]);await fade(true,400);loadMap(S.church.map,null,[S.church.x,S.church.y]);await fade(false,400)}}
async function petMenu(){const S=Game.S,P=S.pet;if(!Game.hasPet())return UI.say(['まだ　あいぼうが　いない。']);
 while(true){const st=Game.petStage(),nx=PET_STAGES[st+1];UI.sayKeep(`${P.name}（${PET_STAGES[st][1]}）Lv${P.lv}　EXP ${P.exp}/${Game.petNeed(P.lv)}\n${st>0?'こうげき '+Game.petAtk():'まだ　タマゴ…（Lv3で　うまれる）'}　${nx?'つぎの　しんか: Lv'+nx[0]:'さいしゅう しんか！'}\nエサ: ${S.food}こ（せんとうで　正解すると　ふえる）`);
  const k=await UI.menu([{t:'ごはん（エサ5）',dis:S.food<5},{t:'ごはん×5（エサ25）',dis:S.food<25},{t:'わざ'},{t:'なまえ'},{t:'もどる'}],{title:'あいぼう',cls:'pmenu'});UI.clearKeep();
  if(k<0||k==4)return;
  if(k<2){const n=k?5:1;S.food-=5*n;Audio8.se('ok');await UI.say([`${P.name}は　おいしそうに　たべた！`]);await Game.petExp(10*n)}
  if(k==2){await UI.say([PET_SKILLS.map(s=>`${P.lv>=s.lv?'✅':'🔒'} ${s.n}（Lv${s.lv}）${s.d}`).join('\n')])}
  if(k==3){const n=prompt('あいぼうの　なまえ（10もじまで）',P.name);if(n&&n.trim())P.name=n.trim().slice(0,10)}}}
async function settings(){while(true){const[a,b]=Game.range();const k=await UI.menu([{t:'問題モード',sub:Game.mode=='t'?'⌨️ タイピング（ダメージ1.3倍）':'4択'},{t:'出題Day（はじめ）',sub:'Day '+a},{t:'出題Day（おわり）',sub:'Day '+b},{t:'さいしんDayだけ'},{t:'ぜんぶのDay'},{t:'BGM',sub:Audio8.muted?'OFF':'ON'},{t:'もどる'}],{title:`せってい（${Game.pool().length}語）`,cls:'set'});
 if(k<0||k==6)return;if(k==0)Game.mode=Game.mode=='t'?'4':'t';
 if(k==1||k==2){const j=await UI.menu(DAYS.map(d=>({t:'Day '+d,sub:WORDS.filter(w=>w.day==d).length+'語'})),{title:'Dayをえらぶ',cls:'days',start:Math.max(0,DAYS.indexOf(k==1?a:b))});if(j>=0){const r=[a,b];r[k-1]=DAYS[j];LS.set('eiq_range',r)}}
 if(k==3)LS.set('eiq_range',[DAYS[DAYS.length-1],DAYS[DAYS.length-1]]);if(k==4)LS.set('eiq_range',[DAYS[0],DAYS[DAYS.length-1]]);
 if(k==5){Audio8.muted=!Audio8.muted;if(!Audio8.muted&&Game.map)Audio8.play(Game.state=='field'?Game.map.bgm:'title')}}}
// ---- Ending ----
async function ending(){const S=Game.S;S.flags.clear=1;document.getElementById('hud').style.display='none';await fade(true,1500);Game.state='ending';UI.clear();Audio8.play('ending');await fade(false,800);
 await UI.say(['……','世界に　ことばが　もどった。','人びとは　ふたたび　あいさつを　かわし','ものの　名前を　よび','たいせつな　人に　気持ちを　つたえられるように　なった。',`${S.pet.name}は　うれしそうに　空を　とびまわっている。`,`王「勇者${S.name}よ。そなたこそ　ことばの　勇者じゃ！」`,'――しかし　ことばは　まいにち　うまれ、まいにち　わすれられていく。','だから　勇者の　たびは　まだ　おわらない。','あしたも　あたらしい　ことばが　まっている――']);
 const t=Math.floor(S.time/60),cr=document.createElement('div');cr.className='credits';cr.innerHTML=`<h2>英単語クエスト<br>〜ことばの勇者〜</h2><p>THE END</p><p>レベル ${S.lv}<br>正解した数 ${S.stats.ok}<br>せんとう回数 ${S.stats.battles}<br>プレイ時間 ${Math.floor(t/60)}時間${t%60}分</p><p>あいぼう: ${esc(S.pet.name)}（${PET_STAGES[Game.petStage()][1]} Lv${S.pet.lv}）</p><p>Thank you for playing!</p><p class="sm">タップで　タイトルへ</p>`;UIroot.appendChild(cr);
 await new Promise(r=>{const h=k=>{if(k=='a'){Input.pop(h);r()}return true};Input.push(h);cr.onclick=()=>{Input.pop(h);r()}});cr.remove();
 S.hp=Game.maxHP();S.mp=Game.maxMP();S.map='castle';loadMap('castle','1');if(curSlot)saveTo(curSlot);await UI.say(['（ぼうけんのしょに　クリアを　きろくした。','ひきつづき　レベル上げや　たんごの　ふくしゅうを　たのしめるよ！）']);title()}
// ---- Field input handler ----
function fieldHandler(k){if(Game.state!='field')return true;if(k=='a')interact();if(k=='b')fieldMenu();return true}
// ---- Title ----
async function title(){Game.state='title';UI.clear();Input.stack=[];Audio8.play('title');document.getElementById('hud').style.display='none';
 const t=UI.el('titlebox','<h1>英単語クエスト</h1><h2>〜ことばの勇者〜</h2>');
 while(true){const has=[1,2,3].some(i=>LS.get('eiq_slot'+i,null));const k=await UI.menu([{t:'つづきから',dis:!has},{t:'はじめから'},{t:'せってい'}],{cls:'tmenu',noCancel:true,start:has?0:1});
  if(k==0){const sl=await pickSlot('どの　ぼうけんのしょで　あそびますか？',false);if(!sl)continue;Game.S=Object.assign(newSave(),LS.get('eiq_slot'+sl));curSlot=sl;t.remove();return startField(false)}
  if(k==1){const sl=await pickSlot('どの　ぼうけんのしょに　しますか？',true);if(!sl)continue;if(LS.get('eiq_slot'+sl,null)&&!await UI.yesno('この　ぼうけんのしょを　けして　はじめから　あそびますか？'))continue;
   const S=newSave();const nm=prompt('ゆうしゃの　なまえは？（6もじまで）','ゆうしゃ');if(nm&&nm.trim())S.name=nm.trim().slice(0,6);
   const old=LS.get('vq',null);if(old&&old.lv>1){S.gold+=Math.min(300,(old.gold||0));if(old.pet){S.pet.name=old.pet.name||S.pet.name;S.pet.lv=Math.min(5,old.pet.lv||1)}S.food=Math.min(100,old.food||0);S.migrated=1}
   Game.S=S;curSlot=sl;t.remove();saveTo(sl);return startField(true)}
  if(k==2)await settings()}}
async function startField(isNew){UI.clear();Input.stack=[fieldHandler];document.getElementById('hud').style.display='';await fade(true,10);loadMap(Game.S.map,null,[Game.S.x,Game.S.y]);Game.P.dir=Game.S.dir||0;Game.state='field';await fade(false,600);
 if(isNew){Game.busy=true;await SCRIPTS.opening(G);if(Game.S.migrated)await UI.say(['（前の　バトルゲームの　きろくが　見つかった！','ゴールドと　あいぼうの　なまえ・レベルを　ひきついだよ）']);Game.busy=false}}
// ---- Main loop ----
let last=performance.now(),tt=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;tt+=dt;
 if(Game.state=='field'){fieldUpdate(dt);fieldRender()}else if(Game.state=='battle'){drawBattle(dt)}else if(Game.state=='title'||Game.state=='ending'){drawTitle(tt)}}
function drawTitle(t){const g=ctx;const gr=g.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#0a0a30');gr.addColorStop(1,Game.state=='ending'?'#e08040':'#305090');g.fillStyle=gr;g.fillRect(0,0,VW,VH);
 for(let i=0;i<50;i++){g.globalAlpha=.4+.4*Math.sin(t*2+i);R(g,(i*97)%VW,(i*53)%140,1,1,'#fff')}g.globalAlpha=1;
 g.fillStyle='#183018';g.beginPath();g.moveTo(0,200);for(let x=0;x<=VW;x+=20)g.lineTo(x,180+Math.sin(x/40)*12);g.lineTo(VW,VH);g.lineTo(0,VH);g.fill();
 g.save();g.translate(140,168);g.scale(2,2);g.drawImage(personSprite('hero',0,((t*2)|0)%2),0,0);g.restore();drawPetSprite(g,176,176+Math.sin(t*3)*3,2,((t*4)|0)%2,2,1.6);
 if(Game.state=='ending'){for(let i=0;i<20;i++){const y=(VH-((t*30+i*37)%VH));g.fillStyle=`hsl(${i*40},80%,70%)`;g.font='10px serif';g.fillText('abcdefghijklmnopqrstuvwxyz'[i%26],(i*61)%VW,y)}}}
async function boot(){bindPad();requestAnimationFrame(loop);try{const r=await fetch('words.json?'+Date.now());const d=await r.json();WORDS=d.words.filter(w=>w.word&&w.meaning);DAYS=d.days;document.getElementById('ver').textContent=`単語 ${WORDS.length}語 / Day ${DAYS[0]}〜${DAYS[DAYS.length-1]}（${d.updated||''}）`}catch(e){document.getElementById('ver').textContent='単語データを読みこめませんでした';WORDS=[{word:'apple',meaning:'りんご',day:1},{word:'book',meaning:'本',day:1},{word:'cat',meaning:'ねこ',day:1},{word:'dog',meaning:'いぬ',day:1}];DAYS=[1]}
 const st=document.getElementById('start');st.onclick=()=>{Audio8.init();st.remove();title()}}
boot();
