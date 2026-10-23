import {DRY_ITEMS,MODES,validateKills,rateOf} from "./simulator.mjs";
import { validateDropCount as validateCount, convolveDistributions as convolve, distributionOdds as stats, binomial } from "../../shared/distributions.mjs";

export function atLeastOne(regularKills,corruptedKills,regularRate,corruptedRate){
 return -Math.expm1(regularKills*Math.log1p(-regularRate)+corruptedKills*Math.log1p(-corruptedRate));
}
export function combinedDistribution(regularKills,corruptedKills,regularRate,corruptedRate){
 validateKills(regularKills,"Regular Gauntlet KC");
 validateKills(corruptedKills,"Corrupted Gauntlet KC");
 return convolve(binomial(regularKills,regularRate),binomial(corruptedKills,corruptedRate));
}
export function calculateDry(regularKills,corruptedKills,received={}){
 validateKills(regularKills,"Regular Gauntlet KC");
 validateKills(corruptedKills,"Corrupted Gauntlet KC");
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const total=regularKills+corruptedKills,results={};
 let seedCount=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  validateCount(count,total,item.name);
  const p=rateOf("regular",item.id),q=rateOf("corrupted",item.id);
  results[item.id]={...stats(combinedDistribution(regularKills,corruptedKills,p,q),count),
   atLeastOne:atLeastOne(regularKills,corruptedKills,p,q)};
  if(item.id!=="youngllef")seedCount+=count;
 }
 validateCount(seedCount,3*total,"Combined seed count");
 const seeds=DRY_ITEMS.filter(item=>item.id!=="youngllef");
 const seedRegular=1-seeds.reduce((product,item)=>product*(1-rateOf("regular",item.id)),1);
 const seedCorrupted=1-seeds.reduce((product,item)=>product*(1-rateOf("corrupted",item.id)),1);
 const uniqueRegular=1-(1-seedRegular)*(1-MODES.regular.pet);
 const uniqueCorrupted=1-(1-seedCorrupted)*(1-MODES.corrupted.pet);
 results.anySeed={atLeastOne:atLeastOne(regularKills,corruptedKills,seedRegular,seedCorrupted),
  expected:regularKills*seeds.reduce((s,item)=>s+rateOf("regular",item.id),0)+
    corruptedKills*seeds.reduce((s,item)=>s+rateOf("corrupted",item.id),0)};
 results.anyUnique={atLeastOne:atLeastOne(regularKills,corruptedKills,uniqueRegular,uniqueCorrupted)};
 return {regularKills,corruptedKills,kills:total,results,...results};
}
