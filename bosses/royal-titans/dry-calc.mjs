import { validateDropCount as checkCount, convolveDistributions as convolve, distributionOdds as summary, binomial } from "../../shared/distributions.mjs";
import { MODES, PET, DRY_ITEMS, rateOf, primaryRate, validateKills, validateOptions } from "./simulator.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));

export function calculateDry(soloKills,duoKills,received={},options={}){
 validateKills(soloKills,"Solo KC");validateKills(duoKills,"Duo KC");
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Drop counts must be an object.");
 const opts=validateOptions(options),kills={solo:soloKills,duo:duoKills},total=soloKills+duoKills;
 const modeTitan=id=>id==="solo"?opts.soloTitan:opts.duoTitan;
 function chance(fn,id){return fn(id,modeTitan(id));}
 function mix(fn){
  let dist={from:0,values:Float64Array.of(1),expected:0},logNone=0;
  for(const mode of MODES){
   const p=chance(fn,mode.id),n=kills[mode.id];
   if(!Number.isFinite(p)||p<0||p>1)throw new RangeError("Invalid drop rate.");
   dist=convolve(dist,binomial(n,p));
   logNone+=n*Math.log1p(-p);
  }
  return {dist,atLeastOne:clamp(-Math.expm1(logNone))};
 }
 const results={};let primaryTotal=0;
 for(const item of DRY_ITEMS){
  const receivedCount=received[item.id]??0;
  checkCount(receivedCount,total,item.name);
  const {dist,atLeastOne}=mix((mode,titan)=>rateOf(item.id,mode,titan,opts));
  results[item.id]={...summary(dist,receivedCount),atLeastOne};
  if(item.id!==PET.id)primaryTotal+=receivedCount;
 }
 checkCount(primaryTotal,total,"All primary uniques");
 const main=mix((mode,titan)=>primaryRate(mode,titan,opts));
 results.anyPrimary={...summary(main.dist,primaryTotal),atLeastOne:main.atLeastOne};
 return {soloKills,duoKills,kills:total,options:opts,results,...results};
}
