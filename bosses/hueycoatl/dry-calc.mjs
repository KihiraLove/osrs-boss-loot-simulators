import { distributionOdds, validateDropCount as checkCount, convolveDistributions as convolve, binomial } from "../../shared/distributions.mjs";

import {
 MODES,PRIMARY,DRY_ITEMS,validateCounts,rateOf,UNIQUE_CHANCE
} from "./simulator.mjs";
const clamp=n=>Math.max(0,Math.min(1,n));

function combined(killsByMode,chance){
 let total={from:0,values:Float64Array.of(1),expected:0};
 for(const mode of MODES){
  const dist=binomial(killsByMode[mode.id],chance(mode.id));
  total=convolve(total,dist);
 }
 return total;
}
function stats(dist, count, multiplier = 1) {
  return distributionOdds(dist, count, value => value * multiplier);
}
function atLeastOne(killsByMode,chance){
 return clamp(-Math.expm1(MODES.reduce((sum,mode)=>
  sum+killsByMode[mode.id]*Math.log1p(-chance(mode.id)),0)));
}
export function calculateDry(soloKills,duoKills,trioKills,received={}){
 validateCounts(soloKills,duoKills,trioKills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received unique counts must be an object.");
 const counts={solo:soloKills,duo:duoKills,trio:trioKills};
 const kills=soloKills+duoKills+trioKills,results={};
 let totalPrimaryHits=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  const mult=item.quantity||1;
  checkCount(count,kills*mult,item.name);
  if(count%mult!==0)
   throw new RangeError(item.name+" must be entered in multiples of "+mult+".");
  const chance=mode=>rateOf(item.id,mode);
  const dist=combined(counts,chance);
  results[item.id]={...stats(dist,count,mult),atLeastOne:atLeastOne(counts,chance)};
  if(PRIMARY.some(x=>x.id===item.id))totalPrimaryHits+=count/mult;
 }
 checkCount(totalPrimaryHits,kills,"Any primary unique count");
 const chance=mode=>MODES.find(m=>m.id===mode).share*UNIQUE_CHANCE;
 const dist=combined(counts,chance);
 results.anyPrimary={...stats(dist,totalPrimaryHits),
  atLeastOne:atLeastOne(counts,chance)};
 return {soloKills,duoKills,trioKills,kills,results,...results};
}
