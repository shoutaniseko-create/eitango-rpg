// Original chiptune BGM/SE via WebAudio (all melodies composed for this game)
const Audio8=(()=>{
let AC=null,master=null,cur=null,timer=null,muted=false;
const N={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
const hz=n=>{if(!n||n=='R')return 0;const m=n.match(/^([A-G]#?)(\d)$/);return 440*Math.pow(2,(N[m[1]]+(+m[2]+1)*12-69)/12)};
function init(){if(AC){if(AC.state=='suspended')AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5;master.connect(AC.destination)}catch(e){}}
function tone(f,t,d,type='square',v=.08){if(!AC||!f)return;const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,t+d*.7);g.gain.linearRampToValueAtTime(.0001,t+d*.98);o.connect(g).connect(master);o.start(t);o.stop(t+d)}
// song: {bpm, lead:"C5/1 D5/1 ...", bass:"..."} unit = 8th note
const parse=s=>s.trim().split(/\s+/).map(x=>{const[a,b]=x.split('/');return[a,+(b||1)]});
const SONGS={
 title:{bpm:100,loop:true,lead:"E5/2 G5/2 C6/3 B5/1 A5/2 G5/2 E5/4 F5/2 A5/2 D6/3 C6/1 B5/4 G5/4 E5/2 G5/2 C6/3 D6/1 E6/2 D6/2 C6/2 A5/2 B5/2 G5/2 A5/2 B5/2 C6/8",
  bass:"C3/4 G3/4 C3/4 G3/4 F3/4 C4/4 G3/4 D3/4 C3/4 G3/4 A3/4 E3/4 F3/4 G3/4 C3/8"},
 field:{bpm:132,loop:true,lead:"G4/2 C5/2 E5/2 G5/3 F5/1 E5/2 D5/2 C5/4 R/2 A4/2 D5/2 F5/2 A5/3 G5/1 F5/2 E5/2 D5/4 R/2 G4/2 C5/2 E5/2 G5/3 A5/1 G5/2 E5/2 C6/3 B5/1 A5/2 G5/2 F5/2 D5/2 E5/2 D5/2 C5/6",
  bass:"C3/2 G3/2 C3/2 G3/2 A2/2 E3/2 A2/2 E3/2 D3/2 A3/2 D3/2 A3/2 G2/2 D3/2 G2/2 D3/2 C3/2 G3/2 C3/2 G3/2 A2/2 E3/2 F3/2 G3/2 F3/2 G3/2 G2/2 B2/2 C3/4 R/2"},
 town:{bpm:112,loop:true,lead:"C5/1 E5/1 G5/2 E5/2 F5/1 A5/1 C6/2 A5/2 G5/2 E5/2 C5/2 D5/2 E5/6 R/2 D5/1 F5/1 A5/2 F5/2 E5/1 G5/1 C6/2 G5/2 F5/2 D5/2 B4/2 D5/2 C5/6 R/2",
  bass:"C3/4 C3/4 F3/4 F3/4 C3/4 G3/4 C3/8 D3/4 D3/4 C3/4 C3/4 G2/4 G2/4 C3/8"},
 dungeon:{bpm:84,loop:true,lead:"A4/2 R/1 C5/1 B4/2 R/2 A4/2 E4/2 F4/4 R/2 G4/2 R/1 B4/1 A4/2 R/2 G4/2 D4/2 E4/6 A4/2 R/1 C5/1 D5/2 R/2 E5/2 C5/2 D5/4 B4/2 G#4/2 A4/8",
  bass:"A2/2 A2/2 A2/2 A2/2 F2/2 F2/2 F2/2 F2/2 G2/2 G2/2 G2/2 G2/2 E2/2 E2/2 E2/2 E2/2 A2/2 A2/2 A2/2 A2/2 D2/2 D2/2 E2/2 E2/2 A2/8"},
 battle:{bpm:168,loop:true,lead:"E5/1 E5/1 R/1 E5/1 D5/1 E5/1 G5/2 E5/1 D5/1 C5/1 D5/1 E5/4 F5/1 F5/1 R/1 F5/1 E5/1 F5/1 A5/2 G5/1 F5/1 E5/1 D5/1 E5/4 A5/2 G5/2 F5/2 E5/2 D5/2 E5/2 F5/2 G#5/2 A5/2 B5/2 C6/2 B5/2 A5/4 R/4",
  bass:"A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 D3/1 D4/1 D3/1 D4/1 D3/1 D4/1 D3/1 D4/1 A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 A2/1 A3/1 F2/2 F3/2 F2/2 F3/2 E2/2 E3/2 E2/2 E3/2 A2/2 A3/2 A2/2 A3/2 A2/8"},
 boss:{bpm:176,loop:true,lead:"D5/1 R/1 D5/1 F5/1 D5/1 G#5/2 A5/1 R/2 G5/1 F5/1 E5/1 F5/1 D5/4 C5/1 R/1 C5/1 E5/1 C5/1 G5/2 G#5/1 R/2 F5/1 E5/1 D5/1 E5/1 C#5/4 D6/2 C6/2 A#5/2 A5/2 G5/2 F5/2 E5/2 C#5/2 D5/8",
  bass:"D2/1 D3/1 D2/1 D3/1 D2/1 D3/1 D2/1 D3/1 D2/1 D3/1 D2/1 D3/1 D2/1 D3/1 D2/1 D3/1 C2/1 C3/1 C2/1 C3/1 C2/1 C3/1 C2/1 C3/1 A1/1 A2/1 A1/1 A2/1 A1/1 A2/1 A1/1 A2/1 A#1/2 A#2/2 A#1/2 A#2/2 A1/2 A2/2 A1/2 A2/2 D2/8"},
 castle:{bpm:96,loop:true,lead:"G4/2 C5/2 D5/2 E5/4 D5/2 C5/2 D5/2 G4/4 R/2 A4/2 D5/2 E5/2 F5/4 E5/2 D5/2 C5/2 B4/2 C5/6",bass:"C3/4 G2/4 C3/4 G2/4 F2/4 D3/4 G2/4 C3/8"},
 ending:{bpm:90,loop:true,lead:"C5/2 E5/2 G5/4 A5/2 G5/2 E5/4 F5/2 E5/2 D5/2 C5/2 D5/8 C5/2 E5/2 G5/4 C6/2 B5/2 A5/4 G5/2 F5/2 E5/2 D5/2 C5/8",bass:"C3/8 A2/8 F2/8 G2/8 C3/8 A2/8 F2/4 G2/4 C3/8"},
};
const JINGLES={
 win:{bpm:180,lead:"C5/1 E5/1 G5/1 C6/3 G5/1 C6/4",bass:"C3/3 G3/3 C3/4"},
 lv:{bpm:180,lead:"G5/1 G5/1 G5/1 E5/1 A5/2 G5/2 C6/4",bass:"C3/4 F3/2 G3/2 C3/4"},
 inn:{bpm:100,lead:"E5/2 G5/2 C6/2 B5/2 G5/2 A5/2 F5/2 G5/6",bass:"C3/4 E3/4 F3/4 G3/2 C3/6"},
 item:{bpm:200,lead:"A5/1 C#6/1 E6/1 A6/3",bass:"A3/6"},
 lose:{bpm:80,lead:"E5/2 D#5/2 D5/2 C#5/6",bass:"A2/2 G#2/2 G2/2 F#2/6"},
};
function schedule(song,onEnd){const q=60/song.bpm/2;let tracks=[['lead','square',.07],['bass','triangle',.12]].map(([k,ty,v])=>({ns:parse(song[k]||'R/1'),i:0,t:AC.currentTime+.05,ty,v}));
 const total=tracks.map(tr=>tr.ns.reduce((a,b)=>a+b[1],0));
 const h={stop:false};
 function pump(){if(h.stop)return;let done=true;for(const tr of tracks){while(tr.t<AC.currentTime+.4){if(tr.i>=tr.ns.length){if(song.loop){tr.i=0}else break}
   const[n,l]=tr.ns[tr.i++];tone(hz(n),tr.t,l*q*.95,tr.ty,tr.v);tr.t+=l*q}if(tr.i<tr.ns.length||song.loop)done=false}
  if(done){if(onEnd)setTimeout(onEnd,(Math.max(...tracks.map(t=>t.t))-AC.currentTime)*1000);return}h.to=setTimeout(pump,100)}
 pump();return h}
let curName=null;
function play(name){init();if(!AC||curName==name)return;stop();curName=name;if(muted)return;cur=schedule(SONGS[name])}
function stop(){if(cur){cur.stop=true;clearTimeout(cur.to)}cur=null;curName=null}
function jingle(name){init();if(!AC||muted)return Promise.resolve();const resume=curName;stop();const J=JINGLES[name];const dur=parse(J.lead).reduce((a,b)=>a+b[1],0)*60/J.bpm/2*1000+150;
 try{schedule(J,null)}catch(e){}return new Promise(r=>setTimeout(()=>{r();if(resume&&!curName)play(resume)},dur))}
function se(type){init();if(!AC||muted)return;const t=AC.currentTime;
 const sw=(f1,f2,d,ty='square',v=.1,s=0)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f1,t+s);o.frequency.exponentialRampToValueAtTime(f2,t+s+d);g.gain.setValueAtTime(v,t+s);g.gain.exponentialRampToValueAtTime(.001,t+s+d);o.connect(g).connect(master);o.start(t+s);o.stop(t+s+d)};
 const noise=(d,v=.15,s=0)=>{const b=AC.createBuffer(1,AC.sampleRate*d,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const n=AC.createBufferSource(),g=AC.createGain();g.gain.value=v;n.buffer=b;n.connect(g).connect(master);n.start(t+s)};
 ({cursor:()=>sw(1200,1200,.04,'square',.05),ok:()=>sw(900,1400,.08,'square',.07),cancel:()=>sw(600,300,.08,'square',.06),
  hit:()=>{noise(.12,.2);sw(300,80,.15,'square',.1)},crit:()=>{noise(.2,.25);sw(1500,200,.25,'sawtooth',.1)},hurt:()=>{noise(.25,.3);sw(150,50,.3,'sawtooth',.15)},
  spell:()=>{for(let i=0;i<6;i++)sw(400+i*200,800+i*200,.08,'square',.06,i*.05)},fire:()=>{noise(.5,.25);sw(200,60,.5,'sawtooth',.1)},thunder:()=>{noise(.6,.35);sw(2000,100,.4,'square',.1)},
  heal:()=>{[523,659,784,1047].forEach((f,i)=>sw(f,f,.12,'triangle',.12,i*.07))},door:()=>sw(200,100,.15,'square',.08),stairs:()=>{[600,500,400,300].forEach((f,i)=>sw(f,f,.06,'square',.06,i*.06))},
  bump:()=>sw(120,80,.06,'square',.08),encounter:()=>{for(let i=0;i<8;i++)sw(800-i*60,700-i*60,.05,'square',.07,i*.04)},run:()=>{[300,400,500,600].forEach((f,i)=>sw(f,f,.05,'square',.06,i*.04))},
  talk:()=>sw(700,700,.02,'square',.03),miss:()=>sw(400,200,.15,'triangle',.1)}[type]||(()=>{}))()}
return{init,play,stop,jingle,se,get muted(){return muted},set muted(v){muted=v;if(v)stop()}};
})();
