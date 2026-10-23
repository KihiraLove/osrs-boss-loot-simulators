import {
 DRY_ITEMS,validateKills,ANY_SHARD_CHANCE,PET_CHANCE
} from "./simulator.mjs";
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
 const shards=(received["odium-shard-1"]??0)+(received["malediction-shard-1"]??0);
 const pet=received["pet-chaos-elemental"]??0;
 checkCount(shards,kills,"Total shards");
 const total=shards+pet;
 checkCount(total,kills*2,"Total rare items");
 const dist=convolution(binomial(kills,ANY_SHARD_CHANCE),binomial(kills,PET_CHANCE));
 result.anyUnique={
  ...summarize(dist,total),
  atLeastOne:-Math.expm1(kills*(Math.log1p(-ANY_SHARD_CHANCE)+Math.log1p(-PET_CHANCE)))
 };
 return result;
}
