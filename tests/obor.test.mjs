import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,UNIQUE,KEY,DRY_ITEMS,ITEMS,
 BOSS_MEMBERS,BOSS_F2P,CHEST_TABLE,HERBS,SEEDS,
 checkCount,checkMode,checkWorld,simulate
} from "../bosses/obor/simulator.mjs";
import {calculateDry} from "../bosses/obor/dry-calc.mjs";
const approx=(actual,expected,tolerance=1e-10)=>
 assert.ok(Math.abs(actual-expected)<=tolerance,"Expected "+expected+", got "+actual);
const total=t=>t.reduce((sum,row)=>sum+row[3],0);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Obor has separate 135-ticket boss and 118-ticket chest tables",()=>{
 assert.equal(total(BOSS_MEMBERS),135);
 assert.equal(total(BOSS_F2P),135);
 assert.equal(total(CHEST_TABLE),118);
 assert.equal(HERBS.length,11);
 assert.equal(SEEDS.length,44);
 assert.equal(DRY_ITEMS.length,2);
 assert.equal(UNIQUE.id,"hill-giant-club");
 assert.equal(KEY.id,"giant-key");
 assert.equal(UNIQUE.rate,1/118);
 assert.equal(KEY.rate,1/16);
 assert.ok(CHEST_TABLE.some(row=>row[0]===UNIQUE.id&&row[3]===1));
 assert.ok(!BOSS_MEMBERS.some(row=>row[0]===UNIQUE.id));
 assert.ok(!BOSS_F2P.some(row=>row[0]===UNIQUE.id));
});
test("Pre-obtained keys simulate exactly one chest per kill regardless of keys found",()=>{
 const r=simulate(3,{rng:()=>0,mode:"preobtained"});
 assert.equal(r.kills,3);
 assert.equal(r.startingKeys,3);
 assert.equal(r.keysFromBoss,3);
 assert.equal(r.chestsOpened,3);
 assert.equal(r.chestKeysFound,3);
 assert.equal(r.chestKeyOpenings,0);
 assert.equal(r.unspentKeys,6);
 assert.equal(r.keysSpent,3);
 assert.equal(r.bossDrops["giant-key"],3);
 assert.equal(r.chestDrops["giant-key"],3);
 assert.equal(r.chestDrops["clue-scroll-beginner"],3);
 assert.equal(r.chestDrops["ensouled-giant-head"],3);
});
test("Key obtained form boss spends chest-found keys on additional chests",()=>{
 const values=[.99,.99,0,0,0,.999,.999];
 let i=0;
 const r=simulate(1,{rng:()=>values[i++]??.999,mode:"boss",world:"f2p"});
 assert.equal(r.keysFromBoss,1);
 assert.equal(r.chestsOpened,2);
 assert.equal(r.chestKeyOpenings,1);
 assert.equal(r.keysSpent,2);
 assert.equal(r.chestKeysFound,1);
 assert.equal(r.unspentKeys,0);
 assert.equal(r.bossDrops["giant-key"],1);
 assert.equal(r.chestDrops["giant-key"],1);
 assert.equal(r.chestDrops["rune-kiteshield"],1);
 assert.equal(r.chestDrops[UNIQUE.id],1);
 assert.equal(r.chestDrops["clue-scroll-beginner"],2);
 assert.equal(r.chestDrops["ensouled-giant-head"],2);
});
test("Boss obtained keys without a boss key open no chests",()=>{
 const r=simulate(100,{rng:()=>.999999,mode:"boss"});
 assert.equal(r.keysFromBoss,0);
 assert.equal(r.chestsOpened,0);
 assert.deepEqual({...r.chestDrops},{});
 assert.equal(r.bossDrops[UNIQUE.id],undefined);
});
test("Members and F2P ordinary boss loot differ, key rate does not",()=>{
 const members=simulate(1,{rng:()=>0,world:"members"});
 const f2p=simulate(1,{rng:()=>0,world:"f2p"});
 assert.equal(members.bossDrops["giant-bones"],1);
 assert.equal(members.bossDrops["big-bones"],undefined);
 assert.equal(f2p.bossDrops["big-bones"],1);
 assert.equal(f2p.bossDrops["giant-bones"],undefined);
 assert.equal(members.bossDrops["ensouled-giant-head"],1);
 assert.equal(f2p.bossDrops["ensouled-giant-head"],undefined);
 assert.equal(members.bossDrops["giant-key"],1);
 assert.equal(f2p.bossDrops["giant-key"],1);
 assert.equal(f2p.chestDrops["clue-scroll-beginner"],1);
 assert.equal(f2p.chestDrops["ensouled-giant-head"],1);
});
test("Chest-only club chance and giant key chance are independent 1/118 and 1/16",()=>{
 const r=calculateDry(1);
 approx(r[UNIQUE.id].atLeastOne,1/118);
 approx(r[KEY.id].atLeastOne,1/16);
 approx(r[UNIQUE.id].none,117/118);
 assert.equal(calculateDry(0)[UNIQUE.id].atLeastOne,0);
 assert.equal(calculateDry(0)[KEY.id].none,1);
 for(const chestCount of [2,118,1000,MAX_KILLS]){
  const data=calculateDry(chestCount);
  approx(data[UNIQUE.id].expected,chestCount/118);
  approx(data[KEY.id].expected,chestCount/16);
  for(const item of DRY_ITEMS){
   const d=data[item.id];
   approx(d.none+d.atLeastOne,1,1e-7);
   assert.ok(d.exactlyOne>=0&&d.exactlyOne<=1);
  }
 }
});
test("Boss and chest rewards can be rolled separately without false club drops",()=>{
 const r=simulate(1,{mode:"preobtained",world:"members",rng:()=>.999999});
 assert.equal(r.bossDrops[UNIQUE.id],undefined);
 assert.equal(r.chestDrops[UNIQUE.id],1);
 assert.equal(r.chestsOpened,1);
});
test("Simulated chest-key chains have a bounded safety limit",()=>{
 const all=simulate(1,{mode:"boss",world:"f2p",rng:()=>0,maxChestOpenings:4});
 assert.equal(all.keysFromBoss,1);
 assert.equal(all.chestsOpened,4);
 assert.equal(all.chestKeysFound,4);
 assert.equal(all.chestKeyOpenings,3);
 assert.equal(all.chestLimitReached,true);
 assert.equal(all.unspentKeys,1);
 assert.throws(()=>simulate(2,{mode:"preobtained",maxChestOpenings:1}));
});
test("Invalid kill counts, random numbers, world types and modes are rejected",()=>{
 for(const n of [-1,1.1,MAX_KILLS+1,NaN,Infinity]){
  assert.throws(()=>checkCount(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>checkMode("something"));
 assert.throws(()=>checkWorld("something"));
 assert.throws(()=>simulate(1,{rng:()=>1}));
});
test("Obor page matches current Bryophyta UX but never invents Slayer key boosts",()=>{
 const home=read("index.html"),html=read("obor/index.html"),app=read("obor/app.mjs"),css=read("obor/styles.css");
 for(const klass of ["obor-choice","obor-summary","obor-stat","obor-empty","obor-limit"])
  assert.match(css,new RegExp("\\."+klass+"\\b"));
 assert.doesNotMatch(css,/\.bryophyta-/);
 assert.match(home,/href="\.\/obor\/"/);
 assert.match(home,/assets\/items\/hill-giant-club\.png/);
 assert.match(html,/id="mode-loot"/);
 assert.match(html,/id="mode-dry"/);
 assert.match(html,/name="key-mode"/);
 assert.match(html,/value="preobtained"/);
 assert.match(html,/value="boss"/);
 assert.match(html,/Key obtained form boss/);
 assert.match(html,/id="chest-count"/);
 assert.match(html,/id="unique-grid"/);
 assert.match(html,/id="boss-loot"/);
 assert.match(html,/id="chest-loot"/);
 assert.doesNotMatch(html+app,/slayer-option|slayer-kills|slayerTask|slayerKills/);
 assert.doesNotMatch(html,/id="dry-note"/);
 assert.match(app,/renderUnique\(data\.chestDrops\)/);
 assert.match(app,/delete chestLoot\[UNIQUE\.id\]/);
 assert.match(app,/calculateDry\(count\("chest-count"/);
 for(const item of Object.values(ITEMS)){
  const b=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...b.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" has a local PNG");
 }
});
