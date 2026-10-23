import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,HALBERD,SIGNATURE,DRY_ITEMS,STANDARD,SEEDS,ITEMS,
 rateOf,simulate,validateKills,validateMode
} from "../bosses/araxxor/simulator.mjs";
import {pieceOdds,calculateDry} from "../bosses/araxxor/dry-calc.mjs";
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,"Expected "+b+", got "+a);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Araxxor rates and 115-ticket main table match published structure",()=>{
 assert.equal(STANDARD.reduce((s,r)=>s+r[4],0),115);
 assert.equal(SEEDS.length,16);
 assert.equal(HALBERD.length,3);
 assert.equal(SIGNATURE.length,4);
 assert.equal(DRY_ITEMS.length,7);
 close(rateOf("noxious-pommel"),1/600);
 close(rateOf("noxious-blade"),1/600);
 close(rateOf("araxyte-fang"),1/600);
 close(rateOf("araxyte-head"),1/250);
 close(rateOf("jar-of-venom"),1/1500);
 close(rateOf("nid"),1/3000);
 close(rateOf("nid","destroy"),1/1500);
});
test("Harvest awards unique pre-roll instead of normal loot, with tertiary rewards",()=>{
 const r=simulate(1,{rng:()=>0,konarTask:true,coagulatedVenom:true});
 assert.equal(r.drops["noxious-pommel"],1);
 assert.equal(r.drops["araxyte-fang"],undefined);
 assert.equal(r.drops["araxyte-head"],1);
 assert.equal(r.drops["jar-of-venom"],1);
 assert.equal(r.drops.nid,1);
 assert.equal(r.drops["clue-scroll-elite"],1);
 assert.equal(r.drops["brimstone-key"],1);
 assert.equal(r.drops["coagulated-venom"],1);
 assert.equal(r.drops["rune-kiteshield"],undefined);
});
test("Halberd piece sequence is a random permutation, refreshed after three hits",()=>{
 const r=simulate(450,{rng:()=>0});
 for(const item of HALBERD)assert.equal(r.drops[item.id],150);
 assert.equal(r.drops["araxyte-fang"],undefined);
});
test("Normal harvest supply package bundles three separate supplies",()=>{
 // First unique roll fails; main table selects the 15/115 supply tickets.
 const r=simulate(1,{rng:()=>.02});
 assert.equal(r.drops["araxyte-venom-sack"],1);
 assert.equal(r.drops["prayer-potion-4"],1);
 assert.equal(r.drops.shark,2);
 assert.equal(r.drops["clue-scroll-elite"],undefined);
});
test("Destroy keeps only clue scrolls and the boosted Nid roll",()=>{
 const r=simulate(2,{mode:"destroy",rng:()=>0,konarTask:true,coagulatedVenom:true});
 assert.deepEqual({...r.drops},{nid:2,"clue-scroll-elite":2});
 assert.equal(r.mode,"destroy");
});
test("Elite combat achievements affect clue roll, Konar affects keys only while Harvesting",()=>{
 const no=simulate(1,{rng:()=>.0205});
 const ca=simulate(1,{rng:()=>.0205,eliteCAs:true});
 assert.equal(no.drops["clue-scroll-elite"],undefined);
 assert.equal(ca.drops["clue-scroll-elite"],1);
 const konar=simulate(1,{rng:()=>0.02,konarTask:true});
 assert.equal(konar.drops["brimstone-key"],1);
 assert.equal(no.drops["brimstone-key"],undefined);
});
test("Per-piece dry odds respect non-repeating sets, and any unique is 1/150",()=>{
 close(pieceOdds(1,1).exact,1/600);
 close(pieceOdds(1,1).expected,1/600);
 assert.throws(()=>pieceOdds(1,2));
 const dry=calculateDry(1,{"noxious-pommel":1});
 close(dry.anyUnique.exact,1/150);
 close(dry.anyUnique.atLeastOne,1/150);
 close(dry["araxyte-fang"].expected,1/600);
 close(dry["araxyte-head"].expected,1/250);
 close(dry["jar-of-venom"].expected,1/1500);
});
test("Destroy dry calculator shows only Nid, at 1/1500",()=>{
 const data=calculateDry(1,{nid:1},"destroy");
 assert.deepEqual(Object.keys(data),["nid"]);
 close(data.nid.exact,1/1500);
 assert.throws(()=>calculateDry(1,{"araxyte-fang":1},"destroy"));
 assert.throws(()=>calculateDry(1,{"noxious-point":1},"destroy"));
});
test("Dry counts normalize and validate input across max kill limit",()=>{
 for(const n of [0,1,100,10000,MAX_KILLS]){
  const data=calculateDry(n);
  for(const item of DRY_ITEMS){
   const s=data[item.id];
   close(s.fewer+s.exact+s.more,1,1e-7);
  }
  close(data.anyUnique.fewer+data.anyUnique.exact+data.anyUnique.more,1,1e-7);
  close(data.anyUnique.expected,n/150,1e-6);
 }
 assert.equal(validateKills(MAX_KILLS),MAX_KILLS);
 for(const n of [-1,1.5,MAX_KILLS+1,Infinity,NaN]){
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateMode("other"));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>calculateDry(1,{"noxious-point":2}));
 assert.throws(()=>calculateDry(1,{"araxyte-fang":1,"noxious-point":1}));
});
test("Araxxor route, corpse modes, and every item icon are local",()=>{
 const home=read("index.html"),page=read("araxxor/index.html"),app=read("araxxor/app.mjs");
 assert.match(home,/href="\.\/araxxor\/"/);
 assert.match(home,/assets\/items\/nid\.png/);
 for(const id of ["mode-loot","mode-dry","kill-count","elite-cas","konar-task","coagulated-venom"])
  assert.ok(page.includes('id="'+id+'"'));
 assert.match(page,/name="corpse" value="harvest"/);
 assert.match(page,/name="corpse" value="destroy"/);
 assert.match(app,/calculateDry/);
 assert.doesNotMatch(home+page+app,/oldschool\.runescape\.wiki\/images/);
 for(const item of Object.values(ITEMS)){
  const image=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...image.subarray(0,8)],[137,80,78,71,13,10,26,10],
   item.id+" missing local PNG");
 }
});
