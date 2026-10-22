import {MAX_KILLS,PRIMARY,PRIMARY_RATE,DRY_ITEMS,validateKills,rateOf} from "./simulator.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));
function checkCount(value,max,label){
 if(!Number.isSafeInteger(value)||value<0||value>max)
  throw new RangeError(label+" received must be a whole number from 0 to "+max+".");
}
// Stable mode-centered Binomial PMF. Grotesque Guardians roll loot twice,
// so this supports 2,000,000 rolls at 1,000,000 completed kills.
export function binomial(n,p){
 if(!Number.isSafeInteger(n)||n<0||n>2*MAX_KILLS||!(p>=0&&p<=1))
  throw new RangeError("Invalid binomial parameters.");
 if(n===0||p===0)return {from:0,values:Float64Array.of(1),expected:0};
 if(p===1)return {from:n,values:Float64Array.of(1),expected:n};
 const mu=n*p,radius=Math.ceil(10*Math.sqrt(n*p*(1-p))+15);
 const from=Math.max(0,Math.floor(mu-radius)),to=Math.min(n,Math.ceil(mu+radius));
 const mode=Math.max(from,Math.min(to,Math.floor((n+1)*p)));
 const values=new Float64Array(to-from+1);
 values[mode-from]=1;
 for(let k=mode-1;k>=from;k--)
  values[k-from]=values[k+1-from]*(k+1)/(n-k)*(1-p)/p;
 for(let k=mode+1;k<=to;k++)
  values[k-from]=values[k-1-from]*(n-k+1)/k*p/(1-p);
 let mass=0;for(const x of values)mass+=x;
 for(let i=0;i<values.length;i++)values[i]/=mass;
 return {from,values,expected:mu};
}
function odds(dist,count){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const n=dist.from+i;
  if(n<count)fewer+=dist.values[i];
  else if(n===count)exact+=dist.values[i];
 }
 return {count,expected:dist.expected,fewer:clamp(fewer),
  exact:clamp(exact),more:clamp(1-fewer-exact)};
}
export function calculateDry(kills,received={}){
 validateKills(kills);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received unique counts must be an object.");
 const result={},rolls=2*kills;
 let primaryCount=0;
 for(const item of DRY_ITEMS){
  const doubleRoll=PRIMARY.some(x=>x.id===item.id)||item.id==="adamant-boots";
  const trials=doubleRoll?rolls:kills;
  const count=received[item.id]??0;
  checkCount(count,trials,item.name);
  const p=rateOf(item.id);
  result[item.id]={...odds(binomial(trials,p),count),
   atLeastOne:-Math.expm1(trials*Math.log1p(-p))};
  if(PRIMARY.some(x=>x.id===item.id))primaryCount+=count;
 }
 checkCount(primaryCount,rolls,"Combined primary uniques");
 result.anyPrimary={
  ...odds(binomial(rolls,PRIMARY_RATE),primaryCount),
  atLeastOne:-Math.expm1(rolls*Math.log1p(-PRIMARY_RATE))
 };
 return result;
}
