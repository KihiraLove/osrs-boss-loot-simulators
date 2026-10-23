import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MODES,UNIQUE,DRY_ITEMS,REGULAR_TABLE,CORRUPTED_TABLE,ITEMS,
 validateKills,rateOf,simulate
} from "../bosses/gauntlet/simulator.mjs";
import {combinedDistribution,calculateDry,atLeastOne} from "../bosses/gauntlet/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Completed chests use 2 regular or 3 corrupted rolls, with 24-ticket tables",()=>{
 assert.equal(MODES.regular.rolls,2);
 assert.equal(MODES.corrupted.rolls,3);
 assert.equal(REGULAR_TABLE.length,24);
 assert.equal(CORRUPTED_TABLE.length,24);
 close(REGULAR_TABLE.reduce((s,row)=>s+row[3],0),24);
 close(CORRUPTED_TABLE.reduce((s,row)=>s+row[3],0),24);
 assert.deepEqual(REGULAR_TABLE.find(row=>row[0]==="dragon-halberd"),["dragon-halberd",1,1,0.5]);
 assert.deepEqual(CORRUPTED_TABLE.find(row=>row[0]==="dragon-halberd"),["dragon-halberd",1,2,0.5]);
 assert.deepEqual(REGULAR_TABLE.find(row=>row[0]==="coins"),["coins",20000,80000,1.5]);
 assert.deepEqual(CORRUPTED_TABLE.find(row=>row[0]==="coins"),["coins",75000,150000,1.5]);
 assert.deepEqual(REGULAR_TABLE.find(row=>row[0]==="rune-full-helm"),["rune-full-helm",2,4,1]);
 assert.deepEqual(CORRUPTED_TABLE.find(row=>row[0]==="rune-full-helm"),["rune-full-helm",3,5,1]);
});

test("Seed, pet, and elite clue rates differ between the two variants",()=>{
 close(rateOf("regular","crystal-weapon-seed"),1/120);
 close(rateOf("regular","crystal-armour-seed"),1/120);
 close(rateOf("regular","enhanced-crystal-weapon-seed"),1/2000);
 close(rateOf("regular","youngllef"),1/2000);
 close(rateOf("corrupted","crystal-weapon-seed"),1/50);
 close(rateOf("corrupted","crystal-armour-seed"),1/50);
 close(rateOf("corrupted","enhanced-crystal-weapon-seed"),1/400);
 close(rateOf("corrupted","youngllef"),1/800);
 close(rateOf("regular","clue-scroll-elite"),1/25);
 close(rateOf("corrupted","clue-scroll-elite"),1/20);
 close(MODES.regular.clueElite,1/23);
 close(MODES.corrupted.clueElite,1/19);
 assert.throws(()=>rateOf("other","youngllef"));
 assert.deepEqual(DRY_ITEMS,UNIQUE);
});

test("Regular and corrupted kills produce one combined loot inventory",()=>{
 const results=simulate(1,1,{rng:()=>0});
 assert.equal(results.regularKills,1);
 assert.equal(results.corruptedKills,1);
 assert.equal(results.kills,2);
 assert.equal(results.drops["crystal-shard"],12); // regular 5 + corrupted 7
 assert.equal(results.drops["rune-full-helm"],13); // 2 × 2 + 3 × 3
 for(const unique of UNIQUE)assert.equal(results.drops[unique.id],2); // four independent checks
 assert.equal(results.drops["clue-scroll-elite"],2);
 assert.equal(results.drops["gauntlet-cape"],1);
 const onlyRegular=simulate(1,0,{rng:()=>0});
 assert.equal(onlyRegular.drops["crystal-shard"],5);
 assert.equal(onlyRegular.drops["rune-full-helm"],4);
 assert.equal(onlyRegular.drops["gauntlet-cape"],undefined);
 const onlyCorrupted=simulate(0,1,{rng:()=>0});
 assert.equal(onlyCorrupted.drops["crystal-shard"],7);
 assert.equal(onlyCorrupted.drops["rune-full-helm"],9);
});

test("Chest quantities and first-time cape are modeled correctly",()=>{
 const result=simulate(1,1,{rng:()=>0.999999});
 assert.equal(result.drops["crystal-shard"],21); // regular 9 + corrupted 12
 assert.equal(result.drops.coins,2*80000+3*150000);
 assert.equal(result.drops["gauntlet-cape"],1);
 assert.equal(simulate(1,5,{rng:()=>0.999999}).drops["gauntlet-cape"],1);
 assert.equal(simulate(0,2,{rng:()=>0.999999,includeCape:false}).drops["gauntlet-cape"],undefined);
 assert.deepEqual({...simulate(0,0).drops},{});
});

test("Mixed-mode dry distribution is a convolution, not an averaged binomial",()=>{
 const p=1/120,q=1/50;
 const r=calculateDry(1,1,{"crystal-weapon-seed":1});
 close(r["crystal-weapon-seed"].expected,p+q);
 close(r["crystal-weapon-seed"].exact,p*(1-q)+(1-p)*q);
 close(r["crystal-weapon-seed"].fewer,(1-p)*(1-q));
 close(r["crystal-weapon-seed"].more,p*q);
 close(r["crystal-weapon-seed"].atLeastOne,1-(1-p)*(1-q));
 close(combinedDistribution(1,1,p,q).values.reduce((a,b)=>a+b,0),1);
 close(r["youngllef"].expected,1/2000+1/800);
});

test("Any seed and any unique chances combine independent per-chest events",()=>{
 const r=calculateDry(1,1);
 const regularSeedNone=(1-1/120)**2*(1-1/2000);
 const corruptedSeedNone=(1-1/50)**2*(1-1/400);
 close(r.anySeed.atLeastOne,1-regularSeedNone*corruptedSeedNone);
 close(r.anyUnique.atLeastOne,1-regularSeedNone*corruptedSeedNone*
  (1-1/2000)*(1-1/800));
 close(atLeastOne(1,1,1/120,1/50),1-(1-1/120)*(1-1/50));
 close(calculateDry(0,0).anyUnique.atLeastOne,0);
});

test("Dry distribution probabilities remain normalized at multiple kill counts",()=>{
 for(const [a,b] of [[0,0],[1,0],[0,1],[3,7],[100,50],[1000,200],[10000,1000]]){
  const results=calculateDry(a,b);
  assert.equal(results.kills,a+b);
  for(const item of DRY_ITEMS){
   const r=results[item.id];
   close(r.fewer+r.exact+r.more,1,1e-7);
   assert.ok(r.atLeastOne>=0&&r.atLeastOne<=1);
  }
 }
});

test("Reject invalid kill counts, options, random values and received counts",()=>{
 for(const count of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(count));
  assert.throws(()=>simulate(count,0));
  assert.throws(()=>simulate(0,count));
  assert.throws(()=>calculateDry(0,count));
 }
 assert.throws(()=>simulate(1,0,{eliteCAs:1}));
 assert.throws(()=>simulate(0,1,{includeCape:1}));
 assert.throws(()=>simulate(1,1,{rng:null}));
 assert.throws(()=>simulate(1,1,{rng:()=>1}));
 assert.throws(()=>simulate(1,1,{rng:()=>-0.1}));
 assert.throws(()=>calculateDry(1,1,null));
 assert.throws(()=>calculateDry(1,1,{"youngllef":3}));
 assert.throws(()=>calculateDry(0,0,{"crystal-armour-seed":1}));
 assert.throws(()=>calculateDry(0,1,{"crystal-armour-seed":-1}));
});

test("Browser UI combines both modes and has all required local item sprites",()=>{
 const home=source("index.html");
 const readme=source("README.md");
 const html=source("gauntlet/index.html");
 const app=source("gauntlet/app.mjs");
 assert.match(home,/href="\.\/gauntlet\/"/);
 assert.match(readme,/\[The Gauntlet\]\(\.\/gauntlet\/README\.md\)/);
 assert.match(app,/calculateDry\(n\.regular,n\.corrupted,readReceived\(n\.regular\+n\.corrupted\)\)/);
 assert.match(app,/simulate\(n\.regular,n\.corrupted/);
 for(const id of ["regular-kills","corrupted-kills","elite-cas","include-cape",
  "mode-loot","mode-dry","dry-inputs","unique-grid","loot-grid","total-summary"]){
  assert.ok(html.includes('id="'+id+'"'),id+" control missing");
 }
 for(const item of Object.values(ITEMS)){
  const data=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
