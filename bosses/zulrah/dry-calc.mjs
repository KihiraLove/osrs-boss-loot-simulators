import {UNIQUE,MAX_KILLS,validateKills} from "./simulator.mjs";

// Stable truncated binomial distribution, supporting both main rolls for up
// to 1,000,000 kills (2,000,000 independent trials).
function binomial(n,p){
 if(!Number.isSafeInteger(n)||n<0||n>2*MAX_KILLS||p<0||p>1)
  throw new RangeError("Invalid number of trials or probability.");
 if(n===0||p===0)return {from:0,values:Float64Array.of(1),expected:0};
 if(p===1)return {from:n,values:Float64Array.of(1),expected:n};
 const mean=n*p,radius=Math.ceil(10*Math.sqrt(n*p*(1-p))+15);
 const from=Math.max(0,Math.floor(mean-radius));
 const to=Math.min(n,Math.ceil(mean+radius));
 const mode=Math.min(to,Math.max(from,Math.floor((n+1)*p)));
 const values=new Float64Array(to-from+1);
 values[mode-from]=1;
 for(let k=mode-1;k>=from;k--)
  values[k-from]=values[k+1-from]*(k+1)/(n-k)*(1-p)/p;
 for(let k=mode+1;k<=to;k++)
  values[k-from]=values[k-1-from]*(n-k+1)/k*p/(1-p);
 let total=0;
 for(const v of values)total+=v;
 for(let k=0;k<values.length;k++)values[k]/=total;
 return {from,values,expected:mean};
}
const clamp=x=>Math.max(0,Math.min(1,x));
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of UNIQUE){
  const count=received[item.id]??0;
  const trials=kills*item.rolls;
  if(!Number.isSafeInteger(count)||count<0||count>trials)
   throw new RangeError(item.name+" received must be a whole number between 0 and "+trials+".");
  const dist=binomial(trials,item.p);
  let fewer=0,exact=0;
  for(let k=0;k<dist.values.length;k++){
   const n=dist.from+k;
   if(n<count)fewer+=dist.values[k];
   else if(n===count)exact=dist.values[k];
  }
  results[item.id]={count,expected:dist.expected,
   fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact),
   atLeastOne:-Math.expm1(trials*Math.log1p(-item.p))};
 }
 return results;
}
