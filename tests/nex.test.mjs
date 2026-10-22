import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_SHARDS,UNIQUE,UNIQUE_RATE,SHARDS_PER_KILL,ITEMS,OTHER_RATES,COMMON_POOL,exposureOf,validateShards,samplePoisson,simulate} from "../nex/simulator.mjs";
import {calculateDry} from "../nex/dry-calc.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,"Expected "+b+", got "+a);
test("Wiki shard bundle means and the six weighted unique rates",()=>{
 close(SHARDS_PER_KILL,5/82*82.5+8/209*90);
 close(exposureOf(SHARDS_PER_KILL*0||0),0);
 close(exposureOf(100),100/SHARDS_PER_KILL);
 assert.equal(UNIQUE.filter(x=>x.weight>0).length,6);
 assert.equal(UNIQUE.reduce((n,x)=>n+x.weight,0),12);
 close(UNIQUE.filter(x=>x.weight>0).reduce((n,x)=>n+x.rate,0),UNIQUE_RATE);
 const horn=UNIQUE.find(x=>x.id==="nihil-horn");
 close(horn.rate,1/258);
});
test("No KC input; zero shards give no rolled rewards",()=>{
 const result=simulate(0,{rng:()=>0.5});
 assert.equal(result.shards,0);
 assert.equal(result.exposure,0);
 assert.deepEqual({...result.rares},{});
 assert.deepEqual({...result.other},{});
 assert.deepEqual({...result.common},{});
 assert.deepEqual({...result.drops},{});
 const dry=calculateDry(0);
 assert.equal(dry.anyUnique.atLeastOne,0);
 assert.equal(dry.nexling.atLeastOne,0);
 assert.equal(dry.anyUnique.exact,1);
});
test("Simulator preserves actual shard total and never manufactures shard loot",()=>{
 const a=simulate(400,{rng:()=>0.5});
 assert.equal(a.other["nihil-shard"],400);
 assert.equal(a.drops["nihil-shard"],400);
 assert.equal(a.common["nihil-shard"],undefined);
 assert.equal(a.rares["nihil-shard"],undefined);
 close(a.exposure,400/SHARDS_PER_KILL);
 assert.equal(a.estimatedCommonRolls,Math.floor(a.exposure*2)+1);
 for(const id of Object.keys(a.drops))assert.ok(ITEMS[id],id);
});
test("Dry chances are Poisson in shard-derived contribution exposure",()=>{
 const shards=1000,e=shards/SHARDS_PER_KILL;
 const r=calculateDry(shards,{"nihil-horn":1,"ancient-hilt":2});
 close(r["nihil-horn"].expected,e/258);
 close(r["nihil-horn"].atLeastOne,-Math.expm1(-e/258));
 close(r.anyUnique.expected,e/43);
 assert.equal(r.anyUnique.count,3);
 close(r.anyUnique.atLeastOne,-Math.expm1(-e/43));
 close(r["nihil-horn"].exact,Math.exp(-e/258)*(e/258));
 close(r["ancient-hilt"].exact,Math.exp(-e/516)*(e/516)**2/2);
 close(r["nexling"].expected,e/500);
});
test("All dry distributions normalize for large and small exposure",()=>{
 for(const shards of [0,1,20,100,2000,25000,MAX_SHARDS]){
  const v=calculateDry(shards);
  for(const id of ["anyUnique",...UNIQUE.map(x=>x.id)]){
   const r=v[id];
   close(r.exact+r.fewer+r.more,1,1e-7);
   assert.ok(r.atLeastOne>=0&&r.atLeastOne<=1);
  }
 }
});
test("Poisson sampler rejects unsafe RNG and avoids underflow at high exposure",()=>{
 assert.equal(samplePoisson(0,()=>0.5),0);
 assert.equal(samplePoisson(1,()=>0),0);
 assert.ok(Number.isSafeInteger(samplePoisson(2000,()=>0.5)));
 assert.throws(()=>samplePoisson(1,()=>1));
 assert.throws(()=>samplePoisson(-1));
 assert.throws(()=>samplePoisson(1,null));
});
test("Common loot comes from labelled illustrative pool, with paired drops",()=>{
 assert.ok(COMMON_POOL.some(x=>x[0]==="@shark-prayer"));
 assert.ok(COMMON_POOL.some(x=>x[0]==="@brew-restore"));
 assert.ok(OTHER_RATES.some(x=>x.id==="clue-scroll-elite"&&x.rate===1/48));
 // RNG can force different illustrative categories without affecting actual shard input.
 const result=simulate(10,{rng:()=>0});
 assert.equal(result.other["nihil-shard"],10);
 assert.ok(result.estimatedCommonRolls>0);
 assert.ok(result.common["air-rune"]>0);
});
test("Input count and option validation",()=>{
 for(const n of [-1,1.1,NaN,Infinity,MAX_SHARDS+1]){
  assert.throws(()=>validateShards(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(10,{rng:null}));
 assert.throws(()=>simulate(10,{rng:()=>1}));
 assert.throws(()=>simulate(10,{eliteCAs:1}));
 assert.throws(()=>calculateDry(10,null));
 assert.throws(()=>calculateDry(10,[]));
 assert.throws(()=>calculateDry(10,{"nihil-horn":-1}));
 assert.throws(()=>calculateDry(10,{"nihil-horn":1.5}));
 assert.throws(()=>calculateDry(10,{"nihil-horn":1_000_001}));
});
test("Navigation, purely shard-based form, docs, sprites and template integration",()=>{
 const home=read("index.html"),page=read("nex/index.html");
 const app=read("nex/app.mjs"),docs=read("nex/README.md");
 assert.match(home,/href="\.\/nex\/"/);
 assert.match(read("README.md"),/nex\/README\.md/);
 assert.match(docs,/nihil shards/);
 assert.ok(page.includes('id="shard-count"'));
 assert.ok(!page.includes('id="kill-count"'));
 assert.match(app,/calculateDry\(shards,received\(\)\)/);
 for(const item of Object.values(ITEMS)){
  const sprite=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...sprite.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
