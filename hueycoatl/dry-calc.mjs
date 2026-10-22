import {binomial} from "../phosani/dry-calc.mjs";
import {
 MODES,PRIMARY,DRY_ITEMS,validateCounts,rateOf,UNIQUE_CHANCE
} from "./simulator.mjs";
const clamp=n=>Math.max(0,Math.min(1,n));
function checkCount(n,max,name){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(name+" must be a whole number from 0 to "+max+".");
}
function convolve(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  const x=a.values[i];if(!x)continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=x*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
function combined(killsByMode,chance){
 let total={from:0,values:Float64Array.of(1),expected:0};
 for(const mode of MODES){
  const dist=binomial(killsByMode[mode.id],chance(mode.id));
  total=convolve(total,dist);
 }
 return total;
}
function stats(dist,count,multiplier=1){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const number=(dist.from+i)*multiplier;
  if(number<count)fewer+=dist.values[i];
  else if(number===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected*multiplier,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
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
