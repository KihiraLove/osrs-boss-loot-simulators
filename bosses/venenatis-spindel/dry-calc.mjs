import { PET, DRY_ITEMS, PRIMARY_RATE, validateKills } from "./simulator.mjs";
import { validateDropCount as validCount, convolveDistributions as convolution, distributionOdds as odds, binomial } from "../../shared/distributions.mjs";

function atLeastOne(venenatis,spindel,pc,pa){
 return -Math.expm1(venenatis*Math.log1p(-pc)+spindel*Math.log1p(-pa));
}
function combined(kcVenenatis,kcSpindel,pc,pa){
 return convolution(binomial(kcVenenatis,pc),binomial(kcSpindel,pa));
}
export function calculateDry(venenatisKills,spindelKills,received={}){
 validateKills(venenatisKills,"Venenatis KC");
 validateKills(spindelKills,"Spindel KC");
 if(received===null||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Rare drop counts must be an object.");
 const total=venenatisKills+spindelKills,results={};
 let primaryCount=0,petCount=0;
 for(const item of DRY_ITEMS){
  const n=received[item.id]??0;
  validCount(n,total,item.name);
  const chance=combined(venenatisKills,spindelKills,item.venenatis,item.spindel);
  results[item.id]={...odds(chance,n),
   atLeastOne:atLeastOne(venenatisKills,spindelKills,item.venenatis,item.spindel)};
  if(item.id===PET.id)petCount=n;
  else primaryCount+=n;
 }
 validCount(primaryCount,total,"Combined primary unique rewards");
 const main=combined(venenatisKills,spindelKills,PRIMARY_RATE.venenatis,PRIMARY_RATE.spindel);
 results.anyPrimary={...odds(main,primaryCount),
  atLeastOne:atLeastOne(venenatisKills,spindelKills,PRIMARY_RATE.venenatis,PRIMARY_RATE.spindel)};
 // Cub can be rolled alongside any one primary unique on the same kill.
 const pets=combined(venenatisKills,spindelKills,PET.venenatis,PET.spindel);
 const anyCount=primaryCount+petCount;
 results.anyUnique={...odds(convolution(main,pets),anyCount),
  atLeastOne:-Math.expm1(
   venenatisKills*(Math.log1p(-PRIMARY_RATE.venenatis)+Math.log1p(-PET.venenatis))+
   spindelKills*(Math.log1p(-PRIMARY_RATE.spindel)+Math.log1p(-PET.spindel))
  )};
 return {venenatisKills,spindelKills,kills:total,results,
  ...results};
}
