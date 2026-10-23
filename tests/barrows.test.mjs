import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_CHESTS,ROLLS,UNIQUE_RATE,SPECIFIC_RATE,BROTHERS,UNIQUE,COMMON,ITEMS,
 validateChests,validatePotential,regularReward,simulate
} from "../bosses/barrows/simulator.mjs";
import {calculateDry,anyEquipment,CHEST_PMF,EQUIPMENT_PER_CHEST} from "../bosses/barrows/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("all six Barrows brothers are included with four unique items each",()=>{
 assert.equal(BROTHERS.length,6);
 assert.ok(BROTHERS.every(b=>b.items.length===4));
 assert.equal(UNIQUE.length,24);
 assert.equal(new Set(UNIQUE.map(x=>x.id)).size,24);
 assert.equal(ROLLS,7);
 close(UNIQUE_RATE,1/102);
 close(SPECIFIC_RATE,1-Math.pow(1-1/2448,7));
 close(1/SPECIFIC_RATE,350.1430906172214,1e-7);
 assert.equal(COMMON[0].start,1);
 assert.equal(COMMON.at(-1).end,1012);
 for(let i=1;i<COMMON.length;i++)assert.equal(COMMON[i].start,COMMON[i-1].end+1);
});
test("one chest has seven independent equipment rolls, but no duplicate item in that chest",()=>{
 const first=simulate(1,{rng:()=>0});
 assert.equal(first.chests,1);
 assert.equal(first.brothers,6);
 assert.equal(first.totalEquipment,1);
 assert.equal(first.clueCount,1);
 assert.equal(first.drops["ahrims-hood"],1);
 assert.equal(first.drops["ahrims-robetop"],undefined);
 assert.equal(first.drops["dharoks-helm"],undefined);
 assert.equal(Object.entries(first.drops).filter(([id])=>id!=="clue-scroll-elite").length,1);
 // Distinct equipment outcomes can coexist on the same chest.
 const rng=()=>{ let call=0;return ()=>{
  const step=call++%3;
  if(step===0)return 0;
  if(step===1)return Math.floor(call/3)/24;
  return .99;
 };};
 const seven=simulate(1,{rng:rng()});
 assert.equal(seven.totalEquipment,7);
 assert.equal(seven.drops["ahrims-hood"],1);
 assert.equal(seven.drops["dharoks-platelegs"],1);
 const twice=simulate(2,{rng:()=>0});
 assert.equal(twice.totalEquipment,2);
 assert.equal(twice.drops["ahrims-hood"],2);
 assert.equal(twice.drops["clue-scroll-elite"],2);
});
test("the reward potential controls ordinary loot, not Barrows uniques",()=>{
 const low=simulate(1,{rng:()=>.999,potential:880});
 assert.equal(low.drops["blood-rune"],301);
 assert.equal(low.drops["bolt-rack"],undefined);
 const full=simulate(1,{rng:()=>.999999,potential:1012});
 assert.equal(full.drops["dragon-med-helm"],7);
 assert.equal(full.drops["bolt-rack"],undefined);
 assert.equal(low.totalEquipment,0);
 assert.equal(full.totalEquipment,0);
});
test("reward potential endpoints and optional hard diary rune boost",()=>{
 const normal=regularReward(880,()=>.999,false);
 const diary=regularReward(880,()=>.999,true);
 assert.equal(normal.id,"blood-rune");
 assert.equal(normal.quantity,43);
 assert.equal(diary.quantity,64);
 assert.equal(regularReward(1012,()=>0).id,"coins");
 assert.equal(regularReward(1012,()=>0).quantity,2);
 assert.equal(regularReward(1012,()=>.999999).id,"dragon-med-helm");
 assert.equal(regularReward(1012,()=>.999999).quantity,1);
 assert.equal(regularReward(1012,()=> (1007-.5)/1012).id,"loop-half-of-key");
 assert.equal(regularReward(1012,()=> (1011-.5)/1012).id,"tooth-half-of-key");
});
test("exact individual equipment dry odds use at most one copy per chest",()=>{
 const first=calculateDry(1,{"ahrims-hood":1});
 close(first["ahrims-hood"].exact,SPECIFIC_RATE);
 close(first["ahrims-hood"].expected,SPECIFIC_RATE);
 close(first["dharoks-helm"].expected,SPECIFIC_RATE);
 assert.throws(()=>calculateDry(1,{"ahrims-hood":2}));
 assert.throws(()=>calculateDry(0,{"ahrims-hood":1}));
 const second=calculateDry(2,{"ahrims-hood":2});
 close(second["ahrims-hood"].exact,SPECIFIC_RATE**2);
});
test("combined equipment count accounts for all seven rolls per chest",()=>{
 const result=calculateDry(1,{"ahrims-hood":1,"dharoks-helm":1});
 close(result.anyUnique.expected,EQUIPMENT_PER_CHEST);
 close(result.anyUnique.exact,CHEST_PMF[2]);
 close(result.anyUnique.atLeastOne,1-(101/102)**7);
 assert.equal(result.anyUnique.count,2);
 close(anyEquipment(1,7).exact,CHEST_PMF[7]);
 assert.throws(()=>anyEquipment(1,8));
 const all=Object.fromEntries(UNIQUE.slice(0,8).map(x=>[x.id,1]));
 assert.throws(()=>calculateDry(1,all));
});
test("elite clue is capped at once per chest across seven rolls",()=>{
 const zero=simulate(0,{rng:()=>0});
 assert.deepEqual({...zero.drops},{});
 const a=simulate(1,{rng:()=>0});
 assert.equal(a.drops["clue-scroll-elite"],1);
 const b=simulate(3,{rng:()=>0,eliteCAs:true});
 assert.equal(b.drops["clue-scroll-elite"],3);
});
test("all dry distributions normalize at small and large chest counts",()=>{
 for(const n of [0,1,100,1000,100000,MAX_CHESTS]){
  const data=calculateDry(n);
  close(data.anyUnique.expected,n*EQUIPMENT_PER_CHEST,1e-6);
  close(data.anyUnique.fewer+data.anyUnique.exact+data.anyUnique.more,1,1e-7);
  for(const item of UNIQUE){
   const odds=data[item.id];
   close(odds.expected,n*SPECIFIC_RATE,1e-6);
   close(odds.fewer+odds.exact+odds.more,1,1e-7);
  }
 }
 for(const n of [-1,1.5,MAX_CHESTS+1,Infinity,NaN]){
  assert.throws(()=>validateChests(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validatePotential(668));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{potential:668}));
});
test("Barrows page is fixed to six brothers, has both modes and local PNG icons",()=>{
 const home=read("index.html"),page=read("bosses/barrows/index.html"),app=read("bosses/barrows/app.mjs");
 assert.match(home,/href="bosses\/barrows\/"/);
 assert.match(home,/assets\/items\/dharoks-helm\.png/);
 assert.match(page,/data-simulator-header data-title="Barrows" data-icon="dharoks-helm"/);
 assert.match(page,/aria-label="Completed Barrows chests with all six brothers defeated"/);
 assert.match(page,/id="chest-count"/);
 assert.match(page,/id="mode-loot"/);
 assert.match(page,/id="mode-dry"/);
 assert.doesNotMatch(page,/name="potential"/);
 assert.doesNotMatch(page,/value="1012"/);
 assert.match(page,/id="hard-diary"/);
 assert.match(page,/id="elite-cas"/);
 assert.doesNotMatch(page,/name="brother"/);
 assert.match(app,/calculateDry/);
 assert.match(app,/BROTHERS/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" must have local PNG");
 }
});
