import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,PRIMARY,PET,UNIQUE,DRY_ITEMS,ITEMS,PRIMARY_RATE,
 VETION_COMMON,CALVARION_COMMON,SUPPLY,TERTIARY,
 validateKills,rollUnique,simulate
} from "../vetion-calvarion/simulator.mjs";
import {calculateDry} from "../vetion-calvarion/dry-calc.mjs";
const approx=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", received "+a);
const weights=x=>x.reduce((sum,row)=>sum+row[2],0);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("All six shared uniques have their verified Vet'ion and Calvar'ion rates",()=>{
 assert.equal(PRIMARY.length,5);assert.equal(UNIQUE.length,6);
 assert.deepEqual(PRIMARY.map(x=>x.id),[
  "skull-of-vetion","dragon-2h-sword","dragon-pickaxe",
  "voidwaker-blade","ring-of-the-gods"
 ]);
 assert.deepEqual(PRIMARY.map(x=>Math.round(1/x.vetion)),[196,256,256,360,512]);
 assert.deepEqual(PRIMARY.map(x=>Math.round(1/x.calvarion)),[618,358,358,912,716]);
 assert.equal(1/PET.vetion,1500);assert.equal(1/PET.calvarion,2800);
 assert.equal(DRY_ITEMS.length,6);
 approx(PRIMARY_RATE.vetion,PRIMARY.reduce((a,x)=>a+x.vetion,0));
 approx(PRIMARY_RATE.calvarion,PRIMARY.reduce((a,x)=>a+x.calvarion,0));
});
test("Weighted common tables use separate 126 and 128 tickets",()=>{
 assert.equal(weights(VETION_COMMON),126);
 assert.equal(weights(CALVARION_COMMON),128);
 const exists=(rows,id,amount,tickets)=>rows.some(r=>r[0]===id&&r[1]===amount&&r[2]===tickets);
 assert.ok(exists(VETION_COMMON,"mystic-fire-staff",4,2));
 assert.ok(exists(VETION_COMMON,"gold-ore",675,6));
 assert.ok(exists(VETION_COMMON,"sanfew-serum-4",20,5));
 assert.ok(exists(CALVARION_COMMON,"ancient-staff",1,3));
 assert.ok(exists(CALVARION_COMMON,"sanfew-serum-4",6,5));
 assert.ok(exists(CALVARION_COMMON,"gold-ore",200,6));
 assert.equal(SUPPLY.length,6);
 for(const type of ["vetion","calvarion"]){
  assert.deepEqual(TERTIARY[type].map(x=>x[0]),
   ["looting-bag","clue-scroll-elite","long-bone","curved-bone","skeleton-champion-scroll"]);
 }
});
test("One exclusive primary item per kill, pet may drop independently",()=>{
 assert.equal(rollUnique("vetion",()=>0),"skull-of-vetion");
 assert.equal(rollUnique("calvarion",()=>0),"skull-of-vetion");
 assert.equal(rollUnique("vetion",()=>.99999),null);
 const r=simulate(2,3,{rng:()=>0});
 assert.equal(r.kills,5);assert.equal(r.vetionKills,2);assert.equal(r.calvarionKills,3);
 assert.equal(r.drops["big-bones"],5);
 assert.equal(r.drops["skull-of-vetion"],5);
 assert.equal(r.drops["vetion-jr"],5);
 assert.equal(r.drops["blighted-anglerfish"],25);
 assert.equal(r.drops["looting-bag"],5);
 assert.equal(r.drops["clue-scroll-elite"],5);
 assert.equal(r.drops["long-bone"],5);
 assert.equal(r.drops["curved-bone"],5);
 assert.equal(r.drops["skeleton-champion-scroll"],5);
 assert.equal(r.drops["rune-pickaxe"],undefined);
});
test("Boss-specific ordinary rolls choose their own weights and quantities",()=>{
 const ven=simulate(1,0,{rng:()=>.999999});
 const spi=simulate(0,1,{rng:()=>.999999});
 assert.equal(ven.drops["wilderness-crabs-teleport"],4);
 assert.equal(spi.drops["dark-fishing-bait"],280);
 assert.equal(ven.drops["dark-fishing-bait"],undefined);
 assert.equal(spi.drops["wilderness-crabs-teleport"],undefined);
 assert.equal(simulate(0,0).kills,0);
});
test("Dry calculator combines nonidentical binomial probabilities for both KCs",()=>{
 const r=calculateDry(1,1,{"voidwaker-blade":1});
 const p=1/360,q=1/912;
 approx(r["voidwaker-blade"].expected,p+q);
 approx(r["voidwaker-blade"].fewer,(1-p)*(1-q));
 approx(r["voidwaker-blade"].exact,p*(1-q)+(1-p)*q);
 approx(r["voidwaker-blade"].more,p*q);
 approx(r["voidwaker-blade"].atLeastOne,1-(1-p)*(1-q));
 const pet=calculateDry(2,3)["vetion-jr"];
 approx(pet.expected,2/1500+3/2800);
 approx(pet.atLeastOne,1-(1-1/1500)**2*(1-1/2800)**3);
});
test("Any-unique odds count mutually exclusive primaries and independent pet",()=>{
 const x=calculateDry(1,0,{"skull-of-vetion":1,"vetion-jr":1});
 const p=PRIMARY_RATE.vetion,q=PET.vetion;
 approx(x.anyPrimary.exact,p);
 approx(x.anyUnique.exact,p*q);
 approx(x.anyUnique.atLeastOne,1-(1-p)*(1-q));
 assert.throws(()=>calculateDry(1,0,{"skull-of-vetion":1,"dragon-pickaxe":1}));
 const y=calculateDry(0,1,{"vetion-jr":1});
 approx(y.anyUnique.more,PRIMARY_RATE.calvarion*PET.calvarion);
});
test("Dry probability distributions normalize for mixed and maximum KC",()=>{
 for(const [v,s] of [[0,0],[1,0],[0,1],[10,20],[250,900],[100000,150000],[MAX_KILLS,MAX_KILLS]]){
  const r=calculateDry(v,s);
  for(const item of [...UNIQUE.map(x=>r[x.id]),r.anyPrimary,r.anyUnique]){
   approx(item.fewer+item.exact+item.more,1,1e-7);
   assert.ok(item.atLeastOne>=0&&item.atLeastOne<=1);
  }
 }
});
test("Invalid KCs, received counts, and RNG values are rejected",()=>{
 for(const v of [-1,1.2,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(v));
  assert.throws(()=>simulate(v,0));
  assert.throws(()=>simulate(0,v));
  assert.throws(()=>calculateDry(v,0));
 }
 assert.throws(()=>simulate(1,1,{rng:()=>1}));
 assert.throws(()=>rollUnique("unknown",()=>0));
 assert.throws(()=>calculateDry(1,1,{"voidwaker-blade":3}));
 assert.throws(()=>calculateDry(1,1,{"ring-of-the-gods":-1}));
 assert.throws(()=>calculateDry(1,1,null));
});
test("Combined page uses two KCs, one inventory and local sprites",()=>{
 const home=read("index.html"),page=read("vetion-calvarion/index.html"),app=read("vetion-calvarion/app.mjs");
 assert.match(home,/href="\.\/vetion-calvarion\/"/);
 assert.match(home,/assets\/items\/vetion-jr\.png/);
 assert.match(page,/id="vetion-kc"/);assert.match(page,/id="calvarion-kc"/);
 assert.match(page,/id="mode-loot"/);assert.match(page,/id="mode-dry"/);
 assert.match(page,/id="unique-grid"/);assert.match(page,/id="loot-grid"/);
 assert.match(page,/id="dry-inputs"/);
 assert.match(app,/simulate\(vetion,calvarion\)/);
 assert.match(app,/calculateDry\(vetion,calvarion,readReceived\(vetion\+calvarion\)\)/);
 assert.doesNotMatch(page,/id="kill-count"/);
 for(const item of Object.values(ITEMS)){
  const img=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...img.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG missing");
 }
});
