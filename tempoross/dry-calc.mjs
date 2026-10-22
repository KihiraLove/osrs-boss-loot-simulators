import {DRY_ITEMS,validatePulls} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));
function valid(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number from 0 to "+max+".");
}
function summary(d,count){
 let fewer=0,exact=0;
 for(let i=0;i<d.values.length;i++){
  const amount=d.from+i;
  if(amount<count)fewer+=d.values[i];
  else if(amount===count)exact+=d.values[i];
 }
 return {count,expected:d.expected,fewer:clamp(fewer),exact:clamp(exact),
  more:clamp(1-fewer-exact)};
}
// The pool cannot award a SECOND fish barrel or tackle box once acquired.
// Only the first success matters; later hits become 25 soaked pages.
export function oneTimeOdds(pulls,count,rate){
 validatePulls(pulls);
 valid(count,Math.min(pulls,1),"One-time reward");
 if(!(rate>=0&&rate<=1))throw new RangeError("Invalid drop rate.");
 const p=-Math.expm1(pulls*Math.log1p(-rate));
 return {count,expected:p,atLeastOne:p,
  fewer:count===0?0:1-p,
  exact:count===0?1-p:p,
  more:count===0?p:0};
}
export function calculateDry(pulls,received={}){
 validatePulls(pulls);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received counts must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  if(item.oneTime){results[item.id]=oneTimeOdds(pulls,count,item.rate);continue;}
  valid(count,pulls,item.name);
  results[item.id]={
   ...summary(binomial(pulls,item.rate),count),
   atLeastOne:-Math.expm1(pulls*Math.log1p(-item.rate))
  };
 }
 return results;
}
