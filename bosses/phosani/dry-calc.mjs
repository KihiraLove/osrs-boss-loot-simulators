import { binomial as binomialDistribution, validateDropCount as countCheck, distributionOdds as odds } from "../../shared/distributions.mjs";
import { ARMOUR_CHANCE, ORB_CHANCE, SIGNATURE, DRY_ITEMS, rateOf, validateKills } from "./simulator.mjs";

// Evaluate around the binomial mode to avoid underflow for very large kill counts.
// O(standard deviation), with omitted tails much smaller than shown precision.
export function binomial(n, p) {
  validateKills(n);
  return binomialDistribution(n, p);
}

// Count total drops from BOTH mutually independent signature tables,
// including the possibility of two uniques on a single kill.
export function anySignatureOdds(kills,count) {
 validateKills(kills);
 countCheck(count,kills*2);
 const a=binomial(kills,ARMOUR_CHANCE),b=binomial(kills,ORB_CHANCE);
 const prefix=new Float64Array(b.values.length+1);
 for(let i=0;i<b.values.length;i++)prefix[i+1]=prefix[i]+b.values[i];
 let fewer=0,exact=0;
 for(let i=0;i<a.values.length;i++){
   const other=count-(a.from+i)-b.from;
   const below=Math.max(0,Math.min(b.values.length,other));
   fewer+=a.values[i]*prefix[below];
   if(other>=0&&other<b.values.length)exact+=a.values[i]*b.values[other];
 }
 return {count,expected:kills*(ARMOUR_CHANCE+ORB_CHANCE),
   atLeastOne:-Math.expm1(kills*(Math.log1p(-ARMOUR_CHANCE)+Math.log1p(-ORB_CHANCE))),
   fewer:Math.max(0,Math.min(1,fewer)),
   exact:Math.max(0,Math.min(1,exact)),
   more:Math.max(0,Math.min(1,1-fewer-exact))};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(received===null||typeof received!=="object")throw new TypeError("Missing drop counts");
 const results={};
 for(const item of DRY_ITEMS){
   const count=received[item.id]??0;
   countCheck(count,kills);
   results[item.id]=odds(binomial(kills,rateOf(item.id)),count);
 }
 const total=SIGNATURE.reduce((s,item)=>s+(received[item.id]??0),0);
 results.anyUnique=anySignatureOdds(kills,total);
 return results;
}
