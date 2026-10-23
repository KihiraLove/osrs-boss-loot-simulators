import {UNIQUE,MAX_KILLS,validateKills,rateOf} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));
function check(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" received must be a whole number from 0 to "+max+".");
}
function stats(dist,count,atLeastOne=null){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  else if(n===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),exact:clamp(exact),
  more:clamp(1-fewer-exact),atLeastOne:atLeastOne===null
   ?-Math.expm1(dist.n*Math.log1p(-dist.p)):atLeastOne};
}
// On KC 50 the random 1/50 head roll is REPLACED by a guaranteed head.
// Starting from KC 0, heads = Binomial(kills-1,1/50)+1 when kills>=50.
export function headOdds(kills,count){
 validateKills(kills);check(count,kills,"Vorkath's head");
 const guaranteed=kills>=50?1:0;
 const trials=kills-guaranteed,p=1/50;
 const dist=binomial(trials,p);
 const shifted={...dist,from:dist.from+guaranteed,expected:dist.expected+guaranteed};
 return stats(shifted,count,guaranteed?1:-Math.expm1(trials*Math.log1p(-p)));
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of UNIQUE){
  const count=received[item.id]??0;
  check(count,kills,item.name);
  if(item.id==="vorkaths-head"){results[item.id]=headOdds(kills,count);continue;}
  const p=rateOf(item.id);
  const dist=binomial(kills,p);
  results[item.id]=stats({...dist,n:kills,p},count);
 }
 return results;
}
