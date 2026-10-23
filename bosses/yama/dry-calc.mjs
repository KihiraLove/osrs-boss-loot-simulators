import {EQUIPMENT,DRY_ITEMS,validatePlan,itemRate,rates} from "./simulator.mjs";
import { validateDropCount as checkCount, convolveDistributions as convolve, binomial } from "../../shared/distributions.mjs";

const clamp=p=>Math.max(0,Math.min(1,p));

function prefixOf(dist){
 const prefix=new Float64Array(dist.values.length+1);
 for(let i=0;i<dist.values.length;i++)prefix[i+1]=prefix[i]+dist.values[i];
 return prefix;
}
// Evaluate the convolution CDF at the observation without allocating a
// potentially enormous weighted distribution (shards are 12 or 6 per hit).
// Units are actual item quantities, not the number of successful rolls.
function mixedOdds(a,b,count,unitA=1,unitB=1){
 const prefix=prefixOf(b);
 let fewer=0,exact=0;
 for(let i=0;i<a.values.length;i++){
  const base=(a.from+i)*unitA;
  const below=Math.ceil((count-base)/unitB)-b.from;
  const bound=Math.max(0,Math.min(b.values.length,below));
  fewer+=a.values[i]*prefix[bound];
  const remaining=count-base;
  if(remaining%unitB===0){
   const index=remaining/unitB-b.from;
   if(index>=0&&index<b.values.length)exact+=a.values[i]*b.values[index];
  }
 }
 return {count,expected:a.expected*unitA+b.expected*unitB,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
// Convolve the two contribution-specific equipment-success counts.
// This is needed only for "Any equipment or Yami", as pet success has
// a single rate shared by both contributions.

// Each solo or duo kill supplies one exclusive equipment roll and a
// separate independent Yami roll; a kill may grant both.
export function anyRare(plan,count){
 const {solo,duo,total}=validatePlan(plan);
 checkCount(count,total*2);
 const gear=convolve(binomial(solo,rates(1).gear),binomial(duo,rates(.5).gear));
 const pet=binomial(total,1/2500);
 return {...mixedOdds(gear,pet,count),
  atLeastOne:-Math.expm1(solo*Math.log1p(-rates(1).gear)
   +duo*Math.log1p(-rates(.5).gear)+total*Math.log1p(-1/2500))};
}
// Shards arrive in 12-item solo batches and 6-item duo batches.
// An observation must be decomposable into valid numbers of either batch.
function validateShardCount(count,solo,duo){
 checkCount(count,solo*12+duo*6);
 if(count%6!==0)throw new RangeError("Oathplate shards must be a multiple of 6.");
 const units=count/6;
 const minimumSolo=Math.max(0,Math.ceil((units-duo)/2));
 const maximumSolo=Math.min(solo,Math.floor(units/2));
 if(minimumSolo>maximumSolo)
  throw new RangeError("Oathplate shard count is impossible for the entered solo and duo kills.");
}
export function calculateDry(plan,received={}){
 const {solo,duo,total}=validatePlan(plan);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Drop counts are required.");
 const result={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  if(item.id==="oathplate-shards")validateShardCount(count,solo,duo);
  else checkCount(count,total);
  const first=binomial(solo,itemRate(item.id,1));
  const second=binomial(duo,itemRate(item.id,.5));
  result[item.id]=item.id==="oathplate-shards"
   ?mixedOdds(first,second,count,12,6)
   :mixedOdds(first,second,count);
 }
 const combinedCount=EQUIPMENT.reduce((sum,item)=>sum+(received[item.id]??0),0)
  +(received.yami??0);
 result.anyUnique=anyRare({solo,duo},combinedCount);
 return result;
}
