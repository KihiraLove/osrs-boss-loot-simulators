import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,ESSENCE,KEY,DRY_ITEMS,ITEMS,
 BOSS_MEMBERS,BOSS_F2P,CHEST_MEMBERS,CHEST_F2P,HERBS,SEEDS,
 checkCount,checkWorld,checkMode,simulate
} from "../bryophyta/simulator.mjs";
import {calculateDry} from "../bryophyta/dry-calc.mjs";
const close=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<=e,"Expected "+b+", got "+a);
const total=t=>t.reduce((s,r)=>s+r[2],0);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Bryophyta and chest have separate accurate 128/118-ticket tables",()=>{
 assert.equal(total(BOSS_MEMBERS),128);assert.equal(total(BOSS_F2P),128);
 assert.equal(total(CHEST_MEMBERS),118);assert.equal(total(CHEST_F2P),118);
 assert.equal(ESSENCE.rate,1/118);assert.equal(KEY.rate,1/16);
 assert.equal(DRY_ITEMS.length,2);assert.equal(HERBS.length,11);assert.equal(SEEDS.length,25);
 assert.equal(BOSS_MEMBERS.some(r=>r[0]==="bryophytas-essence"),false);
 assert.equal(BOSS_F2P.some(r=>r[0]==="bryophytas-essence"),false);
 assert.equal(CHEST_MEMBERS.some(r=>r[0]==="bryophytas-essence"),true);
 assert.equal(CHEST_F2P.some(r=>r[0]==="bryophytas-essence"),true);
});
test("Pre-obtained keys give exactly one chest per kill independently of boss keys",()=>{
 const r=simulate(3,{rng:()=>.999999,mode:"preobtained"});
 assert.equal(r.kills,3);assert.equal(r.chestsOpened,3);
 assert.equal(r.keysFromBoss,0);assert.equal(r.startingKeys,3);
 assert.equal(r.keysSpent,3);assert.equal(r.chestKeysFound,0);
 assert.equal(r.bossDrops["giant-bones"],3);
 assert.equal(r.chestDrops["clue-scroll-beginner"],3);
 assert.equal(r.bossDrops["bryophytas-essence"],undefined);
});
test("Boss-obtained keys open only chests earned from the boss",()=>{
 const none=simulate(7,{rng:()=>.99999,mode:"boss"});
 assert.equal(none.chestsOpened,0);assert.equal(none.keysFromBoss,0);
 assert.deepEqual({...none.chestDrops},{});
 const all=simulate(4,{rng:()=>0,mode:"boss"});
 assert.equal(all.keysFromBoss,4);assert.equal(all.chestsOpened,4);
 assert.equal(all.bossDrops["mossy-key"],4);
 assert.equal(all.chestKeysFound,4);
 assert.equal(all.chestDrops["mossy-key"],4);
 assert.equal(all.chestDrops["rune-longsword"],4);
 assert.equal(all.chestDrops["clue-scroll-beginner"],4);
 // Chest-sourced keys are recorded, never recursively opened.
 assert.equal(all.keysSpent,4);
});
test("Boss-key Slayer boost only affects boss keys, not chest keys",()=>{
 const seq=()=>{let calls=0;return ()=>[.99,.99,.10][calls++]??.99;};
 // F2P call order: main loot, beginner clue, boss key.
 // 0.10 is above 1/16 but below the Slayer task's 1/8 threshold.
 const normal=simulate(1,{rng:seq(),mode:"boss",slayerTask:false,world:"f2p"});
 const slayer=simulate(1,{rng:seq(),mode:"boss",slayerTask:true,world:"f2p"});
 assert.equal(normal.keysFromBoss,0);
 assert.equal(normal.chestsOpened,0);
 assert.equal(slayer.keysFromBoss,1);
 assert.equal(slayer.chestsOpened,1);
 assert.equal(slayer.chestKeysFound,0); // 0.99 is not a chest key
 const zero=simulate(1,{rng:()=>0,mode:"boss",slayerTask:true,world:"f2p"});
 assert.equal(zero.keysFromBoss,1);
 assert.equal(zero.chestKeysFound,1);
});
test("F2P and Members produce their respective guaranteed and ordinary loot",()=>{
 const mem=simulate(1,{rng:()=>0,world:"members"});
 const f2p=simulate(1,{rng:()=>0,world:"f2p"});
 assert.equal(mem.bossDrops["giant-bones"],1);
 assert.equal(mem.bossDrops["big-bones"],undefined);
 assert.equal(f2p.bossDrops["big-bones"],1);
 assert.equal(f2p.bossDrops["giant-bones"],undefined);
 assert.equal(mem.bossDrops["ensouled-giant-head"],1);
 assert.equal(f2p.bossDrops["ensouled-giant-head"],undefined);
 assert.equal(mem.chestDrops["clue-scroll-beginner"],1);
 assert.equal(f2p.chestDrops["clue-scroll-beginner"],1);
});
test("Bryophyta essence can only come from chest; 1/118 chest roll",()=>{
 const r=simulate(1,{rng:()=>.99999,mode:"preobtained"});
 assert.equal(r.bossDrops["bryophytas-essence"],undefined);
 assert.equal(r.chestsOpened,1);
 const tableEntry=CHEST_MEMBERS.find(r=>r[0]==="bryophytas-essence");
 assert.deepEqual(tableEntry,["bryophytas-essence",1,1]);
 const chest=calculateDry(1);
 close(chest["bryophytas-essence"].atLeastOne,1/118);
 close(chest["mossy-key"].atLeastOne,1/16);
 close(chest["bryophytas-essence"].none,117/118);
});
test("Dry calculator uses only chest openings with stable independent odds",()=>{
 const n=118;const d=calculateDry(n);
 assert.equal(d.chests,n);
 close(d["bryophytas-essence"].expected,1);
 close(d["mossy-key"].expected,n/16);
 close(d["bryophytas-essence"].atLeastOne,-Math.expm1(n*Math.log1p(-1/118)));
 for(const count of [0,1,10,1000,MAX_KILLS]){
  const results=calculateDry(count);
  for(const item of DRY_ITEMS){
   const p=results[item.id];
   close(p.none+p.atLeastOne,1,1e-7);
   assert.ok(p.exactlyOne>=0&&p.exactlyOne<=1);
  }
 }
 assert.equal(calculateDry(0)["bryophytas-essence"].atLeastOne,0);
 assert.equal(calculateDry(0)["mossy-key"].none,1);
});
test("Input validation rejects invalid modes, worlds and counts",()=>{
 for(const n of [-1,1.2,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>checkCount(n));assert.throws(()=>simulate(n));assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>checkWorld("ironman"));
 assert.throws(()=>checkMode("other"));
 assert.throws(()=>simulate(1,{rng:()=>1}));
});
test("Page shows independent loot sections, exactly two key modes and chest-only dry count",()=>{
 const home=read("index.html"),html=read("bryophyta/index.html"),app=read("bryophyta/app.mjs");
 assert.match(home,/href="\.\/bryophyta\/"/);
 assert.match(home,/assets\/items\/bryophytas-essence\.png/);
 assert.match(html,/id="mode-loot"/);assert.match(html,/id="mode-dry"/);
 assert.match(html,/value="preobtained"/);assert.match(html,/value="boss"/);
 assert.match(html,/id="kill-count"/);assert.match(html,/id="chest-count"/);
 assert.match(html,/id="boss-loot"/);assert.match(html,/id="chest-loot"/);
 assert.match(html,/id="slayer-task"/);
 assert.match(app,/if\(mode==="dry"\)dryResults\(calculateDry\(count\("chest-count"/);
 assert.doesNotMatch(html,/id="dry-inputs"/);
 for(const item of Object.values(ITEMS)){
  const icon=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" missing local PNG");
 }
});
