import {DRY_ITEMS,rateOf,validateKills,validateMode} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
function checkCount(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" received must be a whole number between 0 and "+max+".");
}
function odds(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const value=dist.from+i;
  if(value<count)fewer+=dist.values[i];
  else if(value===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
function atLeastOne(n,p){return -Math.expm1(n*Math.log1p(-p));}
export function calculateDry(kills,received={},mode="stomach"){
 validateKills(kills);validateMode(mode);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  const p=rateOf(item.id,mode);
  const max=p===0?0:kills;
  checkCount(count,max,item.name);
  results[item.id]={...odds(binomial(kills,p),count),atLeastOne:atLeastOne(kills,p)};
 }
 if(mode==="stomach"){
  const count=(received["elder-venator-fang"]??0)+(received["crimson-kisten"]??0);
  checkCount(count,kills,"Either weapon unique");
  const p=rateOf("elder-venator-fang")+rateOf("crimson-kisten");
  results.anyWeapon={...odds(binomial(kills,p),count),atLeastOne:atLeastOne(kills,p)};
 }
 return {kills,mode,results,...results};
}
