import {UNIQUE,DRY_ITEMS,validateKills} from "./simulator.mjs";
import { validateDropCount as checkCount, distributionOdds as summarize, binomial } from "../../shared/distributions.mjs";

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
