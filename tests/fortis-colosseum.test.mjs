import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {WAVES,UNIQUE,DRY_ITEMS,COMMON,MAX_WAVE_CLEARS,UNIQUE_DENOMS,ITEMS,validatePlan,uniqueRate,waveRates,simulate} from "../bosses/fortis-colosseum/simulator.mjs";
import {calculateDry} from "../bosses/fortis-colosseum/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<eps,a+" != "+b);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Fortis retains each wave's unique rate and ordinary reward pool",()=>{
 assert.equal(WAVES.length,12);assert.equal(UNIQUE.length,7);assert.equal(DRY_ITEMS.length,6);
 for(const {wave} of WAVES){close(uniqueRate(wave),wave<4?0:1/UNIQUE_DENOMS[wave]);if(wave>=2)assert.ok(COMMON[wave].length);}
 close(waveRates(4).echo,1/310);close(waveRates(12).echo,1/32);close(waveRates(12).tonalztics,1/192);close(waveRates(12).armour,9/192);
});

test("wave inputs roll only the entered wave and combine their loot",()=>{
 const result=simulate({1:2,2:3},{rng:()=>0});
 assert.equal(result.waveClears,5);assert.equal(result.drops["sunfire-splinters"],160);assert.equal(result.drops["rune-platebody"],3);
 assert.equal(result.perWave[0].count,2);assert.equal(result.perWave[1].count,3);assert.equal(result.completions,0);
 const last=simulate({12:1},{rng:()=>0});
 assert.equal(last.drops["dizanas-quiver"],1);assert.equal(last.drops["smol-heredit"],1);assert.equal(last.echoRolls,1);
 assert.equal(last.drops["sunfire-splinters"],undefined);assert.equal(last.perWave[0].count,0);
 assert.deepEqual({...simulate({}).drops},{});
});

test("echo quantities count one reward event even when two or three crystals arrive",()=>{
 for(const [bonus,quantity] of [[.94,2],[.96,3]]){
  const rolls=[0,0,bonus];const result=simulate({4:1},{rng:()=>rolls.shift()??.99});
  assert.equal(result.echoRolls,1);assert.equal(result.drops["echo-crystal"],quantity);
 }
});

test("armour duplicate protection persists across different wave counts",()=>{
 const rolls=[0,.5,0,0,.5,0,0,.5,0];
 const result=simulate({4:1,5:1,6:1},{rng:()=>rolls.shift()??.99});
 for(const id of ["sunfire-fanatic-helm","sunfire-fanatic-cuirass","sunfire-fanatic-chausses"])assert.equal(result.drops[id],1);
 const dry=calculateDry({4:1});close(dry["sunfire-fanatic-helm"].expected,1/124*.6/3);
});

test("quivers are kept, exchanged or gambled only for entered wave-12 completions",()=>{
 const exchanged=simulate({12:2},{rng:()=>0,quiverTrade:"splinters"});
 assert.equal(exchanged.drops["sunfire-splinters"],8000);assert.equal(exchanged.drops["dizanas-quiver"],undefined);
 const rolls=[.99,0,.99,0,.99,0,.99,.99,0,.99];
 const gambled=simulate({12:3},{rng:()=>rolls.shift()??.99,quiverTrade:"pet"});
 assert.equal(gambled.drops["smol-heredit"],1);assert.equal(gambled.drops["dizanas-quiver"],2);
 assert.equal(simulate({11:2},{quiverTrade:"splinters",rng:()=>0}).drops["dizanas-quiver"],undefined);
});

test("mixed dry odds use each wave's own number of trials",()=>{
 const result=calculateDry({4:1,12:2});
 close(result["echo-crystal"].expected,1/310+2/32);close(result["smol-heredit"].expected,2/200);
 close(result["tonalztics-of-ralos-uncharged"].expected,2/192);
 close(result.anyUnique.atLeastOne,1-(1-1/124)*(1-1/12)**2*(1-1/200)**2);
 assert.equal(result.quivers,2);assert.equal(result.waveClears,3);
 const single=calculateDry({12:1},{"echo-crystal":1});close(single["echo-crystal"].exact,1/32);
});

test("dry odds normalize for empty plans and the maximum number of wave rolls",()=>{
 for(const counts of [{},Object.fromEntries(WAVES.map(wave=>[wave.id,MAX_WAVE_CLEARS]))]){
  const result=calculateDry(counts);for(const id of [...DRY_ITEMS.map(item=>item.id),"anyUnique"]){const row=result[id];close(row.fewer+row.exact+row.more,1,1e-7);assert.ok(row.atLeastOne>=0&&row.atLeastOne<=1);}
 }
});

test("invalid wave plans, random generators and impossible drops are rejected",()=>{
 for(const counts of [null,[],{13:1},{1:-1},{2:.5},{4:NaN},{12:MAX_WAVE_CLEARS+1}]){assert.throws(()=>validatePlan(counts));assert.throws(()=>simulate(counts));assert.throws(()=>calculateDry(counts));}
 assert.throws(()=>simulate({4:1},{rng:()=>1}));assert.throws(()=>simulate({1:1},{quiverTrade:"other"}));
 assert.throws(()=>calculateDry({4:1},{"smol-heredit":1}));assert.throws(()=>calculateDry({1:1},{"echo-crystal":1}));
 assert.throws(()=>calculateDry({4:1},{"sunfire-fanatic-helm":1,"echo-crystal":1}));assert.throws(()=>calculateDry({},null));
});

test("Fortis has per-wave inputs, a quiver radio group and local artwork",()=>{
 const html=read("bosses/fortis-colosseum/index.html"),app=read("bosses/fortis-colosseum/app.mjs");
 assert.match(html,/id="wave-inputs"/);assert.match(app,/for\(const wave of encounters\)/);
 assert.equal((html.match(/name="quiver-trade" type="radio"/g)??[]).length,3);
 assert.doesNotMatch(html,/wave-reached|run-count|cash.out|<select/i);
 for(const item of Object.values(ITEMS))assert.deepEqual([...readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url)).subarray(0,8)],[137,80,78,71,13,10,26,10]);
});
