import {DRY_ITEMS,rateOf,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));
function valid(n,max,name){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(name+" count must be a whole number from 0 to "+max+".");
}
function odds(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  else if(n===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  valid(count,kills,item.name);
  const p=rateOf(item.id);
  results[item.id]={...odds(binomial(kills,p),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-p))};
 }
 return results;
}
