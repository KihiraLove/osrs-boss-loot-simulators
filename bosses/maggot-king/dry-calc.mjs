import {convolveDistributions,distributionOdds} from "../../shared/distributions.mjs";
import {DRY_ITEMS,rateOf,validateKills,validateMode} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
function checkCount(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" received must be a whole number between 0 and "+max+".");
}

function atLeastOne(n,p){return -Math.expm1(n*Math.log1p(-p));}
export function calculateDry(kills,received={},mode="stomach"){
 validateKills(kills);validateMode(mode);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  const p=rateOf(item.id,mode);
  const max=p===0?0:kills;
  checkCount(count,max,item.name);
  results[item.id]={...distributionOdds(binomial(kills,p),count),atLeastOne:atLeastOne(kills,p)};
 }
 if(mode==="stomach"){
  const count=(received["elder-venator-fang"]??0)+(received["crimson-kisten"]??0);
  checkCount(count,kills,"Either weapon unique");
  const p=rateOf("elder-venator-fang")+rateOf("crimson-kisten");
  results.anyWeapon={...distributionOdds(binomial(kills,p),count),atLeastOne:atLeastOne(kills,p)};
 }
 return {kills,mode,results,...results};
}

export function calculateCombinedDry(stomachKills,eggsKills,received={}) {
 validateKills(stomachKills);validateKills(eggsKills);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Drop counts are required.");
 const petCount=received["maggot-marquess"]??0;
 if(!Number.isSafeInteger(petCount)||petCount<0||petCount>stomachKills+eggsKills)throw new RangeError("Pet count exceeds completed kills.");
 const result=calculateDry(stomachKills,{...received,"maggot-marquess":0},"stomach");
 const p=rateOf("maggot-marquess","stomach"),q=rateOf("maggot-marquess","eggs");
 const distribution=convolveDistributions(binomial(stomachKills,p),binomial(eggsKills,q));
 const pet={...distributionOdds(distribution,petCount),atLeastOne:-Math.expm1(stomachKills*Math.log1p(-p)+eggsKills*Math.log1p(-q))};
 result["maggot-marquess"]=pet;
 result.results["maggot-marquess"]=pet;result.kills=stomachKills+eggsKills;result.mode="combined";
 return result;
}
