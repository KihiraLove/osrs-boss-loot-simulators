import {UNIQUE,DRY_ITEMS,rateOf,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
function countCheck(value,max,label){
 if(!Number.isSafeInteger(value)||value<0||value>max)
  throw new RangeError(label+" must be a non-negative whole number no higher than "+max+".");
}
function clamp(p){return Math.max(0,Math.min(1,p));}
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
function convolve(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  if(!a.values[i])continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=a.values[i]*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
// Pendant, temotli and pet are separate tertiary rolls. Multiple signature
// drops can occur on one kill, hence we convolve three binomials.
export function anySignature(kills,count){
 validateKills(kills);
 countCheck(count,kills*UNIQUE.length,"Total signature rewards");
 const distributions=UNIQUE.map(item=>binomial(kills,item.rate));
 const total=distributions.reduce(convolve);
 return {...odds(total,count),
  atLeastOne:-Math.expm1(kills*UNIQUE.reduce((s,item)=>s+Math.log1p(-item.rate),0))};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(received===null||typeof received!=="object")
  throw new TypeError("Drop counts are required.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  countCheck(count,kills,item.name);
  results[item.id]=odds(binomial(kills,rateOf(item.id)),count);
 }
 const total=UNIQUE.reduce((sum,item)=>sum+(received[item.id]??0),0);
 results.anyUnique=anySignature(kills,total);
 return results;
}
