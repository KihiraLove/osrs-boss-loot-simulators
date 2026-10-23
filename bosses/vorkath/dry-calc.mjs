import { distributionOdds, validateDropCount as check, binomial } from "../../shared/distributions.mjs";
import { UNIQUE, validateKills, rateOf } from "./simulator.mjs";

function stats(dist, count, atLeastOne = null) {
  return { ...distributionOdds(dist, count), atLeastOne: atLeastOne ?? -Math.expm1(dist.n * Math.log1p(-dist.p)) };
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
