import {BUCKET_RATE,DRY_ITEMS,petRate,validateKills,validateFarmingLevel} from "./simulator.mjs";
import { validateDropCount as validCount, distributionOdds as stats, convolveDistributions as convolve, binomial } from "../../shared/distributions.mjs";

export function calculateDry(kills,received={},farmingLevel=99){
 validateKills(kills);validateFarmingLevel(farmingLevel);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drop counts must be an object.");
 const probabilities={
  "bottomless-compost-bucket":BUCKET_RATE,
  tangleroot:petRate(farmingLevel)
 };
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  validCount(count,kills,item.name);
  const p=probabilities[item.id];
  result[item.id]={...stats(binomial(kills,p),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-p))};
 }
 // Bucket and pet can drop on the same kill, so the sum of their
 // binomial counts is NOT a single Binomial(kills, pBucket + pPet).
 const sum=DRY_ITEMS.reduce((n,item)=>n+(received[item.id]??0),0);
 const all=convolve(binomial(kills,BUCKET_RATE),binomial(kills,petRate(farmingLevel)));
 result.anyUnique={
  ...stats(all,sum),
  atLeastOne:-Math.expm1(kills*(Math.log1p(-BUCKET_RATE)+Math.log1p(-petRate(farmingLevel))))
 };
 return result;
}
