import {DRY_ITEMS,validateKills,rateOf} from "./simulator.mjs";
import { distributionOdds as odds, binomial } from "../../shared/distributions.mjs";

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
