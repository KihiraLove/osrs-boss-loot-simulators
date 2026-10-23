import { DRY_ITEMS, validatePlan, waveRates } from "./simulator.mjs";
import { mixedBinomial } from "../../shared/encounters.mjs";
import { distributionOdds, validateDropCount } from "../../shared/distributions.mjs";

function armourPieceDistribution(total){
 // One piece of each armour set is given before duplicates; conditional on
 // t total armour rolls, any specific item is floor(t/3) + Bernoulli(t%3 /3).
 const buckets=new Map();
 for(let i=0;i<total.values.length;i++){
  const t=total.from+i,p=total.values[i];
  if(!p)continue;
  const k=Math.floor(t/3),extra=(t%3)/3;
  buckets.set(k,(buckets.get(k)??0)+p*(1-extra));
  if(extra)buckets.set(k+1,(buckets.get(k+1)??0)+p*extra);
 }
 const from=Math.min(...buckets.keys()),to=Math.max(...buckets.keys());
 const values=new Float64Array(to-from+1);
 for(const [k,p] of buckets)values[k-from]=p;
 return {from,values,expected:total.expected/3};
}

function describe(distribution, count, atLeastOne) {
 const zero = distribution.from === 0 ? distribution.values[0] : 0;
 return {...distributionOdds(distribution,count),atLeastOne:atLeastOne ?? Math.max(0,Math.min(1,1-zero))};
}
export function calculateDry(counts,received={}) {
 const plan=validatePlan(counts);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Received drop counts must be an object.");
 const rates=plan.groups.map(group=>({...group,...waveRates(group.wave)}));
 const mix=key=>mixedBinomial(rates.map(group=>({count:group.count,probability:group[key]})));
 const echo=mix("echo"),armour=mix("armour"),tonal=mix("tonalztics");
 const piece=armourPieceDistribution(armour.distribution);
 const pet=mixedBinomial([{count:plan.counts[12],probability:1/200}]);
 const byId={"echo-crystal":echo,"sunfire-fanatic-helm":{distribution:piece},
  "sunfire-fanatic-cuirass":{distribution:piece},"sunfire-fanatic-chausses":{distribution:piece},
  "tonalztics-of-ralos-uncharged":tonal,"smol-heredit":pet};
 const primaryTrials=rates.filter(group=>group.wave>=4).reduce((sum,group)=>sum+group.count,0);
 const tonalTrials=rates.filter(group=>group.wave>=7).reduce((sum,group)=>sum+group.count,0);
 const result={counts:plan.counts,waveClears:plan.total,quivers:plan.counts[12]};
 let total=0;
 for(const item of DRY_ITEMS) {
  const count=received[item.id]??0;
  const max=item.id==="smol-heredit"?plan.counts[12]:item.id==="tonalztics-of-ralos-uncharged"?tonalTrials:
   item.id.startsWith("sunfire-fanatic-")?Math.ceil(primaryTrials/3):primaryTrials;
  validateDropCount(count,max,item.dryName??item.name);
  total+=count;
  result[item.id]=describe(byId[item.id].distribution,count,byId[item.id].atLeastOne);
 }
 const primaryCount=total-(received["smol-heredit"]??0);
 validateDropCount(primaryCount,primaryTrials,"Primary unique rewards");
 const any=mixedBinomial([...rates.map(group=>({count:group.count,probability:group.unique})),{count:plan.counts[12],probability:1/200}]);
 result.anyUnique=describe(any.distribution,total,any.atLeastOne);
 return result;
}
