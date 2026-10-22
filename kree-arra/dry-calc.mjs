import {UNIQUE,MAX_KILLS,validateKills} from "./simulator.mjs";
// The four sources are independent, not a binomial with averaged rates:
// total item count = Binomial(kills, boss rate) + Binomial(3*kills, bodyguard rate).
const clamp=x=>Math.max(0,Math.min(1,x));
function binomial(n,p){
 if(!Number.isSafeInteger(n)||n<0||n>3*MAX_KILLS||p<0||p>1)
  throw new RangeError("Invalid binomial parameters.");
 if(n===0||p===0)return {from:0,values:Float64Array.of(1),expected:0};
 if(p===1)return {from:n,values:Float64Array.of(1),expected:n};
 const m=n*p,span=Math.ceil(10*Math.sqrt(n*p*(1-p))+15);
 const from=Math.max(0,Math.floor(m-span)),to=Math.min(n,Math.ceil(m+span));
 const mode=Math.max(from,Math.min(to,Math.floor((n+1)*p)));
 const values=new Float64Array(to-from+1);
 values[mode-from]=1;
 for(let k=mode-1;k>=from;k--)
  values[k-from]=values[k+1-from]*(k+1)/(n-k)*(1-p)/p;
 for(let k=mode+1;k<=to;k++)
  values[k-from]=values[k-1-from]*(n-k+1)/k*p/(1-p);
 let total=0;for(const v of values)total+=v;
 for(let i=0;i<values.length;i++)values[i]/=total;
 return {from,values,expected:m};
}
function convolution(a,b){
 const values=new Float64Array(a.values.length+b.values.length-1);
 for(let i=0;i<a.values.length;i++){
  if(a.values[i]===0)continue;
  for(let j=0;j<b.values.length;j++)values[i+j]+=a.values[i]*b.values[j];
 }
 return {from:a.from+b.from,values,expected:a.expected+b.expected};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drops must be an object.");
 const results={};
 for(const item of UNIQUE){
  const count=received[item.id]??0;
  const max=kills*(item.minion?4:1);
  if(!Number.isSafeInteger(count)||count<0||count>max)
   throw new RangeError(item.name+" must be a whole number between 0 and "+max+".");
  const dist=convolution(binomial(kills,item.boss),binomial(3*kills,item.minion));
  let fewer=0,exact=0;
  for(let i=0;i<dist.values.length;i++){
   const value=dist.from+i;
   if(value<count)fewer+=dist.values[i];
   else if(value===count)exact=dist.values[i];
  }
  results[item.id]={count,expected:dist.expected,
   fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact),
   atLeastOne:-Math.expm1(kills*(Math.log1p(-item.boss)+3*Math.log1p(-item.minion)))};
 }
 return results;
}
