import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,SEEDS,RESTRICTED_SEEDS,HERBS,COMBAT_HERBS,GEM,TALISMANS,
 UNIQUE,ITEMS,DRY_ITEMS,rateOf,validateKills,clueRate,rollMain,simulate
} from "../bosses/shellbane-gryphon/simulator.mjs";
import {calculateDry,anyUniqueChance} from "../bosses/shellbane-gryphon/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,`Expected ${b}, got ${a}`);
const src=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const point=(table,name)=>{
 let past=0;
 for(const row of table){if(row[0]===name)return (past+row[3]/2)/table.reduce((s,x)=>s+x[3],0);past+=row[3];}
 throw Error("Missing "+name);
};
const seq=values=>{let i=0;return ()=>values[i++]??0.99;};

test("128-ticket main table has two draws per kill and exact nested table weights",()=>{
 assert.equal(MAIN.reduce((n,row)=>n+row[3],0),128);
 assert.equal(MAIN.filter(row=>!row[0].startsWith("@")).reduce((n,row)=>n+row[3],0),96);
 assert.equal(MAIN.find(row=>row[0]==="@seed")[3],15);
 assert.equal(MAIN.find(row=>row[0]==="@restricted-seed")[3],5);
 assert.equal(MAIN.find(row=>row[0]==="@herb")[3],6);
 assert.equal(MAIN.find(row=>row[0]==="@combat-herb")[3],5);
 assert.equal(MAIN.find(row=>row[0]==="@gem")[3],1);
 for(const [table,sum] of [[SEEDS,16],[RESTRICTED_SEEDS,16],[HERBS,128],[COMBAT_HERBS,16],[GEM,128],[TALISMANS,70]])
  assert.equal(table.reduce((s,r)=>s+r[3],0),sum);
});

test("Two regular loot rolls can yield the same reward alongside separate pre-roll and tertiary",()=>{
 const x=simulate(1,{rng:()=>0,konarTask:true});
 assert.equal(x.drops["big-bones"],1);
 assert.equal(x.drops["gryphon-feather"],7);
 assert.equal(x.drops["rune-claws"],2);
 assert.equal(x.drops["belles-folly-tarnished"],1);
 assert.equal(x.drops["jar-of-feathers"],1);
 assert.equal(x.drops.gull,1);
 assert.equal(x.drops["long-bone"],1);
 assert.equal(x.drops["curved-bone"],1);
 assert.equal(x.drops["clue-scroll-elite"],1);
 assert.equal(x.drops["brimstone-key"],undefined);
});
test("Every main branch is reachable, with nested seed, herb and gem rolls",()=>{
 assert.deepEqual(rollMain(seq([point(MAIN,"@seed"),0,0])),["potato-seed",1]);
 assert.deepEqual(rollMain(seq([point(MAIN,"@restricted-seed"),0,0])),["tomato-seed",1]);
 assert.deepEqual(rollMain(seq([point(MAIN,"@herb"),0])),["grimy-guam-leaf",1]);
 assert.deepEqual(rollMain(seq([point(MAIN,"@combat-herb"),0])),["grimy-kwuarm",1]);
 assert.deepEqual(rollMain(seq([point(MAIN,"@gem"),0.5])),["uncut-sapphire",1]);
 assert.equal(rollMain(seq([point(MAIN,"@gem"),0])),null);
 assert.deepEqual(rollMain(seq([point(MAIN,"adamant-cannonball"),0])),["adamant-cannonball",35]);
 assert.deepEqual(rollMain(seq([point(MAIN,"adamant-cannonball"),0.99])),["adamant-cannonball",50]);
});
test("Pre-roll and collection-log rates are current",()=>{
 assert.deepEqual(UNIQUE.map(x=>x.id),["belles-folly-tarnished","jar-of-feathers","gull"]);
 assert.equal(UNIQUE,DRY_ITEMS);
 close(rateOf("belles-folly-tarnished"),1/75);
 close(rateOf("jar-of-feathers"),1/2000);
 close(rateOf("gull"),1/3000);
 close(rateOf("missing"),0);
 close(clueRate(),1/200);
 close(clueRate(true),1/190);
 assert.throws(()=>clueRate("yes"));
});
test("Removed clue-step mode cannot award a guaranteed clue or casket",()=>{
 const x=simulate(1,{rng:()=>0.99,clueStep:true});
 assert.equal(x.drops["reward-casket-elite"],undefined);
 assert.equal(x.drops["clue-scroll-elite"],undefined);
 assert.equal(x.drops["brimstone-key"],undefined);
 const ordinary=simulate(1,{rng:()=>0.99});
 assert.equal(ordinary.drops["reward-casket-elite"],undefined);
 assert.doesNotThrow(()=>simulate(1,{konarTask:true,clueStep:true}));
});
test("Binomial dry odds and any unique chance are normalized",()=>{
 const chance=1-(1-1/75)*(1-1/2000)*(1-1/3000);
 close(anyUniqueChance(0),0);
 close(anyUniqueChance(1),chance);
 close(anyUniqueChance(10),1-(1-chance)**10,1e-9);
 for(const kc of [0,1,2,10,100,1000,10000,MAX_KILLS]){
  const r=calculateDry(kc);
  close(r.anyUniqueChance,anyUniqueChance(kc));
  for(const item of UNIQUE){
   const x=r[item.id];
   close(x.fewer+x.exact+x.more,1,1e-8);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 const one=calculateDry(1,{"belles-folly-tarnished":1});
 close(one["belles-folly-tarnished"].exact,1/75);
 close(one["jar-of-feathers"].exact,1-1/2000);
 assert.throws(()=>calculateDry(1,{"gull":2}));
 assert.throws(()=>calculateDry(0,{"jar-of-feathers":1}));
 assert.throws(()=>calculateDry(1,null));
});
test("Zero kills and invalid numbers/options/RNG are rejected appropriately",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.1,MAX_KILLS+1,NaN,Infinity]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.doesNotThrow(()=>simulate(1,{konarTask:5}));
 assert.throws(()=>simulate(1,{eliteCAs:"yes"}));
 assert.doesNotThrow(()=>simulate(1,{clueStep:1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
});
test("Page, local icons, and README integration",()=>{
 const home=src("index.html"),page=src("bosses/shellbane-gryphon/index.html");
 const app=src("bosses/shellbane-gryphon/app.mjs"),readme=src("bosses/shellbane-gryphon/README.md");
 assert.match(home,/href="bosses\/shellbane-gryphon\/"/);
 assert.match(readme,/two separate ordinary loot rolls/i);
 for(const id of ["kill-count","elite-cas","mode-loot","mode-dry","unique-grid","loot-grid","dry-any-unique"]){
  assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
 }
 assert.match(app,/anyUniqueChance/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
