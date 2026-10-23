import {UNIQUE,DRY_ITEMS,validateKills,validateMode,rateOf} from "./simulator.mjs";
import { validateDropCount as countCheck, distributionOdds as summarize, binomial } from "../../shared/distributions.mjs";

function combine(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  const v=a.values[i];if(!v)continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=v*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
export function calculateDry(kills,received={},mode="mvp"){
 validateKills(kills);validateMode(mode);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received rare drop counts must be an object.");
 let totalReceived=0,totalDist={from:0,values:Float64Array.of(1),expected:0};
 let noneLog=0;
 const output={};
 for(const item of DRY_ITEMS){
  const rate=rateOf(item.id,mode),count=received[item.id]??0;
  countCheck(count,kills,item.name);
  if(rate===0){
   if(count)throw new RangeError(item.name+" is only available to Solo/MVP.");
   continue;
  }
  totalReceived+=count;
  const dist=binomial(kills,rate);
  output[item.id]={...summarize(dist,count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-rate))};
  totalDist=combine(totalDist,dist);
  noneLog+=Math.log1p(-rate);
 }
 const available=UNIQUE.filter(item=>rateOf(item.id,mode)>0).length;
 countCheck(totalReceived,kills*available,"Total rare rewards");
 output.anyUnique={...summarize(totalDist,totalReceived),
  atLeastOne:-Math.expm1(kills*noneLog)};
 return output;
}
