import { PET, DRY_ITEMS, PRIMARY_RATE, validateKills } from "./simulator.mjs";
import { validateDropCount as validCount, convolveDistributions as convolution, distributionOdds as odds, binomial } from "../../shared/distributions.mjs";

function atLeastOne(vetion,calvarion,pc,pa){
 return -Math.expm1(vetion*Math.log1p(-pc)+calvarion*Math.log1p(-pa));
}
function combined(kcVetion,kcCalvarion,pc,pa){
 return convolution(binomial(kcVetion,pc),binomial(kcCalvarion,pa));
}
export function calculateDry(vetionKills,calvarionKills,received={}){
 validateKills(vetionKills,"Vet'ion KC");
 validateKills(calvarionKills,"Calvar'ion KC");
 if(received===null||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Rare drop counts must be an object.");
 const total=vetionKills+calvarionKills,results={};
 let primaryCount=0,petCount=0;
 for(const item of DRY_ITEMS){
  const n=received[item.id]??0;
  validCount(n,total,item.name);
  const chance=combined(vetionKills,calvarionKills,item.vetion,item.calvarion);
  results[item.id]={...odds(chance,n),
   atLeastOne:atLeastOne(vetionKills,calvarionKills,item.vetion,item.calvarion)};
  if(item.id===PET.id)petCount=n;
  else primaryCount+=n;
 }
 validCount(primaryCount,total,"Combined primary unique rewards");
 const main=combined(vetionKills,calvarionKills,PRIMARY_RATE.vetion,PRIMARY_RATE.calvarion);
 results.anyPrimary={...odds(main,primaryCount),
  atLeastOne:atLeastOne(vetionKills,calvarionKills,PRIMARY_RATE.vetion,PRIMARY_RATE.calvarion)};
 // Pet can roll independently alongside one primary unique on the same kill.
 const pets=combined(vetionKills,calvarionKills,PET.vetion,PET.calvarion);
 const anyCount=primaryCount+petCount;
 results.anyUnique={...odds(convolution(main,pets),anyCount),
  atLeastOne:-Math.expm1(
   vetionKills*(Math.log1p(-PRIMARY_RATE.vetion)+Math.log1p(-PET.vetion))+
   calvarionKills*(Math.log1p(-PRIMARY_RATE.calvarion)+Math.log1p(-PET.calvarion))
  )};
 return {vetionKills,calvarionKills,kills:total,results,
  ...results};
}
