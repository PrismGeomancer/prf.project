(()=>{
 if(window.PROOF_CONFIG.communityMode!=='shared'){window.ProofCommunity=window.ProofLocalCommunity;return}
 let initialized=false,sessionPromise=null;
 async function request(path,options={},retry=true){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch('/api/'+path,{credentials:'same-origin',cache:'no-store',...options,signal:controller.signal});let data;try{data=await response.json()}catch{throw Error('The shared wall is unavailable. Please try again.')}
   if(response.status===401&&retry){initialized=false;await session();return request(path,options,false)}
   if(!response.ok)throw Error(data.error||'The shared wall is unavailable. Please try again.');return data;
  }catch(error){if(error.name==='AbortError')throw Error('The shared wall took too long to respond. Your drawing is saved; try again.');throw error}finally{clearTimeout(timeout)}
 }
 async function session(){if(initialized)return;if(sessionPromise)return sessionPromise;sessionPromise=request('session',{method:'POST'},false).then(()=>{initialized=true}).finally(()=>{sessionPromise=null});return sessionPromise}
 const post=(path,data)=>request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 window.ProofCommunity=Object.freeze({isLocal:false,async read(){await session();return request('round')},async submit(proof){await session();return post('submissions',{id:proof.submissionId,round:proof.round,title:proof.title,wallet:proof.wallet,metrics:proof.metrics,image:proof.image})},async vote(proofId,round){await session();return post('votes',{proofId,round})}});
})();
