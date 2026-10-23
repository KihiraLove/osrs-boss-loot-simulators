import {UNIQUE,DRY_ITEMS,rateOf,validateKills} from "./simulator.mjs";
import { validateDropCount as validCount, distributionOdds as odds, binomial } from "../../shared/distributions.mjs";

// One primary unique-table roll gives at most one of the four outcomes.
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(received===null||typeof received!=="object")
  throw new TypeError("Drop counts must be provided.");
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  validCount(count,kills);
  result[item.id]=odds(binomial(kills,rateOf(item.id)),count);
 }
 const count=UNIQUE.reduce((sum,item)=>sum+(received[item.id]??0),0);
 validCount(count,kills);
 result.anyUnique={
  ...odds(binomial(kills,1/130),count),
  atLeastOne:-Math.expm1(kills*Math.log1p(-1/130))
 };
 return result;
}
