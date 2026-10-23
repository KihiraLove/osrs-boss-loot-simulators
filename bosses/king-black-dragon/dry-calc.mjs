import {DRY_ITEMS,validateKills} from "./simulator.mjs";
import { validateDropCount as check, distributionOdds as odds, convolveDistributions as convolution, binomial } from "../../shared/distributions.mjs";

// The pickaxe pre-roll and each of the three tertiary unique rolls are
// independent. Thus up to four counted rare rewards can share a kill.
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Drop counts must be an object.");
 const result={};let total=0,combined=null,logNone=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;check(count,kills,item.name);total+=count;
  const dist=binomial(kills,item.rate);
  result[item.id]={...odds(dist,count),atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))};
  logNone+=Math.log1p(-item.rate);
  combined=combined?convolution(combined,dist):dist;
 }
 check(total,kills*DRY_ITEMS.length,"Total unique drops");
 result.anyUnique={
  ...odds(combined,total),
  atLeastOne:-Math.expm1(kills*logNone)
 };
 return result;
}
