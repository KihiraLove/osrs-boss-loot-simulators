import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,PRIMARY,PET,UNIQUE,DRY_ITEMS,ITEMS,PRIMARY_RATE,
 VENENATIS_COMMON,SPINDEL_COMMON,SUPPLY,TERTIARY,
 validateKills,rollUnique,simulate
} from "../bosses/venenatis-spindel/simulator.mjs";
import {calculateDry} from "../bosses/venenatis-spindel/dry-calc.mjs";
const approx=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", received "+a);
const weights=x=>x.reduce((sum,row)=>sum+row[2],0);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("All six shared uniques have their verified Venenatis and Spindel rates",()=>{
 assert.equal(PRIMARY.length,5);assert.equal(UNIQUE.length,6);
 assert.deepEqual(PRIMARY.map(x=>x.id),[
  "fangs-of-venenatis","dragon-2h-sword","dragon-pickaxe",
  "voidwaker-gem","treasonous-ring"
 ]);
 assert.deepEqual(PRIMARY.map(x=>Math.round(1/x.venenatis)),[196,256,256,360,512]);
 assert.deepEqual(PRIMARY.map(x=>Math.round(1/x.spindel)),[618,358,358,912,716]);
 assert.equal(1/PET.venenatis,1500);assert.equal(1/PET.spindel,2800);
 assert.equal(DRY_ITEMS.length,6);
 approx(PRIMARY_RATE.venenatis,PRIMARY.reduce((a,x)=>a+x.venenatis,0));
 approx(PRIMARY_RATE.spindel,PRIMARY.reduce((a,x)=>a+x.spindel,0));
});
test("Weighted common tables use separate 126 and 128 tickets",()=>{
 assert.equal(weights(VENENATIS_COMMON),126);
 assert.equal(weights(SPINDEL_COMMON),128);
 const exists=(rows,id,amount,tickets)=>rows.some(r=>r[0]===id&&r[1]===amount&&r[2]===tickets);
 assert.ok(exists(VENENATIS_COMMON,"gold-ore",675,6));
 assert.ok(exists(VENENATIS_COMMON,"red-spiders-eggs",500,3));
 assert.ok(exists(VENENATIS_COMMON,"grimy-snapdragon",100,1));
 assert.ok(exists(SPINDEL_COMMON,"red-spiders-eggs",250,3));
 assert.ok(exists(SPINDEL_COMMON,"grimy-snapdragon",40,1));
 assert.ok(exists(SPINDEL_COMMON,"gold-ore",180,6));
 assert.equal(SUPPLY.length,6);
 assert.deepEqual(TERTIARY.venenatis.map(x=>x[0]),
  ["looting-bag","strange-fruit","clue-scroll-elite","long-bone","curved-bone"]);
 assert.deepEqual(TERTIARY.spindel.map(x=>x[0]),
  ["looting-bag","strange-fruit","clue-scroll-elite"]);
});
test("One exclusive primary item per kill, pet may drop independently",()=>{
 assert.equal(rollUnique("venenatis",()=>0),"fangs-of-venenatis");
 assert.equal(rollUnique("spindel",()=>0),"fangs-of-venenatis");
 assert.equal(rollUnique("venenatis",()=>.99999),null);
 const r=simulate(2,3,{rng:()=>0});
 assert.equal(r.kills,5);assert.equal(r.venenatisKills,2);assert.equal(r.spindelKills,3);
 assert.equal(r.drops["big-bones"],5);
 assert.equal(r.drops["fangs-of-venenatis"],5);
 assert.equal(r.drops["venenatis-spiderling"],5);
 assert.equal(r.drops["blighted-anglerfish"],25);
 assert.equal(r.drops["looting-bag"],5);
 assert.equal(r.drops["strange-fruit"],5);
 assert.equal(r.drops["clue-scroll-elite"],5);
 assert.equal(r.drops["long-bone"],2);
 assert.equal(r.drops["curved-bone"],2);
 assert.equal(r.drops["rune-pickaxe"],undefined);
});
test("Boss-specific ordinary rolls choose their own weights and quantities",()=>{
 const ven=simulate(1,0,{rng:()=>.999999});
 const spi=simulate(0,1,{rng:()=>.999999});
 assert.equal(ven.drops["wilderness-crabs-teleport"],4);
 assert.equal(spi.drops["palm-tree-seed"],1);
 assert.equal(ven.drops["palm-tree-seed"],undefined);
 assert.equal(spi.drops["wilderness-crabs-teleport"],undefined);
 assert.equal(simulate(0,0).kills,0);
});
test("Dry calculator combines nonidentical binomial probabilities for both KCs",()=>{
 const r=calculateDry(1,1,{"voidwaker-gem":1});
 const p=1/360,q=1/912;
 approx(r["voidwaker-gem"].expected,p+q);
 approx(r["voidwaker-gem"].fewer,(1-p)*(1-q));
 approx(r["voidwaker-gem"].exact,p*(1-q)+(1-p)*q);
 approx(r["voidwaker-gem"].more,p*q);
 approx(r["voidwaker-gem"].atLeastOne,1-(1-p)*(1-q));
 const pet=calculateDry(2,3)["venenatis-spiderling"];
 approx(pet.expected,2/1500+3/2800);
 approx(pet.atLeastOne,1-(1-1/1500)**2*(1-1/2800)**3);
});
test("Any-unique odds count mutually exclusive primaries and independent pet",()=>{
 const x=calculateDry(1,0,{"fangs-of-venenatis":1,"venenatis-spiderling":1});
 const p=PRIMARY_RATE.venenatis,q=PET.venenatis;
 approx(x.anyPrimary.exact,p);
 approx(x.anyUnique.exact,p*q);
 approx(x.anyUnique.atLeastOne,1-(1-p)*(1-q));
 assert.throws(()=>calculateDry(1,0,{"fangs-of-venenatis":1,"dragon-pickaxe":1}));
 const y=calculateDry(0,1,{"venenatis-spiderling":1});
 approx(y.anyUnique.more,PRIMARY_RATE.spindel*PET.spindel);
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
 assert.throws(()=>calculateDry(1,1,{"voidwaker-gem":3}));
 assert.throws(()=>calculateDry(1,1,{"treasonous-ring":-1}));
 assert.throws(()=>calculateDry(1,1,null));
});
test("Combined page uses two KCs, one inventory and local sprites",()=>{
 const home=read("index.html"),page=read("venenatis-spindel/index.html"),app=read("venenatis-spindel/app.mjs");
 assert.match(home,/href="\.\/venenatis-spindel\/"/);
 assert.match(home,/assets\/items\/venenatis-spiderling\.png/);
 assert.match(page,/id="venenatis-kc"/);assert.match(page,/id="spindel-kc"/);
 assert.match(page,/id="mode-loot"/);assert.match(page,/id="mode-dry"/);
 assert.match(page,/id="unique-grid"/);assert.match(page,/id="loot-grid"/);
 assert.match(page,/id="dry-inputs"/);
 assert.match(app,/simulate\(venenatis,spindel\)/);
 assert.match(app,/calculateDry\(venenatis,spindel,readReceived\(venenatis\+spindel\)\)/);
 assert.doesNotMatch(page,/id="kill-count"/);
 for(const item of Object.values(ITEMS)){
  const img=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...img.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG missing");
 }
});
