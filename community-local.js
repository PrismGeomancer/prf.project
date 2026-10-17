// Static-hosting wall: examples, personal drawings and one browser-local vote per round.
(()=>{
 const key='proof-pages-wall-v1';let data={votes:{},activity:[]},context;
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&saved.votes&&typeof saved.votes==='object'&&!Array.isArray(saved.votes)){data={votes:saved.votes,activity:Array.isArray(saved.activity)?saved.activity.slice(0,4):[]}}}catch{}
 function save(next){try{localStorage.setItem(key,JSON.stringify(next))}catch{throw Error('Browser storage is unavailable. Allow site storage to save votes on this device.')}data=next}
 function clock(){return ProofKit.roundAt()}
 function ownProofs(round){return context.history().filter(p=>p&&p.round===round&&typeof p.id==='string'&&typeof p.image==='string'&&p.image.startsWith('data:image/png;base64,')&&Number.isFinite(p.score))}
 function wallFor(round){const vote=data.votes[String(round)];return [...context.samples(round).map(p=>({...p,example:true,wallet:'',votes:0})),...ownProofs(round).map(p=>({...p,local:true,votes:0}))].map(p=>({...p,votes:p.id===vote?1:0}))}
 function configure(value){context=value}
 async function read(){
  if(!context)throw Error('Local wall is not initialized.');const active=clock(),wall=wallFor(active.round);
  const rounds=[...new Set([...context.history().map(p=>p.round),...Object.keys(data.votes).map(Number)])].filter(r=>Number.isInteger(r)&&r<active.round).sort((a,b)=>b-a).slice(0,10);
  const completed=rounds.map(round=>{const entries=wallFor(round),sorted=[...entries].sort((a,b)=>b.votes-a.votes||a.created-b.created||a.id.localeCompare(b.id)),winner=sorted[0];return winner?{...winner,round,prompt:context.prompt(round),entries:entries.length,finalists:sorted.slice(1,5),local:true}:null}).filter(Boolean);
  return {...active,serverNow:Date.now(),identity:context.identity(),wall,vote:wall.some(p=>p.id===data.votes[String(active.round)])?data.votes[String(active.round)]:null,votesCast:Object.keys(data.votes).length,completed,activity:data.activity,local:true};
 }
 async function vote(proofId,round){if(round!==clock().round)throw Error('This round has closed. Vote in the new round.');const proof=wallFor(round).find(p=>p.id===proofId);if(!proof)throw Error('Choose a drawing on the current wall.');save({votes:{...data.votes,[round]:proofId},activity:[{time:new Date().toISOString(),message:'You voted for '+proof.title},...data.activity].slice(0,4)});return {vote:proofId,round}}
 async function submit(proof){const existing=ownProofs(proof.round).find(p=>p.id===proof.id&&p.local);if(!existing&&proof.round!==clock().round)throw Error('This round has closed. Your drawing is saved in My collection.');if(!existing)save({votes:{...data.votes},activity:[{time:new Date().toISOString(),message:'You submitted '+proof.title},...data.activity].slice(0,4)});return {proof:{...proof,local:true,shared:false}}}
 window.ProofLocalCommunity=Object.freeze({configure,read,vote,submit,isLocal:true});
})();
