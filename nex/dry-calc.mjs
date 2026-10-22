import {UNIQUE,UNIQUE_RATE,exposureOf,validateShards} from "./simulator.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
// Stable central Poisson distribution. Truncate beyond ~12 standard
// deviations (plus 25 outcomes), then normalize to avoid underflow.
function poisson(mean){
 if(mean===0)return {from:0,values:Float64Array.of(1)};
 const radius=Math.ceil(12*Math.sqrt(mean)+25);
 const from=Math.max(0,Math.floor(mean-radius)),to=Math.ceil(mean+radius);
 const mode=Math.max(from,Math.min(to,Math.floor(mean)));
 const values=new Float64Array(to-from+1);
 values[mode-from]=1;
 for(let i=mode-1;i>=from;i--)
  values[i-from]=values[i+1-from]*(i+1)/mean;
 for(let i=mode+1;i<=to;i++)
  values[i-from]=values[i-1-from]*mean/i;
 let mass=0;for(const v of values)mass+=v;
 for(let i=0;i<values.length;i++)values[i]/=mass;
 return {from,values};
}
function distributionResult(mean,count){
 const dist=poisson(mean);
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  else if(n===count)exact=dist.values[i];
 }
 return {count,expected:mean,fewer:clamp(fewer),exact:clamp(exact),
  more:clamp(1-fewer-exact),atLeastOne:-Math.expm1(-mean)};
}
export function calculateDry(shards,received={}){
 validateShards(shards);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received rare drop counts must be an object.");
 const exposure=exposureOf(shards),results={shards,exposure};
 let totalReceived=0;
 for(const item of UNIQUE){
  const n=received[item.id]??0;
  if(!Number.isSafeInteger(n)||n<0||n>1_000_000)
   throw new RangeError(item.name+" received must be a whole number between 0 and 1,000,000.");
  results[item.id]=distributionResult(exposure*item.rate,n);
  if(item.weight>0)totalReceived+=n;
 }
 results.anyUnique=distributionResult(exposure*UNIQUE_RATE,totalReceived);
 return results;
}
