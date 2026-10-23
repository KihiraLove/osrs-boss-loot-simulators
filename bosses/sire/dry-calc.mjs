import {REWARDS,BLUDGEON,UNSIRED_RATE,validateKills,validateUnsired} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=p=>Math.max(0,Math.min(1,p));
function validCount(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a non-negative whole number no higher than "+max+".");
}
function odds(dist,count){
 let fewer=0,exact=0;
 for(let j=0;j<dist.values.length;j++){
  const k=dist.from+j;
  if(k<count)fewer+=dist.values[j];
  else if(k===count)exact+=dist.values[j];
 }
 return {count,expected:dist.expected,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
// Pet can occur only once. Conditional on whether that first pet was rolled,
// the other n or n-1 offers use the 123-ticket nonpet reward distribution.
function rewardMix(n,weight){
 const noPet=Math.pow(123/128,n);
 const p=weight/123;
 const a=binomial(n,p);
 const b=binomial(Math.max(0,n-1),p);
 return {noPet,a,b,expected:noPet*a.expected+(1-noPet)*b.expected};
}
function mixedOdds(n,weight,count){
 const mix=rewardMix(n,weight);
 const oa=odds(mix.a,count),ob=odds(mix.b,count);
 const p=mix.noPet;
 return {count,expected:mix.expected,
  fewer:clamp(p*oa.fewer+(1-p)*ob.fewer),
  exact:clamp(p*oa.exact+(1-p)*ob.exact),
  more:clamp(p*oa.more+(1-p)*ob.more)};
}
// Given B bludgeon outcomes, each named piece appears floor(B/3) times
// plus a Bernoulli((B % 3)/3) for the incomplete set.
function pieceOdds(n,count){
 const mix=rewardMix(n,62);
 let fewer=0,exact=0,expected=0;
 for(const [distribution,mass] of [[mix.a,mix.noPet],[mix.b,1-mix.noPet]]){
  for(let j=0;j<distribution.values.length;j++){
   const b=distribution.from+j,base=Math.floor(b/3),fraction=(b%3)/3;
   const w=mass*distribution.values[j];
   expected+=w*(base+fraction);
   if(base<count)fewer+=w*(1-fraction);
   if(base===count)exact+=w*(1-fraction);
   if(base+1<count)fewer+=w*fraction;
   if(base+1===count)exact+=w*fraction;
  }
 }
 return {count,expected,fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
// Unsired rarity and Font reward rarity use distinct trial counts.
// No "any reward" summary: every Unsired is guaranteed a reward.
export function calculateDry(kills,unsiredCount,received={}){
 validateKills(kills);
 validateUnsired(unsiredCount);
 validCount(unsiredCount,kills,"Unsired drops");
 if(received===null||typeof received!=="object")
  throw new TypeError("Reward counts are required.");
 const result={unsired:odds(binomial(kills,UNSIRED_RATE),unsiredCount)};
 let total=0;
 const petChance=-Math.expm1(unsiredCount*Math.log(123/128));
 for(const item of REWARDS){
  const count=received[item.id]??0;
  validCount(count,item.id==="abyssal-orphan"?1:unsiredCount,item.name);
  total+=count;
  if(item.id==="abyssal-orphan"){
   result[item.id]={count,expected:petChance,
    fewer:count===0?0:1-petChance,
    exact:count===0?1-petChance:petChance,
    more:count===0?petChance:0};
  }else if(item.group==="bludgeon"){
   result[item.id]=pieceOdds(unsiredCount,count);
  }else{
   result[item.id]=mixedOdds(unsiredCount,item.weight,count);
  }
 }
 if(total>unsiredCount)throw new RangeError("Reward counts cannot exceed the number of Unsireds.");
 return result;
}
