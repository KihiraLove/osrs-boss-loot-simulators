import {DRY_ITEMS,ANY_SHARD_CHANCE,validateKills} from "./simulator.mjs";
import { distributionOdds as odds, binomial } from "../../shared/distributions.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));
function valid(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number from 0 to "+max+".");
}

// A shard excludes ordinary loot, including the Dragon 2h sword,
// and the offspring pet roll. On non-shard kills, ordinary loot and
// the pet can BOTH happen: 0, 1, or 2 collection-log drops per kill.
export const COLLECTION_LOG_PER_KILL=Object.freeze((()=>{
 const shard=ANY_SHARD_CHANCE,nonShard=1-shard,dragon=1/128,pet=1/2000;
 const p0=nonShard*(1-dragon)*(1-pet);
 const p2=nonShard*dragon*pet;
 const p1=1-p0-p2;
 return {p0,p1,p2};
})());
export function collectionLogOdds(kills,count){
 validateKills(kills);valid(count,kills*2,"Total collection-log drops");
 const {p0,p1,p2}=COLLECTION_LOG_PER_KILL;
 // D is the number of double-reward kills, S the number of single-
 // reward kills from the other kills. T=2D+S. The conditional form
 // avoids O(kills^2) dynamic programming and is exact up to the
 // binomial helper's negligible numerical tail truncation.
 const doubles=binomial(kills,p2),conditional=p1/(1-p2);
 let fewer=0,exact=0;
 for(let i=0;i<doubles.values.length;i++){
  const d=doubles.from+i,mass=doubles.values[i];
  if(!mass)continue;
  const singles=binomial(kills-d,conditional);
  const target=count-2*d;
  let f=0,e=0;
  for(let j=0;j<singles.values.length;j++){
   const s=singles.from+j;
   if(s<target)f+=singles.values[j];
   else if(s===target)e+=singles.values[j];
  }
  fewer+=mass*f;exact+=mass*e;
 }
 return {count,expected:kills*(p1+2*p2),
  atLeastOne:-Math.expm1(kills*Math.log(p0)),
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  valid(count,kills,item.name);
  results[item.id]={
   ...odds(binomial(kills,item.rate),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))
  };
 }
 const shards=(received["odium-shard-3"]??0)+(received["malediction-shard-3"]??0);
 valid(shards,kills,"Total ward shards");
 const otherPrimary=shards+(received["dragon-2h-sword"]??0);
 valid(otherPrimary,kills,"Ward shards and Dragon 2h swords");
 const pet=received["scorpias-offspring"]??0;
 valid(shards+pet,kills,"Ward shards and Scorpia's offspring");
 const shardDist=binomial(kills,ANY_SHARD_CHANCE);
 results.anyShard={
  ...odds(shardDist,shards),
  atLeastOne:-Math.expm1(kills*Math.log1p(-ANY_SHARD_CHANCE))
 };
 results.anyUnique=collectionLogOdds(kills,otherPrimary+pet);
 return results;
}
