import {UNIQUE,DRY_ITEMS,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=n=>Math.max(0,Math.min(1,n));
function checkCount(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number from 0 to "+max+".");
}
function summarize(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const k=dist.from+i;
  if(k<count)fewer+=dist.values[i];
  else if(k===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
function combine(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  const weight=a.values[i];if(!weight)continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=weight*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
// All six collection-log rares are independent tertiary rolls.
// The total number of rare items can exceed the number of kills.
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received rare drop counts must be an object.");
 const result={};
 let receivedTotal=0;
 let totalDist={from:0,values:Float64Array.of(1),expected:0};
 let logNone=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  checkCount(count,kills,item.name);
  receivedTotal+=count;
  const dist=binomial(kills,item.rate);
  result[item.id]={
   ...summarize(dist,count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))
  };
  totalDist=combine(totalDist,dist);
  logNone+=Math.log1p(-item.rate);
 }
 checkCount(receivedTotal,kills*UNIQUE.length,"Total rare drops");
 result.anyUnique={
  ...summarize(totalDist,receivedTotal),
  atLeastOne:-Math.expm1(kills*logNone)
 };
 return result;
}
