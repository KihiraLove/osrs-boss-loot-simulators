import { validateDropCount as checkCount, binomial as binomialDistribution, distributionOdds as odds } from "../../shared/distributions.mjs";
import {MAX_KILLS,PRIMARY,PRIMARY_RATE,DRY_ITEMS,validateKills,rateOf} from "./simulator.mjs";

// Stable mode-centered Binomial PMF. Grotesque Guardians roll loot twice,
// so this supports 2,000,000 rolls at 1,000,000 completed kills.
export function binomial(n, p) {
  return binomialDistribution(n, p, { maxTrials: 2 * MAX_KILLS });
}

export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received unique counts must be an object.");
 const result={},rolls=2*kills;
 let primaryCount=0;
 for(const item of DRY_ITEMS){
  const doubleRoll=PRIMARY.some(x=>x.id===item.id)||item.id==="adamant-boots";
  const trials=doubleRoll?rolls:kills;
  const count=received[item.id]??0;
  checkCount(count,trials,item.name);
  const p=rateOf(item.id);
  result[item.id]={...odds(binomial(trials,p),count),
   atLeastOne:-Math.expm1(trials*Math.log1p(-p))};
  if(PRIMARY.some(x=>x.id===item.id))primaryCount+=count;
 }
 checkCount(primaryCount,rolls,"Combined primary uniques");
 result.anyPrimary={
  ...odds(binomial(rolls,PRIMARY_RATE),primaryCount),
  atLeastOne:-Math.expm1(rolls*Math.log1p(-PRIMARY_RATE))
 };
 return result;
}
