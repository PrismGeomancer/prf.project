// Static settings. All visitors must use the same round epoch and duration.
window.PROOF_CONFIG=Object.freeze({
  communityMode:'local', // GitHub Pages: browser-local drawings and votes; no API required.
  roundEpoch:'2026-10-07T00:00:00Z',
  roundDurationMs:300000,
  baseRound:1842,
  rpcEndpoints:['https://solana-rpc.publicnode.com','https://api.mainnet.solana.com'],
  balanceRefreshMs:30000
});
