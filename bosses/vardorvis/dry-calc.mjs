import {DRY_ITEMS,validateKills,vestigeHitRate,rateOf} from "./simulator.mjs";
import { validateDropCount as validateCount, distributionOdds as stats, binomial } from "../../shared/distributions.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));

// Ultor vestiges are awarded on every THIRD independent vestige-table hit.
// An individual kill has a 3/1088 normal (9/1088 awakened) hit probability.
// This is floor(Binomial(kills,p)/3), NOT Binomial(kills,1/1088).
export function vestigeOdds(kills,count,awakened=false){
 validateKills(kills);
 if(typeof awakened!=="boolean")throw new TypeError("Awakened must be a boolean.");
 validateCount(count,Math.floor(kills/3),"Ultor vestige");
 const distribution=binomial(kills,vestigeHitRate(awakened));
 let fewer=0,exact=0,expected=0,noVestige=0;
 for(let i=0;i<distribution.values.length;i++){
  const hits=distribution.from+i,vestiges=Math.floor(hits/3),mass=distribution.values[i];
  expected+=vestiges*mass;
  if(vestiges<count)fewer+=mass;
  else if(vestiges===count)exact+=mass;
  if(hits<3)noVestige+=mass;
 }
 return {count,expected,fewer:clamp(fewer),exact:clamp(exact),
  more:clamp(1-fewer-exact),atLeastOne:clamp(1-noVestige)};
}
export function calculateDry(kills,received={},awakened=false){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received counts must be an object.");
 if(typeof awakened!=="boolean")throw new TypeError("Awakened must be a boolean.");
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  if(item.id==="ultor-vestige"){
   result[item.id]=vestigeOdds(kills,count,awakened);continue;
  }
  validateCount(count,kills,item.name);
  const rate=rateOf(item.id,awakened);
  result[item.id]={
   ...stats(binomial(kills,rate),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-rate))
  };
 }
 return result;
}
