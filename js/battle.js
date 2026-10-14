// ===== DQ-style front-view battle with vocab questions =====
const Battle={on:false,enemies:[],t:0,shake:0,flashScr:0,fx:[],bg:'field'};
function battleBG(g,style,t){const grd=g.createLinearGradient(0,0,0,170);
 const c={world:['#4a90e0','#a8d8f8','#3c9c3c'],cave:['#100804','#2a1e14','#3a2a1a'],tower:['#4060c0','#90b0f0','#808090'],demon:['#100010','#401030','#2a1030'],town:['#4a90e0','#a8d8f8','#3c9c3c'],castle:['#202030','#404058','#605048']}[style]||['#000','#222','#333'];
 grd.addColorStop(0,c[0]);grd.addColorStop(.65,c[1]);grd.addColorStop(.66,c[2]);grd.addColorStop(1,c[2]);g.fillStyle=grd;g.fillRect(0,0,VW,170);
 if(style=='world'){g.fillStyle='#fff8';[[40,30],[200,20],[280,45]].forEach(([x,y])=>{g.beginPath();g.ellipse((x+t/8)%360-20,y,22,7,0,0,7);g.fill()});g.fillStyle='#2a7a2a';for(let x=0;x<VW;x+=24){g.beginPath();g.arc(x+12,112,14,Math.PI,0);g.fill()}}
 if(style=='cave'||style=='demon'){g.fillStyle=style=='cave'?'#1a120a':'#200818';for(let x=0;x<VW;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x+10,18+((x*7)%20));g.lineTo(x+20,0);g.fill()}}
 if(style=='tower'){g.fillStyle='#fff8';g.beginPath();g.ellipse((t/5)%380-30,40,30,8,0,0,7);g.fill()}
 g.fillStyle='#000';g.fillRect(0,170,VW,VH-170)}
function drawBattle(dt){const g=ctx;Battle.t++;g.save();if(Battle.shake>0){Battle.shake--;g.translate((Math.random()-.5)*8,(Math.random()-.5)*6)}
 battleBG(g,Battle.bg,Battle.t);const alive=Battle.enemies;const n=alive.length;
 alive.forEach((e,i)=>{if(e.alpha<=0)return;const x=VW/2+(i-(n-1)/2)*(n>2?90:110);e.sx=x;if(e.dead)e.alpha=Math.max(0,e.alpha-.04);
  const fl=e.flash>0&&(e.flash--%4<2);drawMonster(g,e,x+(e.hit>0?(e.hit--%2?3:-3):0),78,Battle.t+i*20,fl,e.alpha)});
 Battle.fx=Battle.fx.filter(f=>f.l-->0);Battle.fx.forEach(f=>{const a=f.l/f.L;
  if(f.k=='slash'){g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=3;g.beginPath();g.moveTo(f.x-20,f.y-25+(1-a)*10);g.lineTo(f.x+20,f.y+25-(1-a)*10);g.stroke()}
  if(f.k=='num'){g.font='bold 14px monospace';g.textAlign='center';g.fillStyle='#000';g.fillText(f.t,f.x+1,f.y+1-(1-a)*20);g.fillStyle=f.c;g.fillText(f.t,f.x,f.y-(1-a)*20)}
  if(f.k=='fire'){for(let i=0;i<8;i++){g.fillStyle=`rgba(255,${100+i*15},0,${a})`;g.beginPath();g.arc(f.x+Math.sin(i*2+f.l)*14,f.y-i*5+Math.cos(i)*6,8-i*.6,0,7);g.fill()}}
  if(f.k=='bolt'){g.strokeStyle=`rgba(255,255,120,${a})`;g.lineWidth=3;g.beginPath();let y=0,x=f.x;g.moveTo(x,0);while(y<130){y+=14;x+=(Math.random()-.5)*16;g.lineTo(x,y)}g.stroke()}
  if(f.k=='light'){g.fillStyle=`rgba(255,255,220,${a*.8})`;g.beginPath();g.arc(f.x,f.y,(1-a)*60+10,0,7);g.fill()}
  if(f.k=='heal'){for(let i=0;i<6;i++){g.fillStyle=`rgba(120,255,160,${a})`;g.fillRect(f.x+Math.sin(i+f.l/5)*30,f.y-(1-a)*40-i*6,3,3)}}
  if(f.k=='breath'){g.fillStyle=`rgba(255,140,40,${a*.6})`;g.fillRect(0,60,VW,90)}});
 if(Battle.flashScr>0){g.fillStyle=`rgba(255,0,0,${Battle.flashScr/20})`;g.fillRect(0,0,VW,VH);Battle.flashScr--}
 if(Battle.whiteScr>0){g.fillStyle=`rgba(255,255,255,${Battle.whiteScr/12})`;g.fillRect(0,0,VW,VH);Battle.whiteScr--}
 g.restore()}
// ---- Vocab question ----
function wordPool(){let p=Game.pool();return p.length>=4?p:WORDS}
function pickWord(boss){let p=wordPool();const miss=JSON.parse(localStorage.vqmiss||'{}');const mk=Object.keys(miss);
 if(boss){const days=[...new Set(p.map(w=>w.day))].sort((a,b)=>a-b).slice(-3);const r=p.filter(w=>days.includes(w.day));if(r.length>=4)p=r}
 else if(mk.length&&Math.random()<.3){const mw=WORDS.filter(w=>miss[w.word]);if(mw.length)return mw[(Math.random()*mw.length)|0]}
 return p[(Math.random()*p.length)|0]}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function ask(opt={}){return new Promise(res=>{const w=pickWord(opt.boss);const typing=opt.typing||Game.mode=='t';const panel=document.createElement('div');panel.className='win qpanel'+(typing?' top':'');UIroot.appendChild(panel);
 const title=opt.title?`<div class="qt">${esc(opt.title)}</div>`:'';let done=false;
 const finish=async(ok,given)=>{if(done)return;done=true;const miss=JSON.parse(localStorage.vqmiss||'{}');if(ok){if(miss[w.word]){miss[w.word]--;if(miss[w.word]<=0)delete miss[w.word]}Game.S.stats.ok++}else{miss[w.word]=2;Game.S.stats.ng++}localStorage.vqmiss=JSON.stringify(miss);
  const ex=w.example||{};panel.innerHTML=`${title}<div class="qres ${ok?'ok':'ng'}">${ok?'⭕ 正解！':'❌ ざんねん…'}</div><div class="qw">${esc(w.word)}</div><div class="qm">${esc(w.meaning)}</div>`+
   (!ok&&given?`<div class="qy">あなたの答え: ${esc(given)}</div>`:'')+(ex.en?`<div class="qe">${esc(ex.en)}<br><span>${esc(ex.ja||'')}</span></div>`:'')+(!ok&&w.core?`<div class="qc">💡 ${esc(w.core)}</div>`:'')+`<div class="qn">▼ タップで つづける</div>`;
  Audio8.se(ok?'ok':'miss');await sleep(250);const h=k=>{if(k=='a'||k=='b')close();return true};const close=()=>{Input.pop(h);panel.remove();res({ok,typing,word:w})};Input.push(h);panel.onclick=close;if(ok)setTimeout(()=>{if(panel.isConnected)close()},1600)};
 if(typing){panel.innerHTML=`${title}<div class="qm big">${esc(w.meaning)}</div><div class="qh">${esc(w.word[0])}${' _'.repeat(w.word.length-1)}　（${w.word.length}文字）</div>
  <form><input type="text" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="done" placeholder="英単語をタイプ"><div class="qb"><button type="submit">けってい</button><button type="button" class="sk">わからない</button></div></form>`;
  const inp=panel.querySelector('input');panel.querySelector('form').onsubmit=e=>{e.preventDefault();const v=inp.value.trim().toLowerCase();if(!v)return;inp.blur();finish(v==w.word.trim().toLowerCase(),inp.value.trim())};
  panel.querySelector('.sk').onclick=()=>{inp.blur();finish(false,'')};const h=k=>true;Input.push(h);const oldRes=res;res=v=>{Input.pop(h);oldRes(v)};setTimeout(()=>inp.focus(),60)}
 else{const p=wordPool();let opts=[w.meaning];let cand=opt.boss?p.filter(x=>x.day==w.day):p;if(cand.length<8)cand=p;cand=shuffle(cand.slice()).slice(0,40);for(const c of cand){if(opts.length>=4)break;if(!opts.includes(c.meaning)&&c.word!=w.word)opts.push(c.meaning)}shuffle(opts);
  panel.innerHTML=`${title}<div class="qw big">${esc(w.word)}</div><div class="qch">${opts.map((o,i)=>`<button data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
  const bs=[...panel.querySelectorAll('button')];let cur=0;const upd=()=>bs.forEach((b,i)=>b.classList.toggle('cur',i==cur));
  bs.forEach((b,i)=>b.onclick=()=>{if(done)return;Input.pop(h);finish(opts[i]==w.meaning,opts[i])});
  const h=k=>{if(k=='up'||k=='down')cur^=2;if(k=='left'||k=='right')cur^=1;if(k=='a'){Input.pop(h);finish(opts[cur]==w.meaning,opts[cur]);return true}upd();return true};Input.push(h);upd()}})}
// ---- Battle flow ----
let blogEl=null;
async function blog(t,wait=650){if(!blogEl)return;blogEl.innerHTML='';for(let i=1;i<=t.length;i++){blogEl.innerHTML=esc(t.slice(0,i)).replace(/\n/g,'<br>');await sleep(14)}await sleep(wait)}
function bstat(){const S=Game.S,el=document.getElementById('bstat');if(!el)return;const pet=Game.petStage()>0?`<div class="ps">🐉 ${esc(S.pet.name)} Lv${S.pet.lv}</div>`:'';
 el.innerHTML=`<div class="hn">${esc(S.name)}</div><div>Lv ${S.lv}</div><div class="${S.hp<Game.maxHP()/4?'low':''}">HP ${S.hp}/${Game.maxHP()}</div><div>MP ${S.mp}/${Game.maxMP()}</div>${pet}`}
async function runBattle(ids,opt={}){const S=Game.S;Battle.on=true;Battle.bg=opt.bg||'world';Battle.fx=[];
 Battle.enemies=ids.map((id,i)=>{const d=opt.boss?BOSSES[id]:ENEMIES[id];return{...d,id,hp:d.hp,max:d.hp,alpha:1,flash:0,hit:0,dead:false,name:d.n+(ids.length>1&&ids.filter(x=>x==id).length>1?String.fromCharCode(65+ids.slice(0,i).filter(x=>x==id).length):'')}});
 Audio8.play(opt.boss?'boss':'battle');UI.clear();document.getElementById('hud').style.display='none';const st=UI.el('bstat');st.id='bstat';blogEl=UI.el('blog');bstat();
 const names=Battle.enemies.map(e=>e.name);
 if(opt.boss){await blog(`${names[0]}が　あらわれた！`,900)}else await blog(names.length>1?`${names[0]}たちが　あらわれた！`:`${names[0]}が　あらわれた！`,700);
 let result=null,corr=0,typed=0;const alive=()=>Battle.enemies.filter(e=>!e.dead);
 const dmgEnemy=async(e,d,kind)=>{e.hp-=d;e.flash=12;e.hit=8;Battle.fx.push({k:'num',t:String(d),x:e.sx,y:50,c:'#fff',l:40,L:40});Audio8.se(kind||'hit');await blog(`${e.name}に　${d}の　ダメージ！`,500);
  if(e.hp<=0){e.dead=true;await blog(`${e.name}を　たおした！`,500)}};
 while(!result){bstat();
  // command
  const cmds=[{t:'たたかう'},{t:'じゅもん',dis:!Game.spells().length},{t:'どうぐ'},{t:opt.boss?'にげる（不可）':'にげる',dis:!!opt.boss}];
  blogEl.innerHTML=`${esc(S.name)}は　どうする？`;const c=await UI.menu(cmds,{cls:'bcmd',noCancel:true,cols:true});
  let acted=true;
  if(c==0){const r=await ask({boss:opt.boss,title:'⚔️ こうげき！ 正しい意味をえらぼう'});const tgt=alive()[0];
   if(r.ok){corr++;if(r.typing)typed++;const crit=Math.random()<.08+Math.min(corr,10)*.01;let d=Math.max(1,Math.round((Game.atk()-tgt.def/2)*(.85+Math.random()*.3)*(r.typing?1.3:1)*(crit?1.8:1)));
    Battle.fx.push({k:'slash',x:tgt.sx,y:78,l:12,L:12});await blog(crit?'かいしんの　いちげき！！':`${S.name}の　こうげき！`,crit?400:250);if(crit)Battle.whiteScr=8;await dmgEnemy(tgt,d,crit?'crit':'hit')}
   else{await blog(`${S.name}の　こうげき！`,250);Audio8.se('miss');await blog('しかし　ことばが　でてこない…！　ミス！',600)}}
  else if(c==1){const sp=Game.spells();const k=await UI.menu(sp.map(s=>({t:s.n,sub:`MP${s.mp}`,dis:S.mp<s.mp})),{cls:'bsub',title:'じゅもん（タイピング）'});
   if(k<0)acted=false;else{const s=sp[k];S.mp-=s.mp;bstat();const r=await ask({typing:true,boss:opt.boss,title:`✨ ${s.n}　つづりを　うちこめ！`});await blog(`${S.name}は　${s.n}を　となえた！`,350);
    if(!r.ok){Audio8.se('miss');await blog('しかし　つづりを　まちがえた！　じゅもんは　きえた…',600)}else{corr++;typed++;Audio8.se('spell');
     const pow=()=>Math.round(s.pow*(.9+Math.random()*.2)*(1+S.lv*.02));
     if(s.type=='heal'){const h=Math.min(pow(),Game.maxHP()-S.hp);S.hp+=h;Battle.fx.push({k:'heal',x:VW/2,y:180,l:30,L:30});Audio8.se('heal');bstat();await blog(`HPが　${h}　かいふくした！`)}
     else if(s.type=='atk'){const tgt=alive()[0];Battle.fx.push({k:s.id=='light'?'light':'fire',x:tgt.sx,y:80,l:30,L:30});await sleep(300);await dmgEnemy(tgt,pow(),s.id=='light'?'thunder':'fire')}
     else{for(const e of alive()){Battle.fx.push({k:'bolt',x:e.sx,l:20,L:20})}Audio8.se('thunder');Battle.whiteScr=10;await sleep(300);for(const e of alive())await dmgEnemy(e,pow(),'hit')}}}}
  else if(c==2){const its=Object.entries(S.inv).filter(([k,n])=>n>0&&ITEMS[k]&&!ITEMS[k].key&&['heal','mp'].includes(ITEMS[k].use));
   if(!its.length){await blog('つかえる　どうぐが　ない！',600);acted=false}else{const k=await UI.menu(its.map(([id,n])=>({t:ITEMS[id].n,sub:'×'+n})),{cls:'bsub',title:'どうぐ'});
    if(k<0)acted=false;else{const[id]=its[k];const it=ITEMS[id];S.inv[id]--;await blog(`${S.name}は　${it.n}を　つかった！`,300);
     if(it.use=='heal'){const h=Math.min(it.v,Game.maxHP()-S.hp);S.hp+=h;Audio8.se('heal');Battle.fx.push({k:'heal',x:VW/2,y:180,l:30,L:30});bstat();await blog(`HPが　${h}　かいふくした！`)}
     else{const h=Math.min(it.v,Game.maxMP()-S.mp);S.mp+=h;Audio8.se('heal');bstat();await blog(`MPが　${h}　かいふくした！`)}}}}
  else if(c==3){await blog(`${S.name}は　にげだした！`,300);if(Math.random()<.6){Audio8.se('run');await blog('うまく　にげきれた！',400);result='run';break}await blog('しかし　まわりこまれて　しまった！',500)}
  if(!acted)continue;
  // partner
  if(alive().length&&Game.petStage()>0){const P=S.pet,sk=id=>Game.petSkills().some(s=>s.id==id);
   if(sk('fire')&&Math.random()<.3){await blog(`${P.name}は　ほのおの　いきを　はいた！`,300);Battle.fx.push({k:'breath',l:20,L:20});Audio8.se('fire');for(const e of alive())await dmgEnemy(e,Math.round(Game.petAtk()*.8*(.9+Math.random()*.2)),'hit')}
   else if(sk('heal')&&S.hp<Game.maxHP()*.5&&Math.random()<.4){const h=Math.min(Math.round(20+P.lv*5),Game.maxHP()-S.hp);S.hp+=h;Audio8.se('heal');bstat();await blog(`${P.name}は　いやしの歌を　うたった！\nHPが　${h}　かいふくした！`)}
   else{const times=sk('double')&&Math.random()<.3?2:1;for(let i=0;i<times&&alive().length;i++){const tgt=alive()[0];await blog(`${P.name}の　${['かみつき','しっぽアタック','ひっかき'][(Math.random()*3)|0]}！`,250);await dmgEnemy(tgt,Math.max(1,Math.round((Game.petAtk()-tgt.def/3)*(.85+Math.random()*.3))))}}}
  if(!alive().length){result='win';break}
  // enemies
  for(const e of alive()){let mult=1,txt=`${e.name}の　こうげき！`;
   if(e.final&&Math.random()<.25){mult=1.6;txt='魔王ムゴンは　ちんもくの波動を　はなった！'}else if(e.boss&&Math.random()<.2){mult=1.4;txt=`${e.name}の　はげしい　こうげき！`}else if(e.sh=='mage'&&Math.random()<.3){txt=`${e.name}は　のろいの　ことばを　となえた！`;mult=1.2}else if(e.sh=='dragon'&&Math.random()<.3){txt=`${e.name}は　ほのおを　はいた！`;mult=1.3}
   await blog(txt,300);if(Math.random()<.06&&!e.boss){Audio8.se('miss');await blog(`${S.name}は　ひらりと　かわした！`,450);continue}
   let d=Math.max(1,Math.round((e.atk-Game.def()*.4)*mult*(.85+Math.random()*.3)*(Game.petSkills().some(s=>s.id=='guard')?.8:1)));S.hp=Math.max(0,S.hp-d);Battle.shake=10;Battle.flashScr=8;Audio8.se('hurt');bstat();
   const bs=document.getElementById('bstat');bs.classList.remove('hurt');void bs.offsetWidth;bs.classList.add('hurt');await blog(`${S.name}は　${d}の　ダメージを　うけた！`,500);
   if(S.hp<=0){result='lose';break}}}
 // results
 if(result=='win'){const ex=Battle.enemies.reduce((a,e)=>a+e.exp,0),gd=Battle.enemies.reduce((a,e)=>a+e.g,0),fd=corr+typed;
  await Audio8.jingle('win');await blog(opt.boss?`${names[0]}を　たおした！`:'まものたちを　やっつけた！',400);
  if(ex)await blog(`けいけんち　${ex}ポイント　かくとく！`,400);if(gd){S.gold+=gd;await blog(`${gd}ゴールドを　てにいれた！`,400)}
  if(fd){S.food+=fd;await blog(`あいぼうの　エサを　${fd}こ　ひろった！`,400)}
  S.stats.battles++;await Game.gainExp(ex);if(S.pet&&Game.hasPet())await Game.petExp(Math.ceil(ex/4))}
 else if(result=='lose'){Audio8.stop();await Audio8.jingle('lose');await blog(`${S.name}は　ちからつきた……`,1200)}
 Battle.on=false;blogEl=null;UI.clear();document.getElementById('hud').style.display='';return result}
