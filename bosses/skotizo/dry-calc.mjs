import {DRY_ITEMS,rateOf,validateKills} from "./simulator.mjs";
import { distributionOdds as odds, binomial } from "../../shared/distributions.mjs";

function valid(n,max,name){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(name+" count must be a whole number from 0 to "+max+".");
}

export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  valid(count,kills,item.name);
  const p=rateOf(item.id);
  results[item.id]={...odds(binomial(kills,p),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-p))};
 }
 return results;
}
