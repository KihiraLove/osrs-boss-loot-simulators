import { DRY_ITEMS, validateRuns, validateWave, ratesUpTo } from "./simulator.mjs";
import { convolveDistributions as convolve, binomial } from "../../shared/distributions.mjs";
const clamp=x=>Math.max(0,Math.min(1,x));

const point=()=>({from:0,values:Float64Array.of(1),expected:0});
function sumBinomials(runs,probs){
 let out=point();
 for(const p of probs)if(p>0)out=convolve(out,binomial(runs,p));
 return out;
}
function armourPieceDistribution(total){
 // One piece of each armour set is given before duplicates; conditional on
 // t total armour rolls, any specific item is floor(t/3) + Bernoulli(t%3 /3).
 const buckets=new Map();
 for(let i=0;i<total.values.length;i++){
  const t=total.from+i,p=total.values[i];
  if(!p)continue;
  const k=Math.floor(t/3),extra=(t%3)/3;
  buckets.set(k,(buckets.get(k)??0)+p*(1-extra));
  if(extra)buckets.set(k+1,(buckets.get(k+1)??0)+p*extra);
 }
 const from=Math.min(...buckets.keys()),to=Math.max(...buckets.keys());
 const values=new Float64Array(to-from+1);
 for(const [k,p] of buckets)values[k-from]=p;
 return {from,values,expected:total.expected/3};
}
function describe(dist,count,atLeastOneOverride){
 let fewer=0,exact=0;
 for(let i=0;i<dist.values.length;i++){
  const k=dist.from+i;
  if(k<count)fewer+=dist.values[i];
  else if(k===count)exact=dist.values[i];
 }
 let zero=0;
 if(dist.from<=0&&0<dist.from+dist.values.length)zero=dist.values[-dist.from];
 return {count,expected:dist.expected,
  fewer:clamp(fewer),exact:clamp(exact),more:clamp(1-fewer-exact),
  atLeastOne:atLeastOneOverride??clamp(1-zero)};
}
export function calculateDry(runs,wave=12,received={}){
 validateRuns(runs);validateWave(wave);
 if(!received||typeof received!=="object"||Array.isArray(received))
  throw new TypeError("Received drop counts must be an object.");
 const rates=ratesUpTo(wave),result={runs,wave};
 const echo=sumBinomials(runs,rates.map(x=>x.echo));
 const armour=sumBinomials(runs,rates.map(x=>x.armour));
 const piece=armourPieceDistribution(armour);
 const tonal=sumBinomials(runs,rates.map(x=>x.tonalztics));
 const pet=binomial(wave===12?runs:0,1/200);
 const byId={
  "echo-crystal":echo,"sunfire-fanatic-helm":piece,
  "sunfire-fanatic-cuirass":piece,"sunfire-fanatic-chausses":piece,
  "tonalztics-of-ralos-uncharged":tonal,"smol-heredit":pet
 };
 let total=0;
 for(const item of DRY_ITEMS){
  const count=received[item.id]??0;
  const max=item.id==="smol-heredit"?(wave===12?runs:0):
   item.id==="tonalztics-of-ralos-uncharged"?runs*rates.filter(x=>x.wave>=7).length:
   item.id.startsWith("sunfire-fanatic-")?Math.ceil(runs*rates.length/3):runs*rates.length;
  if(!Number.isSafeInteger(count)||count<0||count>max)
   throw new RangeError((item.dryName??item.name)+" must be between 0 and "+max+".");
  total+=count;
  result[item.id]=describe(byId[item.id],count);
 }
 if(total>runs*(rates.length+(wave===12?1:0)))
  throw new RangeError("Combined unique rewards exceed possible reward rolls.");
 const any=sumBinomials(runs,[...rates.map(x=>x.unique),...(wave===12?[1/200]:[])]);
 result.anyUnique=describe(any,total);
 // Quiver is a guarantee, so its dry chance is always 100% after wave 12.
 result.quivers=wave===12?runs:0;
 return result;
}
