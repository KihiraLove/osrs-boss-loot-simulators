import { DRY_ITEMS, validateKills, PET_CHANCE, PRIMARY_CHANCE } from "./simulator.mjs";
import { validateDropCount as checkCount, distributionOdds as summarize, convolveDistributions as convolution, binomial } from "../../shared/distributions.mjs";

export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Drop counts must be an object.");
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  checkCount(count,kills,item.name);
  result[item.id]={
   ...summarize(binomial(kills,item.rate),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))
  };
 }
 const primaries=(received["dragon-pickaxe"]??0)+(received["dragon-2h-sword"]??0);
 const pet=received["pet-chaos-elemental"]??0;
 checkCount(primaries,kills,"Dragon pickaxe plus Dragon 2h sword");
 checkCount(primaries+pet,kills*2,"Total rare items");
 const totalDist=convolution(binomial(kills,PRIMARY_CHANCE),binomial(kills,PET_CHANCE));
 result.anyUnique={
  ...summarize(totalDist,primaries+pet),
  atLeastOne:-Math.expm1(kills*(Math.log1p(-PRIMARY_CHANCE)+Math.log1p(-PET_CHANCE)))
 };
 return result;
}
