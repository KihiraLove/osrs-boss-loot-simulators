import { PET, DRY_ITEMS, rateOf, primaryRate, validatePlan, validateOptions } from "./simulator.mjs";
import { mixedBinomial } from "../../shared/encounters.mjs";
import { distributionOdds, validateDropCount } from "../../shared/distributions.mjs";

export function calculateDry(counts,received={},options={}) {
 const plan=validatePlan(counts),opts=validateOptions(options);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Drop counts must be an object.");
 const mix=rate=>mixedBinomial(plan.groups.map(group=>({count:group.count,probability:rate(group)})));
 const results={};let primaryTotal=0;
 for(const item of DRY_ITEMS) {
  const count=received[item.id]??0;
  const probability=group=>rateOf(item.id,group.mode,group.titan,opts);
  const eligible=plan.groups.reduce((sum,group)=>sum+(probability(group)>0?group.count:0),0);
  validateDropCount(count,eligible,item.name);
  const {distribution,atLeastOne}=mix(probability);
  results[item.id]={...distributionOdds(distribution,count),atLeastOne};
  if(item.id!==PET.id)primaryTotal+=count;
 }
 for(const titan of ["branda","eldric"]) {
  const count=DRY_ITEMS.filter(item=>item.titan===titan).reduce((sum,item)=>sum+(received[item.id]??0),0);
  const max=plan.groups.filter(group=>group.titan===titan).reduce((sum,group)=>sum+group.count,0);
  validateDropCount(count,max,"Combined "+titan+" rewards");
 }
 validateDropCount(primaryTotal,opts.action==="loot"?plan.total:0,"All primary uniques");
 const main=mix(group=>primaryRate(group.mode,group.titan,opts));
 results.anyPrimary={...distributionOdds(main.distribution,primaryTotal),atLeastOne:main.atLeastOne};
 return {counts:plan.counts,kills:plan.total,options:opts,...results};
}
