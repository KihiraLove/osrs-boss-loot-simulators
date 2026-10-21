import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,RARE,ITEMS,UNIQUE,DRY_ITEMS,
 SHARD_CHANCE,ANY_SHARD_CHANCE,PET_CHANCE,
 validateKills,validateTask,clueRate,rateOf,simulate
} from "../chaos-fanatic/simulator.mjs";
import {calculateDry} from "../chaos-fanatic/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Chaos Fanatic has two exclusive 1/256 shards and independent 1/1000 pet",()=>{
 assert.deepEqual(UNIQUE.map(x=>x.id),[
  "odium-shard-1","malediction-shard-1","pet-chaos-elemental"
 ]);
 assert.deepEqual(DRY_ITEMS,UNIQUE);
 close(SHARD_CHANCE,1/256);
 close(ANY_SHARD_CHANCE,1/128);
 close(PET_CHANCE,1/1000);
 for(const item of UNIQUE)close(rateOf(item.id),item.rate);
 assert.equal(rateOf("ancient-staff"),0);
});
test("Main table has 128 tickets and published notable rolls",()=>{
 assert.equal(MAIN.reduce((s,row)=>s+row[3],0),128);
 const weight=id=>MAIN.find(row=>row[0]===id)?.[3];
 for(const [id,w] of [["battlestaff",5],["@robes",4],["@gems-pair",5],["ancient-staff",1],
 ["coins",18],["grimy-lantadyme",8],["prayer-potion-4",8],["sinister-key",4],
 ["@rare",4],["@gem",4]])assert.equal(weight(id),w);
 assert.equal(RARE.length,27);
 close(RARE.reduce((s,row)=>s+1/row[2],0),8/128,5e-6);
});
test("Shard pre-roll blocks ordinary loot, not bones or tertiary",()=>{
 const o=simulate(2,{rng:()=>0});
 assert.equal(o.drops.bones,2);
 assert.equal(o.drops["odium-shard-1"],2);
 assert.equal(o.drops["malediction-shard-1"],undefined);
 assert.equal(o.drops["pet-chaos-elemental"],2);
 assert.equal(o.drops["looting-bag"],2);
 assert.equal(o.drops["clue-scroll-hard"],2);
 assert.equal(o.drops.battlestaff,undefined);
 assert.equal(o.drops["brimstone-key"],undefined);
 // 1/256 to 1/128 selects only the malediction shard.
 let i=0;
 const m=simulate(1,{rng:()=>[1/256+0.0001,.99,.99,.99][i++]??0.99});
 assert.equal(m.drops["malediction-shard-1"],1);
 assert.equal(m.drops["odium-shard-1"],undefined);
});
test("A normal drop is one main ticket; paired rows award both items",()=>{
 const total=MAIN.reduce((s,r)=>s+r[3],0);
 const point=id=>{
  let before=0;
  for(const row of MAIN){if(row[0]===id)return (before+row[3]/2)/total;before+=row[3];}
  throw Error(id);
 };
 let seq=[.99,point("@robes"),.99,.99,.99],i=0;
 const robes=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(robes.drops["zamorak-monk-top"],1);
 assert.equal(robes.drops["zamorak-monk-bottom"],1);
 assert.equal(robes.drops["odium-shard-1"],undefined);
 seq=[.99,point("@gems-pair"),.99,.99,.99];i=0;
 const gems=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(gems.drops["uncut-emerald"],6);
 assert.equal(gems.drops["uncut-sapphire"],4);
});
test("Rare/gem branch produces published table results",()=>{
 const total=MAIN.reduce((s,r)=>s+r[3],0);
 const prior=MAIN.slice(0,-2).reduce((s,r)=>s+r[3],0);
 let i=0,seq=[.99,(prior+2)/total,.38,.99,.99,.99];
 const r=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(r.drops.coins,3000);
 assert.equal(r.drops.bones,1);
});
test("Slayer tasks and hard clue boosts are optional",()=>{
 const konar=simulate(1,{rng:()=>0,task:"konar"});
 assert.equal(konar.drops["brimstone-key"],1);
 assert.equal(konar.drops["larrans-key"],undefined);
 const wilderness=simulate(1,{rng:()=>0,task:"krystilia"});
 assert.equal(wilderness.drops["larrans-key"],1);
 assert.equal(wilderness.drops["slayers-enchantment"],1);
 assert.equal(wilderness.drops["brimstone-key"],undefined);
 close(clueRate(),1/128);
 close(clueRate({hardCAs:true}),1/121);
 close(clueRate({ringOfWealth:true}),1/64);
 close(clueRate({hardCAs:true,ringOfWealth:true}),1/60);
});
test("Dry model handles mutually exclusive shards plus independent pet",()=>{
 const x=calculateDry(1,{"odium-shard-1":1});
 const p=ANY_SHARD_CHANCE,q=PET_CHANCE;
 close(x["odium-shard-1"].exact,1/256);
 close(x["malediction-shard-1"].atLeastOne,1/256);
 close(x["pet-chaos-elemental"].atLeastOne,q);
 close(x.anyUnique.expected,p+q);
 close(x.anyUnique.fewer,(1-p)*(1-q));
 close(x.anyUnique.exact,p*(1-q)+(1-p)*q);
 close(x.anyUnique.more,p*q);
 close(x.anyUnique.atLeastOne,1-(1-p)*(1-q));
 assert.throws(()=>calculateDry(1,{"odium-shard-1":1,"malediction-shard-1":1}));
 close(calculateDry(1,{"odium-shard-1":1,"pet-chaos-elemental":1}).anyUnique.exact,p*q);
});
test("High KC, zero KC, bounds, RNG and options",()=>{
 for(const n of [0,1,10,100,10000,MAX_KILLS]){
  const r=calculateDry(n);
  for(const x of [...UNIQUE.map(item=>r[item.id]),r.anyUnique]){
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));assert.throws(()=>simulate(n));assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateTask("unknown"));
 assert.throws(()=>simulate(1,{task:"other"}));
 assert.throws(()=>clueRate({hardCAs:1}));
 assert.throws(()=>simulate(1,{ringOfWealth:1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>calculateDry(1,{"odium-shard-1":-1}));
 assert.throws(()=>calculateDry(1,{"pet-chaos-elemental":2}));
 assert.throws(()=>calculateDry(1,null));
});
test("Chaos Fanatic page, controls and every item has a local PNG",()=>{
 const home=source("index.html"),page=source("chaos-fanatic/index.html"),app=source("chaos-fanatic/app.mjs");
 assert.match(home,/href="\.\/chaos-fanatic\/"/);
 assert.match(home,/assets\/items\/odium-shard-1\.png/);
 assert.match(page,/id="kill-count"/);
 assert.match(page,/id="hard-cas"/);
 assert.match(page,/id="ring-of-wealth"/);
 assert.match(page,/name="slayer-task"/);
 assert.match(page,/id="mode-loot"/);
 assert.match(page,/id="mode-dry"/);
 assert.match(page,/id="unique-grid"/);
 assert.match(page,/id="loot-grid"/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" needs PNG");
 }
});
