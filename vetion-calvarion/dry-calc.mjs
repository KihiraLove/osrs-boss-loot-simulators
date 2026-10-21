import {
 PRIMARY,PET,DRY_ITEMS,PRIMARY_RATE,validateKills
} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.min(1,Math.max(0,x));
function validCount(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number between 0 and "+max+".");
}
function convolution(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  const v=a.values[i];if(!v)continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=v*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
function odds(distribution,count){
 let fewer=0,exact=0;
 for(let i=0;i<distribution.values.length;i++){
  const n=distribution.from+i;
  if(n<count)fewer+=distribution.values[i];
  if(n===count)exact+=distribution.values[i];
 }
 return {count,expected:distribution.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
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
