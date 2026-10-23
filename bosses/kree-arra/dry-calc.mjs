import { binomial, convolveDistributions as convolution } from "../../shared/distributions.mjs";
import { UNIQUE, validateKills } from "./simulator.mjs";
// The four sources are independent, not a binomial with averaged rates:
// total item count = Binomial(kills, boss rate) + Binomial(3*kills, bodyguard rate).
const clamp=x=>Math.max(0,Math.min(1,x));

export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of UNIQUE){
  const count=received[item.id]??0;
  const max=kills*(item.minion?4:1);
  if(!Number.isSafeInteger(count)||count<0||count>max)
   throw new RangeError(item.name+" must be a whole number between 0 and "+max+".");
  const dist=convolution(binomial(kills,item.boss),binomial(3*kills,item.minion));
  let fewer=0,exact=0;
  for(let i=0;i<dist.values.length;i++){
   const value=dist.from+i;
   if(value<count)fewer+=dist.values[i];
   else if(value===count)exact=dist.values[i];
  }
  results[item.id]={count,expected:dist.expected,
   fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact),
   atLeastOne:-Math.expm1(kills*(Math.log1p(-item.boss)+3*Math.log1p(-item.minion)))};
 }
 return results;
}
