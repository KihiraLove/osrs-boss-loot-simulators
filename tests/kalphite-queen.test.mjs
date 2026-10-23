import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,UNIQUE,DRY_ITEMS,MAIN,CONSUMABLES,RDT,TERTIARY,ITEMS,
 validateKills,rateOf,simulate
} from "../bosses/kalphite-queen/simulator.mjs";
import {calculateDry} from "../bosses/kalphite-queen/dry-calc.mjs";
const near=(a,b,delta=1e-9)=>assert.ok(Math.abs(a-b)<=delta,"Expected "+b+", got "+a);
const total=t=>t.reduce((s,r)=>s+r[3],0);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Kalphite Queen has exactly six collection-log rewards at published rates",()=>{
 assert.equal(UNIQUE.length,6);
 assert.equal(DRY_ITEMS.length,6);
 assert.deepEqual(UNIQUE.map(x=>x.id),[
  "kq-head","dragon-chainbody","dragon-2h-sword",
  "dragon-pickaxe","jar-of-sand","kalphite-princess"
 ]);
 assert.deepEqual(UNIQUE.map(x=>Math.round(1/x.rate)),[128,128,256,400,2000,3000]);
 for(const item of UNIQUE)near(rateOf(item.id),item.rate);
});
test("One 126-ticket primary and one 9-ticket consumable table",()=>{
 assert.equal(total(MAIN),126);
 assert.equal(total(CONSUMABLES),9);
 assert.equal(CONSUMABLES.length,9);
 const row=(table,id,q,w)=>table.some(r=>r[0]===id&&r[1]===q&&r[3]===w);
 assert.ok(row(MAIN,"battlestaff",10,5));
 assert.ok(row(MAIN,"rune-knife-pplusplus",25,4));
 assert.ok(row(MAIN,"death-rune",150,6));
 assert.ok(row(MAIN,"wine-of-zamorak",60,10));
 assert.ok(row(MAIN,"@rare",0,1));
 assert.ok(row(CONSUMABLES,"prayer-potion-4",2,1));
 assert.equal(RDT.length,10);
 near(RDT.reduce((s,r)=>s+r[2]*126,0),0.6567378235721427);
});
test("Every kill rolls both tables and independent tertiary items",()=>{
 const r=simulate(3,{rng:()=>0});
 assert.equal(r.kills,3);
 assert.equal(r.drops.battlestaff,30);
 assert.equal(r.drops.monkfish,9);
 for(const id of UNIQUE.map(x=>x.id)){
  assert.equal(r.drops[id],3,id);
 }
 assert.equal(r.drops["ensouled-kalphite-head"],3);
 assert.equal(r.drops["clue-scroll-elite"],3);
 assert.equal(r.drops["brimstone-key"],undefined);
 assert.equal(simulate(0).kills,0);
 assert.deepEqual({...simulate(0).drops},{});
});
test("Optional Konar assignment and elite Combat Achievements use their proper rates",()=>{
 assert.equal(rateOf("brimstone-key"),1/54);
 assert.equal(rateOf("clue-scroll-elite"),1/100);
 assert.equal(rateOf("clue-scroll-elite",true),1/95);
 const on=simulate(1,{rng:()=>0,konarTask:true,eliteCAs:true});
 const off=simulate(1,{rng:()=>0,konarTask:false,eliteCAs:false});
 assert.equal(on.drops["brimstone-key"],undefined);
 assert.equal(off.drops["brimstone-key"],undefined);
 assert.equal(on.eliteCAs,true);
 assert.equal(off.eliteCAs,false);
});
test("Main RDT outcome has only one draw and no invented guaranteed loot",()=>{
 const ordinary=simulate(2,{rng:()=>.99999});
 assert.equal(ordinary.drops["superantipoison-2"],2);
 assert.equal(ordinary.drops["kq-head"],undefined);
 assert.equal(ordinary.drops["battlestaff"],undefined);
 const main=MAIN.findIndex(r=>r[0]==="@rare");
 assert.equal(main,MAIN.length-1);
 const values=[.999,0,.999,...Array(8).fill(.999)];
 let idx=0;
 const rare=simulate(1,{rng:()=>values[idx++]??.999});
 assert.equal(rare.drops.coins,3000);
 assert.equal(rare.drops["superantipoison-2"],1);
});
test("Kq head tattered 256-KC milestone is not represented as a random unique",()=>{
 assert.ok(!UNIQUE.some(x=>x.id==="kq-head-tattered"));
 assert.ok(!TERTIARY.some(x=>x.id==="kq-head-tattered"));
 assert.equal(ITEMS["kq-head-tattered"],undefined);
});
test("Dry calculator supports all independent rare rolls, including double drops",()=>{
 const chance=calculateDry(1,{"kq-head":1,"dragon-chainbody":1});
 const p=1/128;
 near(chance["kq-head"].exact,p);
 near(chance["dragon-chainbody"].exact,p);
 near(chance.anyUnique.expected,UNIQUE.reduce((s,x)=>s+x.rate,0));
 near(chance.anyUnique.atLeastOne,1-UNIQUE.reduce((s,x)=>s*(1-x.rate),1));
 const anyTwo=calculateDry(1,{"kq-head":1,"dragon-chainbody":1}).anyUnique;
 assert.ok(anyTwo.exact>0);
 assert.ok(anyTwo.more>0);
});
test("Dry math accurately distinguishes zero, one, and multiple unique drops",()=>{
 const r=calculateDry(2,{"kalphite-princess":1});
 const p=1/3000;
 near(r["kalphite-princess"].fewer,(1-p)**2);
 near(r["kalphite-princess"].exact,2*p*(1-p));
 near(r["kalphite-princess"].more,p*p);
 near(r["kalphite-princess"].atLeastOne,1-(1-p)**2);
 for(const n of [0,1,25,10000,MAX_KILLS]){
  const d=calculateDry(n);
  for(const x of [...UNIQUE.map(i=>d[i.id]),d.anyUnique]){
   near(x.fewer+x.exact+x.more,1,1e-6);
   assert.ok(x.expected>=0);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
});
test("Invalid KC, drop counts and RNG are rejected",()=>{
 for(const x of [-1,1.1,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(x));
  assert.throws(()=>simulate(x));
  assert.throws(()=>calculateDry(x));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.doesNotThrow(()=>simulate(1,{konarTask:"yes"}));
 assert.throws(()=>calculateDry(1,{"kq-head":2}));
 assert.throws(()=>calculateDry(1,{"kq-head":-1}));
 assert.throws(()=>calculateDry(1,null));
});
test("Kalphite Queen homepage, calculator options, and all local item icons exist",()=>{
 const home=read("index.html");
 const html=read("bosses/kalphite-queen/index.html"),app=read("bosses/kalphite-queen/app.mjs");
 assert.match(home,/href="bosses\/kalphite-queen\/"/);
 assert.match(home,/assets\/items\/kalphite-princess\.png/);
 assert.match(html,/id="kill-count"/);
 assert.match(html,/id="elite-cas"/);
 assert.doesNotMatch(html,/id="konar-task"/);
 assert.match(html,/id="mode-loot"/);
 assert.match(html,/id="mode-dry"/);
 assert.match(html,/id="unique-grid"/);
 assert.match(html,/id="loot-grid"/);
 assert.match(html,/id="dry-inputs"/);
 assert.match(app,/simulate\(kills,\{\.\.\.readRings\(\),eliteCAs:/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" needs local PNG");
 }
});
