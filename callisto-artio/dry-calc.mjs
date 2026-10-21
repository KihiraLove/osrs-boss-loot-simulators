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
function atLeastOne(callisto,artio,pc,pa){
 return -Math.expm1(callisto*Math.log1p(-pc)+artio*Math.log1p(-pa));
}
function combined(kcCallisto,kcArtio,pc,pa){
 return convolution(binomial(kcCallisto,pc),binomial(kcArtio,pa));
}
export function calculateDry(callistoKills,artioKills,received={}){
 validateKills(callistoKills,"Callisto KC");
 validateKills(artioKills,"Artio KC");
 if(received===null||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Rare drop counts must be an object.");
 const total=callistoKills+artioKills,results={};
 let primaryCount=0,petCount=0;
 for(const item of DRY_ITEMS){
  const n=received[item.id]??0;
  validCount(n,total,item.name);
  const chance=combined(callistoKills,artioKills,item.callisto,item.artio);
  results[item.id]={...odds(chance,n),
   atLeastOne:atLeastOne(callistoKills,artioKills,item.callisto,item.artio)};
  if(item.id===PET.id)petCount=n;
  else primaryCount+=n;
 }
 validCount(primaryCount,total,"Combined primary unique rewards");
 const main=combined(callistoKills,artioKills,PRIMARY_RATE.callisto,PRIMARY_RATE.artio);
 results.anyPrimary={...odds(main,primaryCount),
  atLeastOne:atLeastOne(callistoKills,artioKills,PRIMARY_RATE.callisto,PRIMARY_RATE.artio)};
 // Cub can be rolled alongside any one primary unique on the same kill.
 const pets=combined(callistoKills,artioKills,PET.callisto,PET.artio);
 const anyCount=primaryCount+petCount;
 results.anyUnique={...odds(convolution(main,pets),anyCount),
  atLeastOne:-Math.expm1(
   callistoKills*(Math.log1p(-PRIMARY_RATE.callisto)+Math.log1p(-PET.callisto))+
   artioKills*(Math.log1p(-PRIMARY_RATE.artio)+Math.log1p(-PET.artio))
  )};
 return {callistoKills,artioKills,kills:total,results,
  ...results};
}
