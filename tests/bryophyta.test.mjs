import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,ESSENCE,KEY,DRY_ITEMS,ITEMS,
 BOSS_MEMBERS,BOSS_F2P,CHEST_MEMBERS,CHEST_F2P,HERBS,SEEDS,
 checkCount,checkWorld,checkMode,simulate
} from "../bosses/bryophyta/simulator.mjs";
import {calculateDry} from "../bosses/bryophyta/dry-calc.mjs";
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
test("Key obtained form boss opens additional chests using chest-found keys",()=>{
 const none=simulate(7,{rng:()=>.99999,mode:"boss"});
 assert.equal(none.chestsOpened,0);assert.equal(none.keysFromBoss,0);
 assert.deepEqual({...none.chestDrops},{});
 // F2P kill: common loot, clue, boss key; then chest loot + chest key
 // for each opened chest. The first chest generates another key.
 const rolls=[.99,.99,0,0,0,.999,.999];
 let index=0;
 const all=simulate(1,{mode:"boss",world:"f2p",
   rng:()=>rolls[index++]??.999});
 assert.equal(all.keysFromBoss,1);
 assert.equal(all.chestsOpened,2);
 assert.equal(all.chestKeyOpenings,1);
 assert.equal(all.bossDrops["mossy-key"],1);
 assert.equal(all.chestKeysFound,1);
 assert.equal(all.chestDrops["mossy-key"],1);
 assert.equal(all.chestDrops["rune-longsword"],1);
 assert.equal(all.chestDrops["strength-potion-4"],15);
 assert.equal(all.chestDrops["clue-scroll-beginner"],2);
 assert.equal(all.keysSpent,2);
 assert.equal(all.unspentKeys,0);
 assert.equal(all.chestLimitReached,false);
});
test("Pre-obtained mode ignores both sources of extra keys",()=>{
 const all=simulate(3,{rng:()=>0,mode:"preobtained"});
 assert.equal(all.keysFromBoss,3);
 assert.equal(all.chestsOpened,3);
 assert.equal(all.chestKeysFound,3);
 assert.equal(all.chestKeyOpenings,0);
 assert.equal(all.unspentKeys,6);
 assert.equal(all.chestLimitReached,false);
});
test("Chest-key chains have a bounded safeguard and report unused keys",()=>{
 const capped=simulate(1,{rng:()=>0,world:"f2p",
  mode:"boss",maxChestOpenings:5});
 assert.equal(capped.keysFromBoss,1);
 assert.equal(capped.chestsOpened,5);
 assert.equal(capped.chestKeysFound,5);
 assert.equal(capped.chestKeyOpenings,4);
 assert.equal(capped.unspentKeys,1);
 assert.equal(capped.chestLimitReached,true);
 assert.throws(()=>simulate(2,{mode:"preobtained",maxChestOpenings:1}));
});
test("The on-task kill count applies the key boost only to those kills",()=>{
 // F2P boss: common loot, beginner clue, key (0.10 qualifies only on task).
 // Subsequent chest rolls are .99 so they cannot create another key.
 const seq=()=>{let i=0;return ()=>{
  if(i<9)return [0.99,0.99,0.10][i++%3];
  i++;return 0.99;
 };};
 const normal=simulate(3,{rng:seq(),mode:"boss",slayerKills:0,world:"f2p"});
 const partial=simulate(3,{rng:seq(),mode:"boss",slayerKills:2,world:"f2p"});
 const full=simulate(3,{rng:seq(),mode:"boss",slayerKills:3,world:"f2p"});
 assert.equal(normal.keysFromBoss,0);assert.equal(normal.chestsOpened,0);
 assert.equal(partial.keysFromBoss,2);assert.equal(partial.chestsOpened,2);
 assert.equal(partial.chestKeysFound,0);
 assert.equal(partial.slayerKills,2);
 assert.equal(full.keysFromBoss,3);assert.equal(full.chestsOpened,3);
 assert.throws(()=>simulate(2,{slayerKills:3}),/cannot exceed/);
 for(const value of [-1,1.5,Infinity,NaN,MAX_KILLS+1])
  assert.throws(()=>simulate(2,{slayerKills:value}));
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
test("Essence is awarded by chest openings rather than boss kills",()=>{
 const index=CHEST_F2P.findIndex(row=>row[0]===ESSENCE.id);
 const before=CHEST_F2P.slice(0,index).reduce((sum,row)=>sum+row[2],0);
 const essenceRoll=(before+0.5)/118;
 // F2P boss: main roll, beginner clue, key. Chest: main roll, key.
 const values=[0.99,0.99,0.99,essenceRoll,0.99];
 let i=0;
 const result=simulate(1,{world:"f2p",mode:"preobtained",
  rng:()=>values[i++]??0.99});
 assert.equal(result.bossDrops[ESSENCE.id],undefined);
 assert.equal(result.chestDrops[ESSENCE.id],1);
 assert.equal(result.chestsOpened,1);
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
 assert.match(html,/id="slayer-kills"/);
 assert.match(html,/Kc on slayer task out of total/);
 assert.match(html,/Key obtained form boss/);
 assert.match(html,/id="unique-grid"/);
 assert.match(app,/renderUnique\(data\.chestDrops\)/);
 assert.match(app,/delete chestLoot\[ESSENCE\.id\]/);
 for(const removed of [
  "One chest opening per boss kill; ignore boss-dropped keys for openings.",
  "Only open chests with keys dropped by Bryophyta (1/16 normally).",
  "Boss loot and chest loot are rolled separately. Keys found in opened chests are kept as loot, not automatically reused.",
  "Boss obtained keys"
 ])assert.ok(!html.includes(removed),removed+" should be absent");
 assert.ok(!html.includes('id="simulation-note"'));
 assert.match(app,/slayerKills:count\("slayer-kills"/);
 assert.match(app,/if\(mode==="dry"\)dryResults\(calculateDry\(count\("chest-count"/);
 assert.doesNotMatch(html,/id="dry-inputs"/);
 assert.doesNotMatch(html,/id="dry-note"/);
 assert.doesNotMatch(html,/Only chest openings count\. Bryophyta's essence is 1\/118 per chest; mossy keys are 1\/16 per chest\./);
 const summarySection=app.slice(app.indexOf('function lootResults(data){'),app.indexOf('function percentage(x){'));
 assert.match(summarySection,/stat\("Keys from boss",data\.keysFromBoss\)/);
 assert.match(summarySection,/stat\("Keys found in chests",data\.chestKeysFound\)/);
 assert.equal((summarySection.match(/stat\("/g)||[]).length,2);
 for(const text of ["Boss-dropped keys","Boss kills","Kc on Slayer task","Chests opened","Chests opened with chest keys"])
  assert.ok(!summarySection.includes('stat("'+text+'"'),text+" should not appear as a summary field");
 for(const item of Object.values(ITEMS)){
  const icon=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" missing local PNG");
 }
});
