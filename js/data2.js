// ===== Expansion: more monsters, word groups, rares, bonus dungeon, encyclopedia data =====
const E2=(n,sh,c,hp,atk,def,exp,g,grp,desc,x={})=>({n,sh,c,hp,atk,def,exp,g,grp,desc,...x});
Object.assign(ENEMIES,{
 slimeB:E2('ベスもじスライム','blob','#f84',10,7,1,4,4,'short','ことばスライムの　あかい　なかま。みじかい　ことばが　だいすき。'),
 book1:E2('ちいさなじしょ','book','#c96',11,7,2,5,6,'noun','ページを　ぱたぱた　させて　とぶ　小さな　じしょ。名詞ばかり　のっている。'),
 snake1:E2('つづりヘビ','snake','#6b4',12,8,2,5,5,'verb','からだに　つづりが　きざまれた　ヘビ。うごきの　ことばを　はく。'),
 eye1:E2('みはりの目玉','eye','#fdd',14,10,3,7,7,'adj','山の　すきまで　旅人を　みはる　目玉。ようすを　あらわす　ことばを　つかう。'),
 weed2:E2('ねむりそう','plant','#b6e',15,10,3,7,6,'d1','あまい　かおりで　ねむけを　さそう　花。'),
 snake2:E2('どくつづりヘビ','snake','#a4c',22,15,5,11,10,'d2','どくを　もった　つづりヘビ。まちがえた　つづりを　あざわらう。'),
 skull:E2('ガイコツけんし','knight','#ddc',28,17,7,13,12,'d3','どうくつで　ねむっていた　むかしの　けんし。ことばを　わすれて　さまよう。'),
 mimic1:E2('ひとくいばこ','chest','#b72',40,22,8,30,40,'long','たからばこの　ふりを　した　まもの。長い　ことばで　かみついてくる。'),
 book2:E2('まどうのじしょ','book','#48c',30,25,7,19,18,'verb','まほうの　ことばが　つまった　あおい　じしょ。'),
 eye2:E2('にらみ目玉','eye','#f88',28,26,6,18,16,'adj','にらまれると　ことばが　でなくなる　という。'),
 weed3:E2('しびれそう','plant','#ee4',32,25,8,20,16,'short','さわると　しびれる　きいろい　花。'),
 bat3:E2('ことばコウモリ','bat','#c44',28,27,6,19,15,'d0','ことばを　さかさまに　して　しまう　コウモリ。'),
 ghost2:E2('さまようゴースト','ghost','#8cf',38,31,10,28,22,'noun','風の塔を　さまよう　たましい。ものの　名前を　さがしている。'),
 book3:E2('のろいの書','book','#625',42,33,11,31,25,'long','ひらくと　のろいの　ことばが　あふれだす　書物。'),
 snake3:E2('かぜへび','snake','#6dd',44,32,12,30,24,'d1','風に　のって　空を　およぐ　ヘビ。'),
 golem3:E2('てつもじゴーレム','golem','#779',70,40,22,48,36,'noun','てつの　もじで　できた　ゴーレム。とても　かたい。'),
 mage2:E2('ことわり魔道士','mage','#3a8',52,44,14,46,36,'verb','魔王に　つかえる　魔道士。ことばの　ことわりを　ねじまげる。'),
 slime3:E2('キングあくたい','blob','#a2a',66,42,16,48,40,'adj','わるぐちばかり　いう　大きな　スライム。'),
 eye3:E2('やみの目玉','eye','#a3f',50,44,14,44,34,'d2','やみの　なかで　ひかる　むらさきの　目玉。'),
 ghost3:E2('しじまのレイス','ghost','#a8a',80,56,20,70,50,'d3','魔王の城の　しずけさから　うまれた　ゆうれい。'),
 book4:E2('きんだんの書','book','#a00',88,58,22,74,52,'long','よんでは　いけない　ことばが　しるされた　まっかな　書。'),
 mimic2:E2('ミミックキング','chest','#fc4',110,62,26,120,200,'phrase','金の　たからばこに　ばけた　まものの　王。'),
 snake4:E2('やみのおろち','snake','#426',100,58,24,78,56,'verb','魔王の城の　地下に　すむ　大ヘビ。'),
 dragon2:E2('しんえんドラゴン','dragon','#c33',200,80,36,160,120,'long','ことばの深淵に　すむ　あかい　りゅう。'),
 golem4:E2('ことわりの巨人','golem','#fd8',220,78,44,170,110,'noun','せかいの　ことばを　ささえる　金の　巨人。'),
 knight2:E2('ことばの騎士王','knight','#fff',180,84,34,170,120,'adj','ことばの　神に　つかえる　しろい　騎士。'),
 mage3:E2('しんえんの賢者','mage','#fff',160,86,30,165,115,'verb','すべての　ことばを　しる　という　賢者。'),
 eye4:E2('すべてを見る目','eye','#4ff',150,82,30,150,100,'phrase','深淵の　すべてを　見とおす　目。'),
 lord2:E2('まおうのかげ','lord','#222',240,88,38,200,150,'latest','たおされた　魔王の　かげ。さいしんの　ことばを　ねらう。'),
 metal1:E2('メタルもじスライム','blob','#ccd',5,8,999,200,10,'long','はがねの　からだを　もつ　スライム。すぐ　にげる。たおせば　けいけんち　たっぷり！',{metal:1,flee:.4,rare:1}),
 gold1:E2('ゴールドもじスライム','blob','#fd2',30,15,20,30,600,'short','金で　できた　スライム。たおすと　ゴールドが　ざくざく！',{flee:.35,rare:1}),
 metal3:E2('メタルじしょ','book','#ccd',6,30,999,800,30,'long','はがねの　表紙の　じしょ。めったに　見られない。',{metal:1,flee:.45,rare:1}),
 metal2:E2('はぐれメタルワード','blob','#aab',8,20,999,1200,40,'long','まぼろしの　メタル。出会えたら　とても　ラッキー！',{metal:1,flee:.5,rare:1}),
});
// groups/descriptions for original enemies
const EX0={slime:['noun','世界中に　いる　スライム。うばわれた　ことばを　ひとつだけ　もっている。'],bat:['verb','ことばを　もごもごさせる　コウモリ。'],weed:['adj','ずっと　だまっている　草の　まもの。'],
 ghost:['noun','口の　ない　ゴースト。しゃべれない　かなしみで　さまよう。'],bat2:['d0','どうくつの　やみに　とけこむ　コウモリ。'],golem1:['d1','いわに　もじが　きざまれた　ゴーレム。'],
 wolf:['noun','ことばを　かみくだいて　食べる　オオカミ。'],bird:['verb','じゅもんの　ように　なく　鳥。'],slime2:['adj','わるい　ことばばかり　つかう　スライム。'],
 garg:['d2','風の塔を　まもる　石の　まもの。'],mage:['long','ことばを　けしさる　魔道士。'],golem2:['phrase','ことだまの　ちからで　うごく　ゴーレム。'],
 knight:['d3','魔王に　したがう　やみの　きし。'],eater:['long','ことばを　食べて　大きくなる　けもの。'],phantom:['short','すがたが　見えたり　きえたりする　鳥。'],
 aknight:['noun','しじまの　城を　まもる　きし。'],dmage:['verb','ちんもくの　じゅもんを　となえる　魔導士。'],wdragon:['adj','ことばを　こだまの　ように　くりかえす　ドラゴン。']};
for(const[k,[g,d]]of Object.entries(EX0))Object.assign(ENEMIES[k],{grp:g,desc:d});
Object.assign(BOSSES.b1,{grp:'latest',desc:'北のどうくつの　ぬし。赤い　ことばの石を　のみこんでいた。'});
Object.assign(BOSSES.b2,{grp:'latest',desc:'風の塔に　すむ　大ガラス。ことばを　わすれさせる。'});
Object.assign(BOSSES.b3,{grp:'latest',desc:'魔王ムゴンの　側近。のろいの　ことばを　あやつる。'});
Object.assign(BOSSES.b4,{grp:'latest',desc:'世界の　ことばを　うばった　魔王。しずかな　世界を　のぞむ。'});
BOSSES.b5={...E2('ことばの神ロゴス','lord','#fd4',3000,110,40,5000,3000,'long','ことばの深淵の　おくに　ねむる　ことばの神。すべての　長い　ことばを　しる。'),boss:true,scale:1.8,lines:['よくぞ　ここまで　きた　ことばの勇者よ。','そなたの　ことばの　ちから……','この　わたしに　見せて　みよ！']};
// zones
Object.assign(ZONES,{sw:['slime','bat','weed','slimeB','book1','snake1'],nw:['slime','bat','weed','ghost','eye1','weed2','book1'],cave:['ghost','bat2','golem1','snake2','skull','mimic1'],
 se:['wolf','bird','slime2','book2','eye2','weed3','bat3'],tower:['garg','mage','golem2','bird','ghost2','book3','snake3'],ne:['knight','eater','phantom','golem3','mage2','slime3','eye3'],
 demon:['aknight','dmage','wdragon','knight','ghost3','book4','mimic2','snake4'],abyss:['dragon2','golem4','knight2','mage3','eye4','lord2','wdragon']});
const RARES={sw:['metal1','gold1'],nw:['metal1','gold1'],cave:['metal1','gold1'],se:['metal1','gold1','metal3'],tower:['metal3','gold1'],ne:['metal2','metal3','gold1'],demon:['metal2','gold1'],abyss:['metal2']};
const ZONE_NAMES={sw:'フミノ村の　まわり',nw:'北の　山あい',cave:'北のどうくつ',se:'マリナ地方',tower:'風の塔',ne:'王都地方',demon:'魔王の城',abyss:'ことばの深淵'};
// word groups
const GROUPS={noun:'名詞の言葉',verb:'動詞の言葉',adj:'ようすの言葉（形容詞）',short:'みじかい言葉（5文字以下）',long:'長い言葉（9文字以上）',phrase:'熟語・フレーズ',d0:'Day 4・8・12…',d1:'Day 1・5・9…',d2:'Day 2・6・10…',d3:'Day 3・7・11…',latest:'さいしんの言葉（最新3Day）'};
const m1=w=>String(w.meaning).split(/[、,;／/・]/)[0].replace(/[（(].*$/,'').trim();
const isVerb=w=>/[うくぐすずつぬぶむる]$/.test(m1(w)),isAdj=w=>/(い|な|の|的)$/.test(m1(w))&&!isVerb(w);
function inGroup(g,w,latestDays){switch(g){case'noun':return!isVerb(w)&&!isAdj(w)&&!/ /.test(w.word);case'verb':return isVerb(w);case'adj':return isAdj(w);case'short':return w.word.length<=5;case'long':return w.word.length>=9;
 case'phrase':return /[ \-]/.test(w.word);case'd0':case'd1':case'd2':case'd3':return w.day%4==+g[1];case'latest':return latestDays.includes(w.day)}return true}
// bonus dungeon
WB.rows[38]=WB.rows[38].slice(0,12)+'7'+WB.rows[38].slice(13);MAPS.world.rows=WB.rows;MAPS.world.links[7]=['abyss1','1','cave','clear'];
MAPS.abyss1={name:'ことばの深淵 B1',style:'demon',bgm:'dungeon',enc:'abyss',rate:14,links:{1:['world','7'],2:['abyss2','1']},rows:[
 "####################",
 "#1....#.......#....#",
 "#.###.#.#####.#.##.#",
 "#.#...#.#$..#...#..#",
 "#.#.###.###.#####.##",
 "#.#.....#.........$#",
 "#.#####.#.#######.##",
 "#.....#...#.....#..#",
 "#####.#####.###.##.#",
 "#$....#.....#.#....#",
 "#.###.#.#####.####.#",
 "#...#...#........#.#",
 "###.#####.######.#.#",
 "#.........#.......2#",
 "####################"],chests:[{item:'herb2'},{item:'water'},{gold:2000}]};
MAPS.abyss2={name:'ことばの深淵 B2',style:'demon',bgm:'dungeon',enc:'abyss',rate:14,links:{1:['abyss1','2']},rows:[
 "####################",
 "#~~~~~~~~~~~~~~~~~~#",
 "#~,,,,,,,,,,,,,,,,~#",
 "#~,,,,,,,,X,,,,,,,~#",
 "#~,,,,,,,,,,,,,,,,~#",
 "#~~~~~~~~,,~~~~~~~~#",
 "#.$......,,......$.#",
 "#.........1........#",
 "####################"],chests:[{item:'water'},{item:'herb2'}],boss:'b5',bossFlag:'logos'};
SCRIPTS.boss_b5=async G=>{await G.say(['ロゴス「みごとだ……ことばの勇者よ。','ことばは　まなぶ者の　なかで　いきつづける。','これからも　まいにち　あたらしい　ことばと　であうのだ」','ことばの神に　みとめられた！（3000ゴールドを　手に入れた）'])};
const DEX_LIST=()=>[...Object.keys(ENEMIES).map(id=>({id,boss:false})),...Object.keys(BOSSES).map(id=>({id,boss:true}))];
const DEX_REWARDS=[[10,'herb2',3,'じょうやくそう×3'],[25,null,800,'800ゴールド'],[50,'water',3,'まほうのみず×3'],[75,null,3000,'3000ゴールド'],[100,null,10000,'10000ゴールド＋称号「ずかんマスター」']];
