import { validateDropCount as check, convolveDistributions, distributionOdds, binomial } from "../../shared/distributions.mjs";
import { DRY_ITEMS, HALBERD, validateKills, validateMode, rateOf } from "./simulator.mjs";

const clamp=x=>Math.max(0,Math.min(1,x));

// A halberd hit occurs at 1/200 per kill; first three hits are a
// random permutation of the pieces, then a fresh permutation begins.
// Given B halberd hits, a named piece appears floor(B/3) times plus
// Bernoulli((B % 3)/3), which is NOT Binomial(kills, 1/600).
export function pieceOdds(kills,count){
 validateKills(kills);check(count,kills,"Halberd piece count");
 const dist=binomial(kills,1/200);
 let fewer=0,exact=0,expected=0;
 for(let i=0;i<dist.values.length;i++){
  const hits=dist.from+i,base=Math.floor(hits/3),extra=(hits%3)/3;
  const p=dist.values[i];
  expected+=p*(base+extra);
  if(base<count)fewer+=p*(1-extra);
  if(base===count)exact+=p*(1-extra);
  if(base+1<count)fewer+=p*extra;
  if(base+1===count)exact+=p*extra;
 }
 return {count,expected,fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function calculateDry(kills,received={},mode="harvest"){
 validateKills(kills);validateMode(mode);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Drop counts are required.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  check(count,kills,item.name);
  if(mode==="destroy"&&item.id!=="nid"&&count>0)
   throw new RangeError("Destroy forfeits all rare rewards except Nid.");
  if(mode==="destroy"&&item.id!=="nid")continue;
  results[item.id]=HALBERD.some(x=>x.id===item.id)
   ?pieceOdds(kills,count):distributionOdds(binomial(kills,rateOf(item.id,mode)),count);
 }
 if(mode==="harvest"){
  const count=DRY_ITEMS.slice(0,4).reduce((s,item)=>s+(received[item.id]??0),0);
  check(count,kills,"Signature count");
  results.anyUnique={...distributionOdds(binomial(kills,1/150),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-1/150))};
 }
 return results;
}

export function calculateCombinedDry(harvestKills,destroyKills,received={}) {
 validateKills(harvestKills);validateKills(destroyKills);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Drop counts are required.");
 const petCount=received["nid"]??0;
 if(!Number.isSafeInteger(petCount)||petCount<0||petCount>harvestKills+destroyKills)throw new RangeError("Pet count exceeds completed kills.");
 const result=calculateDry(harvestKills,{...received,"nid":0},"harvest");
 const p=rateOf("nid","harvest"),q=rateOf("nid","destroy");
 const distribution=convolveDistributions(binomial(harvestKills,p),binomial(destroyKills,q));
 const pet={...distributionOdds(distribution,petCount),atLeastOne:-Math.expm1(harvestKills*Math.log1p(-p)+destroyKills*Math.log1p(-q))};
 result["nid"]=pet;

 return result;
}
