import {DRY_ITEMS,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=n=>Math.max(0,Math.min(1,n));
function check(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number from 0 to "+max+".");
}
function odds(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  else if(n===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
function convolution(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  if(!a.values[i])continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=a.values[i]*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
// The pickaxe pre-roll and each of the three tertiary unique rolls are
// independent. Thus up to four counted rare rewards can share a kill.
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Drop counts must be an object.");
 const result={};let total=0,combined=null,logNone=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;check(count,kills,item.name);total+=count;
  const dist=binomial(kills,item.rate);
  result[item.id]={...odds(dist,count),atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))};
  logNone+=Math.log1p(-item.rate);
  combined=combined?convolution(combined,dist):dist;
 }
 check(total,kills*DRY_ITEMS.length,"Total unique drops");
 result.anyUnique={
  ...odds(combined,total),
  atLeastOne:-Math.expm1(kills*logNone)
 };
 return result;
}
