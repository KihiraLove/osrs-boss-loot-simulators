import {UNIQUE,MOON_RATE,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
function validCount(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number between 0 and "+max+".");
}
function stats(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i,p=dist.values[i];
  if(n<count)fewer+=p;
  else if(n===count)exact+=p;
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
// The shared binomial utility limits n to 1m kills. All three moons
// contribute a total of 3*n independent chances, potentially >1m.
function totalUniqueDistribution(kills){
 const n=3*kills,p=MOON_RATE;
 if(n===0)return {from:0,values:Float64Array.of(1),expected:0};
 const mean=n*p, radius=Math.ceil(10*Math.sqrt(n*p*(1-p))+15);
 const from=Math.max(0,Math.floor(mean-radius)),to=Math.min(n,Math.ceil(mean+radius));
 const mode=Math.max(from,Math.min(to,Math.floor((n+1)*p)));
 const values=new Float64Array(to-from+1);values[mode-from]=1;
 for(let k=mode-1;k>=from;k--)
  values[k-from]=values[k+1-from]*(k+1)/(n-k)*(1-p)/p;
 for(let k=mode+1;k<=to;k++)
  values[k-from]=values[k-1-from]*(n-k+1)/k*p/(1-p);
 let total=0;
 for(const v of values)total+=v;
 for(let i=0;i<values.length;i++)values[i]/=total;
 return {from,values,expected:mean};
}
// Before any set is completed, its unique hits form a random permutation
// of four distinct pieces; subsequently each hit chooses among all four.
// Given H hits on this moon:
// H<4: P(named piece=1)=H/4, P(0)=1-H/4.
// H>=4: named count is 1+Binomial(H-4,1/4).
// We mix over H~Binomial(kills,1/56), unlike an incorrect simple
// Binomial(kills,1/224) treatment.
export function pieceOdds(kills,count){
 validateKills(kills);validCount(count,kills,"Item count");
 const hits=binomial(kills,MOON_RATE);
 let fewer=0,exact=0,atLeastOne=0;
 for(let i=0;i<hits.values.length;i++){
  const h=hits.from+i,prob=hits.values[i];
  if(h<4){
   const success=h/4;
   if(count>0)fewer+=prob*(1-success);
   else exact+=prob*(1-success);
   if(count>1)fewer+=prob*success;
   else if(count===1)exact+=prob*success;
   atLeastOne+=prob*success;
  }else{
   atLeastOne+=prob;
   if(count===0)continue;
   const dist=binomial(h-4,1/4),conditional=stats(dist,count-1);
   fewer+=prob*conditional.fewer;
   exact+=prob*conditional.exact;
  }
 }
 return {count,expected:kills*MOON_RATE/4,
  fewer:clamp(fewer),exact:clamp(exact),
  more:clamp(1-fewer-exact),atLeastOne:clamp(atLeastOne)};
}
export function completionChance(kills){
 validateKills(kills);
 const hits=binomial(kills,MOON_RATE);
 let completeSet=0;
 for(let i=0;i<hits.values.length;i++)
  if(hits.from+i>=4)completeSet+=hits.values[i];
 const each=clamp(completeSet);
 return each*each*each;
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Obtained drop counts must be an object.");
 const result={};
 let total=0;
 for(const item of UNIQUE){
  const count=received[item.id]??0;
  validCount(count,kills,item.name);
  total+=count;
  result[item.id]=pieceOdds(kills,count);
 }
 validCount(total,kills*3,"Total unique items");
 const any=stats(totalUniqueDistribution(kills),total);
 result.anyUnique={...any,atLeastOne:-Math.expm1(3*kills*Math.log1p(-MOON_RATE))};
 result.completionChance=completionChance(kills);
 return result;
}
