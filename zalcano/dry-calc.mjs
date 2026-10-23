import {UNIQUE,validateKills,parameters} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
function odds(dist,count,p,kills){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const value=dist.from+i;
  if(value<count)fewer+=dist.values[i];
  else if(value===count)exact=dist.values[i];
 }
 return {count,expected:dist.expected,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact),
  atLeastOne:-Math.expm1(kills*Math.log1p(-p))};
}
function convolution(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++)
  for(let j=0;j<b.values.length;j++)
   values[i+j]+=a.values[i]*b.values[j];
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
export function calculateDry(kills,received={},opts={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const p=parameters(opts);
 const rates={"smolcano":p.petRate,"crystal-tool-seed":p.seedRate,
  "zalcano-shard":p.shardRate,"uncut-onyx":p.onyxRate};
 const result={kills,parameters:p};
 let total=0;
 for(const item of UNIQUE){
  const count=received[item.id]??0;
  if(!Number.isSafeInteger(count)||count<0||count>kills)
   throw new RangeError(item.name+" must be between 0 and "+kills+".");
  total+=count;
  result[item.id]=odds(binomial(kills,rates[item.id]),count,rates[item.id],kills);
 }
 if(total>3*kills)throw new RangeError("Too many combined collection-log rewards.");
 // Within any single kill, seed and onyx are mutually exclusive. The
 // combined table event, Zalcano shard, and pet roll independently.
 const dist=convolution(convolution(binomial(kills,p.teamUnique),
  binomial(kills,p.shardRate)),binomial(kills,p.petRate));
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<total)fewer+=dist.values[i];
  else if(n===total)exact=dist.values[i];
 }
 const noDrops=(1-p.teamUnique)*(1-p.shardRate)*(1-p.petRate);
 result.anyUnique={count:total,expected:dist.expected,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact),
  atLeastOne:-Math.expm1(kills*Math.log(noDrops))};
 return result;
}
