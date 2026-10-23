import {DRY_ITEMS,validateKills,rateOf} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.min(1,Math.max(0,x));
function odds(d,count){
 let fewer=0,exact=0;
 for(let i=0;i<d.values.length;i++){
  const n=d.from+i;if(n<count)fewer+=d.values[i];else if(n===count)exact+=d.values[i];
 }
 return {count,expected:d.expected,fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received counts must be an object.");
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  if(!Number.isSafeInteger(count)||count<0||count>kills)
   throw new RangeError(item.name+" count must be a whole number from 0 to kills.");
  // Unique-table entries are mutually exclusive; pet cannot coexist with a shard.
  const p=item.id==="muphin"?rateOf(item.id)*.99:rateOf(item.id);
  result[item.id]={...odds(binomial(kills,p),count),atLeastOne:-Math.expm1(kills*Math.log1p(-p))};
 }
 return result;
}
