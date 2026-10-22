import {BUCKET_RATE,DRY_ITEMS,petRate,validateKills,validateFarmingLevel} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=n=>Math.max(0,Math.min(1,n));
function validCount(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number between 0 and "+max+".");
}
function stats(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const actual=dist.from+i;
  if(actual<count)fewer+=dist.values[i];
  else if(actual===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),exact:clamp(exact),
  more:clamp(1-fewer-exact)};
}
function convolve(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  if(!a.values[i])continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=a.values[i]*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
export function calculateDry(kills,received={},farmingLevel=99){
 validateKills(kills);validateFarmingLevel(farmingLevel);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drop counts must be an object.");
 const probabilities={
  "bottomless-compost-bucket":BUCKET_RATE,
  tangleroot:petRate(farmingLevel)
 };
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  validCount(count,kills,item.name);
  const p=probabilities[item.id];
  result[item.id]={...stats(binomial(kills,p),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-p))};
 }
 // Bucket and pet can drop on the same kill, so the sum of their
 // binomial counts is NOT a single Binomial(kills, pBucket + pPet).
 const sum=DRY_ITEMS.reduce((n,item)=>n+(received[item.id]??0),0);
 const all=convolve(binomial(kills,BUCKET_RATE),binomial(kills,petRate(farmingLevel)));
 result.anyUnique={
  ...stats(all,sum),
  atLeastOne:-Math.expm1(kills*(Math.log1p(-BUCKET_RATE)+Math.log1p(-petRate(farmingLevel))))
 };
 return result;
}
