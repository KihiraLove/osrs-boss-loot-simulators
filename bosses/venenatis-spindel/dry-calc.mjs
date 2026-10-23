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
