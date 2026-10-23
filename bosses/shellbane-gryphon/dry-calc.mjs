import {DRY_ITEMS,validateKills} from "./simulator.mjs";
import { validateDropCount as checkCount, distributionOdds as odds, binomial } from "../../shared/distributions.mjs";

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
