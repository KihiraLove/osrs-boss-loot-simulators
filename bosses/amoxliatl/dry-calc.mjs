import {UNIQUE,DRY_ITEMS,rateOf,validateKills} from "./simulator.mjs";
import { validateDropCount as countCheck, distributionOdds as odds, convolveDistributions as convolve, binomial } from "../../shared/distributions.mjs";

// Pendant, temotli and pet are separate tertiary rolls. Multiple signature
// drops can occur on one kill, hence we convolve three binomials.
export function anySignature(kills,count){
 validateKills(kills);
 countCheck(count,kills*UNIQUE.length,"Total signature rewards");
 const distributions=UNIQUE.map(item=>binomial(kills,item.rate));
 const total=distributions.reduce(convolve);
 return {...odds(total,count),
  atLeastOne:-Math.expm1(kills*UNIQUE.reduce((s,item)=>s+Math.log1p(-item.rate),0))};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(received===null||typeof received!=="object")
  throw new TypeError("Drop counts are required.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  countCheck(count,kills,item.name);
  results[item.id]=odds(binomial(kills,rateOf(item.id)),count);
 }
 const total=UNIQUE.reduce((sum,item)=>sum+(received[item.id]??0),0);
 results.anyUnique=anySignature(kills,total);
 return results;
}
