import { distributionOdds as stats, validateDropCount as checkCount, binomial } from "../../shared/distributions.mjs";
import { DRY_IDS, RING_IDS, TERTIARY, validateKills, preRollRates } from "./simulator.mjs";

const sig=new Set(["hydras-claw","hydra-tail","hydra-leather","ring-piece"]);
export const SIGNATURE_CHANCE=Object.entries(preRollRates())
 .filter(([id])=>sig.has(id)).reduce((s,[,p])=>s+p,0);

// Ring fragments are not independent! They cycle eye -> fang -> heart.
// Every completed three-piece cycle awards one of each.
export function ringCountFromHits(totalHits,id){
 if(id==="hydras-eye")return Math.floor((totalHits+2)/3);
 if(id==="hydras-fang")return Math.floor((totalHits+1)/3);
 if(id==="hydras-heart")return Math.floor(totalHits/3);
 throw new RangeError("Unrecognized ring piece.");
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object")throw new TypeError("Drop counts are required.");
 const probability=preRollRates();
 const result={};
 const ringDist=binomial(kills,probability["ring-piece"]);
 for(const id of DRY_IDS){
  const count=received[id]??0;
  const max=RING_IDS.includes(id)?ringCountFromHits(kills,id):kills;
  checkCount(count,max);
  if(RING_IDS.includes(id)){
   result[id]=stats(ringDist,count,hits=>ringCountFromHits(hits,id));
  }else{
   const p=probability[id]??TERTIARY.find(([name])=>name===id)?.[1];
   result[id]=stats(binomial(kills,p),count);
  }
 }
 const signatureCount=["hydras-claw","hydra-tail","hydra-leather",...RING_IDS]
   .reduce((sum,id)=>sum+(received[id]??0),0);
 checkCount(signatureCount,kills);
 const summary=stats(binomial(kills,SIGNATURE_CHANCE),signatureCount);
 result.anyUnique={...summary,atLeastOne:-Math.expm1(kills*Math.log1p(-SIGNATURE_CHANCE))};
 return result;
}
