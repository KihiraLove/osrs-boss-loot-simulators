import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,UNSIRED_RATE,REWARDS,REWARD_WEIGHTS,BLUDGEON,MAIN,ITEMS,simulate,openUnsired} from "../bosses/sire/simulator.mjs";
import {calculateDry} from "../bosses/sire/dry-calc.mjs";
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,"Expected "+b+", got "+a);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Unsired and Font probabilities reflect the Sire table",()=>{
 assert.equal(UNSIRED_RATE,1/100);
 assert.equal(MAIN.reduce((s,r)=>s+r[4],0),139);
 assert.equal(REWARD_WEIGHTS.reduce((s,r)=>s+r[1],0),128);
 assert.equal(BLUDGEON.length,3);
 assert.equal(REWARDS.length,8);
});
test("A kill separates ordinary loot from Unsired rewards",()=>{
 const unsired=simulate(1,{rng:()=>0});
 assert.equal(unsired.drops["abyssal-ashes"],1);
 assert.equal(unsired.drops.unsired,1);
 assert.equal(unsired.rewards["bludgeon-spine"],1);
 assert.equal(unsired.drops["bludgeon-spine"],undefined);
 assert.equal(unsired.drops.battlestaff,undefined);
 const common=simulate(1,{rng:()=>0.01});
 assert.equal(common.drops.unsired,undefined);
 assert.equal(common.drops.battlestaff,10);
});
test("Bludgeon pieces never duplicate before a set is complete",()=>{
 const result=openUnsired(6,{rng:()=>0});
 for(const piece of BLUDGEON)assert.equal(result.drops[piece.id],2);
});
test("Orphan can only appear once",()=>{
 const result=openUnsired(3,{rng:()=>0.999});
 assert.equal(result.drops["abyssal-orphan"],1);
 assert.equal(result.drops["abyssal-head"],2);
});
test("Tertiary options change clues and task keys",()=>{
 const base=simulate(1,{rng:()=>0.02});
 const task=simulate(1,{rng:()=>0.02,konarTask:true});
 assert.equal(base.drops["brimstone-key"],undefined);
 assert.equal(task.drops["brimstone-key"],undefined);
 const noCa=simulate(1,{rng:()=>0.0057});
 const ca=simulate(1,{rng:()=>0.0057,eliteCAs:true});
 assert.equal(noCa.drops["clue-scroll-elite"],undefined);
 assert.equal(ca.drops["clue-scroll-elite"],1);
});
test("Dry probabilities use kills for Unsired and Unsired count for rewards",()=>{
 const zero=calculateDry(0,0);
 close(zero.unsired.exact,1);
 assert.ok(!("anyUnique" in zero));
 assert.ok(!("anyReward" in zero));
 const one=calculateDry(1,1,{"abyssal-dagger":1});
 close(one.unsired.exact,1/100);
 close(one["abyssal-dagger"].exact,26/128);
 close(one["abyssal-orphan"].exact,123/128);
 close(one["bludgeon-spine"].more,(62/128)/3);
 close(calculateDry(100,1,{"abyssal-orphan":1})["abyssal-orphan"].exact,5/128);
 close(calculateDry(100,3,{"bludgeon-spine":2})["bludgeon-spine"].exact,0);
});
test("Fewer/exact/more normalize at supported counts",()=>{
 for(const [kills,unsired] of [[0,0],[1,1],[100,2],[10000,100],[MAX_KILLS,10000]]){
  const results=calculateDry(kills,unsired);
  for(const item of [{id:"unsired"},...REWARDS]){
   const row=results[item.id];
   close(row.fewer+row.exact+row.more,1,1e-7);
  }
  close(results.unsired.expected,kills/100,1e-6);
  close(results["abyssal-orphan"].expected,1-Math.pow(123/128,unsired),1e-9);
 }
 assert.throws(()=>calculateDry(1,2));
 assert.throws(()=>calculateDry(1,0,{"abyssal-dagger":1}));
 assert.throws(()=>calculateDry(10,1,{"abyssal-dagger":1,"abyssal-whip":1}));
 assert.throws(()=>calculateDry(10,1,{"abyssal-orphan":2}));
 assert.throws(()=>calculateDry(-1,0));
 assert.throws(()=>openUnsired(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
});
test("Sire route, modes, and all drop icons are local PNGs",()=>{
 const home=read("index.html"),page=read("bosses/sire/index.html"),app=read("bosses/sire/app.mjs");
 assert.match(home,/href="bosses\/sire\/"/);
 assert.match(home,/assets\/items\/abyssal-orphan\.png/);
 for(const id of ["mode-loot","mode-dry","unsired-count","opened-panel","rewards-grid","elite-cas"])
  assert.ok(page.includes('id="'+id+'"'));
 assert.match(app,/calculateDry\(kills,unsireds,readRewards\(unsireds\)\)/);
 assert.doesNotMatch(home+page+app,/oldschool\.runescape\.wiki\/images/);
 for(const item of Object.values(ITEMS)){
  const img=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...img.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" icon required");
 }
});
