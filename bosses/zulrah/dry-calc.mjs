import { binomial } from "../../shared/distributions.mjs";
import { UNIQUE, validateKills } from "./simulator.mjs";

// Stable truncated binomial distribution, supporting both main rolls for up
// to 1,000,000 kills (2,000,000 independent trials).

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
