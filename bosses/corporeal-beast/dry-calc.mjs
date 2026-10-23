import {
 DRY_ITEMS,validateKills,SIGIL_CHANCE,SPIRIT_CHANCE,ELIXIR_CHANCE,JAR_CHANCE,PET_CHANCE
} from "./simulator.mjs";
import { validateDropCount as check, distributionOdds as summarize, convolveDistributions as convolve, binomial } from "../../shared/distributions.mjs";

export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received item counts must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  check(count,kills,item.name);
  results[item.id]={
   ...summarize(binomial(kills,item.rate),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))
  };
 }
 const sigils=(received["elysian-sigil"]??0)+(received["spectral-sigil"]??0)+(received["arcane-sigil"]??0);
 const main=(received["spirit-shield"]??0)+(received["holy-elixir"]??0);
 const jar=received["jar-of-spirits"]??0,pet=received["pet-dark-core"]??0;
 check(sigils,kills,"Combined sigils");
 check(main,kills,"Spirit shields and holy elixirs");
 check(sigils+main+jar+pet,kills*4,"Combined rare items");
 // Exclusive sigils, exclusive shield/elixir main-table rolls,
 // independent jar and pet rolls. The four groups may co-occur.
 let distribution=binomial(kills,SIGIL_CHANCE);
 for(const rate of [SPIRIT_CHANCE+ELIXIR_CHANCE,JAR_CHANCE,PET_CHANCE])
  distribution=convolve(distribution,binomial(kills,rate));
 results.anyUnique={
  ...summarize(distribution,sigils+main+jar+pet),
  atLeastOne:-Math.expm1(kills*(
   Math.log1p(-SIGIL_CHANCE)+Math.log1p(-SPIRIT_CHANCE-ELIXIR_CHANCE)+
   Math.log1p(-JAR_CHANCE)+Math.log1p(-PET_CHANCE)
  ))
 };
 return results;
}
