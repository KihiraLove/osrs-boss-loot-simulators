import {
 DRY_ITEMS,validateKills,SIGIL_CHANCE,SPIRIT_CHANCE,ELIXIR_CHANCE,JAR_CHANCE,PET_CHANCE
} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
function check(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number from 0 to "+max+".");
}
function summarize(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  else if(n===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
function convolve(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++)
  if(a.values[i]!==0)for(let j=0;j<b.values.length;j++)
   values[i+j]+=a.values[i]*b.values[j];
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received item counts must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  check(count,kills,item.name);
  results[item.id]={
   ...summarize(binomial(kills,item.rate),count),
   atLeastOne:-Math.expm1(kills*Math.log1p(-item.rate))
  };
 }
 const sigils=(received["elysian-sigil"]??0)+(received["spectral-sigil"]??0)+(received["arcane-sigil"]??0);
 const main=(received["spirit-shield"]??0)+(received["holy-elixir"]??0);
 const jar=received["jar-of-spirits"]??0,pet=received["pet-dark-core"]??0;
 check(sigils,kills,"Combined sigils");
 check(main,kills,"Spirit shields and holy elixirs");
 check(sigils+main+jar+pet,kills*4,"Combined rare items");
 // Exclusive sigils, exclusive shield/elixir main-table rolls,
 // independent jar and pet rolls. The four groups may co-occur.
 let distribution=binomial(kills,SIGIL_CHANCE);
 for(const rate of [SPIRIT_CHANCE+ELIXIR_CHANCE,JAR_CHANCE,PET_CHANCE])
  distribution=convolve(distribution,binomial(kills,rate));
 results.anyUnique={
  ...summarize(distribution,sigils+main+jar+pet),
  atLeastOne:-Math.expm1(kills*(
   Math.log1p(-SIGIL_CHANCE)+Math.log1p(-SPIRIT_CHANCE-ELIXIR_CHANCE)+
   Math.log1p(-JAR_CHANCE)+Math.log1p(-PET_CHANCE)
  ))
 };
 return results;
}
