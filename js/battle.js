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
function groupPool(grp){const range=wordPool();if(!grp)return{p:range,fb:false};const days=[...new Set(range.map(w=>w.day))].sort((a,b)=>a-b).slice(-3);const p=range.filter(w=>inGroup(grp,w,days));return p.length>=6?{p,fb:false}:{p:range,fb:true}}
function pickWord(e){const{p}=groupPool(e&&e.grp);const miss=JSON.parse(localStorage.vqmiss||'{}');
 if(!(e&&e.boss)&&Math.random()<.3){const mw=p.filter(w=>miss[w.word]);if(mw.length)return[mw[(Math.random()*mw.length)|0],p]}
 return[p[(Math.random()*p.length)|0],p]}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a}
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function ask(opt={}){return new Promise(res=>{const[w,pool]=pickWord(opt.enemy);const hard=Game.mode=='h';const typing=opt.typing||Game.mode!='4';const panel=document.createElement('div');panel.className='win qpanel'+(typing?' top':'');panel.dataset.w=w.word;UIroot.appendChild(panel);
 const title=opt.title?`<div class="qt">${esc(opt.title)}${hard?' 🔥ハード':''}</div>`:'';let done=false,timer=null;const S=Game.S;S.wstat=S.wstat||{};
 const finish=async(ok,given)=>{if(done)return;done=true;clearInterval(timer);const miss=JSON.parse(localStorage.vqmiss||'{}');if(ok){if(miss[w.word]){miss[w.word]--;if(miss[w.word]<=0)delete miss[w.word]}S.stats.ok++;S.wstat[w.word]=(S.wstat[w.word]||0)+1}else{miss[w.word]=2;S.stats.ng++}localStorage.vqmiss=JSON.stringify(miss);
  const ex=w.example||{};panel.innerHTML=`${title}<div class="qres ${ok?'ok':'ng'}">${ok?'⭕ 正解！':given=='（時間切れ）'?'⏰ 時間切れ！':'❌ ざんねん…'}</div><div class="qw">${esc(w.word)}</div><div class="qm">${esc(w.meaning)}</div>`+
   (!ok&&given&&given!='（時間切れ）'?`<div class="qy">あなたの答え: ${esc(given)}</div>`:'')+(ex.en?`<div class="qe">${esc(ex.en)}<br><span>${esc(ex.ja||'')}</span></div>`:'')+(!ok&&w.core?`<div class="qc">💡 ${esc(w.core)}</div>`:'')+`<div class="qn">▼ タップで つづける</div>`;
  Audio8.se(ok?'ok':'miss');await sleep(250);const h=k=>{if(k=='a'||k=='b')close();return true};const close=()=>{Input.pop(h);panel.remove();res({ok,typing,hard:hard&&typing,word:w})};Input.push(h);panel.onclick=close;if(ok)setTimeout(()=>{if(panel.isConnected)close()},1600)};
 if(typing){const ex=w.example||{};let blank=false;let prompt=`<div class="qm big">${esc(w.meaning)}</div>`;
  if(hard&&ex.en&&Math.random()<.4){const re=new RegExp('\\b'+reEsc(w.word)+'\\b','i');if(re.test(ex.en))blank=true,prompt=`<div class="qs">${esc(ex.en.replace(re,'\u0001')).replace('\u0001','<u>　＿＿＿　</u>')}</div><div class="qsj">${esc(ex.ja||'')}</div><div class="qm">（${esc(w.meaning)}）</div>`}
  const hint=hard?`<div class="qh">ヒントなし</div><div class="tbar"><i></i></div>`:`<div class="qh">${esc(w.word[0])}${' _'.repeat(w.word.length-1)}　（${w.word.length}文字）</div>`;
  panel.innerHTML=`${title}${prompt}${hint}<form><input type="text" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="done" placeholder="英単語をタイプ"><div class="qb"><button type="submit">けってい</button><button type="button" class="sk">わからない</button></div></form>`;
  const inp=panel.querySelector('input');panel.querySelector('form').onsubmit=e=>{e.preventDefault();const v=inp.value.trim().toLowerCase();if(!v)return;inp.blur();Input.pop(hh);finish(v==w.word.trim().toLowerCase()||(!blank&&WORDS.some(x=>x.meaning==w.meaning&&x.word.trim().toLowerCase()==v)),inp.value.trim())};
  panel.querySelector('.sk').onclick=()=>{inp.blur();Input.pop(hh);finish(false,'')};const hh=k=>true;Input.push(hh);setTimeout(()=>inp.focus(),60);
  if(hard){const lim=(9+Math.min(6,w.word.length*.4))*1000,t0=performance.now(),bar=panel.querySelector('.tbar i');timer=setInterval(()=>{const r=1-(performance.now()-t0)/lim;bar.style.width=Math.max(0,r*100)+'%';bar.style.background=r<.3?'#f44':r<.6?'#fc4':'#4f8';if(r<=0){inp.blur();Input.pop(hh);finish(false,'（時間切れ）')}},100)}}
 else{let opts=[w.meaning];let cand=shuffle(pool.length>=8?pool.slice():wordPool().slice()).slice(0,40);for(const c of cand){if(opts.length>=4)break;if(!opts.includes(c.meaning)&&c.word!=w.word)opts.push(c.meaning)}for(const c of shuffle(WORDS.slice(0,200))){if(opts.length>=4)break;if(!opts.includes(c.meaning))opts.push(c.meaning)}shuffle(opts);
  panel.innerHTML=`${title}<div class="qw big">${esc(w.word)}</div><div class="qch">${opts.map((o,i)=>`<button data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
  const bs=[...panel.querySelectorAll('button')];let cur=0;const upd=()=>bs.forEach((b,i)=>b.classList.toggle('cur',i==cur));
  bs.forEach((b,i)=>b.onclick=()=>{if(done)return;Input.pop(h);finish(opts[i]==w.meaning,opts[i])});
  const h=k=>{if(k=='up'||k=='down')cur^=2;if(k=='left'||k=='right')cur^=1;if(k=='a'){Input.pop(h);finish(opts[cur]==w.meaning,opts[cur]);return true}upd();return true};Input.push(h);upd()}})}
// ---- Battle flow ----
let blogEl=null;
async function blog(t,wait=650){if(!blogEl)return;blogEl.innerHTML='';for(let i=1;i<=t.length;i++){blogEl.innerHTML=esc(t.slice(0,i)).replace(/\n/g,'<br>');await sleep(14)}await sleep(wait)}
function bstat(){const S=Game.S,el=document.getElementById('bstat');if(!el)return;const pet=Game.petStage()>0?`<div class="ps">🐉 ${esc(S.pet.name)} Lv${S.pet.lv}</div>`:'';
 el.innerHTML=`<div class="hn">${esc(S.name)}</div><div>Lv ${S.lv}</div><div class="${S.hp<Game.maxHP()/4?'low':''}">HP ${S.hp}/${Game.maxHP()}</div><div>MP ${S.mp}/${Game.maxMP()}</div>${pet}`;
 const g=document.getElementById('bgrp'),f=Battle.enemies.find(e=>!e.dead);if(g&&f){const gp=groupPool(f.grp);g.innerHTML=`📖 ${esc(f.name)}の言葉<br><b>${esc(GROUPS[f.grp]||'ぜんぶ')}</b>${gp.fb?'<br><small>（範囲内に少ないので全範囲から）</small>':''}`}}
function dexMark(id,k){const S=Game.S;S.dex=S.dex||{};const d=S.dex[id]=S.dex[id]||{seen:0,kill:0};d[k]++}
async function runBattle(ids,opt={}){const S=Game.S;Battle.on=true;Battle.bg=opt.bg||'world';Battle.fx=[];
 Battle.enemies=ids.map((id,i)=>{const d=opt.boss?BOSSES[id]:ENEMIES[id];return{...d,id,hp:d.hp,max:d.hp,alpha:1,flash:0,hit:0,dead:false,name:d.n+(ids.length>1&&ids.filter(x=>x==id).length>1?String.fromCharCode(65+ids.slice(0,i).filter(x=>x==id).length):'')}});
 [...new Set(ids)].forEach(id=>dexMark(id,'seen'));
 Audio8.play(opt.boss?'boss':'battle');UI.clear();document.getElementById('hud').style.display='none';const st=UI.el('bstat');st.id='bstat';const gw=UI.el('bgrp');gw.id='bgrp';blogEl=UI.el('blog');bstat();
 const names=Battle.enemies.map(e=>e.name);const hardM=()=>Game.mode=='h';
 if(opt.boss){await blog(`${names[0]}が　あらわれた！`,900)}else await blog((Battle.enemies[0].rare?'おっ！？　':'')+(names.length>1?`${names[0]}たちが　あらわれた！`:`${names[0]}が　あらわれた！`),700);
 let result=null,corr=0,typed=0;const alive=()=>Battle.enemies.filter(e=>!e.dead);
 const dmgEnemy=async(e,d,kind,spell)=>{if(e.metal){d=spell?0:kind=='crit'?1+((Math.random()*3)|0):Math.random()<.5?1:0}
  if(d<=0){Audio8.se('miss');await blog(spell?`しかし　${e.name}には　きかなかった！`:`ミス！　${e.name}に　ダメージを　あたえられない！`,500);return}
  e.hp-=d;e.flash=12;e.hit=8;Battle.fx.push({k:'num',t:String(d),x:e.sx,y:50,c:'#fff',l:40,L:40});Audio8.se(kind||'hit');await blog(`${e.name}に　${d}の　ダメージ！`,500);
  if(e.hp<=0){e.dead=true;dexMark(e.id,'kill');await blog(`${e.name}を　たおした！`,500);bstat()}};
 const strike=async(e,pre)=>{let mult=1,txt=pre||`${e.name}の　こうげき！`;
  if(!pre){if(e.final&&Math.random()<.25){mult=1.6;txt=`${e.name}は　ちんもくの波動を　はなった！`}else if(e.boss&&Math.random()<.2){mult=1.4;txt=`${e.name}の　はげしい　こうげき！`}else if(e.sh=='mage'&&Math.random()<.3){txt=`${e.name}は　のろいの　ことばを　となえた！`;mult=1.2}else if(e.sh=='dragon'&&Math.random()<.3){txt=`${e.name}は　ほのおを　はいた！`;mult=1.3}}
  await blog(txt,300);if(!pre&&Math.random()<.06&&!e.boss){Audio8.se('miss');await blog(`${S.name}は　ひらりと　かわした！`,450);return}
  let d=Math.max(1,Math.round((e.atk-Game.def()*.4)*mult*(.85+Math.random()*.3)*(Game.petSkills().some(s=>s.id=='guard')?.8:1)));S.hp=Math.max(0,S.hp-d);Battle.shake=10;Battle.flashScr=8;Audio8.se('hurt');bstat();
  const bs=document.getElementById('bstat');bs.classList.remove('hurt');void bs.offsetWidth;bs.classList.add('hurt');await blog(`${S.name}は　${d}の　ダメージを　うけた！`,500)};
 const hardPenalty=async(r)=>{if(r.hard&&alive().length&&S.hp>0){await strike(alive()[0],`すきを　つかれた！　${alive()[0].name}の　こうげき！`)}};
 while(!result){bstat();
  const cmds=[{t:'たたかう'},{t:'じゅもん',dis:!Game.spells().length},{t:'どうぐ'},{t:opt.boss?'にげる（不可）':'にげる',dis:!!opt.boss}];
  blogEl.innerHTML=`${esc(S.name)}は　どうする？`;const c=await UI.menu(cmds,{cls:'bcmd',noCancel:true,cols:true});
  let acted=true;
  if(c==0){const tgt=alive()[0];const r=await ask({enemy:tgt,boss:opt.boss,title:'⚔️ こうげき！'+(Game.mode=='4'?' 正しい意味をえらぼう':' 英単語をうちこもう')});
   if(r.ok){corr++;if(r.typing)typed++;const crit=Math.random()<.08+Math.min(corr,10)*.01+(r.hard?.07:0);let d=Math.max(1,Math.round((Game.atk()-tgt.def/2)*(.85+Math.random()*.3)*(r.hard?1.6:r.typing?1.3:1)*(crit?1.8:1)));
    Battle.fx.push({k:'slash',x:tgt.sx,y:78,l:12,L:12});await blog(crit?'かいしんの　いちげき！！':`${S.name}の　こうげき！`,crit?400:250);if(crit)Battle.whiteScr=8;await dmgEnemy(tgt,d,crit?'crit':'hit')}
   else{await blog(`${S.name}の　こうげき！`,250);Audio8.se('miss');await blog('しかし　ことばが　でてこない…！　ミス！',600);await hardPenalty(r)}}
  else if(c==1){const sp=Game.spells();const k=await UI.menu(sp.map(s=>({t:s.n,sub:`MP${s.mp}`,dis:S.mp<s.mp})),{cls:'bsub',title:'じゅもん（タイピング）'});
   if(k<0)acted=false;else{const s=sp[k];S.mp-=s.mp;bstat();const r=await ask({typing:true,enemy:alive()[0],boss:opt.boss,title:`✨ ${s.n}　つづりを　うちこめ！`});await blog(`${S.name}は　${s.n}を　となえた！`,350);
    if(!r.ok){Audio8.se('miss');await blog('しかし　つづりを　まちがえた！　じゅもんは　きえた…',600);await hardPenalty(r)}else{corr++;typed++;Audio8.se('spell');
     const pow=()=>Math.round(s.pow*(.9+Math.random()*.2)*(1+S.lv*.02)*(r.hard?1.3:1));
     if(s.type=='heal'){const h=Math.min(pow(),Game.maxHP()-S.hp);S.hp+=h;Battle.fx.push({k:'heal',x:VW/2,y:180,l:30,L:30});Audio8.se('heal');bstat();await blog(`HPが　${h}　かいふくした！`)}
     else if(s.type=='atk'){const tgt=alive()[0];Battle.fx.push({k:s.id=='light'?'light':'fire',x:tgt.sx,y:80,l:30,L:30});await sleep(300);await dmgEnemy(tgt,pow(),s.id=='light'?'thunder':'fire',true)}
     else{for(const e of alive()){Battle.fx.push({k:'bolt',x:e.sx,l:20,L:20})}Audio8.se('thunder');Battle.whiteScr=10;await sleep(300);for(const e of alive())await dmgEnemy(e,pow(),'hit',true)}}}}
  else if(c==2){const its=Object.entries(S.inv).filter(([k,n])=>n>0&&ITEMS[k]&&!ITEMS[k].key&&['heal','mp'].includes(ITEMS[k].use));
   if(!its.length){await blog('つかえる　どうぐが　ない！',600);acted=false}else{const k=await UI.menu(its.map(([id,n])=>({t:ITEMS[id].n,sub:'×'+n})),{cls:'bsub',title:'どうぐ'});
    if(k<0)acted=false;else{const[id]=its[k];const it=ITEMS[id];S.inv[id]--;await blog(`${S.name}は　${it.n}を　つかった！`,300);
     if(it.use=='heal'){const h=Math.min(it.v,Game.maxHP()-S.hp);S.hp+=h;Audio8.se('heal');Battle.fx.push({k:'heal',x:VW/2,y:180,l:30,L:30});bstat();await blog(`HPが　${h}　かいふくした！`)}
     else{const h=Math.min(it.v,Game.maxMP()-S.mp);S.mp+=h;Audio8.se('heal');bstat();await blog(`MPが　${h}　かいふくした！`)}}}}
  else if(c==3){await blog(`${S.name}は　にげだした！`,300);if(Math.random()<.6){Audio8.se('run');await blog('うまく　にげきれた！',400);result='run';break}await blog('しかし　まわりこまれて　しまった！',500)}
  if(!acted)continue;if(S.hp<=0){result='lose';break}
  if(alive().length&&Game.petStage()>0){const P=S.pet,sk=id=>Game.petSkills().some(s=>s.id==id);
   if(sk('fire')&&Math.random()<.3){await blog(`${P.name}は　ほのおの　いきを　はいた！`,300);Battle.fx.push({k:'breath',l:20,L:20});Audio8.se('fire');for(const e of alive())await dmgEnemy(e,Math.round(Game.petAtk()*.8*(.9+Math.random()*.2)),'hit',true)}
   else if(sk('heal')&&S.hp<Game.maxHP()*.5&&Math.random()<.4){const h=Math.min(Math.round(20+P.lv*5),Game.maxHP()-S.hp);S.hp+=h;Audio8.se('heal');bstat();await blog(`${P.name}は　いやしの歌を　うたった！\nHPが　${h}　かいふくした！`)}
   else{const times=sk('double')&&Math.random()<.3?2:1;for(let i=0;i<times&&alive().length;i++){const tgt=alive()[0];await blog(`${P.name}の　${['かみつき','しっぽアタック','ひっかき'][(Math.random()*3)|0]}！`,250);await dmgEnemy(tgt,Math.max(1,Math.round((Game.petAtk()-tgt.def/3)*(.85+Math.random()*.3))))}}}
  if(!alive().length){result='win';break}
  for(const e of alive()){if(e.flee&&Math.random()<e.flee){e.dead=true;e.fled=true;Audio8.se('run');await blog(`${e.name}は　にげだした！`,500);bstat();continue}
   await strike(e);if(S.hp<=0){result='lose';break}}
  if(!result&&!alive().length)result='win'}
 if(result=='win'){const kd=Battle.enemies.filter(e=>!e.fled),mul=hardM()?1.5:1;const ex=Math.round(kd.reduce((a,e)=>a+e.exp,0)*mul),gd=Math.round(kd.reduce((a,e)=>a+e.g,0)*mul),fd=corr+typed;
  if(!kd.length){await blog('まものたちは　にげさって　しまった…',700)}else{
  await Audio8.jingle('win');await blog(opt.boss?`${names[0]}を　たおした！`:'まものたちを　やっつけた！',400);if(mul>1)await blog('🔥ハードボーナス！　けいけんちと　ゴールド　1.5ばい！',400);
  if(ex)await blog(`けいけんち　${ex}ポイント　かくとく！`,400);if(gd){S.gold+=gd;await blog(`${gd}ゴールドを　てにいれた！`,400)}}
  if(fd){S.food+=fd;await blog(`あいぼうの　エサを　${fd}こ　ひろった！`,400)}
  S.stats.battles++;await Game.gainExp(ex);if(S.pet&&Game.hasPet()&&ex)await Game.petExp(Math.ceil(ex/4))}
 else if(result=='lose'){Audio8.stop();await Audio8.jingle('lose');await blog(`${S.name}は　ちからつきた……`,1200)}
 Battle.on=false;blogEl=null;UI.clear();document.getElementById('hud').style.display='';return result}
