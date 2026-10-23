import {
 DRY_ITEMS,validateKills,ANY_SHARD_CHANCE,PET_CHANCE
} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
function checkCount(n,limit,label){
 if(!Number.isSafeInteger(n)||n<0||n>limit)
  throw new RangeError(label+" must be a whole number from 0 to "+limit+".");
}
function summarize(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const k=dist.from+i;
  if(k<count)fewer+=dist.values[i];
  else if(k===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
function convolution(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  if(a.values[i]===0)continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=a.values[i]*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
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
