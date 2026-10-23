import {DRY_ITEMS,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));
function checkCount(n,max,name){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(name+" received must be a whole number between 0 and "+max+".");
}
function odds(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const value=dist.from+i;
  if(value<count)fewer+=dist.values[i];
  else if(value===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function anyUniqueChance(kills){
 validateKills(kills);
 // Belle, jar, and pet are independent per kill; overlapping uniques
 // can occur on one kill, so this is the chance of at least one hit.
 const one=DRY_ITEMS.reduce((p,item)=>p*(1-item.rate),1);
 return -Math.expm1(kills*Math.log(one));
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drop counts must be an object.");
 const result={};
 for(const item of DRY_ITEMS){
  const n=received[item.id]??0;
  checkCount(n,kills,item.name);
  result[item.id]={...odds(binomial(kills,item.rate),n),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))};
 }
 result.anyUniqueChance=anyUniqueChance(kills);
 return result;
}
