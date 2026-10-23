import { PREROLL, DRY_ITEMS, validateKills, validateWorld, rateOf } from "./simulator.mjs";
import { validateDropCount as countCheck, distributionOdds as summary, binomial } from "../../shared/distributions.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));

// The three mutually exclusive pre-roll rewards are one Bernoulli trial
// per kill (total 10/150 for Members, 5/150 on F2P).
// Beef is independently rolled on Members worlds and can appear on the
// same kill as Mooleta, a milk bucket, or slippers.
export function anyUnique(kills,count,world="members"){
 validateKills(kills);validateWorld(world);
 const max=world==="members"?kills*2:kills;
 countCheck(count,max,"Total rare items");
 const primary=PREROLL.reduce((sum,x)=>sum+rateOf(x.id,world),0);
 if(world==="f2p"){
  const result=summary(binomial(kills,primary),count);
  return {...result,atLeastOne:-Math.expm1(kills*Math.log1p(-primary))};
 }
 const a=binomial(kills,primary),b=binomial(kills,rateOf("beef",world));
 const prefix=new Float64Array(b.values.length+1);
 for(let i=0;i<b.values.length;i++)prefix[i+1]=prefix[i]+b.values[i];
 let fewer=0,exact=0;
 for(let i=0;i<a.values.length;i++){
  const remaining=count-(a.from+i)-b.from;
  const below=Math.max(0,Math.min(b.values.length,remaining));
  fewer+=a.values[i]*prefix[below];
  if(remaining>=0&&remaining<b.values.length)exact+=a.values[i]*b.values[remaining];
 }
 return {count,expected:kills*(primary+rateOf("beef",world)),
  atLeastOne:-Math.expm1(kills*(Math.log1p(-primary)+Math.log1p(-rateOf("beef",world)))),
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function calculateDry(kills,received={},world="members"){
 validateKills(kills);validateWorld(world);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Drop counts are required.");
 const result={};
 let total=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  countCheck(count,kills,item.name);
  const p=rateOf(item.id,world);
  if(p===0){
   if(count!==0)throw new RangeError(item.name+" does not drop on free-to-play worlds.");
   continue;
  }
  total+=count;
  result[item.id]=summary(binomial(kills,p),count);
 }
 if(total>(world==="members"?2*kills:kills))
  throw new RangeError("Total rare drops exceed the maximum possible outcomes.");
 // A single pre-roll cannot award two different main uniques on one kill.
 const preCount=PREROLL.reduce((s,item)=>s+(received[item.id]??0),0);
 countCheck(preCount,kills,"Combined pre-roll rewards");
 result.anyUnique=anyUnique(kills,total,world);
 return result;
}
