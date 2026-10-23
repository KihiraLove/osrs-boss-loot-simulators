import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,UNIQUE,DRY_ITEMS,ANIMA,ITEMS,BUCKET_RATE,
 FARMING_XP,FARMING_XP_OUTFIT,petRate,rateOf,validateFarmingLevel,validateKills,simulate
} from "../bosses/hespori/simulator.mjs";
import {calculateDry} from "../bosses/hespori/dry-calc.mjs";
const close=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<=e,"Expected "+b+", got "+a);
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("One full 80-ticket normal seed table, including correct stack ranges",()=>{
 assert.equal(MAIN.length,32);
 assert.equal(MAIN.reduce((s,r)=>s+r[4],0),80);
 for(const [id,lo,hi,weight] of [
  ["watermelon-seed",10,20,2],["snape-grass-seed",6,16,2],
  ["white-lily-seed",8,18,5],["limpwurt-seed",6,14,2],
  ["ranarr-seed",1,2,2],["snapdragon-seed",1,1,2],
  ["maple-seed",2,4,4],["teak-seed",2,5,4],
  ["magic-seed",1,1,1],["redwood-tree-seed",1,1,1]
 ]){
  const row=MAIN.find(r=>r[0]===id);
  assert.equal(row?.[2],lo,id+" min");
  assert.equal(row?.[3],hi,id+" max");
  assert.equal(row?.[4],weight,id+" tickets");
 }
});
test("Bucket, seed and pet probabilities are independent and level dependent",()=>{
 close(BUCKET_RATE,1/35);
 close(rateOf("bottomless-compost-bucket"),1/35);
 close(rateOf("white-lily-seed"),34/35*5/80);
 close(rateOf("attas-seed"),1/3);
 close(rateOf("iasor-seed"),1/3);
 close(rateOf("kronos-seed"),1/3);
 close(petRate(65),1/5375);
 close(petRate(99),1/4525);
 close(rateOf("tangleroot",99),petRate(99));
 assert.equal(UNIQUE.length,6);
 assert.equal(ANIMA.length,3);
 assert.equal(DRY_ITEMS.length,2);
 assert.equal(rateOf("unlisted-seed"),0);
});
test("Guaranteed anima + successful bucket pre-roll replaces ordinary seed",()=>{
 const result=simulate(1,{rng:()=>0});
 assert.equal(result.drops["attas-seed"],1);
 assert.equal(result.drops["bottomless-compost-bucket"],1);
 assert.equal(result.drops.tangleroot,1);
 assert.equal(result.drops["watermelon-seed"],undefined);
 assert.equal(result.farmingXp,FARMING_XP);
});
test("Unsuccessful pre-roll gives one weighted normal seed, with inclusive quantity",()=>{
 const seq=[0,0,.99,0,0,.99];
 let i=0;
 const result=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(result.drops["attas-seed"],1);
 assert.equal(result.drops["watermelon-seed"],10);
 assert.equal(result.drops["bottomless-compost-bucket"],undefined);
 assert.equal(result.drops.tangleroot,undefined);
 const highest=simulate(1,{rng:()=>.9999999});
 assert.equal(highest.drops["kronos-seed"],2);
 assert.equal(highest.drops["redwood-tree-seed"],1);
});
test("Outfit and Farming level change XP and pet chance, not guaranteed seed count",()=>{
 const n=7;
 const ordinary=simulate(n,{rng:()=>0,farmingLevel:65});
 const outfit=simulate(n,{rng:()=>0,farmingLevel:99,farmerOutfit:true});
 assert.equal(ordinary.farmingXp,n*FARMING_XP);
 assert.equal(outfit.farmingXp,n*FARMING_XP_OUTFIT);
 assert.equal(ordinary.drops["attas-seed"],n);
 assert.equal(outfit.drops["attas-seed"],n);
});
test("Independent pet and bucket count distributions include both from the same kill",()=>{
 const p=BUCKET_RATE,q=petRate(99);
 const r=calculateDry(1,{"bottomless-compost-bucket":1,tangleroot:1});
 close(r["bottomless-compost-bucket"].exact,p);
 close(r.tangleroot.exact,q);
 close(r.anyUnique.exact,p*q);
 close(r.anyUnique.atLeastOne,p+q-p*q);
 close(r.anyUnique.expected,p+q);
});
test("Dry distributions normalize for realistic and very high kills",()=>{
 for(const n of [0,1,5,35,1000,10000,100000,MAX_KILLS]){
  const r=calculateDry(n,{},65);
  for(const key of ["bottomless-compost-bucket","tangleroot","anyUnique"]){
   const x=r[key];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1,key);
  }
 }
 assert.throws(()=>calculateDry(1,{"bottomless-compost-bucket":2}));
 assert.throws(()=>calculateDry(1,{tangleroot:-1}));
 assert.throws(()=>calculateDry(1,null));
});
test("Validate bounds, RNG, and farming experience options",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 assert.equal(simulate(0,{farmerOutfit:true}).farmingXp,0);
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 for(const level of [0,64,99.5,100,NaN]){
  assert.throws(()=>validateFarmingLevel(level));
  assert.throws(()=>simulate(1,{farmingLevel:level}));
  assert.throws(()=>calculateDry(1,{},level));
 }
 assert.throws(()=>simulate(1,{farmerOutfit:1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
});
test("Homepage, controls, docs, sprites and source are committed",()=>{
 const home=source("index.html");
 const page=source("bosses/hespori/index.html");
 const app=source("bosses/hespori/app.mjs");
 const readme=source("bosses/hespori/README.md");
 assert.match(home,/href="bosses\/hespori\/"/);
 assert.match(readme,/1\/35/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\),farmingLevel\)/);
 for(const id of ["mode-loot","mode-dry","kill-count","farming-level","farmer-outfit",
  "unique-grid","loot-grid","dry-inputs","farming-xp"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
