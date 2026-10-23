import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,PRIMARY,PET,UNIQUE,DRY_ITEMS,ITEMS,PRIMARY_RATE,
 CALLISTO_COMMON,ARTIO_COMMON,SUPPLY,TERTIARY,validateKills,rollUnique,simulate
} from "../bosses/callisto-artio/simulator.mjs";
import {calculateDry} from "../bosses/callisto-artio/dry-calc.mjs";
const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t,"Expected "+b+", got "+a);
const sum=rows=>rows.reduce((s,row)=>s+row[2],0);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Callisto and Artio unique drops match the two Wiki rate tables",()=>{
 assert.equal(PRIMARY.length,5);
 assert.equal(UNIQUE.length,6);assert.equal(DRY_ITEMS.length,6);
 assert.deepEqual(PRIMARY.map(x=>x.id),
  ["claws-of-callisto","dragon-2h-sword","dragon-pickaxe","voidwaker-hilt","tyrannical-ring"]);
 assert.deepEqual(PRIMARY.map(x=>Math.round(1/x.callisto)),[196,256,256,360,512]);
 assert.deepEqual(PRIMARY.map(x=>Math.round(1/x.artio)),[618,358,358,912,716]);
 assert.equal(1/PET.callisto,1500);assert.equal(1/PET.artio,2800);
 near(PRIMARY_RATE.callisto,PRIMARY.reduce((s,x)=>s+x.callisto,0));
 near(PRIMARY_RATE.artio,PRIMARY.reduce((s,x)=>s+x.artio,0));
});
test("Callisto has 126-ticket and Artio 128-ticket ordinary tables",()=>{
 assert.equal(sum(CALLISTO_COMMON),126);
 assert.equal(sum(ARTIO_COMMON),128);
 assert.equal(SUPPLY.length,6);
 for(const boss of ["callisto","artio"]){
  assert.equal(TERTIARY[boss].length,4);
  assert.equal(TERTIARY[boss][0][1],1/3);
 }
 assert.equal(rollUnique("callisto",()=>0),"claws-of-callisto");
 assert.equal(rollUnique("artio",()=>0),"claws-of-callisto");
 assert.equal(rollUnique("callisto",()=>.999999),null);
 assert.equal(rollUnique("artio",()=>.999999),null);
});
test("Bosses share a combined inventory but retain their independent drop rolls",()=>{
 const r=simulate(3,7,{rng:()=>0});
 assert.equal(r.callistoKills,3);
 assert.equal(r.artioKills,7);
 assert.equal(r.kills,10);
 assert.equal(r.drops["big-bones"],10);
 assert.equal(r.drops["claws-of-callisto"],10);
 assert.equal(r.drops["callisto-cub"],10);
 assert.equal(r.drops["blighted-anglerfish"],50);
 assert.equal(r.drops["looting-bag"],10);
 assert.equal(r.drops["clue-scroll-elite"],10);
 assert.equal(r.drops["long-bone"],10);
 assert.equal(r.drops["curved-bone"],10);
 assert.equal(r.drops["rune-pickaxe"],undefined);
});
test("Common rolls use their respective tables and quantities",()=>{
 const c=simulate(1,0,{rng:()=>.999999});
 assert.equal(c.drops["wilderness-crabs-teleport"],4);
 assert.equal(c.drops["palm-tree-seed"],undefined);
 const a=simulate(0,1,{rng:()=>.999999});
 assert.equal(a.drops["palm-tree-seed"],1);
 assert.equal(a.drops["wilderness-crabs-teleport"],undefined);
 assert.equal(simulate(0,0).kills,0);
 const rolls=[.99999,.99999,.1,.51,.99999,...Array(5).fill(.99999)];
 let i=0;
 const supply=simulate(1,0,{rng:()=>rolls[i++]??.99999});
 assert.equal(supply.drops["blighted-super-restore-4"],4);
});
test("Dry odds combine Callisto and Artio probability distributions",()=>{
 const r=calculateDry(1,1,{"voidwaker-hilt":1});
 const pc=1/360,pa=1/912;
 near(r["voidwaker-hilt"].atLeastOne,1-(1-pc)*(1-pa));
 near(r["voidwaker-hilt"].expected,pc+pa);
 near(r["voidwaker-hilt"].fewer,(1-pc)*(1-pa));
 near(r["voidwaker-hilt"].exact,pc*(1-pa)+(1-pc)*pa);
 near(r["voidwaker-hilt"].more,pc*pa);
 const pet=calculateDry(2,3,{"callisto-cub":0})["callisto-cub"];
 near(pet.expected,2/1500+3/2800);
 near(pet.atLeastOne,1-Math.pow(1-1/1500,2)*Math.pow(1-1/2800,3));
});
test("Primary uniques remain exclusive per kill, pet may drop alongside",()=>{
 const a=calculateDry(1,0,{"claws-of-callisto":1,"callisto-cub":1});
 near(a.anyPrimary.exact,PRIMARY_RATE.callisto);
 near(a.anyUnique.exact,PRIMARY_RATE.callisto*PET.callisto);
 near(a.anyUnique.atLeastOne,1-(1-PRIMARY_RATE.callisto)*(1-PET.callisto));
 near(a.anyUnique.expected,PRIMARY_RATE.callisto+PET.callisto);
 assert.throws(()=>calculateDry(1,0,{"claws-of-callisto":1,"dragon-pickaxe":1}));
 const b=calculateDry(0,1,{"callisto-cub":1});
 near(b.anyPrimary.atLeastOne,PRIMARY_RATE.artio);
 near(b.anyUnique.more,PRIMARY_RATE.artio*PET.artio);
});
test("Dry calculator normalizes for mixed and large kill counts",()=>{
 for(const [c,a] of [[0,0],[1,0],[0,1],[10,100],[1000,100],[100000,50000],[MAX_KILLS,MAX_KILLS]]){
  const r=calculateDry(c,a);
  for(const v of [...UNIQUE.map(x=>r[x.id]),r.anyPrimary,r.anyUnique]){
   near(v.fewer+v.exact+v.more,1,1e-7);
   assert.ok(v.atLeastOne>=0&&v.atLeastOne<=1);
  }
 }
});
test("Input validation rejects negative, fractional and impossible rare drop counts",()=>{
 for(const n of [-1,.3,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n,0));
  assert.throws(()=>simulate(0,n));
  assert.throws(()=>calculateDry(n,0));
 }
 assert.throws(()=>calculateDry(1,1,{"voidwaker-hilt":3}));
 assert.throws(()=>calculateDry(1,1,{"claws-of-callisto":-1}));
 assert.throws(()=>calculateDry(1,1,null));
 assert.throws(()=>simulate(1,1,{rng:()=>1}));
 assert.throws(()=>rollUnique("not-boss",()=>0));
});
test("Combined website page and all required local sprites exist",()=>{
 const home=read("index.html"),page=read("callisto-artio/index.html");
 const app=read("callisto-artio/app.mjs");
 assert.match(home,/href="\.\/callisto-artio\/"/);
 assert.match(home,/assets\/items\/callisto-cub\.png/);
 assert.match(page,/id="callisto-kc"/);
 assert.match(page,/id="artio-kc"/);
 assert.match(page,/id="mode-loot"/);
 assert.match(page,/id="mode-dry"/);
 assert.match(page,/id="unique-grid"/);
 assert.match(page,/id="dry-inputs"/);
 assert.match(app,/simulate\(callisto,artio\)/);
 assert.match(app,/calculateDry\(callisto,artio,readReceived\(callisto\+artio\)\)/);
 assert.doesNotMatch(page,/id="kill-count"/);
 for(const item of Object.values(ITEMS)){
  const icon=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" must have a local PNG");
 }
});
