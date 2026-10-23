import {DRY_ITEMS,rateOf,validateKills} from "./simulator.mjs";
import { validateDropCount as countCheck, distributionOdds as odds, binomial } from "../../shared/distributions.mjs";

export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drop counts must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  countCheck(count,kills,item.name);
  const p=rateOf(item.id);
  results[item.id]={...odds(binomial(kills,p),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-p))};
 }
 return results;
}
