import {DRY_ITEMS,validateKills} from "./simulator.mjs";
import { distributionOdds as summarize, binomial } from "../../shared/distributions.mjs";

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
