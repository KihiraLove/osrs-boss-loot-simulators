import {KINGS,UNIQUE,ANY_MAIN_UNIQUE_RATE,PET_RATE,validateKills} from "./simulator.mjs";
import {binomial} from "../phosani/dry-calc.mjs";
const clamp=n=>Math.min(1,Math.max(0,n));
function check(n,max,name){if(!Number.isSafeInteger(n)||n<0||n>max)throw new RangeError(name+" must be between 0 and "+max+".");}
function summary(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){const n=dist.from+i;if(n<count)fewer+=dist.values[i];else if(n===count)exact+=dist.values[i];}
 return {count,expected:dist.expected,fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact)};
}
function convolve(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++)for(let j=0;j<b.values.length;j++)values[i+j]+=a.values[i]*b.values[j];
 return {values,from:a.from+b.from,expected:a.expected+b.expected};
}
const atLeast=(n,p)=>-Math.expm1(n*Math.log1p(-p));
export function calculateDry(killCounts,received={}){
 const counts=validateKills(killCounts);
 if(!received||typeof received!=="object"||Array.isArray(received))throw new TypeError("Drop counts must be an object.");
 const result={};
 for(const king of KINGS){
  const n=counts[king.id],got=received[king.id]??{};
  if(!got||typeof got!=="object"||Array.isArray(got))throw new TypeError("Drops for "+king.name+" must be an object.");
  const resultKing={};
  for(const item of UNIQUE[king.id]){
   const count=got[item.id]??0;check(count,n,item.name);
   resultKing[item.id]={...summary(binomial(n,item.rate),count),atLeastOne:atLeast(n,item.rate)};
  }
  const main=UNIQUE[king.id].slice(0,3).reduce((s,item)=>s+(got[item.id]??0),0);
  check(main,n,"Total "+king.name+" main uniques");
  const total=main+(got["pet-dagannoth-"+king.id]??0);
  check(total,2*n,"Total "+king.name+" rares");
  resultKing.anyUnique={
   ...summary(convolve(binomial(n,ANY_MAIN_UNIQUE_RATE),binomial(n,PET_RATE)),total),
   atLeastOne:1-(1-atLeast(n,ANY_MAIN_UNIQUE_RATE))*(1-atLeast(n,PET_RATE))
  };
  result[king.id]=resultKing;
 }
 return result;
}
