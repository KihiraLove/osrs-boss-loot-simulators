import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,RARE,ITEMS,UNIQUE,DRY_ITEMS,
 SHARD_CHANCE,ANY_SHARD_CHANCE,FEDORA_CHANCE,
 validateKills,validateTask,clueRate,rateOf,simulate
} from "../bosses/crazy-archaeologist/simulator.mjs";
import {calculateDry} from "../bosses/crazy-archaeologist/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Crazy Archaeologist has two exclusive 1/256 shards and a separate 1/128 Fedora",()=>{
 assert.deepEqual(UNIQUE.map(x=>x.id),["odium-shard-2","malediction-shard-2","fedora"]);
 assert.deepEqual(DRY_ITEMS,UNIQUE);
 close(SHARD_CHANCE,1/256);close(ANY_SHARD_CHANCE,1/128);close(FEDORA_CHANCE,1/128);
 for(const item of UNIQUE)close(rateOf(item.id),item.rate);
 assert.equal(rateOf("rune-crossbow"),0);
});
test("Published ordinary weights and item quantities are retained",()=>{
 assert.equal(MAIN.reduce((s,r)=>s+r[3],0),128);
 for(const [id,w,q] of [
 ["amulet-of-power",7,1],["rune-crossbow",5,2],["red-dhide-body",4,1],
 ["rune-knife",4,10],["dragon-arrow",1,75],["steel-cannonball",4,150],
 ["potato-with-cheese",8,3],["coins",18,499],["grimy-dwarf-weed",8,4],
 ["@gems-pair",5,0],["@rare",4,0],["@gem",4,0],["@nothing",1,0]
 ]){
  const row=MAIN.find(x=>x[0]===id);
  assert.ok(row,id+" missing");assert.equal(row[3],w);assert.equal(row[1],q);
 }
 assert.equal(RARE.length,27);
 close(RARE.reduce((s,row)=>s+1/row[2],0),8/128,5e-6);
});
test("Shard pre-roll excludes the main drop but not bones, Fedora or other tertiary",()=>{
 const x=simulate(1,{rng:()=>0});
 assert.equal(x.drops.bones,1);assert.equal(x.drops["odium-shard-2"],1);
 assert.equal(x.drops["malediction-shard-2"],undefined);
 assert.equal(x.drops.fedora,1);assert.equal(x.drops["looting-bag"],1);
 assert.equal(x.drops["clue-scroll-hard"],1);
 assert.equal(x.drops["amulet-of-power"],undefined);
 let i=0;
 const m=simulate(1,{rng:()=>[1/256+0.0001,0,0,0][i++]??0});
 assert.equal(m.drops["malediction-shard-2"],1);
 assert.equal(m.drops["odium-shard-2"],undefined);
});
test("Ordinary table has weighted drops, paired gems and an unlisted blank ticket",()=>{
 function point(id){
  let before=0;for(const r of MAIN){if(r[0]===id)return (before+r[3]/2)/128;before+=r[3];}
  throw Error("Missing "+id);
 }
 let seq=[.99,point("rune-crossbow"),.99,.99,.99,.99],i=0;
 const crossbows=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(crossbows.drops["rune-crossbow"],2);
 seq=[.99,point("@gems-pair"),.99,.99,.99,.99];i=0;
 const gems=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(gems.drops["uncut-emerald"],6);assert.equal(gems.drops["uncut-sapphire"],4);
 seq=[.99,point("@nothing"),.99,.99,.99,.99];i=0;
 const blank=simulate(1,{rng:()=>seq[i++]??.99});
 assert.deepEqual({...blank.drops},{bones:1});
});
test("Slayer and clue options are mutually exclusive or independent as appropriate",()=>{
 const konar=simulate(1,{rng:()=>0,task:"konar"});
 assert.equal(konar.drops["brimstone-key"],1);
 assert.equal(konar.drops["larrans-key"],undefined);
 const krystilia=simulate(1,{rng:()=>0,task:"krystilia"});
 assert.equal(krystilia.drops["larrans-key"],1);
 assert.equal(krystilia.drops["slayers-enchantment"],1);
 assert.equal(krystilia.drops["brimstone-key"],undefined);
 close(clueRate(),1/128);close(clueRate({hardCAs:true}),1/121);
 close(clueRate({ringOfWealth:true}),1/64);
 close(clueRate({hardCAs:true,ringOfWealth:true}),1/60);
});
test("Dry calculator treats any shard and Fedora as independent outcomes",()=>{
 const x=calculateDry(1,{"odium-shard-2":1});
 const p=ANY_SHARD_CHANCE,q=FEDORA_CHANCE;
 close(x["odium-shard-2"].exact,1/256);
 close(x["malediction-shard-2"].atLeastOne,1/256);
 close(x.fedora.atLeastOne,q);
 close(x.anyUnique.expected,p+q);
 close(x.anyUnique.fewer,(1-p)*(1-q));
 close(x.anyUnique.exact,p*(1-q)+(1-p)*q);
 close(x.anyUnique.more,p*q);
 close(x.anyUnique.atLeastOne,1-(1-p)*(1-q));
 assert.throws(()=>calculateDry(1,{"odium-shard-2":1,"malediction-shard-2":1}));
 close(calculateDry(1,{"odium-shard-2":1,fedora:1}).anyUnique.exact,p*q);
});
test("High KC, zero KC, validation, options and RNG bounds",()=>{
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
 assert.throws(()=>calculateDry(1,{"odium-shard-2":-1}));
 assert.throws(()=>calculateDry(1,{fedora:2}));
 assert.throws(()=>calculateDry(1,null));
});
test("Crazy Archaeologist page and all item images are local",()=>{
 const home=source("index.html"),page=source("bosses/crazy-archaeologist/index.html"),app=source("bosses/crazy-archaeologist/app.mjs");
 assert.match(home,/href="bosses\/crazy-archaeologist\/"/);
 assert.match(home,/assets\/items\/fedora\.png/);
 for(const id of ["kill-count","hard-cas","ring-of-wealth","mode-loot","mode-dry","unique-grid","loot-grid"])assert.ok(page.includes('id="'+id+'"'),id+" absent");
 assert.match(page,/name="slayer-task"/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" needs PNG");
 }
});
