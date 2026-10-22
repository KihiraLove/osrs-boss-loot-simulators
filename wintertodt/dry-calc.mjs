import {DRY_ITEMS,PYRO_IDS,EFFECTIVE_RATES,rateOf,validatePulls} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=p=>Math.min(1,Math.max(0,p));
function check(n,max,label){
 if(!Number.isSafeInteger(n)||n<0||n>max)
  throw new RangeError(label+" must be a whole number between 0 and "+max+".");
}
function summarize(dist,count,transform=n=>n){
 let exact=0,fewer=0,expected=0,atLeastOne=0;
 for(let i=0;i<dist.values.length;i++){
  const n=transform(dist.from+i),p=dist.values[i];
  expected+=n*p;
  if(n<count)fewer+=p;
  else if(n===count)exact+=p;
  if(n>0)atLeastOne+=p;
 }
 return {count,expected,fewer:clamp(fewer),exact:clamp(exact),
  more:clamp(1-fewer-exact),atLeastOne:clamp(atLeastOne)};
}
// A pyromancer piece is awarded to the outfit piece with the least copies.
// With zero starting outfit counts, the piece at offset j is awarded after
// hits j+1, j+5, j+9... (cycle length 4). It isn't a 1/600 binomial roll.
export function pyroPieceOdds(pulls,index,count){
 validatePulls(pulls);
 if(!Number.isInteger(index)||index<0||index>=4)throw new RangeError("Invalid outfit index.");
 check(count,Math.ceil(pulls/4),"Pyromancer piece count");
 const dist=binomial(pulls,EFFECTIVE_RATES["pyromancer-garb"]);
 return summarize(dist,count,hits=>Math.floor(hits/4)+(hits%4>index?1:0));
}
export function cappedOdds(pulls,count,id,max=3){
 validatePulls(pulls);check(count,Math.min(pulls,max),id);
 return summarize(binomial(pulls,rateOf(id)),count,hits=>Math.min(hits,max));
}
export function calculateDry(pulls,received={}){
 validatePulls(pulls);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received rewards must be an object.");
 const results={};
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  const index=PYRO_IDS.indexOf(item.id);
  if(index>=0){results[item.id]=pyroPieceOdds(pulls,index,count);continue;}
  if(item.id==="warm-gloves"||item.id==="bruma-torch"){
   results[item.id]=cappedOdds(pulls,count,item.id);continue;
  }
  check(count,pulls,item.name);
  results[item.id]=summarize(binomial(pulls,rateOf(item.id)),count);
 }
 return results;
}
