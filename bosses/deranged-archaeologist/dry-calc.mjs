import {DRY_ITEMS,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
function summarize(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const k=dist.from+i;
  if(k<count)fewer+=dist.values[i];
  else if(k===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Drop counts must be an object.");
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  if(!Number.isSafeInteger(count)||count<0||count>kills)
   throw new RangeError(item.name+" received must be between 0 and the kill count.");
  result[item.id]={
   ...summarize(binomial(kills,item.rate),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))
  };
 }
 // Deranged Archaeologist has exactly one unique.
 result.anyUnique=result["steel-ring"];
 return result;
}
