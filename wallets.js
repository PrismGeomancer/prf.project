// Browser-only Solana adapters: Wallet Standard discovery plus legacy providers.
(()=>{
 const registered=new Map(),legacy=new Map(),listeners=new Set();let nextId=0;
 const changed=()=>listeners.forEach(fn=>fn());
 const accountFor=wallet=>wallet.accounts.find(a=>a.chains?.includes('solana:mainnet'));
 function standard(wallet){
  const features=wallet.features;
  return {
   id:`standard-${++nextId}`,name:wallet.name,
   get publicKey(){return accountFor(wallet)?.address||null},
   get isConnected(){return !!this.publicKey},
   async connect(options={}){await features['standard:connect'].connect({silent:!!options.onlyIfTrusted});return {publicKey:this.publicKey}},
   async disconnect(){if(!features['standard:disconnect'])throw Error('Disconnect this site in your wallet settings.');await features['standard:disconnect'].disconnect()},
   on(event,fn){return features['standard:events'].on('change',properties=>{if(!('accounts' in properties))return;const key=this.publicKey;if(event==='accountChanged')fn(key)})},
   async signMessage(message){
    const account=accountFor(wallet);
    if(!account||!account.features?.includes('solana:signMessage')||!features['solana:signMessage'])throw Error('This wallet account does not support message signatures.');
    const [result]=await features['solana:signMessage'].signMessage({account,message});
    if(!result||result.signedMessage?.length!==message.length||!message.every((byte,i)=>byte===result.signedMessage[i]))throw Error('The wallet changed the signing message.');
    if(result.signatureType&&result.signatureType!=='ed25519')throw Error('Unsupported signature type.');
    if(this.publicKey!==account.address)throw Error('Wallet changed during signing. Try again.');
    return {signature:result.signature,publicKey:account.address};
   }
  };
 }
 const api=Object.freeze({register(...wallets){
  const added=[];
  for(const wallet of wallets){
   if(registered.has(wallet)||!wallet?.chains?.includes('solana:mainnet')||typeof wallet.name!=='string'||typeof wallet.features?.['standard:connect']?.connect!=='function'||typeof wallet.features?.['standard:events']?.on!=='function')continue;
   registered.set(wallet,standard(wallet));added.push(wallet);
  }
  if(added.length)changed();
  return ()=>{added.forEach(wallet=>registered.delete(wallet));changed()};
 }});
 window.addEventListener('wallet-standard:register-wallet',event=>{if(typeof event.detail==='function')event.detail(api)});
 window.dispatchEvent(new CustomEvent('wallet-standard:app-ready',{detail:api}));
 function get(){
  const wallets=[...registered.values()];
  const candidates=[['Phantom',window.phantom?.solana||(window.solana?.isPhantom?window.solana:null)],['Solflare',window.solflare],['Backpack',window.backpack?.solana||window.backpack],['Solana wallet',window.solana]];
  const seen=new Set();
  for(const [name,provider] of candidates){
   if(!provider||seen.has(provider)||typeof provider.connect!=='function'||typeof provider.disconnect!=='function')continue;
   seen.add(provider);
   if(wallets.some(w=>w.name.toLowerCase()===name.toLowerCase())||(name==='Solana wallet'&&wallets.some(w=>w.name.toLowerCase()===(provider.isPhantom?'phantom':provider.isSolflare?'solflare':provider.isBackpack?'backpack':''))))continue;
   if(!legacy.has(provider))legacy.set(provider,{
    id:`injected-${++nextId}`,name,
    get publicKey(){return provider.publicKey},get isConnected(){return provider.isConnected},
    connect:options=>provider.connect(options),disconnect:()=>provider.disconnect(),
    on(event,fn){provider.on?.(event,fn);return ()=>provider.removeListener?.(event,fn)},
    async signMessage(message){if(typeof provider.signMessage!=='function')throw Error('This wallet does not support message signatures.');const result=await provider.signMessage(message,'utf8');return result instanceof Uint8Array?{signature:result,publicKey:provider.publicKey}:result}
   });
   wallets.push(legacy.get(provider));
  }
  return wallets;
 }
 window.ProofWallets=Object.freeze({get,onChange(fn){listeners.add(fn);return ()=>listeners.delete(fn)}});
})();
