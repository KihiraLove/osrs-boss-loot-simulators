import { UNIQUE, validatePlan, parameters, rateOf } from "./simulator.mjs";
import { mixedBinomial } from "../../shared/encounters.mjs";
import { distributionOdds, validateDropCount } from "../../shared/distributions.mjs";

export function calculateDry(counts,received={}) {
 const plan=validatePlan(counts);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Received drops must be an object.");
 const results={counts:plan.counts,kills:plan.total};
 let total=0;
 for(const item of UNIQUE) {
  const count=received[item.id]??0;
  validateDropCount(count,plan.total,item.name);total+=count;
  const mix=mixedBinomial(plan.groups.map(group=>({count:group.count,probability:rateOf(item.id,group.id)})));
  results[item.id]={...distributionOdds(mix.distribution,count),atLeastOne:mix.atLeastOne};
 }
 validateDropCount((received["crystal-tool-seed"]??0)+(received["uncut-onyx"]??0),plan.total,"Tool seeds and onyx");
 validateDropCount(total,3*plan.total,"Combined collection-log rewards");
 const groups=plan.groups.flatMap(group=>{
  const p=parameters(group.id);
  return [p.teamUnique,p.shardRate,p.petRate].map(probability=>({count:group.count,probability}));
 });
 const mix=mixedBinomial(groups);
 results.anyUnique={...distributionOdds(mix.distribution,total),atLeastOne:mix.atLeastOne};
 return results;
}
