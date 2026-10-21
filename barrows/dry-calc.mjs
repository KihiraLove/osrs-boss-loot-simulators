import {MAX_CHESTS,ROLLS,UNIQUE_RATE,SPECIFIC_RATE,UNIQUE,validateChests} from "./simulator.mjs";
// Bounded exact recurrence about the binomial mode: handles up to
// seven million independent equipment-roll trials without allocating
// a full distribution or underflowing extreme lower-tail probabilities.
function binomial(n,p){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_CHESTS*ROLLS)
  throw new RangeError("Invalid number of Barrows rolls.");
 if(p<0||p>1||!Number.isFinite(p))throw new RangeError("Invalid drop rate.");
 if(n===0||p===0)return {from:0,values:Float64Array.of(1),expected:0};
 if(p===1)return {from:n,values:Float64Array.of(1),expected:n};
 const expected=n*p;
 const radius=Math.ceil(10*Math.sqrt(n*p*(1-p))+15);
 const from=Math.max(0,Math.floor(expected-radius));
 const to=Math.min(n,Math.ceil(expected+radius));
 const mode=Math.max(from,Math.min(to,Math.floor((n+1)*p)));
 const values=new Float64Array(to-from+1);
 values[mode-from]=1;
 for(let k=mode-1;k>=from;k--)
  values[k-from]=values[k+1-from]*(k+1)/(n-k)*(1-p)/p;
 for(let k=mode+1;k<=to;k++)
  values[k-from]=values[k-1-from]*(n-k+1)/k*p/(1-p);
 const total=values.reduce((s,x)=>s+x,0);
 for(let i=0;i<values.length;i++)values[i]/=total;
 return {from,values,expected};
}
function stats(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  if(n===count)exact+=dist.values[i];
 }
 const clamp=x=>Math.max(0,Math.min(1,x));
 return {count,expected:dist.expected,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}

// Distribution of the number of distinct pieces given seven equipment
// attempts. Each successful roll chooses one of 24 items uniformly and
// a duplicate selection is discarded. This matches the Wiki's exact
// approximately 1/350.14 marginal chance for a named piece.
export const CHEST_PMF=(()=>{
 let values=Float64Array.of(1);
 for(let trial=0;trial<ROLLS;trial++){
  const next=new Float64Array(values.length+1);
  for(let obtained=0;obtained<values.length;obtained++){
   const newPiece=UNIQUE_RATE*(24-obtained)/24;
   next[obtained]+=values[obtained]*(1-newPiece);
   next[obtained+1]+=values[obtained]*newPiece;
  }
  values=next;
 }
 return values;
})();
export const EQUIPMENT_PER_CHEST=CHEST_PMF.reduce((s,p,k)=>s+k*p,0);
function exactAcrossChests(chests){
 let dist=Float64Array.of(1);
 for(let chest=0;chest<chests;chest++){
  const next=new Float64Array(dist.length+ROLLS);
  for(let i=0;i<dist.length;i++){
   const value=dist[i];
   if(value===0)continue;
   for(let k=0;k<CHEST_PMF.length;k++)next[i+k]+=value*CHEST_PMF[k];
  }
  dist=next;
 }
 return {from:0,values:dist,expected:chests*EQUIPMENT_PER_CHEST};
}
export function anyEquipment(chests,count){
 validateChests(chests);
 if(!Number.isSafeInteger(count)||count<0||count>chests*ROLLS)
  throw new RangeError("Total equipment count exceeds the possible seven rewards per chest.");
 // Exact chest-level convolution is practical for 1,000 chests. For
 // larger samples use a binomial approximation matched to its expected
 // number of *distinct awarded pieces*, rather than raw successful rolls.
 const distribution=chests<=1000
  ?exactAcrossChests(chests)
  :binomial(chests*ROLLS,EQUIPMENT_PER_CHEST/ROLLS);
 const result=stats(distribution,count);
 result.expected=chests*EQUIPMENT_PER_CHEST;
 result.atLeastOne=-Math.expm1(chests*ROLLS*Math.log1p(-UNIQUE_RATE));
 if(count===0){
  result.exact=Math.exp(chests*ROLLS*Math.log1p(-UNIQUE_RATE));
  result.fewer=0;result.more=Math.max(0,1-result.exact);
 }
 return result;
}
export function calculateDry(chests,received={}){
 validateChests(chests);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Observed item counts are required.");
 const results={};let combined=0;
 for(const item of UNIQUE){
  const count=received[item.id]??0;
  if(!Number.isSafeInteger(count)||count<0||count>chests)
   throw new RangeError(item.name+" must be between 0 and the number of chests; duplicate items cannot appear within one chest.");
  combined+=count;
  // Each roll independently selects a named piece with probability
  // 1/(102*24), but repeats within a chest are not awarded.
  // Thus each item has one Bernoulli trial per chest with probability
  // 1 - (1 - 1/2448)^7.
  results[item.id]=stats(binomial(chests,SPECIFIC_RATE),count);
 }
 results.anyUnique=anyEquipment(chests,combined);
 return results;
}
