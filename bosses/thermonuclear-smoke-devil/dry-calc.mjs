import {DRY_ITEMS,PRE_RATE,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=n=>Math.max(0,Math.min(1,n));
function countCheck(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number between 0 and "+max+".");
}
function stats(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  else if(n===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
function convolution(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  const p=a.values[i];if(!p)continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=p*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
// One pre-roll can succeed per kill, but jar and pet independently coexist.
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drop counts must be an object.");
 const results={};let total=0,primaryTotal=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  countCheck(count,kills,item.name);
  total+=count;
  if(["occult-necklace","smoke-battlestaff","dragon-chainbody"].includes(item.id))
   primaryTotal+=count;
  const dist=binomial(kills,item.rate);
  results[item.id]={...stats(dist,count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))};
 }
 countCheck(primaryTotal,kills,"Combined primary pre-roll uniques");
 countCheck(total,3*kills,"Combined chase rewards");
 const primary=binomial(kills,PRE_RATE);
 results.anyPrimary={...stats(primary,primaryTotal),
  atLeastOne:-Math.expm1(kills*Math.log1p(-PRE_RATE))};
 const jar=binomial(kills,1/2000),pet=binomial(kills,1/3000);
 const combined=convolution(convolution(primary,jar),pet);
 results.anyUnique={...stats(combined,total),
  atLeastOne:-Math.expm1(kills*(
   Math.log1p(-PRE_RATE)+Math.log1p(-1/2000)+Math.log1p(-1/3000)
  ))};
 return results;
}
