import {DRY_ITEMS,PRE_RATE,validateKills} from "./simulator.mjs";
import { validateDropCount as countCheck, distributionOdds as stats, convolveDistributions as convolution, binomial } from "../../shared/distributions.mjs";

// One pre-roll can succeed per kill, but jar and pet independently coexist.
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drop counts must be an object.");
 const results={};let total=0,primaryTotal=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  countCheck(count,kills,item.name);
  total+=count;
  if(["occult-necklace","smoke-battlestaff","dragon-chainbody"].includes(item.id))
   primaryTotal+=count;
  const dist=binomial(kills,item.rate);
  results[item.id]={...stats(dist,count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))};
 }
 countCheck(primaryTotal,kills,"Combined primary pre-roll uniques");
 countCheck(total,3*kills,"Combined chase rewards");
 const primary=binomial(kills,PRE_RATE);
 results.anyPrimary={...stats(primary,primaryTotal),
  atLeastOne:-Math.expm1(kills*Math.log1p(-PRE_RATE))};
 const jar=binomial(kills,1/2000),pet=binomial(kills,1/3000);
 const combined=convolution(convolution(primary,jar),pet);
 results.anyUnique={...stats(combined,total),
  atLeastOne:-Math.expm1(kills*(
   Math.log1p(-PRE_RATE)+Math.log1p(-1/2000)+Math.log1p(-1/3000)
  ))};
 return results;
}
