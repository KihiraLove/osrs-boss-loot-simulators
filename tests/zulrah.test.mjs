import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,MAIN,SHARK,UNIQUE,ITEMS,TABLE_TICKETS,MUTAGEN_ROLL,simulate,validateKills,rateOf} from "../zulrah/simulator.mjs";
import {calculateDry} from "../zulrah/dry-calc.mjs";
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,"Expected "+b+", got "+a);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Zulrah ordinary loot uses 249 tickets with two rolls",()=>{
 assert.equal(TABLE_TICKETS,249);
 assert.equal(MAIN.reduce((n,row)=>n+row[4],0),249);
 assert.equal(MAIN.find(x=>x[0]==="@flax")[4],10);
 assert.equal(MAIN.find(x=>x[0]==="@rdt")[4],10);
 assert.equal(MAIN.find(x=>x[0]==="@shark")[4],12);
 assert.deepEqual(SHARK.map(x=>x[4]),[3,3,2]);
 assert.equal(SHARK[1][2],70);
});
test("Guaranteed scales, two unique-table drops and tertiary drops",()=>{
 const r=simulate(1,{rng:()=>0});
 assert.equal(r.kills,1);
 assert.equal(r.drops["zulrahs-scales"],100);
 assert.equal(r.drops["tanzanite-fang"],2);
 assert.equal(r.drops["pet-snakeling"],1);
 assert.equal(r.drops["jar-of-swamp"],1);
 assert.equal(r.drops["clue-scroll-elite"],1);
 assert.deepEqual({...simulate(0).drops},{});
});
test("Mutagens replace flax and are not rolled independently",()=>{
 close(MUTAGEN_ROLL,100/(249*5264));
 close(rateOf("magma-mutagen"),1-Math.pow(1-MUTAGEN_ROLL,2));
 // RNG sequence: scales, unique check, ordinary ticket (first 10/249),
 // flax subtable (10..19), unique check, regular ticket, tertiary.
 let n=0;
 const sequence=[0.5,0.5,0,0.002,0.5,0.1,0.5,0.5,0.5];
 const r=simulate(1,{rng:()=>sequence[n++%sequence.length]});
 assert.equal(r.drops["magma-mutagen"],1);
 assert.equal(r.drops.flax,undefined);
});
test("One-roll tertiary and two-roll unique probabilities stay distinct",()=>{
 close(rateOf("tanzanite-fang"),1-Math.pow(1023/1024,2));
 close(rateOf("jar-of-swamp"),1/3000);
 close(rateOf("pet-snakeling"),1/4000);
 assert.equal(UNIQUE.length,8);
 const r=calculateDry(1,{"tanzanite-fang":1});
 close(r["tanzanite-fang"].exact,2*(1/1024)*(1023/1024));
 close(r["tanzanite-fang"].expected,2/1024);
 close(r["jar-of-swamp"].atLeastOne,1/3000);
 assert.throws(()=>calculateDry(1,{"jar-of-swamp":2}));
 assert.deepEqual(Object.keys(calculateDry(0)).length,8);
});
test("Large kills and invalid inputs",()=>{
 for(const k of [0,1,100,10000,MAX_KILLS]){
  const results=calculateDry(k);
  for(const item of UNIQUE){
   const o=results[item.id];
   close(o.fewer+o.exact+o.more,1,1e-7);
   assert.ok(o.atLeastOne>=0&&o.atLeastOne<=1);
  }
 }
 for(const n of [-1,NaN,1.1,MAX_KILLS+1]){
  assert.throws(()=>simulate(n));assert.throws(()=>calculateDry(n));
  assert.throws(()=>validateKills(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:12}));
 assert.throws(()=>simulate(1,{eliteCAs:"yes"}));
 assert.throws(()=>simulate(1,{konarTask:1}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{"magic-fang":3}));
});
test("Site navigation, options, docs and local PNG sprites",()=>{
 assert.match(read("index.html"),/href="\.\/zulrah\/"/);
 assert.match(read("README.md"),/zulrah\/README\.md/);
 assert.match(read("zulrah/README.md"),/249-ticket/);
 const html=read("zulrah/index.html"),app=read("zulrah/app.mjs");
 for(const id of ["kill-count","elite-cas","konar-task","mode-loot","mode-dry","unique-grid","loot-grid","dry-inputs","dry-results-grid"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/kills\*\(item\.rolls===2\?2:1\)/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
