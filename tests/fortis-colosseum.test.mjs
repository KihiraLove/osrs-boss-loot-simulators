import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {UNIQUE,DRY_ITEMS,COMMON,MAX_RUNS,UNIQUE_DENOMS,ITEMS,
 validateRuns,validateWave,uniqueRate,waveRates,ratesUpTo,rateOf,simulate}
 from "../bosses/fortis-colosseum/simulator.mjs";
import {calculateDry} from "../bosses/fortis-colosseum/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<eps,"Expected "+b+", got "+a);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Each Fortis wave has the updated unique rate and its own normal pool",()=>{
 assert.equal(Object.keys(COMMON).length,11);
 assert.equal(UNIQUE.length,7);assert.equal(DRY_ITEMS.length,6);
 for(let wave=1;wave<=12;wave++){
  close(uniqueRate(wave),wave<4?0:1/UNIQUE_DENOMS[wave]);
  if(wave>=2)assert.ok(COMMON[wave].reduce((sum,row)=>sum+row[3],0)>0);
 }
 close(waveRates(4).echo,1/310);
 close(waveRates(7).tonalztics,1/1312);
 close(waveRates(12).echo,1/32);
 close(waveRates(12).tonalztics,1/192);
 close(waveRates(12).armour,9/192);
 assert.equal(ratesUpTo(3).length,0);
});
test("Wave 1 splinters guaranteed, wave 2 has common loot, and no earlier quiver",()=>{
 const one=simulate(1,1,{rng:()=>0});
 assert.equal(one.drops["sunfire-splinters"],80);
 assert.equal(one.drops["dizanas-quiver"],undefined);
 assert.equal(one.drops["echo-crystal"],undefined);
 const two=simulate(1,2,{rng:()=>0});
 assert.equal(two.drops["rune-platebody"],1);
 assert.equal(two.perWave.length,2);
 assert.equal(two.perWave[0].drops["sunfire-splinters"],80);
 const three=simulate(1,3,{rng:()=>0});
 assert.equal(three.drops["rune-platebody"],2);
 assert.deepEqual({...simulate(0,12).drops},{});
});
test("Full 12-wave completion grants quiver and independent pet roll",()=>{
 const x=simulate(1,12,{rng:()=>0});
 assert.equal(x.drops["dizanas-quiver"],1);
 assert.equal(x.drops["smol-heredit"],1);
 assert.equal(x.echoRolls,9);
 assert.equal(x.drops["echo-crystal"],9);
 assert.equal(x.drops["sunfire-splinters"],80);
 assert.equal(x.perWave.length,12);
 const s=simulate(2,12,{rng:()=>0,quiverTrade:"splinters"});
 assert.equal(s.drops["dizanas-quiver"],undefined);
 assert.equal(s.drops["sunfire-splinters"],8160);
});
test("Echo crystal double and triple quantities do not increase unique event count",()=>{
 let phase=0;
 const sequence=[0,0,0,0,0.94];
 const rng=()=>sequence[phase++]??0.99;
 const x=simulate(1,4,{rng});
 assert.equal(x.echoRolls,1);
 assert.equal(x.drops["echo-crystal"],2);
 const triple=[0,0,0,0,0.96];let p=0;
 const y=simulate(1,4,{rng:()=>triple[p++]??0.99});
 assert.equal(y.echoRolls,1);
 assert.equal(y.drops["echo-crystal"],3);
});
test("Armour pieces have set-completion duplicate protection across runs",()=>{
 // Wave 2,3 have one common RNG call each. Waves 4,5,6 then
 // each roll the unique, choose armour and select a missing piece.
 const sequence=[0,0,0,.5,0,0,.5,0,0,.5,0];
 let index=0;
 const x=simulate(2,6,{rng:()=>sequence[(index++)%sequence.length]});
 for(const id of ["sunfire-fanatic-helm","sunfire-fanatic-cuirass","sunfire-fanatic-chausses"])
  assert.equal(x.drops[id],2,id);
 assert.equal(x.drops["echo-crystal"],undefined);
 const d=calculateDry(1,4);
 for(const id of ["sunfire-fanatic-helm","sunfire-fanatic-cuirass","sunfire-fanatic-chausses"])
  close(d[id].expected,(1/124)*.6/3);
});
test("Combined dry probabilities are wave-based, and quiver remains guaranteed",()=>{
 const w4=calculateDry(1,4),w12=calculateDry(1,12);
 close(w4.anyUnique.atLeastOne,1/124);
 close(w4["echo-crystal"].atLeastOne,1/310);
 close(w4["smol-heredit"].atLeastOne,0);
 close(w12["smol-heredit"].atLeastOne,1/200);
 assert.equal(w12.quivers,1);
 assert.equal(w4.quivers,0);
 close(w12.anyUnique.atLeastOne,
  1-(1-1/200)*ratesUpTo(12).reduce((p,x)=>p*(1-x.unique),1));
 assert.ok(w12["echo-crystal"].expected>w4["echo-crystal"].expected);
});
test("Armour drop-protection dry calculator matches 0/1/2 roll conditioning",()=>{
 const d=calculateDry(1,4);
 const p=(1/124)*.6;
 close(d["sunfire-fanatic-helm"].atLeastOne,p/3);
 close(d["sunfire-fanatic-cuirass"].expected,p/3);
 const e=calculateDry(20,12);
 for(const id of ["sunfire-fanatic-helm","sunfire-fanatic-cuirass","sunfire-fanatic-chausses"]){
  close(e[id].expected,e["sunfire-fanatic-helm"].expected);
 }
});
test("Probability normalization for large run counts and 12 waves",()=>{
 for(const runs of [0,1,20,200,10000,MAX_RUNS]){
  const data=calculateDry(runs,12);
  for(const id of [...DRY_ITEMS.map(x=>x.id),"anyUnique"]){
   const x=data[id];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
});
test("Invalid runs, waves, input and impossible reported drops are rejected",()=>{
 for(const runs of [-1,NaN,Infinity,1.5,MAX_RUNS+1]){
  assert.throws(()=>validateRuns(runs));
  assert.throws(()=>simulate(runs));
  assert.throws(()=>calculateDry(runs));
 }
 for(const wave of [0,13,1.5,NaN]){
  assert.throws(()=>validateWave(wave));
  assert.throws(()=>simulate(1,wave));
  assert.throws(()=>calculateDry(1,wave));
 }
 assert.throws(()=>simulate(1,12,{rng:()=>1}));
 assert.throws(()=>simulate(1,12,{quiverTrade:"no"}));
 assert.throws(()=>calculateDry(1,4,{"smol-heredit":1}));
 assert.throws(()=>calculateDry(1,1,{"echo-crystal":1}));
 assert.throws(()=>calculateDry(1,12,{"echo-crystal":10}));
 assert.throws(()=>calculateDry(1,12,null));
});
test("Navigation, controls, README and local item images are present",()=>{
 const html=read("bosses/fortis-colosseum/index.html");
 assert.match(read("index.html"),/href="bosses\/fortis-colosseum\/"/);
 assert.match(read("README.md"),/fortis-colosseum\/README\.md/);
 for(const id of ["run-count","wave-reached","quiver-trade","mode-loot",
  "mode-dry","unique-grid","loot-grid","dry-results-grid","dry-inputs",
  "summary-echo","dry-note","dry-quivers"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(read("bosses/fortis-colosseum/app.mjs"),/calculateDry\(runs,wave/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
