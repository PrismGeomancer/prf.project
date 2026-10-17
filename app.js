const $ = id => document.getElementById(id);
const KEY = 'proof-mvp-v1';
let serverTimeOffset=0;
const schedule=()=>ProofKit.roundAt(Date.now()+serverTimeOffset);
const community={ready:false,loading:false,error:'',voting:false};
const INK = '#191916', RED = '#d94132';
const prompts = ['Draw something from memory.', 'Draw your last brain cell.', 'Draw something the internet would love.', 'Draw something famous, badly.', 'Draw whatever’s in your head.'];
const uid = () => [...crypto.getRandomValues(new Uint8Array(3))].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const delay = ms => new Promise(r=>setTimeout(r,ms));
const BASE58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function encodeBase58(bytes){let value=0n;for(const byte of bytes)value=value*256n+BigInt(byte);let result='';while(value){result=BASE58[Number(value%58n)]+result;value/=58n;}for(const byte of bytes){if(byte!==0)break;result='1'+result;}return result;}
function validSolanaAddress(address){if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address))return false;let value=0n;for(const character of address)value=value*58n+BigInt(BASE58.indexOf(character));let bytes=0;while(value){bytes++;value/=256n;}let zeros=0;for(const character of address){if(character!=='1')break;zeros++;}return bytes+zeros===32;}
function demoWallet(index){return encodeBase58(Uint8Array.from({length:32},(_,i)=>(index*37+i*29+71)%256));}
function shortWallet(address){return address?`${address.slice(0,4)}…${address.slice(-4)}`:'No payout address';}
function payoutDetails(address){return address?`<div class="payout-details"><span class="eyebrow">SOLANA PAYOUT ADDRESS</span><code>${esc(address)}</code></div>`:'';}
const line = (d,color=INK,width=4) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle = (x,y,r,color=INK,width=4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const text = (s,x,y,size=18,color=INK) => `<text x="${x}" y="${y}" font-family="Patrick,cursive" font-size="${size}" fill="${color}">${s}</text>`;
// Original, deliberately imperfect doodles of recognizable people, memes and things.
const illustratedTitles=['Elon Musk','Donald Trump','Tesla Cybertruck','A tree','Twin Towers · 9/11','dogwifhat','Pepe','Bitcoin','Pikachu','SpongeBob','Mario','Batman','Spider-Man','Homer Simpson','Bart Simpson','Shrek','Rick Sanchez','Among Us','Nyan Cat','Darth Vader','Hello Kitty','Wojak','To the moon','McDonald’s fries','Pac-Man','Rubber duck'];
const illustratedDrawings = [
 // Elon: swept hair, squint, X shirt, tiny rocket.
 line('M72 78l3-28 17-17 28-3 26 19 4 29-7 33-30 17-29-11-12-23ZM76 59l15-14 40 4 17 16M81 76l17-4m23 1 16 4M109 76l-5 17 11 1M95 107q15 10 28-2M90 124l-35 20-11 59h129l-10-60-34-19')+line('M96 150l30 35m0-35-30 35',RED,3)+line('M177 59l8-15 7 17-3 29-12-2ZM179 91l-6 11m14-10 3 11',INK,2)+text('to mars?',151,126,17,RED),
 // Donald: large swept hair, suit and long red tie.
 line('M69 85l5-29 19-17 35 1 24 21-3 34-16 30-35-2-23-19ZM73 69q12-38 50-29l22 15-36 2-20 13-19 2M85 85l13-5m25 0 15 6M108 88l-5 16 11 1M97 114l27-3M94 125l-33 16-20 69h137l-20-68-29-17M94 126l11 20-25 18-8-20m57-19-14 22 25 16 10-18')+line('M106 149l9-2 8 51-13 10-9-13Z',RED,3)+text('the hair survived',49,238,18),
 // Tesla Cybertruck: angular wedge and flat panels.
 line('M24 141l30-42 72-21 60 50 8 47-14 5H40l-19-11ZM54 100l12 35h120M65 101l61-20 46 43-105 10ZM25 143l165-11M39 150l18-3m108-1 18-2',INK,3)+circle(57,179,18)+circle(161,177,18)+circle(57,179,7,INK,2)+circle(161,177,7,INK,2)+line('M98 143v26m28-29v27',INK,2)+text('TESLA',85,61,21,RED)+line('M23 205h175',INK,2),
 // Tree: wobbly branches, scribbled canopy, a fallen leaf.
 line('M92 188l6-61-24-28m25 30 24-34m-17 94-1-44 21-21M86 190h31')+line('M71 119q-34 3-33-23-26-11-6-35-2-31 28-28 16-24 41-8 22-18 38 2 32-8 31 23 30 6 19 32 3 28-24 29-14 25-39 8-28 20-55 0Z',INK,3)+line('M49 74q12-10 24 0m51-25q13-6 21 7m-13 36-15 7',INK,2)+line('M164 173q-18-8-23 9 20 5 23-9Zm-10 4-9 5',RED,2)+text('touch grass',68,225,21),
 // Twin Towers: a non-graphic skyline remembrance.
 line('M52 189V50h45v139M117 190V44h45v146M60 51V37m79 7V22M27 190h166',INK,3)+line('M61 64v111m9-111v111m10-111v111m9-111v111M126 60v116m10-116v116m10-116v116m8-116v116M55 86h38m-38 26h38m-38 26h38m-38 27h38M120 81h38m-38 29h38m-38 27h38m-38 28h38',INK,1.5)+line('M33 188v-26h13m119 26v-21h18v21',INK,2)+text('09 / 11 / 2001',43,225,22)+line('M76 233h65',RED,2),
 // dogwifhat: Shiba face under an oversized knitted cap.
 line('M53 111l8-45 29 22m50-1 28-23 7 49M58 111q-4 65 50 77 57-4 56-79M61 85q0-57 50-52 50-6 51 54M55 86l110-3 5 27-118 4Z',INK,3)+line('M64 88l4 20m8-22 4 21m9-22 3 20m10-22 2 21m10-23 3 20m9-21 2 20m9-23 2 20m8-20 2 19',RED,2)+line('M75 131l11-5 9 5m34-2 10-5 10 6M95 147l24-1-10 12ZM107 159v11m-21-6q19 17 43-2M66 148l14 10m64-11-13 13',INK,3)+text('wif. hat.',82,225,23),
 // Pepe: huge eyelids, wide frog mouth, shirt.
 line('M48 126q-18-27 8-53 5-32 36-25 34-22 61 8 37 10 27 53l-1 34q-9 34-64 35-57-1-67-52ZM55 83q16-32 43-6l-1 20-42-3m48-19q30-33 59 0l3 20-61 3M58 122q42-17 99 1m-100 8q43 19 96 4M66 169l-22 23-2 32h143l-9-35-25-18',INK,3)+circle(79,82,4)+circle(131,82,4)+line('M77 176l20 18 31-1 23-20',INK,2)+text('feels human, man',37,242,18,RED),
 // Bitcoin: wonky coin with a recognizable B and double stems.
 circle(108,115,69)+circle(109,115,58,INK,2)+line('M87 78l38-1q28 13 0 32 33 8 4 37H86M92 79v68m-8-40h39M101 66v87m13-87v88',INK,4)+line('M63 57l-11-14m109 13 12-11m-63 153v15',RED,2)+text('magic internet money',23,233,18),
 // Pikachu: pointed ears, lightning tail, cheek circles.
 line('M76 76l-11-47 29 34m33 1 23-39-1 53M81 67q27-21 55 4l17 49-14 45-61 1-16-43ZM78 164l-8 34 27-1 9-21 8 21h27l-4-34M146 154l28-8-13-17 25-27-15-22 30-4-6 31-17 20 16 22-47 23')+circle(88,103,4)+circle(130,103,4)+line('M104 113l8 2-5 5m-12 8q11 9 25-2',INK,2)+circle(78,124,8,RED,2)+circle(139,124,8,RED,2)+text('pika?',91,233,22),
 // SpongeBob: uneven sponge box, teeth, shorts and thin legs.
 line('M51 48l114 3-3 110-115-3ZM48 158h116v25H48ZM66 183l-1 23-17 7m91-29 3 22 20 6M46 96l-16 33 17 6m116-38 16 32-18 9',INK,3)+circle(85,85,19,INK,3)+circle(126,85,19,INK,3)+circle(88,88,6)+circle(123,88,6)+line('M104 94l7 21-14 4M74 129q30 24 62-1M98 135v13h13v-13m-6 24-5 16 9 6 6-7-5-15',INK,2)+circle(63,66,5,INK,2)+circle(150,67,6,INK,2)+circle(65,143,4,INK,2)+text('I’m ready-ish',57,239,20,RED),
 // Mario: cap, M, moustache, round nose and overall straps.
 line('M63 86q-5-51 45-52 48-2 49 51M56 90q47-22 110-3M70 92l-6 24 8 29q33 35 72 1l12-31-10-21M80 160l-21 22-8 41h115l-7-39-18-21M81 167l7 41m43-41-4 41M85 189h47',INK,3)+circle(107,109,14)+line('M79 121q5-15 18 3 13-12 16 0 18-18 26-4-10 19-31 9-15 12-29-8Z',INK,3)+circle(89,98,3)+circle(127,96,3)+circle(108,62,16,RED,2)+line('M100 69V54l8 10 7-11v15',RED,2)+text('it’s-a me',75,243,19),
 // Batman: pointed cowl, cape and bat chest emblem.
 line('M76 88l1-47 22 25 23-1 22-26-2 58-18 30-28-3ZM80 92l19 3m23-3 15-4M99 111h24M90 127l-27 17-31 64 28-5 15 17 21-13 14 15 19-17 15 13 17-15 27 6-33-65-29-17M80 145l10 57m44-58-11 58')+line('M86 157l13 9 11-12 11 12 15-10-5 16-11-1-10 10-11-10-10 1Z',INK,2)+text('night shift',68,243,20),
 // Spider-Man: large mask eyes and a crude web lattice.
 line('M108 35q-43-3-47 43l9 51 34 20 36-23 12-47q-3-42-44-44ZM73 76l29 22-10 19-21-15Zm68-2-28 24 8 18 23-16ZM84 152l-35 32-7 39h139l-11-43-34-29',INK,3)+line('M108 38v106M66 75l79 46M147 68l-77 57M64 92q43-24 84 0M72 116q38-22 65-1M91 46l28 91m11-90-35 91',RED,1.5)+line('M107 167v32m-3-23-14-8m19 8 14-9m-20 17-14 8m20-8 13 10',INK,2)+text('friendly neighborhood',21,244,18),
 // Homer: bald dome, two hairs, bulging eyes and a muzzle.
 line('M64 102q-11-69 43-66 40 1 48 43l4 72-38 26-50-14-7-30M78 172l-31 27-3 26h136l-8-30-37-22',INK,3)+circle(93,91,20,INK,3)+circle(131,92,20,INK,3)+circle(98,91,3)+circle(126,92,3)+line('M108 110l-4 11 22 4q28 16-6 26l-28-2M94 47q9-21 22-6m-3 5q12-20 21 1M73 151l-11-10-7-3m30 39 17 16 12-12 16 9 6-16',INK,2)+text('d’oh.',87,243,23,RED),
 // Bart: tall jagged hair, big eyes and the overbite.
 line('M64 86l-1-49 13 12 7-23 14 23 8-26 13 26 13-25 8 27 15-18 2 63-8 45-28 28-34-10-17-32ZM85 158l-25 19-10 46h113l-10-45-28-20',INK,3)+circle(97,95,22,INK,3)+circle(134,93,20,INK,3)+circle(103,95,3)+circle(128,95,3)+line('M138 113l20 6-3 12-26-1M106 139q17 6 29-2',INK,2)+text('eat my shorts',54,242,20),
 // Shrek: round ogre, trumpet ears and rough vest.
 line('M75 78q3-45 41-40 43-2 42 41l-1 49-36 30-42-17-9-33M72 81l-25-12-1-20 15 1 7 21m91 7 19-10 7-22 13 6-9 26-27 14M87 160l-35 28-7 37h140l-13-41-32-24M91 162l11 58m33-58-8 58',INK,3)+line('M86 88l17-5m23-1 17 4M104 102l-7 16 24 3M95 138q25 13 43-5',INK,3)+text('my swamp.',64,244,21,RED),
 // Rick: spiky blue-free hair, sleepy eyes and lab coat.
 line('M73 90l-19-19 20-3-6-21 21 7 10-25 13 22 20-24 2 28 28-8-10 25 21 4-18 17M79 83l-7 49 30 27 35-22 11-54M91 165l-28 20-17 38h136l-14-38-33-21M92 166l-9 23 15 12m34-35 11 23-14 12',INK,3)+circle(93,102,13,INK,2)+circle(127,103,13,INK,2)+line('M82 99h22m10 0h25M109 109l-5 13h12M90 140l36-5',INK,2)+line('M117 143l2 16-9 4',RED,2)+text('20 seconds? burp.',36,244,19),
 // Among Us: capsule body, backpack and large visor.
 line('M71 164V83q0-43 39-43 42-2 42 47v78l-9 34h-24v-26H96v27H71ZM70 91H48v65h22M100 73q45-13 62 7v33q-43 18-65-4Z',INK,4)+line('M108 83l35-1',INK,2)+text('a little sus',69,232,23,RED),
 // Nyan Cat: cat in a toaster-pastry body, rainbow trail.
 line('M32 103l-16-3m14 15H8m26 13-20 3m24 9H7m30 15-19 4',RED,3)+line('M51 80l93 1v77l-90 2ZM137 91l2-27 20 16 18-14 8 31 9 17-9 35-43 4-16-31ZM58 157l-9 17 13 2 10-17m44 0 10 18 13-6-9-15M51 109l-14-15-11 4 18 23',INK,3)+circle(155,110,2)+circle(181,109,2)+line('M158 127q10 10 20-2M67 99l2 3m20-5 2 3m24-4 2 3m-49 24 2 3m21-8 2 3m25-2 2 3',INK,2)+text('nyan nyan nyan',46,225,22),
 // Darth Vader: dome, cheek vents, triangular respirator.
 line('M59 166l5-79q4-51 45-51 48 1 49 56l4 78-39-10-31 2ZM68 94l35 4-15 24-22-8Zm79-1-32 5 18 25 18-9ZM110 112l-23 41h47ZM59 171l-16 53h143l-24-53',INK,3)+line('M63 134l15 18m-13-23 18 16m59-17-18 17m22-10-16 15M102 137v13m8-17v17m8-13v13M89 189h41v28H89Zm9 10h7m9 0h6',INK,2)+text('your father?',58,246,20,RED),
 // Hello Kitty: ear corners, six whiskers, simple bow.
 line('M66 79l-7-37 30 15q22-8 44-1l28-15-4 40q18 18 11 51-8 28-61 28-56-1-60-33-4-33 19-48ZM85 163l-24 30-5 31h105l-4-33-26-28',INK,3)+circle(83,110,3)+circle(133,110,3)+circle(108,125,4,RED,2)+line('M50 104l-24-6m24 16H22m30 11-24 7m132-29 24-5m-21 18 25-1m-28 10 24 8',INK,2)+line('M127 67l-6-17 18 6 4-11 20 12-12 14-12-8-13 4Z',RED,3)+text('no mouth. still human.',24,244,19),
 // Wojak: long bald head, heavy eyelids, a resigned little mouth.
 line('M81 111q-15-78 27-78 37-3 38 55l-5 56-34 23-33-24-1-20M86 165l-28 23-15 37h135l-17-39-30-22',INK,3)+line('M82 86l19 2m15-2 21-1M84 94l17 4m14-2 17-3M109 94l-8 28 16-1M95 139l30-1M75 119l8 7m45-9 9 8',INK,2)+text('it is what it is',54,243,20),
 // Moon rocket: fins, porthole, sketchy flame and cratered moon.
 line('M96 163l-9-70 24-49 26 46-9 74ZM90 119l-25 40 29-6m39-33 22 40-26-6M100 166l-6 35 16-13 13 15-4-37',INK,3)+circle(112,101,12,RED,3)+circle(162,49,26,INK,2)+circle(168,40,6,INK,1.5)+circle(151,56,4,INK,1.5)+line('M44 78l3-9 5 9 8 2-8 4-4 8-3-9-8-3Z',RED,2)+text('wen moon?',67,239,23),
 // McDonald's fries: M carton, uneven fries sticking out.
 line('M54 110l112 2-13 90-79-3ZM68 109l-6-49 11-3 10 52m5 0-3-71 11 1 6 70m9 1 4-64 11 3-1 61m12 0 11-54 10 5-9 48M67 118l14 69 62 3 12-72',INK,3)+line('M91 165q0-39 14-31l6 30q-1-42 15-30l7 31',RED,4)+text('financial freedom',36,236,22),
 // Pac-Man: open pie mouth, dots and a little ghost.
 line('M112 86q-23-39-63-13-36 28-11 65 25 35 69 8l-39-28Z',INK,4)+circle(74,79,3)+circle(132,117,4)+circle(151,117,4)+line('M169 137V99q15-24 31-1v40l-9-7-7 8-8-8Z',RED,3)+circle(180,104,2)+circle(191,104,2)+text('nom nom nom',56,222,23),
 // Rubber duck: round body, beak, wing and curved tail.
 line('M76 115q-25-38 11-62 40-16 57 20l2 26 28 11-30 14q35 55-37 70-73 5-79-58l17 18 15-5 12-28ZM146 101l-24 7 23 15M76 147q40-18 46 19-19 18-40-2',INK,3)+circle(112,82,4)+line('M44 208q29-8 55 0t70-2M58 219q47-8 86 0',RED,2)+text('debugging buddy',43,245,20),
];

const suppliedSamples = [{"title": "alien", "asset": "images/alien.png"}, {"title": "bart", "asset": "images/bart.png"}, {"title": "blacky", "asset": "images/blacky.png"}, {"title": "bonnie blue", "asset": "images/bonnie_blue.png"}, {"title": "brokie", "asset": "images/brokie.png"}, {"title": "cumman", "asset": "images/cumman.png"}, {"title": "doge", "asset": "images/doge.png"}, {"title": "penis", "asset": "images/penis.png"}, {"title": "penistler", "asset": "images/penistler.png"}, {"title": "penny", "asset": "images/penny.png"}, {"title": "rat", "asset": "images/rat.png"}, {"title": "robot", "asset": "images/robot.png"}];
const communitySamples=[...illustratedTitles.map((title,i)=>({title,svg:illustratedDrawings[i]})),...suppliedSamples];
const drawingTitles=communitySamples.map(p=>p.title);
const drawings=communitySamples;
const winnerDrawings=[0,1,2,4,5,6,27,32,36,37].map(i=>communitySamples[i]);
const sketch=(index,archive=false)=>{const sample=(archive?winnerDrawings:communitySamples)[index%(archive?winnerDrawings.length:communitySamples.length)];return sample.asset?`<img src="${esc(sample.asset)}" alt="${esc(sample.title)} drawing" loading="eager">`:`<svg viewBox="0 0 220 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hand-drawn ${esc(sample.title)}">${sample.svg}</svg>`};
const votes=[24,19,16,13,11,9,7,6,5,4,3,9];
const sampleHumans=['91AF','4B21','83F2','21AC','7D08','A109','C420','B3F1','9EE2','38AA','106B','77C2','D21F','AAB9','321C','5F08','6D12','E8A3','B702','493E','1C8B','DA04','823F','F159','0AE7','C694'];
const sampleScores=[96.2,93.8,91.4,95.1,89.6,92.3,78.5,94.0,87.2,95.8,90.4,88.1,92.7,91.3,85.4,82.1,92.8,88.7,94.3,83.6,91.2,86.9,95.4,89.1,90.7,87.6];
const baseWall = round => drawings.map((_,i)=>({id:`S${round}-${i}`,human:`human_${sampleHumans[i]||(0x2200+i*47).toString(16).toUpperCase()}`,proof:`PROOF #${9281+i}`,title:drawingTitles[i],wallet:demoWallet(i),score:sampleScores[i]??(82+(i*73%160)/10),votes:votes[i]||0,art:i,created:i,round}));
const archiveData = winnerDrawings.map((_,i)=>({round:1841-i,prompt:`Draw ${winnerDrawings[i].title} from memory.`,title:winnerDrawings[i].title,wallet:demoWallet(i+40),human:`human_${['83F2','21AC','A109','4B21','91AF','7D08','C420','77C2','321C','B3F1'][i]}`,votes:[31,28,42,23,37,29,21,34,18,26][i],entries:[64,55,78,49,71,60,44,68,39,52][i],paid:[44,35,58,29,51,40,24,48,19,32][i],seed:1,prize:[3.20,2.75,3.90,2.45,3.55,3,2.20,3.40,1.95,2.60][i],art:i,archive:true}));
let state;
try { state = JSON.parse(localStorage.getItem(KEY)); } catch {}
if(!state || state.version!==1 || !Number.isInteger(state.round) || state.round<1842 || !Array.isArray(state.wall)) state={version:1,identity:`human_${uid().slice(0,4)}`,connected:false,freeUsed:false,history:[],votesCast:0,voteRounds:[],vote:null,round:1842,endsAt:Date.now()+300000,potCents:250,paidEntries:0,wall:baseWall(1842),completed:[]};
// Older or interrupted saves must not prevent the controls from initializing.
for(const key of ['history','completed','voteRounds'])if(!Array.isArray(state[key]))state[key]=[];
state.identity=typeof state.identity==='string'?state.identity:`human_${uid().slice(0,4)}`;
for(const [key,fallback] of Object.entries({endsAt:Date.now()+300000,potCents:250,paidEntries:0,votesCast:0,liveStep:0,nextLiveAt:Date.now()+8000}))if(!Number.isFinite(state[key]))state[key]=fallback;
state.wall=state.wall.filter(p=>p&&typeof p.id==='string'&&typeof p.human==='string'&&Number.isFinite(p.score)&&Number.isFinite(p.votes)&&(p.image||Number.isInteger(p.art)));
if(!state.wall.length)state.wall=baseWall(state.round);
// Preserve saved drawings and vote totals as the demo art catalog grows.
if(state.samplesRevision!==4){
 const catalog=baseWall(state.round),byId=new Map(catalog.map(p=>[p.id,p]));
 const kept=[],removed=[];
 for(const p of state.wall){
  if(!p.image&&!p.simulated&&!byId.has(p.id))removed.push(p);
  else kept.push(p);
 }
 for(const sample of catalog){const existing=kept.find(p=>p.id===sample.id);if(existing){existing.art=sample.art;existing.title=sample.title;}else kept.push({...sample,votes:0});}
 for(const p of removed){const index=Math.max(0,drawingTitles.indexOf(p.title));const replacement=kept.find(x=>x.id===catalog[index].id);replacement.votes+=p.votes;if(state.vote===p.id)state.vote=replacement.id;}
 for(const p of kept.filter(p=>p.simulated)){const index=drawingTitles.indexOf(p.title);p.art=index>=0?index:p.art%drawings.length;}
 state.wall=kept;state.samplesRevision=4;
}
for(const p of state.wall)if(!p.image){p.art%=drawings.length;p.title=drawingTitles[p.art];p.wallet??=demoWallet(p.art);}
if(!Array.isArray(state.imported))state.imported=[];
if(state.scheduleVersion!==1){
 const clock=schedule();state.round=clock.round;state.endsAt=clock.endsAt;state.wall=baseWall(clock.round);state.vote=null;state.potCents=250;state.paidEntries=0;state.liveStep=0;state.nextLiveAt=Date.now()+8000;state.scheduleVersion=1;
}else if(state.round===schedule().round)state.endsAt=schedule().endsAt;
state.payoutAddress??='';
state.proofDraft??='';
state.liveStep??=0;
state.nextLiveAt??=Date.now()+8000;
// A saved identity flag is never evidence of a live wallet connection.
state.connected=false;
let sort='top',archiveExpanded=false,showcaseExpanded=false,toastTimeout,phase='idle',tool='black',strokes=[],currentStroke=null,gesture=null,startedAt=0,proofDeadline=0,proofTimer,undoCount=0,clearCount=0,erases=0,trace=[],pauses=[],lastUp=0,submissionToken=0,drawingRound=state.round;
let storageWarningShown=false;
const persist = () => {try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{if(!storageWarningShown){storageWarningShown=true;toast('Browser storage is unavailable. Keep this page open to retain your proof.');}return false}};
// Public records always come from the shared service; retain personal drawings.
state.wall=[];state.completed=[];state.vote=null;state.potCents=250;state.paidEntries=0;
persist();
ProofLocalCommunity.configure({samples:baseWall,history:()=>state.history,identity:()=>state.identity,prompt:round=>prompts[(round-1842)%prompts.length]});
const canvas=$('canvas'),ctx=canvas.getContext('2d');
$('submission-name').value=state.proofDraft;
$('submission-wallet').value=state.payoutAddress;
for(const input of [$('submission-name'),$('submission-wallet')])input.addEventListener('input',()=>{state.proofDraft=$('submission-name').value;state.payoutAddress=$('submission-wallet').value.trim();input.removeAttribute('aria-invalid');persist();});
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').hidden=true,3400)}
function artOf(item){return item.image?`<img src="${esc(item.image)}" alt="Hand-drawn proof by ${esc(item.human)}">`:sketch(item.art,item.archive)}
function classification(score){return score<40?'SUSPICIOUS':score<70?'UNCERTAIN':score<90?'LIKELY HUMAN':'EXTREMELY HUMAN'}
function promptForRound(){return prompts[(state.round-1842)%prompts.length]}
function renderWall(){
 const focusedVote=document.activeElement?.dataset?.vote;
 const wall=[...state.wall].sort(sort==='top'?(a,b)=>b.votes-a.votes||b.created-a.created:(a,b)=>b.created-a.created);
 $('proof-grid').innerHTML=wall.length?wall.map((p,i)=>`<article class="proof-card ${state.vote===p.id?'voted':''}" style="--tilt:${[-.8,.6,-.4,.9][i%4]}deg" aria-label="${esc(p.title||'Your proof')} by ${esc(p.human)}">${p.example?'<span class="you-tag">EXAMPLE</span>':p.human===state.identity?'<span class="you-tag">YOU</span>':''}<div class="proof-art">${artOf(p)}</div><div class="proof-identity"><strong>${esc(p.title||'Your proof')}</strong><span>#${i+1}</span></div><span class="proof-id">${p.example?'SKETCHBOOK EXAMPLE':esc(p.human)+' · '+esc(p.proof)}</span>${p.wallet?`<span class="proof-wallet" title="${esc(p.wallet)}">${esc(shortWallet(p.wallet))}</span>`:''}<div class="proof-score"><span>HUMAN SIGNAL</span><span>${p.example?'EXAMPLE':p.score.toFixed(1)+'%'}</span></div><div class="proof-card-bottom"><span>${p.votes} votes</span><button class="vote-button" ${!community.ready||community.voting?'disabled':''} data-vote="${esc(p.id)}" aria-label="${state.vote===p.id?'Voted for':'Vote for'} ${esc(p.human)}" aria-pressed="${state.vote===p.id}">${state.vote===p.id?'VOTED':'Vote ↗'}</button></div></article>`).join(''):`<p class="shared-empty">${community.ready?'No drawings yet this round. Make the first mark.':community.error?'The shared wall is unavailable. You can still browse the example drawings below.':'The shared wall is loading. Browse the example drawings below.'}</p>`;
 $('proof-count').textContent=state.wall.length;$('humans').textContent=ProofCommunity.isLocal?state.wall.filter(p=>!p.example).length:new Set(state.wall.map(p=>p.human)).size;$('vote-count').textContent=state.wall.reduce((n,p)=>n+p.votes,0);$('wall-counter').textContent=`${state.wall.length} proofs of questionable artistic ability.`;
 if(focusedVote)document.querySelector(`[data-vote="${CSS.escape(focusedVote)}"]`)?.focus({preventScroll:true});
}
function renderRound(){ $('round-label').textContent=`ROUND #${state.round} · DRAWING OPEN`;$('pot').innerHTML=`${(state.potCents/100).toFixed(2)} <small>SOL</small>`;$('contributions').textContent=`+ ${(state.paidEntries*.05).toFixed(2)} SOL entries`;$('challenge-prompt').innerHTML=esc(promptForRound()).replace(' from ','<br>from ');$('entry-label').textContent='Free entry'; }
function renderShowcase(){
 const featured=[0,1,2,3,5,6,27,37];
 const indices=showcaseExpanded?communitySamples.map((_,i)=>i):featured;
 $('showcase-grid').innerHTML=indices.map((index,i)=>`<article class="proof-card showcase-card" style="--tilt:${[-.8,.6,-.4,.9][i%4]}deg"><button class="showcase-preview" data-showcase-index="${index}" aria-label="View ${esc(communitySamples[index].title)} example drawing"><span class="proof-art">${sketch(index)}</span><span class="proof-identity"><strong>${esc(communitySamples[index].title)}</strong><span aria-hidden="true">↗</span></span><span class="showcase-label">EXAMPLE DRAWING</span></button></article>`).join('');
 $('showcase-toggle').textContent=showcaseExpanded?'Fewer drawings ↑':`All ${communitySamples.length} drawings ↗`;
 $('showcase-toggle').setAttribute('aria-expanded',String(showcaseExpanded));
}
function showExample(index,archived=false){
 index=Number(index);const sample=(archived?winnerDrawings:communitySamples)[index];if(!sample)return;
 openModal(`<div class="modal-heading"><span class="eyebrow">${archived?'PAST HUMANS':'SKETCHBOOK'} · EXAMPLE DRAWING</span><h2>${esc(sample.title)}</h2></div><div class="showcase-art">${sketch(index,archived)}</div><p class="proof-publication">From the project’s example collection. Community votes and round results are shown separately.</p>`);
}
$('showcase-grid').addEventListener('click',e=>{const button=e.target.closest('[data-showcase-index]');if(button)showExample(button.dataset.showcaseIndex)});
$('showcase-toggle').addEventListener('click',()=>{showcaseExpanded=!showcaseExpanded;renderShowcase()});
function renderArchive(){
 const examples=!state.completed.length;
 const all=examples?archiveData:state.completed.slice(0,10);
 $('archive-list').innerHTML=(examples?'<p class="archive-example-note">Sketchbook examples. Completed community rounds will appear here as people submit drawings.</p>':'')+all.slice(0,archiveExpanded?10:3).map((r,i)=>`<button class="archive-row" ${examples?`data-archive-example="${i}"`:`data-round="${r.round}"`} aria-label="${examples?'View example drawing '+esc(r.title):'View round '+r.round+': '+esc(r.prompt)}"><span class="archive-art">${artOf(r)}</span><span class="archive-round">${examples?'EXAMPLE':'#'+r.round}</span><span class="archive-prompt">${esc(examples?r.title:r.prompt.replace(/^Draw /,''))}</span><span class="archive-winner">${examples?'From the sketchbook':r.local?'Browser-local round':esc(r.human)}</span><span class="archive-stats">${examples?'Example drawing':r.votes+' votes<br>'+r.entries+' proofs'}</span><span class="archive-prize">${examples?'View drawing':r.votes+' votes'} <small>${examples?'EXAMPLE ↗':'ROUND WINNER ↗'}</small></span></button>`).join('');
 $('archive-toggle').hidden=all.length<=3;
 $('archive-toggle').innerHTML=archiveExpanded?'Fewer drawings <span>↑</span>':`All ${all.length} ${examples?'examples':'rounds'} <span>↓</span>`;
}
async function voteFor(id){
 if(community.voting)return;
 if(!community.ready){toast('The shared wall is unavailable. Retry before voting.');return}
 if(!state.wall.some(p=>p.id===id)){toast('That drawing is not in the current round.');return}
 if(state.vote===id){toast('Already voted. Pick another drawing to move your vote.');return}
 const old=state.vote;community.voting=true;renderWall();
 try{const result=await ProofCommunity.vote(id,state.round);if(result.round===state.round)state.vote=result.vote;await syncCommunity();toast(old?'Changed your mind. Vote moved.':ProofCommunity.isLocal?'Your vote is saved on this device.':'Your vote is saved for everyone.')}catch(error){toast(error.message)}finally{community.voting=false;renderWall()}
}
$('proof-grid').addEventListener('click',e=>{const b=e.target.closest('[data-vote]');if(b)voteFor(b.dataset.vote)});
for(const order of ['top','new']) $('sort-'+order).addEventListener('click',()=>{sort=order;for(const o of ['top','new']){$('sort-'+o).classList.toggle('active',order===o);$('sort-'+o).setAttribute('aria-pressed',String(order===o))}renderWall()});
function openModal(html){$('modal-content').innerHTML=html;delete $('modal-content').dataset.proofId;if(!$('modal').open)$('modal').showModal()}
function closeModal(){$('modal').close();walletContinuation=null;}
$('close-modal').addEventListener('click',closeModal);
$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
function roundDetail(round){const r=state.completed.find(x=>x.round===Number(round));if(!r)return;openModal(`<div class="modal-heading"><span class="eyebrow">ROUND #${r.round} · CLOSED</span><h2>${esc(r.prompt)}</h2></div><div class="modal-art">${artOf(r)}</div><div class="modal-stats"><div><span>THE HUMAN</span><strong style="font-size:16px">${esc(r.human)}</strong></div><div><span>WINNING VOTES</span><strong>${r.votes}</strong></div><div><span>PROOFS</span><strong>${r.entries}</strong></div></div>${payoutDetails(r.wallet)}<h3>The other finalists.</h3><div class="finalists">${r.finalists.map(p=>`<div class="finalist">${artOf(p)}</div>`).join('')}</div><p class="small-print">${r.local?'Browser-local results, including example drawings.':'Shared community results.'} Ties go to the earliest accepted drawing. No SOL payouts are made.</p>`)}
$('archive-list').addEventListener('click',e=>{const example=e.target.closest('[data-archive-example]');if(example){showExample(example.dataset.archiveExample,true);return}const b=e.target.closest('[data-round]');if(b)roundDetail(b.dataset.round)});
$('archive-toggle').addEventListener('click',()=>{archiveExpanded=!archiveExpanded;renderArchive()});
$('profile-button').addEventListener('click',profile);
let walletProvider=null,walletAddress='',walletPending=false,walletContinuation=null,walletSubscriptions=[];
const walletName=()=>walletProvider?.name||'your wallet';
let balance={address:'',value:null,updatedAt:0,status:'idle'},balanceRequest=0,balanceController=null;
function renderBalance(){
 $('wallet-strip').hidden=!walletAddress;
 const value=balance.value===null?'— SOL':`${(balance.value/1e9).toLocaleString(undefined,{minimumFractionDigits:3,maximumFractionDigits:4})} SOL`;
 const status=balance.status==='loading'?'Reading balance…':balance.status==='error'?(balance.value===null?'Balance unavailable. Try refresh.':'Last reading · refresh unavailable.'):balance.updatedAt?'Updated '+new Date(balance.updatedAt).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'Connect to read your balance.';
 document.querySelectorAll('[data-wallet-balance]').forEach(el=>el.textContent=value);
 document.querySelectorAll('[data-balance-status]').forEach(el=>el.textContent=status);
 document.querySelectorAll('[data-refresh-balance]').forEach(el=>el.disabled=balance.status==='loading');
 if(walletAddress)$('wallet-explorer').href='https://explorer.solana.com/address/'+walletAddress;
}
async function refreshWalletBalance(force=false){
 if(!walletAddress||balance.status==='loading'&&!force)return;
 if(!force&&balance.address===walletAddress&&Date.now()-balance.updatedAt<PROOF_CONFIG.balanceRefreshMs)return;
 balanceController?.abort();const request=++balanceRequest,address=walletAddress;
 balance={...balance,address,status:'loading'};renderBalance();
 for(const endpoint of PROOF_CONFIG.rpcEndpoints){
  const controller=new AbortController();balanceController=controller;const timeout=setTimeout(()=>controller.abort(),7000);
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:request,method:'getBalance',params:[address,{commitment:'confirmed'}]}),signal:controller.signal});
   if(!response.ok)throw Error('Balance service unavailable');const data=await response.json();
   if(data.error||!Number.isFinite(data.result?.value)||data.result.value<0||!Number.isInteger(data.result.value))throw Error('Invalid balance response');
   if(request!==balanceRequest||address!==walletAddress)return;
   balance={address,value:data.result.value,updatedAt:Date.now(),status:'ready'};renderBalance();return;
  }catch{if(request!==balanceRequest||address!==walletAddress)return;}finally{clearTimeout(timeout);}
 }
 if(request===balanceRequest){balance.status='error';renderBalance();}
}
document.addEventListener('click',e=>{if(e.target.closest('[data-refresh-balance]'))refreshWalletBalance(true);});
setInterval(()=>{if(!document.hidden)refreshWalletBalance();},PROOF_CONFIG.balanceRefreshMs);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tickRound();refreshWalletBalance();}});
function renderWallet(){
 $('connect-button').innerHTML=walletAddress?`${esc(shortWallet(walletAddress))} <span>↗</span>`:'Connect wallet <span>↗</span>';
 $('connect-button').title=walletAddress?walletName()+' · '+walletAddress:'Choose a Solana wallet';
 $('wallet-help').textContent=walletAddress?'Filled from '+walletName()+'. You can choose another payout address.':'Paste your Solana address or connect a wallet to fill it in.';
 const address=$('connected-wallet-address');if(address)address.textContent=walletAddress;
 renderBalance();
}
function setWallet(publicKey){
 const address=publicKey?.toString();
 if(!address||!validSolanaAddress(address))throw new Error('The wallet did not provide a valid Solana address.');
 const changed=walletAddress!==address;
 walletAddress=address;state.connected=true;state.walletReconnect=true;state.walletName=walletName();state.payoutAddress=address;
 if(changed){balanceController?.abort();balanceRequest++;balance={address,value:null,updatedAt:0,status:'idle'};}
 $('submission-wallet').value=address;$('submission-wallet').removeAttribute('aria-invalid');
 persist();renderWallet();refreshWalletBalance();
}
function clearWallet(){balanceController?.abort();balanceRequest++;balance={address:'',value:null,updatedAt:0,status:'idle'};walletAddress='';state.connected=false;state.walletReconnect=false;persist();renderWallet();}
function getWalletProvider(id){
 const provider=id?ProofWallets.get().find(w=>w.id===id):walletProvider;
 if(!provider)return null;
 if(walletProvider!==provider){
  walletSubscriptions.forEach(off=>off?.());walletSubscriptions=[];walletProvider=provider;
  const current=()=>walletProvider===provider;
  walletSubscriptions.push(provider.on('connect',key=>{if(current())try{setWallet(key||provider.publicKey)}catch{clearWallet()}}));
  walletSubscriptions.push(provider.on('disconnect',()=>{if(!current())return;clearWallet();if($('disconnect'))closeModal();toast(provider.name+' disconnected.')}));
  walletSubscriptions.push(provider.on('accountChanged',key=>{if(!current())return;if(key){try{setWallet(key);toast(provider.name+' account updated.')}catch{clearWallet()}}else{clearWallet();if($('disconnect'))closeModal();toast('Account changed. Reconnect your wallet to continue.')}}));
 }
 return provider;
}
async function requestWalletConnection(id){
 if(walletPending)return;
 const provider=getWalletProvider(id);if(!provider){connect();return;}
 walletPending=true;
 document.querySelectorAll('[data-connect-wallet]').forEach(b=>{b.disabled=true;if(b.dataset.connectWallet===id)b.textContent='Approve in '+provider.name+'…'});
 if($('wallet-error'))$('wallet-error').textContent='';
 try{
  const response=await provider.connect();setWallet(response?.publicKey||provider.publicKey);
  const resume=walletContinuation;if($('wallet-picker'))closeModal();if(resume)resume();toast(provider.name+' connected. Payout address filled in.');
 }catch(error){
  const message=error?.code===4001?'Connection cancelled. You can try again.':error?.code===-32002?'A request is already open. Check your wallet.':'Could not connect. Unlock '+provider.name+' and try again.';
  clearWallet();
  if($('wallet-error'))$('wallet-error').textContent=message;toast(message);
 }finally{walletPending=false;renderWalletChoices();}
}
function renderWalletChoices(){
 const picker=$('wallet-picker');if(!picker)return;
 const wallets=ProofWallets.get();
 picker.innerHTML=wallets.length?wallets.map(w=>`<button class="wallet-choice" data-connect-wallet="${esc(w.id)}" ${walletPending?'disabled':''}><span>${esc(w.name)}</span><small>${walletPending&&w===walletProvider?'Awaiting approval…':'Detected · Connect ↗'}</small></button>`).join(''):'<p class="wallet-empty">No Solana wallet detected yet. Install a wallet, or open this site in your wallet app’s browser.</p>';
 picker.querySelectorAll('[data-connect-wallet]').forEach(b=>b.addEventListener('click',()=>requestWalletConnection(b.dataset.connectWallet)));
}
function connect(){
 if(state.connected&&walletAddress){
  openModal(`<div class="connect-state"><span class="eyebrow">${esc(walletName())} · CONNECTED</span><h3>Your wallet. Your mark.</h3><div class="wallet-reading"><span class="eyebrow">SOLANA MAINNET BALANCE</span><strong data-wallet-balance>— SOL</strong><small data-balance-status></small><button data-refresh-balance class="nav-button">↻ Refresh balance</button></div><div class="payout-details"><span class="eyebrow">CONNECTED SOLANA ADDRESS</span><code id="connected-wallet-address">${esc(walletAddress)}</code></div><p>Your payout address is filled in.<br>Connecting does not move funds.</p><button id="disconnect" class="outline">Disconnect wallet</button><p id="wallet-error" class="wallet-error" role="status"></p></div>`);
  renderBalance();refreshWalletBalance();
  $('disconnect').onclick=async()=>{const button=$('disconnect');button.disabled=true;try{await walletProvider.disconnect();clearWallet();if($('modal').open)closeModal();}catch(error){if($('wallet-error'))$('wallet-error').textContent=error.message||'Could not disconnect. Try again in your wallet.';if(button.isConnected)button.disabled=false;}};
  return;
 }
 const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent),canOpen=/^https?:$/.test(location.protocol);
 const browse=`https://phantom.com/ul/browse/${encodeURIComponent(location.href)}?ref=${encodeURIComponent(location.origin)}`;
 openModal(`<div class="connect-state"><span class="eyebrow">CONNECT A SOLANA WALLET</span><h3>Your wallet. Your choice.</h3><p>Choose your wallet below.<br>Your Solana address fills in automatically.</p><div id="wallet-picker" class="wallet-picker" aria-label="Available Solana wallets"></div><button id="retry-wallet" class="outline">Refresh wallet list ↻</button><p id="wallet-error" class="wallet-error" role="status"></p><div class="wallet-get"><span class="eyebrow">NEED A WALLET?</span><div><a href="https://phantom.com/download" target="_blank" rel="noopener noreferrer">Phantom ↗</a><a href="https://solflare.com" target="_blank" rel="noopener noreferrer">Solflare ↗</a><a href="https://backpack.app" target="_blank" rel="noopener noreferrer">Backpack ↗</a></div></div>${mobile&&canOpen?`<a class="outline wallet-mobile-link" href="${esc(browse)}">Open in Phantom ↗</a><p class="small-print">Using another mobile wallet? Open this URL in its app browser.</p>`:''}<span class="small-print">CONNECTION SHARES YOUR PUBLIC ADDRESS. NO PAYMENT OR SIGNATURE IS REQUESTED.</span></div>`);
 renderWalletChoices();
 $('retry-wallet').onclick=renderWalletChoices;
}
ProofWallets.onChange(()=>{renderWalletChoices();if(walletAddress&&!ProofWallets.get().includes(walletProvider)){clearWallet();toast('Wallet is no longer available. Reconnect to continue.')}restoreWallet();});
$('connect-button').addEventListener('click',connect);
renderWallet();
async function copyCA(){const value=$('contract-value').textContent;try{await navigator.clipboard.writeText(value);$('copy-ca').textContent='Copied ✓';setTimeout(()=>$('copy-ca').textContent='Copy ↗',1800);toast('Copied. Token launch coming soon.')}catch{openModal(`<h3>Token contract</h3><p>Select and copy:</p><input aria-label="Token contract" value="${esc(value)}" readonly style="width:100%;padding:12px;font-family:var(--mono)"><p class="small-print">Token launch coming soon.</p>`);$('modal-content').querySelector('input').select()}}
$('copy-ca').addEventListener('click',copyCA);
function resetDrawing(){strokes=[];currentStroke=null;gesture=null;undoCount=0;clearCount=0;erases=0;trace=[];pauses=[];lastUp=0;ctx.clearRect(0,0,800,520);$('accepted-stamp').hidden=true;$('analysis').hidden=true;$('canvas-overlay').hidden=true;}
function drawStroke(s){if(!s||!s.points.length)return;ctx.save();ctx.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=s.tool==='red'?RED:INK;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=s.tool==='eraser'?26:4;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);if(s.points.length===1){ctx.lineTo(s.points[0].x+.01,s.points[0].y+.01)}else s.points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();ctx.restore()}
function redraw(){ctx.clearRect(0,0,800,520);strokes.forEach(drawStroke);if(currentStroke)drawStroke(currentStroke)}
function point(e){const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(800,(e.clientX-r.left)*800/r.width)),y:Math.max(0,Math.min(520,(e.clientY-r.top)*520/r.height)),t:performance.now()-startedAt}}
function endStroke(e){if(!currentStroke)return;strokes.push(currentStroke);trace.push(currentStroke);currentStroke=null;lastUp=performance.now();gesture=null;if(e&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)}
canvas.addEventListener('pointerdown',e=>{if(phase!=='drawing'||performance.now()>=proofDeadline){if(phase==='idle')toast('Hit Start proof first. Your 20 seconds start when you do.');return}if(gesture!==null||e.button>0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);gesture=e.pointerId;if(lastUp)pauses.push(performance.now()-lastUp);currentStroke={tool,points:[point(e)]};if(tool==='eraser')erases++;redraw()});
canvas.addEventListener('pointermove',e=>{if(phase!=='drawing'||e.pointerId!==gesture||!currentStroke)return;if(performance.now()>=proofDeadline){finishDrawing();return}e.preventDefault();const samples=e.getCoalescedEvents?.();for(const p of samples?.length?samples:[e])currentStroke.points.push(point(p));redraw()});
canvas.addEventListener('pointerup',endStroke);canvas.addEventListener('pointercancel',endStroke);canvas.addEventListener('lostpointercapture',()=>{if(currentStroke)endStroke()});
for(const b of document.querySelectorAll('[data-tool]'))b.addEventListener('click',()=>{tool=b.dataset.tool;for(const t of document.querySelectorAll('[data-tool]')){t.classList.toggle('selected',t===b);t.setAttribute('aria-pressed',String(t===b))}});
$('undo').addEventListener('click',()=>{if(phase!=='drawing'){toast('Undo is available during your proof.');return}endStroke();if(strokes.length){strokes.pop();undoCount++;redraw()}else toast('Nothing to undo yet.')});
$('clear').addEventListener('click',()=>{if(phase!=='drawing'){toast('Start a new proof to get a fresh canvas.');return}endStroke();if(strokes.length){strokes=[];clearCount++;redraw()}});
async function startProof(){
 if(['drawing','analysis','publishing'].includes(phase))return;
 if(!community.ready){toast('Connect to the shared wall before starting. Use Retry connection.');return}
 beginDrawing();
}
function beginDrawing(){drawingRound=state.round;resetDrawing();phase='drawing';startedAt=performance.now();proofDeadline=startedAt+20000;canvas.classList.add('drawing');$('canvas-status').textContent='CAPTURING HUMAN INPUT';$('start-button').hidden=true;$('submit-button').hidden=false;$('submit-button').disabled=false;$('drawing-clock').textContent='00:20';$('draw-feedback').textContent='The clock is running. Make something only you would.';canvas.scrollIntoView({behavior:'instant',block:'center'});proofTimer=setInterval(()=>{const remaining=Math.max(0,Math.ceil((proofDeadline-performance.now())/1000));$('drawing-clock').textContent=`00:${String(remaining).padStart(2,'0')}`;if(remaining===0)finishDrawing()},100);}
function finishDrawing(){if(phase!=='drawing')return;endStroke();clearInterval(proofTimer);phase='finished';canvas.classList.remove('drawing');$('canvas-status').textContent='INPUT CAPTURED · TIME’S UP';$('drawing-clock').textContent='00:00';$('draw-feedback').textContent='Pencils down. Ready to analyze your proof.';if(!hasInk()){$('submit-button').hidden=true;$('start-button').hidden=false;$('start-button').textContent='Try again →';$('draw-feedback').textContent='Your canvas is blank. Try again — your entry was not used.';phase='idle'}}
function hasInk(){const pixels=ctx.getImageData(0,0,800,520).data;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>30)return true;return false}
function analyzeBehavior(){const raw=trace.filter(s=>s.tool!=='eraser');let distance=0,directions=0;const speeds=[];const durations=[];for(const s of raw){durations.push(s.points.at(-1).t-s.points[0].t);let angle=null;for(let i=1;i<s.points.length;i++){const a=s.points[i-1],b=s.points[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);distance+=d;const dt=b.t-a.t;if(dt>0&&d>0)speeds.push(d/dt);if(d>1){const next=Math.atan2(dy,dx);if(angle!==null&&Math.abs(Math.atan2(Math.sin(next-angle),Math.cos(next-angle)))>.4)directions++;angle=next}}}const avg=speeds.reduce((a,b)=>a+b,0)/Math.max(1,speeds.length);const variance=speeds.reduce((s,v)=>s+(v-avg)**2,0)/Math.max(1,speeds.length);const variation=avg?Math.sqrt(variance)/avg:0;const elapsed=Math.min(20,(performance.now()-startedAt)/1000);const corrections=undoCount+clearCount+erases;const score=Math.min(98.8,Math.max(8,28+Math.min(distance/100,23)+Math.min(raw.length*3,15)+Math.min(elapsed,12)+Math.min(variation*9,9)+Math.min(directions/3,8)+Math.min(corrections*1.5,4)));return {duration:Number(elapsed.toFixed(2)),strokes:raw.length,distance:Math.round(distance),pauses:pauses.map(n=>Math.round(n)),undos:undoCount,clears:clearCount,eraser:erases,directionChanges:directions,velocityVariation:Number(variation.toFixed(3)),score:Number(score.toFixed(1))};}
async function submitProof(){if(!['drawing','finished'].includes(phase))return;
 const title=$('submission-name').value.trim(),wallet=$('submission-wallet').value.trim();
 if(!title){$('submission-name').setAttribute('aria-invalid','true');$('draw-feedback').textContent='Give your proof a name before submitting.';$('submission-name').focus();return;}
 if(!validSolanaAddress(wallet)){$('submission-wallet').setAttribute('aria-invalid','true');$('draw-feedback').textContent='Enter a valid Solana payout address.';$('submission-wallet').focus();return;}
 if(phase==='drawing'&&performance.now()>=proofDeadline)finishDrawing();endStroke();if(!hasInk()){toast('Make at least one mark before you submit.');return}
 clearInterval(proofTimer);const metrics=analyzeBehavior();phase='analysis';canvas.classList.remove('drawing');$('submit-button').disabled=true;$('canvas-status').textContent='ANALYZING HUMAN SIGNAL';const image=canvas.toDataURL('image/png');const token=++submissionToken,round=drawingRound;const free=!state.freeUsed;const submissionId=crypto.randomUUID(),id=`PROOF-${submissionId}`;
 const lines=[['CAPTURING INPUT',`${metrics.strokes} STROKES`],['STROKE CONTINUITY',`${metrics.distance} PX`],['TIMING VARIANCE',metrics.pauses.length?`${metrics.pauses.length} PAUSES`:'CONTINUOUS'],['POINTER VELOCITY',metrics.velocityVariation>.3?'VARIED':'STEADY'],['CORRECTIONS',`${metrics.undos} UNDO · ${metrics.eraser} ERASE · ${metrics.clears} CLEAR`],['DIRECTION CHANGES',String(metrics.directionChanges)],['GENERATING PROOF','DONE']];
 $('analysis').hidden=false;$('analysis').innerHTML='<div><span class="eyebrow">HUMANITY ANALYZER / EXPERIMENTAL</span><div class="analysis-lines" id="analysis-lines"></div></div><div class="analysis-score"><span class="eyebrow">READING YOUR SCRIBBLES…</span><strong id="analysis-value">—</strong><span id="analysis-class">A LITTLE PATIENCE, HUMAN.</span><small id="analysis-id"></small></div><p class="small-print">Measured input behavior. The score is a playful heuristic, not proof of biological identity.</p>';$('draw-feedback').textContent='Reading the shaky lines, pauses and changes of mind…';
 for(const [name,value] of lines){await delay(220);if(token!==submissionToken)return;$('analysis-lines').insertAdjacentHTML('beforeend',`<div><span>${name}</span><span>${value}</span></div>`)}
 const proof={id,submissionId,publication:'pending',human:state.identity,title,wallet,proof:id,score:metrics.score,votes:0,image,created:Date.now(),round,metrics,prompt:prompts[(round-1842)%prompts.length],free};
 state.freeUsed=true;state.history.push(proof);persist();updateLatestProof();
 $('analysis-value').textContent=metrics.score.toFixed(1);$('analysis-class').textContent=classification(metrics.score);$('analysis-id').textContent=id;
 phase='publishing';$('draw-feedback').textContent=ProofCommunity.isLocal?'Adding to your browser-local wall…':'Saved on this device. Adding to the shared wall…';
 let published=false;
 try{await publishSharedProof(proof);published=true}catch(error){$('draw-feedback').textContent=error.message+' Open your proof to retry adding it to the wall.';toast('Drawing saved on this device. Open your proof to retry adding it to the wall.');}
 phase='submitted';$('canvas-status').textContent=published?(ProofCommunity.isLocal?'LOCAL PROOF ACCEPTED':'SHARED PROOF ACCEPTED'):'DRAWING SAVED ON THIS DEVICE';$('accepted-stamp').hidden=!published;
 if(published){$('draw-feedback').textContent=ProofCommunity.isLocal?'Proof accepted. Your drawing is saved on this device and added to your wall.':'Proof accepted. Everyone can see your drawing on the wall.';toast('Proof accepted. Open your proof to sign or download it.');}
 $('submit-button').hidden=true;$('start-button').hidden=false;$('start-button').innerHTML='Make another proof <span>↗</span>';renderRound();renderWall();

}
$('start-button').addEventListener('click',startProof);$('submit-button').addEventListener('click',submitProof);
function restoreDrawControls(){clearInterval(proofTimer);phase='idle';canvas.classList.remove('drawing');$('start-button').hidden=false;$('start-button').innerHTML='Start proof <span>→</span>';$('submit-button').hidden=true;$('canvas-status').textContent='WAITING FOR A HUMAN';$('drawing-clock').textContent='00:20';$('canvas-overlay').hidden=false;$('draw-feedback').textContent='A new round. A new chance to be human.';}
function tickRound(){
 const clock=schedule();
 const left=Math.max(0,Math.ceil((state.endsAt-(Date.now()+serverTimeOffset))/1000));$('round-timer').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
 if(community.ready&&state.round!==clock.round){community.ready=false;renderWall();syncCommunity()}
}
let activity=[];
function renderActivity(){$('activity-feed').innerHTML=activity.length?activity.map(a=>`<div><span>${esc(new Date(a.time).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}))}</span><span>${esc(a.message)}</span></div>`).join(''):'<p>No community activity yet.</p>'}
function addActivity(){/* Public activity comes from the server. */}
function renderCommunityStatus(){
 const status=$('community-status');status.textContent=community.error|| (community.ready?(ProofCommunity.isLocal?'Browser-local wall · drawings and votes are saved on this device.':'Shared wall · drawings and votes update automatically.'):'Loading drawings…');status.classList.toggle('shared-error',!!community.error);$('retry-community').hidden=!community.error;
}
async function syncCommunity(){
 if(community.loading)return;community.loading=true;
 try{
  const requestStarted=Date.now(),data=await ProofCommunity.read();serverTimeOffset=data.serverNow-(requestStarted+Date.now())/2;
  if(data.round!==state.round){if(phase==='drawing')finishDrawing();if(!['analysis','publishing','finished'].includes(phase))restoreDrawControls();}
  state.round=data.round;state.endsAt=data.endsAt;state.identity=data.identity;state.wall=data.wall;state.vote=data.vote;state.votesCast=data.votesCast;state.completed=data.completed;activity=data.activity;
  community.ready=true;community.error='';persist();renderRound();renderWall();renderArchive();renderActivity();tickRound();
 }catch(error){community.error=error.message||'The shared wall is unavailable. Retry connection.';community.ready=false;renderWall()}finally{community.loading=false;renderCommunityStatus()}
}
async function publishSharedProof(proof){
 if(proof.publication==='published')return;
 const {proof:shared}=await ProofCommunity.submit(proof);proof.publication='published';proof.shared=!ProofCommunity.isLocal;proof.local=ProofCommunity.isLocal;
 if(!proof.bundle?.signature){proof.created=shared.created;proof.human=shared.human;delete proof.bundle;}
 persist();await syncCommunity();
}
$('retry-community').addEventListener('click',syncCommunity);
setInterval(()=>{if(!document.hidden)syncCommunity()},5000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncCommunity()});
function restoreLastProof(){const last=state.history.at(-1);if(!last)return;const img=new Image();img.onload=()=>{if(phase!=='idle')return;ctx.drawImage(img,0,0,800,520);$('canvas-overlay').hidden=true;$('accepted-stamp').hidden=false;$('canvas-status').textContent='YOUR LAST ACCEPTED PROOF';$('start-button').innerHTML='Make another proof <span>↗</span>';};img.src=last.image;}
$('humans-label').textContent=ProofCommunity.isLocal?'YOUR PROOFS':'HUMANS';$('proof-count-label').textContent=ProofCommunity.isLocal?'WALL DRAWINGS':'PROOFS';$('wall-disclosure').textContent=ProofCommunity.isLocal?'Example drawings and browser-local votes. SOL amounts and payouts are illustrative.':'Community drawings and votes are live. SOL amounts and payouts are illustrative.';
renderRound();renderWall();renderShowcase();renderArchive();renderActivity();restoreLastProof();renderCommunityStatus();syncCommunity();setInterval(tickRound,500);
// Reconnect only a wallet previously approved by the user, without opening a prompt.
let restoringWallet=false;
async function restoreWallet(){
 if(walletPending||walletAddress||restoringWallet||!state.walletReconnect)return;
 const saved=ProofWallets.get().find(w=>w.name===state.walletName||(!state.walletName&&w.name==='Phantom'));
 if(!saved)return;
 restoringWallet=true;
 try{const response=await saved.connect({onlyIfTrusted:true});if(!walletPending&&!walletAddress&&response?.publicKey){getWalletProvider(saved.id);setWallet(response.publicKey)}}catch{}finally{restoringWallet=false;}
}
restoreWallet();
// Structured access exposes voting and navigation, never synthetic canvas input.
if(document.modelContext?.registerTool){const lifecycle=new AbortController();const tools=[{name:'read_proof_round',description:'Read the current shared challenge and community proof summaries.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({round:state.round,prompt:promptForRound(),potSOL:state.potCents/100,shared:!ProofCommunity.isLocal,proofs:state.wall.map(p=>({id:p.id,human:p.human,votes:p.votes,score:p.score}))})},{name:'vote_for_proof',description:'Save or move this browser session’s vote in the shared round.',inputSchema:{type:'object',properties:{proofId:{type:'string'}},required:['proofId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{if(!input||typeof input.proofId!=='string')throw new Error('proofId must be a string');await voteFor(input.proofId);return {votedFor:state.vote,round:state.round}}},{name:'open_proof_archive_round',description:'Open a completed round’s drawing, prize and finalists.',inputSchema:{type:'object',properties:{round:{type:'integer'}},required:['round'],additionalProperties:false},annotations:{readOnlyHint:true},execute:input=>{if(!Number.isInteger(input?.round)||!state.completed.some(r=>r.round===input.round))throw new Error('Unknown completed round');roundDetail(input.round);return {openedRound:input.round}}}];for(const t of tools){try{Promise.resolve(document.modelContext.registerTool(t,{signal:lifecycle.signal})).catch(()=>{})}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}

// Personal collections are portable files. Importing never adds a shared vote or entry.
const verifiedProofs=new WeakMap();
let signingProof=false,importingProof=false;
function collectionProofs(){return [...state.history,...state.imported];}
function proofById(id){return collectionProofs().find(p=>p.id===id);}
function proofLabel(proof){const verified=verifiedProofs.get(proof);return verified==='signed'?'WALLET SIGNATURE VERIFIED':verified==='invalid'?'VERIFICATION FAILED':proof.bundle?.signature?'CHECKING SIGNATURE…':'UNSIGNED DRAWING';}
function updateLatestProof(){const latest=state.history.at(-1);$('latest-proof').hidden=!latest;if(latest)$('latest-proof').dataset.openProof=latest.id;}
function profile(){
 const wins=state.completed.filter(r=>r.human===state.identity),last=state.history.at(-1),proofs=collectionProofs();
 openModal(`<div class="modal-heading"><span class="eyebrow">YOUR PROOF COLLECTION</span><h2>You were here.</h2></div><div class="collection-controls"><button data-import-proof class="outline">Import / verify ↗</button><button id="backup-collection" class="outline" ${proofs.length?'':'disabled'}>Back up collection ↓</button></div><div class="modal-stats"><div><span>MY DRAWINGS</span><strong>${state.history.length}</strong></div><div><span>IMPORTED</span><strong>${state.imported.length}</strong></div><div><span>HUMAN SIGNAL</span><strong>${last?last.score.toFixed(1):'—'}</strong></div><div><span>VOTES CAST</span><strong>${state.votesCast}</strong></div><div><span>ROUND WINS</span><strong>${wins.length}</strong></div></div>${proofs.length?`<div class="history collection-history">${[...proofs].sort((a,b)=>b.created-a.created).map(p=>`<article><img src="${p.image}" alt="${esc(p.title)} drawing"><p>${esc(p.title)}</p><small>ROUND #${p.round} ${p.imported?'· IMPORTED':''}</small><small>${esc(shortWallet(p.wallet))}</small><span class="signature-label ${verifiedProofs.get(p)==='signed'?'signed':''}" data-proof-status="${esc(p.id)}">${proofLabel(p)}</span><button class="outline" data-open-proof="${esc(p.id)}">Open proof ↗</button></article>`).join('')}</div>`:'<div class="empty-profile">A blank canvas is waiting. You can also import a proof file to verify it.<a class="ink-button" href="#draw" id="profile-start">Make your first proof ↗</a></div>'}<p class="small-print">Signatures confirm the signing wallet approved a drawing and its metadata. Human scores are experimental. Back up your collection to keep it across browsers.</p>`);
 $('profile-start')?.addEventListener('click',closeModal);
 $('backup-collection').onclick=()=>runProofAction($('backup-collection'),()=>ProofKit.downloadCollection(collectionProofs()));
}
function openProof(id){
 const p=proofById(id);if(!p)return;
 const signature=p.bundle?.signature;
 openModal(`<div class="modal-heading"><span class="eyebrow">${esc(p.id)} · ROUND #${p.round}</span><h2>${esc(p.title)}</h2></div><div class="portable-art"><img src="${p.image}" alt="${esc(p.title)} drawing"></div><p class="proof-publication">${p.publication==='published'?(p.local?'Added to your browser-local wall.':'Added to the shared local wall.'):p.publication==='pending'?'Saved on this device. Not yet added to the shared local wall.':'Personal collection drawing.'}</p><span id="detail-proof-status" class="signature-label ${verifiedProofs.get(p)==='signed'?'signed':''}">${proofLabel(p)}</span><div class="proof-detail-stats"><span>${p.score.toFixed(1)} HUMAN SIGNAL</span><span>${new Date(p.created).toLocaleString()}</span></div>${payoutDetails(p.wallet)}${signature?`<div class="payout-details"><span class="eyebrow">SIGNING WALLET</span><code>${esc(p.bundle.payload.signer)}</code></div>`:''}<div class="payout-details"><span class="eyebrow">DRAWING FINGERPRINT · SHA-256</span><code id="detail-proof-hash">Reading drawing…</code></div><div class="proof-file-actions">${p.publication==='pending'?'<button id="retry-publish-proof" class="outline">Retry adding to wall ↗</button>':''}${!signature?`<button id="sign-proof" class="ink-button" ${signingProof?'disabled':''}>Sign with wallet ↗</button>`:''}<button id="download-proof" class="outline">Download proof ↓</button><button id="download-drawing" class="outline">Drawing PNG ↓</button><button id="share-card" class="outline">Share card PNG ↓</button><button id="verify-proof" class="outline">Verify again ↗</button></div><p id="proof-action-status" class="proof-action-status" role="status"></p><p class="small-print">Wallet signing is a free message approval. It does not send SOL. Downloaded proof files carry the drawing and metadata together; anyone can import them here to check the fingerprint and signature.</p>`);
 $('modal-content').dataset.proofId=p.id;
 $('sign-proof')?.addEventListener('click',()=>signSavedProof(p));
 $('retry-publish-proof')?.addEventListener('click',()=>runProofAction($('retry-publish-proof'),async()=>{await publishSharedProof(p);openProof(p.id);toast('Your drawing is now on the shared wall.')}));
 $('download-proof').onclick=()=>runProofAction($('download-proof'),()=>ProofKit.downloadProof(p));
 $('download-drawing').onclick=()=>runProofAction($('download-drawing'),()=>ProofKit.downloadDrawing(p));
 $('share-card').onclick=()=>runProofAction($('share-card'),()=>ProofKit.shareCard(p));
 $('verify-proof').onclick=()=>runProofAction($('verify-proof'),async()=>{const result=await verifySavedProof(p);if($('proof-action-status'))$('proof-action-status').textContent=result.signed?'Wallet signature and drawing fingerprint verified.':'Drawing fingerprint checked. This proof has no wallet signature.';});
 verifySavedProof(p).catch(error=>{if($('proof-action-status'))$('proof-action-status').textContent=error.message;});
}
async function verifySavedProof(proof){
 try{
  const bundle=await ProofKit.bundleFor(proof);if(!sameDrawingRecord(proof,ProofKit.recordFor(bundle)))throw Error('Saved drawing or metadata does not match its proof file.');
  const result=await ProofKit.verify(bundle);verifiedProofs.set(proof,result.signed?'signed':'unsigned');
  document.querySelectorAll('[data-proof-status]').forEach(el=>{if(el.dataset.proofStatus===proof.id){el.textContent=proofLabel(proof);el.classList.toggle('signed',result.signed);}});
  if($('detail-proof-hash')&&$('modal-content').dataset.proofId===proof.id){$('detail-proof-hash').textContent=result.hash;$('detail-proof-status').textContent=proofLabel(proof);$('detail-proof-status').classList.toggle('signed',result.signed);}
  return result;
 }catch(error){verifiedProofs.set(proof,'invalid');document.querySelectorAll('[data-proof-status]').forEach(el=>{if(el.dataset.proofStatus===proof.id){el.textContent='VERIFICATION FAILED';el.classList.remove('signed');}});if($('detail-proof-status')&&$('modal-content').dataset.proofId===proof.id){$('detail-proof-status').textContent='VERIFICATION FAILED';$('detail-proof-status').classList.remove('signed');}throw error;}
}
async function runProofAction(button,action){
 if(button.disabled)return;button.disabled=true;
 if($('proof-action-status'))$('proof-action-status').textContent='';
 try{await action();}catch(error){if($('proof-action-status'))$('proof-action-status').textContent=error.message;toast(error.message||'Could not complete this action.');}finally{if(button.isConnected)button.disabled=false;}
}
async function signSavedProof(proof){
 if(signingProof)return;
 if(!walletAddress||!state.connected){walletContinuation=()=>openProof(proof.id);connect();toast('Connect a Solana wallet to sign your saved drawing.');return;}
 const button=$('sign-proof'),address=walletAddress;
 signingProof=true;button.disabled=true;button.textContent='Approve message in '+walletName()+'…';
 try{
  const bundle=await ProofKit.sign(proof,walletProvider,address);
  if(walletAddress!==address||!state.connected)throw Error('Wallet changed. Reconnect and sign again.');
  proof.bundle=bundle;verifiedProofs.set(proof,'signed');
  for(const copy of [...state.wall,...state.completed.flatMap(r=>r.allEntries||[])])if(copy.id===proof.id)copy.bundle=bundle;
  persist();signingProof=false;openProof(proof.id);toast('Wallet signature verified. Your proof is ready to travel.');
 }catch(error){const message=error?.code===4001?'Signature cancelled. Your drawing is saved and unsigned.':error?.message||'Could not sign. Try again in your wallet.';if($('proof-action-status'))$('proof-action-status').textContent=message;toast(message);}
 finally{signingProof=false;if(button.isConnected){button.disabled=false;button.textContent='Sign with wallet ↗';}}
}
function sameDrawingRecord(a,b){const keys=['id','title','human','round','created','prompt','wallet','image','score'];return ProofKit.canonical(keys.map(k=>a[k]??null))===ProofKit.canonical(keys.map(k=>b[k]??null))&&ProofKit.canonical(ProofKit.metricData({...a.metrics,score:a.score}))===ProofKit.canonical(ProofKit.metricData({...b.metrics,score:b.score}));}
async function importProofFile(file){
 if(importingProof)return;importingProof=true;const feedback=$('collection-import-status');
 if(feedback)feedback.textContent='Checking drawing fingerprints and signatures…';
 try{
  const proofs=await ProofKit.parseFile(file),existing=new Map(collectionProofs().map(p=>[p.id,p])),added=[],upgrades=[];
  for(const proof of proofs){const duplicate=existing.get(proof.id);if(duplicate){if(!sameDrawingRecord(duplicate,proof))throw Error('A proof with this ID already exists with different content.');if(proof.verification==='signed'&&!duplicate.bundle?.signature)upgrades.push([duplicate,proof.bundle]);}else{existing.set(proof.id,proof);added.push(proof);}}
  if(existing.size>ProofKit.MAX_COLLECTION)throw Error('Your collection can hold up to 100 proofs.');
  // Apply only after the entire file passes; an invalid batch never partially imports.
  for(const [proof,bundle] of upgrades){proof.bundle=bundle;verifiedProofs.set(proof,'signed');}
  for(const proof of added){verifiedProofs.set(proof,proof.verification);delete proof.verification;state.imported.push(proof);}
  persist();profile();
  const signed=proofs.filter(p=>p.bundle.signature).length;
  const message=`${added.length} proof${added.length===1?'':'s'} imported · ${signed} wallet signature${signed===1?'':'s'} verified.${!added.length&&!upgrades.length?' Already in your collection.':''}`;
  const status=document.createElement('p');status.id='collection-import-status';status.className='proof-action-status';status.setAttribute('role','status');status.textContent=message;$('modal-content').prepend(status);toast(message);
 }catch(error){profile();const status=document.createElement('p');status.id='collection-import-status';status.className='wallet-error';status.setAttribute('role','status');status.textContent=error.message;$('modal-content').prepend(status);toast(error.message);}
 finally{importingProof=false;$('proof-file').value='';}
}
function initCollection(){
 updateLatestProof();
 $('collection-button').addEventListener('click',profile);
 document.addEventListener('click',e=>{const importer=e.target.closest('[data-import-proof]');if(importer){if(!importingProof)$('proof-file').click();return;}const open=e.target.closest('[data-open-proof]');if(open){openProof(open.dataset.openProof);$('modal-content').dataset.proofId=open.dataset.openProof;}});
 $('proof-file').addEventListener('change',()=>{const file=$('proof-file').files[0];if(file)importProofFile(file);});
 for(const proof of collectionProofs())if(proof.bundle)verifySavedProof(proof).catch(()=>{});
}
initCollection();
