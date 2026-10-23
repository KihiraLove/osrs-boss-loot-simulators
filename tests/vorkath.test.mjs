import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,MAIN,BOLTS,SHARKS,SEEDS,ITEMS,UNIQUE,TERTIARY,simulate,rateOf,validateKills} from "../bosses/vorkath/simulator.mjs";
import {headOdds,calculateDry} from "../bosses/vorkath/dry-calc.mjs";
const close=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`Expected ${b}, got ${a}`);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Vorkath uses exactly 150 tickets per main roll, twice per kill",()=>{
 assert.equal(MAIN.reduce((s,r)=>s+r[4],0),150);
 assert.equal(MAIN.find(x=>x[0]==="@rdt")[4],5);
 assert.equal(MAIN.find(x=>x[0]==="@seed")[4],3);
 assert.equal(MAIN.find(x=>x[0]==="@bolts")[4],5);
 assert.equal(MAIN.find(x=>x[0]==="@shark")[4],4);
 assert.equal(MAIN.find(x=>x[0]==="@nothing")[4],2);
 assert.equal(BOLTS.reduce((s,r)=>s+r[4],0),91);
 assert.equal(SHARKS.reduce((s,r)=>s+r[4],0),8);
 assert.equal(SEEDS.length,16);
 assert.deepEqual(MAIN.find(x=>x[0]==="blue-dragonhide"),["blue-dragonhide","Blue dragonhide",25,30,8]);
});
test("Always drops and two deterministic main rolls on each kill",()=>{
 // 0 selects the first main-table item with its minimum quantity.
 const result=simulate(1,{rng:()=>0});
 assert.equal(result.kills,1);
 assert.equal(result.drops["superior-dragon-bones"],2);
 assert.equal(result.drops["blue-dragonhide"],2);
 assert.equal(result.drops["rune-longsword"],4);
 // Independent tertiary 0 rolls can all succeed in one kill.
 assert.equal(result.drops.vorki,1);
 assert.equal(result.drops["vorkaths-head"],1);
 assert.equal(result.drops["clue-scroll-elite"],1);
});
test("Zero kills and guaranteed head on exactly kill 50",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 const x=simulate(50,{rng:()=>0.5});
 assert.equal(x.drops["vorkaths-head"],1);
 const y=simulate(49,{rng:()=>0.5});
 assert.equal(y.drops["vorkaths-head"],undefined);
 const z=simulate(51,{rng:()=>0.5});
 assert.equal(z.drops["vorkaths-head"],1);
});
test("Tertiary rates stay one roll per kill",()=>{
 close(rateOf("scaly-blue-dragonhide"),1/10);
 close(rateOf("vorkaths-head"),1/50);
 close(rateOf("dragonbone-necklace"),1/1000);
 close(rateOf("jar-of-decay"),1/3000);
 close(rateOf("vorki"),1/3000);
 close(rateOf("draconic-visage"),1/5000);
 close(rateOf("skeletal-visage"),1/5000);
 assert.equal(UNIQUE.length,6);
 assert.equal(TERTIARY.length,7);
});
test("Head dry calculation includes the guaranteed kill 50",()=>{
 close(headOdds(1,0).exact,49/50);
 close(headOdds(49,0).exact,Math.pow(49/50,49));
 close(headOdds(50,0).exact,0);
 close(headOdds(50,1).exact,Math.pow(49/50,49));
 close(headOdds(50,1).atLeastOne,1);
 close(headOdds(51,1).exact,Math.pow(49/50,50));
 assert.throws(()=>headOdds(2,3));
});
test("Dry calculator checks counts and probabilities",()=>{
 for(const k of [0,1,49,50,51,100,1000,MAX_KILLS]){
  const results=calculateDry(k);
  for(const unique of UNIQUE){
   const r=results[unique.id];
   close(r.fewer+r.exact+r.more,1,1e-7);
   assert.ok(r.atLeastOne>=0&&r.atLeastOne<=1);
  }
 }
 close(calculateDry(1,{"vorki":1}).vorki.exact,1/3000);
 assert.throws(()=>calculateDry(1,{"vorki":2}));
 assert.throws(()=>calculateDry(1,null));
});
test("Validate kills, options and random generator",()=>{
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{eliteCAs:1}));
 assert.throws(()=>simulate(1,{konarTask:"yes"}));
});
test("UI, navigation, docs and all local PNG sprites",()=>{
 const index=source("index.html");
 const ui=source("vorkath/index.html"),app=source("vorkath/app.mjs");
 const docs=source("vorkath/README.md");
 assert.match(index,/href="\.\/vorkath\/"/);
 assert.match(docs,/50th/);
 for(const id of ["kill-count","elite-cas","konar-task","mode-loot","mode-dry",
  "unique-grid","loot-grid","dry-inputs","dry-results-grid"])
  assert.ok(ui.includes('id="'+id+'"'),id);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
