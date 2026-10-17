/* Portable proof files: SHA-256 drawing fingerprints and Ed25519 signatures.
   TweetNaCl 1.0.3 is bundled locally; no remote script or backend is needed. */
window.ProofKit=(()=>{
 'use strict';
 const config=window.PROOF_CONFIG,alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
 const MAX_DRAWING=2*1024*1024,MAX_FILE=20*1024*1024,MAX_COLLECTION=100;
 const encoder=new TextEncoder();
 function roundAt(time=Date.now()){
  const epoch=Date.parse(config.roundEpoch),index=Math.max(0,Math.floor((time-epoch)/config.roundDurationMs));
  return {round:config.baseRound+index,startsAt:epoch+index*config.roundDurationMs,endsAt:epoch+(index+1)*config.roundDurationMs};
 }
 function base58Decode(value){
  if(typeof value!=='string'||value.length>100)throw Error('Invalid address or signature.');
  let number=0n;for(const character of value){const digit=alphabet.indexOf(character);if(digit<0)throw Error('Invalid Base58 value.');number=number*58n+BigInt(digit);}
  const bytes=[];while(number){bytes.unshift(Number(number%256n));number/=256n;}
  for(const character of value){if(character!=='1')break;bytes.unshift(0);}
  return Uint8Array.from(bytes);
 }
 function base64Encode(bytes){let s='';for(const byte of bytes)s+=String.fromCharCode(byte);return btoa(s);}
 function base64Decode(s){if(typeof s!=='string'||s.length>MAX_DRAWING*2||!s.length||s.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(s))throw Error('Invalid encoded drawing or signature.');try{return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}catch{throw Error('Invalid encoded data.');}}
 function pngBytes(image){
  if(typeof image!=='string'||!image.startsWith('data:image/png;base64,'))throw Error('The proof must contain a PNG drawing.');
  const bytes=base64Decode(image.slice(22));
  if(bytes.length>MAX_DRAWING||bytes.length<33||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))throw Error('Invalid or oversized PNG drawing.');
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if(view.getUint32(16)!==800||view.getUint32(20)!==520)throw Error('Proof drawings must be 800 × 520 pixels.');
  return bytes;
 }
 function canonical(value){
  if(value===null||typeof value==='boolean'||typeof value==='string')return JSON.stringify(value);
  if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  throw Error('Invalid proof metadata.');
 }
 async function drawingHash(image){
  if(!crypto.subtle)throw Error('Open PROOF over HTTPS or localhost to fingerprint drawings.');
  const hash=await crypto.subtle.digest('SHA-256',pngBytes(image));
  return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 }
 function metricData(metrics={}){
  const result={};for(const name of ['duration','strokes','distance','undos','clears','eraser','directionChanges','velocityVariation','score'])result[name]=Number.isFinite(metrics[name])?metrics[name]:0;
  result.pauses=Array.isArray(metrics.pauses)?metrics.pauses.filter(n=>Number.isFinite(n)&&n>=0).slice(0,1000):[];
  return result;
 }
 async function bundleFor(proof,signer='',signedAt=null){
  if(proof.bundle&&!signer)return proof.bundle;
  const createdAt=new Date(proof.created).toISOString();
  const payload={id:proof.id,title:proof.title,human:proof.human,round:proof.round,prompt:proof.prompt||'',createdAt,payoutAddress:proof.wallet,signer,signedAt,origin:location.origin==='null'?'file://':location.origin,drawingHash:await drawingHash(proof.image),width:800,height:520,metrics:metricData({...proof.metrics,score:proof.score})};
  return {format:'proof-v1',payload,drawing:proof.image,signature:null};
 }
 function messageFor(payload){
  return 'PROOF drawing attestation v1\nThis signature records my approval of this drawing and its metadata.\nIt does not authorize a payment or prove unique human identity.\n\n'+canonical(payload);
 }
 function checkPayload(payload){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))throw Error('Missing proof metadata.');
  const strings={id:100,title:40,human:100,prompt:300,payoutAddress:44,signer:44,origin:300,drawingHash:64,createdAt:40};
  for(const [key,length] of Object.entries(strings))if(typeof payload[key]!=='string'||payload[key].length>length)throw Error('Invalid '+key+' in proof.');
  if(!payload.id||!payload.title.trim()||!Number.isSafeInteger(payload.round)||payload.round<1||payload.width!==800||payload.height!==520||!Number.isFinite(Date.parse(payload.createdAt))||!/^[a-f0-9]{64}$/.test(payload.drawingHash))throw Error('Invalid proof metadata.');
  if(base58Decode(payload.payoutAddress).length!==32)throw Error('Invalid payout address.');
  if(payload.signer&&base58Decode(payload.signer).length!==32)throw Error('Invalid signing wallet.');
  if(payload.signedAt!==null&&(typeof payload.signedAt!=='string'||!Number.isFinite(Date.parse(payload.signedAt))))throw Error('Invalid signature date.');
  const metrics=payload.metrics;if(!metrics||typeof metrics!=='object'||Array.isArray(metrics)||canonical(metricData(metrics))!==canonical(metrics)||metrics.score<0||metrics.score>100||metrics.pauses.some(n=>n<0))throw Error('Invalid drawing metrics.');
  // Fixed fields avoid hiding unsigned metadata next to an authenticated payload.
  const expected=[...Object.keys(strings),'signedAt','round','width','height','metrics'].sort();
  if(JSON.stringify(Object.keys(payload).sort())!==JSON.stringify(expected))throw Error('Unexpected proof metadata.');
 }
 async function verify(bundle){
  if(!bundle||bundle.format!=='proof-v1')throw Error('This is not a PROOF file.');
  checkPayload(bundle.payload);
  const fingerprint=await drawingHash(bundle.drawing);
  if(fingerprint!==bundle.payload.drawingHash)throw Error('Drawing fingerprint mismatch. The file was changed.');
  if(bundle.signature===null){if(bundle.payload.signer||bundle.payload.signedAt!==null)throw Error('Missing wallet signature.');return {signed:false,hash:fingerprint};}
  if(!bundle.signature||bundle.signature.algorithm!=='Ed25519'||!bundle.payload.signer||!bundle.payload.signedAt)throw Error('Invalid signature details.');
  const signature=base64Decode(bundle.signature.value),key=base58Decode(bundle.payload.signer);
  if(signature.length!==64||!window.nacl?.sign.detached.verify(encoder.encode(messageFor(bundle.payload)),signature,key))throw Error('Wallet signature is invalid. The file or metadata was changed.');
  return {signed:true,hash:fingerprint};
 }
 async function sign(proof,provider,address){
  if(typeof provider?.signMessage!=='function')throw Error('This wallet does not support message signatures.');
  const bundle=await bundleFor(proof,address,new Date().toISOString());
  const response=await provider.signMessage(encoder.encode(messageFor(bundle.payload)),'utf8');
  if(response.publicKey&&response.publicKey.toString()!==address)throw Error('Wallet changed during signing. Try again.');
  const signature=response.signature;if(!(signature instanceof Uint8Array)||signature.length!==64)throw Error('Wallet returned an invalid signature.');
  bundle.signature={algorithm:'Ed25519',value:base64Encode(signature)};
  await verify(bundle);return bundle;
 }
 async function validateDrawing(image){
  pngBytes(image);const img=new Image();img.src=image;try{await img.decode();}catch{throw Error('The PNG drawing could not be opened.');}
  if(img.naturalWidth!==800||img.naturalHeight!==520)throw Error('Invalid drawing dimensions.');
 }
 function fromBundle(bundle){const p=bundle.payload;return {id:p.id,title:p.title,human:p.human,wallet:p.payoutAddress,proof:p.id,score:p.metrics.score,metrics:p.metrics,image:bundle.drawing,created:Date.parse(p.createdAt),round:p.round,prompt:p.prompt,votes:0,bundle,imported:true};}
 async function parseFile(file){
  if(!file||file.size>MAX_FILE)throw Error('Choose a PROOF file under 20 MB.');
  let data;try{data=JSON.parse(await file.text());}catch{throw Error('Could not read this JSON proof file.');}
  const bundles=data.format==='proof-collection-v1'?data.proofs:[data];
  if(!Array.isArray(bundles)||!bundles.length||bundles.length>MAX_COLLECTION)throw Error('A collection must contain 1–100 proofs.');
  const proofs=[];for(const bundle of bundles){const result=await verify(bundle);await validateDrawing(bundle.drawing);proofs.push({...fromBundle(bundle),verification:result.signed?'signed':'unsigned'});}
  return proofs;
 }
 function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
 function filename(proof,suffix){return 'proof-'+String(proof.id).replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)+suffix;}
 async function downloadProof(proof){const bundle=await bundleFor(proof);await verify(bundle);download(new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}),filename(proof,'.json'));}
 async function downloadDrawing(proof){download(new Blob([pngBytes(proof.image)],{type:'image/png'}),filename(proof,'.png'));}
 async function downloadCollection(proofs){
  if(!proofs.length)throw Error('Make or import a proof first.');
  const bundles=[];for(const proof of proofs){const bundle=await bundleFor(proof);await verify(bundle);bundles.push(bundle);}
  const blob=new Blob([JSON.stringify({format:'proof-collection-v1',exportedAt:new Date().toISOString(),proofs:bundles},null,2)],{type:'application/json'});
  if(blob.size>MAX_FILE||bundles.length>MAX_COLLECTION)throw Error('This collection is too large. Download proofs individually.');
  download(blob,'proof-collection-'+new Date().toISOString().slice(0,10)+'.json');
 }
 async function shareCard(proof){
  const bundle=await bundleFor(proof),result=await verify(bundle);
  await document.fonts.ready;const image=new Image();image.src=proof.image;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1000;const c=canvas.getContext('2d');
  c.fillStyle='#f4f0e8';c.fillRect(0,0,1200,1000);c.strokeStyle='#d6d1c6';c.lineWidth=1;
  for(let x=0;x<1200;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,1000);c.stroke();}for(let y=0;y<1000;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(1200,y);c.stroke();}
  c.fillStyle='#191916';c.font='bold 66px Caveat, cursive';c.fillText('PROOF.',60,90);c.font='20px Mono, monospace';c.textAlign='right';c.fillText('ROUND #'+proof.round,1140,80);c.textAlign='left';
  c.font='bold 55px Caveat, cursive';const title=proof.title;let size=55;while(c.measureText(title).width>1050&&size>26)c.font='bold '+(--size)+'px Caveat, cursive';c.fillText(title,60,170);
  c.fillStyle='#fffefa';c.fillRect(60,200,1080,600);c.strokeStyle='#191916';c.lineWidth=3;c.strokeRect(60,200,1080,600);c.drawImage(image,140,205,920,598);
  c.fillStyle='#d94132';c.font='bold 36px Caveat, cursive';c.fillText(result.signed?'WALLET SIGNED. IMPERFECTLY DRAWN.':'ONE DRAWING. ONE HUMAN SIGNAL.',60,860);
  c.fillStyle='#191916';c.font='16px Mono, monospace';c.fillText('PAYOUT '+proof.wallet,60,905);c.fillText(proof.id+' · '+proof.score.toFixed(1)+' HUMAN SIGNAL',60,940);
  c.fillStyle='#77736b';c.font='13px Mono, monospace';c.fillText('SHA256 '+result.hash.slice(0,32)+'…',60,973);
  if(result.signed){c.textAlign='right';c.fillText('SIGNED '+bundle.payload.signer.slice(0,4)+'…'+bundle.payload.signer.slice(-4),1140,973);}
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Could not create the share card.');download(blob,filename(proof,'-share.png'));
 }
 return {roundAt,canonical,drawingHash,messageFor,bundleFor,verify,sign,parseFile,downloadProof,downloadDrawing,downloadCollection,shareCard,recordFor:fromBundle,metricData,MAX_COLLECTION};
})();
