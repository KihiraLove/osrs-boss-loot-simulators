import {KINGS,UNIQUE,ANY_MAIN_UNIQUE_RATE,PET_RATE,validateKills} from "./simulator.mjs";
import { validateDropCount as check, distributionOdds as summary, convolveDistributions as convolve, binomial } from "../../shared/distributions.mjs";

const atLeast=(n,p)=>-Math.expm1(n*Math.log1p(-p));
export function calculateDry(killCounts,received={}){
 const counts=validateKills(killCounts);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Drop counts must be an object.");
 const result={};
 for(const king of KINGS){
  const n=counts[king.id],got=received[king.id]??{};
  if(!got||typeof got!=="object"||Array.isArray(got))throw new TypeError("Drops for "+king.name+" must be an object.");
  const resultKing={};
  for(const item of UNIQUE[king.id]){
   const count=got[item.id]??0;check(count,n,item.name);
   resultKing[item.id]={...summary(binomial(n,item.rate),count),atLeastOne:atLeast(n,item.rate)};
  }
  const main=UNIQUE[king.id].slice(0,3).reduce((s,item)=>s+(got[item.id]??0),0);
  check(main,n,"Total "+king.name+" main uniques");
  const total=main+(got["pet-dagannoth-"+king.id]??0);
  check(total,2*n,"Total "+king.name+" rares");
  resultKing.anyUnique={
   ...summary(convolve(binomial(n,ANY_MAIN_UNIQUE_RATE),binomial(n,PET_RATE)),total),
   atLeastOne:1-(1-atLeast(n,ANY_MAIN_UNIQUE_RATE))*(1-atLeast(n,PET_RATE))
  };
  result[king.id]=resultKing;
 }
 return result;
}
