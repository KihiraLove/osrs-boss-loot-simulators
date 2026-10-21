import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MINOR,MAIN,RARE,ITEMS,UNIQUE,DRY_ITEMS,
 PICKAXE_CHANCE,DRAGON_2H_MAIN_CHANCE,DRAGON_2H_CHANCE,
 PET_CHANCE,PRIMARY_CHANCE,validateKills,validateTask,clueRate,
 rateOf,simulate
} from "../chaos-elemental/simulator.mjs";
import {calculateDry} from "../chaos-elemental/dry-calc.mjs";

const close=(actual,expected,epsilon=1e-10)=>
 assert.ok(Math.abs(actual-expected)<=epsilon,"Expected "+expected+", got "+actual);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Chaos Elemental has exactly three collection-log rewards",()=>{
 assert.deepEqual(UNIQUE.map(x=>x.id),[
  "dragon-2h-sword","dragon-pickaxe","pet-chaos-elemental"
 ]);
 assert.deepEqual(DRY_ITEMS,UNIQUE);
 close(PICKAXE_CHANCE,1/256);
 close(DRAGON_2H_MAIN_CHANCE,2/128);
 close(DRAGON_2H_CHANCE,255/256*2/128);
 close(PET_CHANCE,1/300);
 close(PRIMARY_CHANCE,PICKAXE_CHANCE+DRAGON_2H_CHANCE);
 for(const item of UNIQUE)close(rateOf(item.id),item.rate);
});
test("Always one of five minor drops; 128-ticket major table",()=>{
 assert.equal(MINOR.length,5);
 assert.equal(MAIN.reduce((sum,row)=>sum+row[3],0),128);
 assert.deepEqual(MINOR.map(x=>x[0]),[
  "blighted-anglerfish","blighted-karambwan",
  "blighted-super-restore-4","dragon-bones","super-combat-potion-1"
 ]);
 const row=(id,qty,weight)=>MAIN.some(r=>r[0]===id&&r[1]===qty&&r[3]===weight);
 assert.ok(row("rune-dart",100,5));
 assert.ok(row("dragon-2h-sword",1,2));
 assert.ok(row("chaos-rune",300,8));
 assert.ok(row("blighted-ancient-ice-sack",20,5));
 assert.ok(row("@rare",0,8));
 assert.equal(RARE.length,12);
 const mass=RARE.reduce((sum,row)=>sum+row[2]/(8/128),0);
 assert.ok(mass>0&&mass<1);
});
test("Dragon pickaxe pre-roll replaces main reward but not minor or tertiary rolls",()=>{
 const x=simulate(2,{rng:()=>0});
 assert.equal(x.kills,2);
 assert.equal(x.drops["blighted-anglerfish"],4);
 assert.equal(x.drops["dragon-pickaxe"],2);
 assert.equal(x.drops["pet-chaos-elemental"],2);
 assert.equal(x.drops["weapon-poison-plus-plus"],2);
 assert.equal(x.drops["looting-bag"],2);
 assert.equal(x.drops["clue-scroll-elite"],2);
 assert.equal(x.drops["rune-dart"],undefined);
 assert.equal(x.drops["dragon-2h-sword"],undefined);
 assert.equal(x.drops["brimstone-key"],undefined);
});
test("Dragon 2h is an exclusive main-table roll after pickaxe failure",()=>{
 const total=MAIN.reduce((a,r)=>a+r[3],0);
 let prior=0;
 for(const row of MAIN){
  if(row[0]==="dragon-2h-sword")break;
  prior+=row[3];
 }
 let i=0;
 const rng=()=>[0,.99,(prior+0.5)/total,.99,.99,.99,.99][i++]??.99;
 const result=simulate(1,{rng});
 assert.equal(result.drops["dragon-2h-sword"],1);
 assert.equal(result.drops["dragon-pickaxe"],undefined);
 assert.equal(result.drops["blighted-anglerfish"],2);
 assert.equal(result.drops["pet-chaos-elemental"],undefined);
});
test("Rare-table branch is conditional and can return a known RDT item",()=>{
 const values=[0,.99,.999,.2];
 let i=0;
 const result=simulate(1,{rng:()=>values[i++]??.999});
 assert.equal(result.drops.coins,3000);
 assert.equal(result.drops["blighted-anglerfish"],2);
 assert.equal(result.drops["dragon-pickaxe"],undefined);
 assert.equal(result.drops["rune-dart"],undefined);
});
test("Konar and Krystilia are exclusive optional Slayer assignments",()=>{
 const konar=simulate(1,{rng:()=>0,task:"konar"});
 assert.equal(konar.drops["brimstone-key"],1);
 assert.equal(konar.drops["larrans-key"],undefined);
 const krystilia=simulate(1,{rng:()=>0,task:"krystilia"});
 assert.equal(krystilia.drops["larrans-key"],1);
 assert.equal(krystilia.drops["slayers-enchantment"],1);
 assert.equal(krystilia.drops["brimstone-key"],undefined);
 const none=simulate(1,{rng:()=>0,task:"none"});
 assert.equal(none.drops["brimstone-key"],undefined);
 assert.equal(none.drops["larrans-key"],undefined);
});
test("Elite-clue boosts stack according to Combat Achievements and imbued ring",()=>{
 close(clueRate(),1/200);
 close(clueRate({eliteCAs:true}),1/190);
 close(clueRate({ringOfWealth:true}),1/100);
 close(clueRate({eliteCAs:true,ringOfWealth:true}),1/95);
});
test("Dry odds reflect mutually exclusive primary rewards and independent pet",()=>{
 const x=calculateDry(1,{"dragon-2h-sword":1});
 const p=DRAGON_2H_CHANCE,q=PICKAXE_CHANCE,pet=PET_CHANCE;
 close(x["dragon-2h-sword"].exact,p);
 close(x["dragon-pickaxe"].atLeastOne,q);
 close(x["pet-chaos-elemental"].atLeastOne,pet);
 close(x.anyUnique.expected,p+q+pet);
 close(x.anyUnique.fewer,(1-p-q)*(1-pet));
 close(x.anyUnique.exact,(p+q)*(1-pet)+(1-p-q)*pet);
 close(x.anyUnique.more,(p+q)*pet);
 close(x.anyUnique.atLeastOne,1-(1-p-q)*(1-pet));
 assert.throws(()=>calculateDry(1,{"dragon-2h-sword":1,"dragon-pickaxe":1}));
 const twice=calculateDry(1,{"dragon-2h-sword":1,"pet-chaos-elemental":1});
 close(twice.anyUnique.exact,(p+q)*pet);
});
test("Dry distributions remain normalized at zero and high KC",()=>{
 for(const n of [0,1,2,100,10000,MAX_KILLS]){
  const r=calculateDry(n);
  for(const item of [...UNIQUE.map(x=>r[x.id]),r.anyUnique]){
   close(item.fewer+item.exact+item.more,1,1e-7);
   assert.ok(item.atLeastOne>=0&&item.atLeastOne<=1);
   assert.ok(item.expected>=0);
  }
 }
 assert.deepEqual({...simulate(0).drops},{});
});
test("Invalid KC, options, RNG and received counts throw",()=>{
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateTask("yes"));
 assert.throws(()=>simulate(1,{task:"other"}));
 assert.throws(()=>simulate(1,{eliteCAs:1}));
 assert.throws(()=>clueRate({ringOfWealth:1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>calculateDry(1,{"dragon-pickaxe":-1}));
 assert.throws(()=>calculateDry(1,{"pet-chaos-elemental":2}));
 assert.throws(()=>calculateDry(1,null));
});
test("Chaos Elemental page, options and local PNG item sprites",()=>{
 const home=source("index.html"),html=source("chaos-elemental/index.html");
 const app=source("chaos-elemental/app.mjs");
 assert.match(home,/href="\.\/chaos-elemental\/"/);
 assert.match(home,/assets\/items\/pet-chaos-elemental\.png/);
 assert.match(html,/id="kill-count"/);
 assert.match(html,/id="elite-cas"/);
 assert.match(html,/id="ring-of-wealth"/);
 assert.match(html,/name="slayer-task"/);
 assert.match(html,/value="konar"/);
 assert.match(html,/value="krystilia"/);
 assert.match(html,/id="mode-loot"/);
 assert.match(html,/id="mode-dry"/);
 assert.match(html,/id="unique-grid"/);
 assert.match(html,/id="loot-grid"/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 assert.match(app,/ringOfWealth:\$\("ring-of-wealth"\)\.checked/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" needs a local PNG");
 }
});
