import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MODES,PRIMARY,UNIQUE,COMMON,ITEMS,rateOf,scaledQuantity,
 validateCounts,validateKills,simulate
} from "../hueycoatl/simulator.mjs";
import {calculateDry} from "../hueycoatl/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"expected "+b+" got "+a);
const text=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("68-ticket standard table and independent 35-weight primary table",()=>{
 assert.equal(COMMON.length,26);
 assert.equal(COMMON.reduce((s,r)=>s+r[3],0),68);
 assert.equal(PRIMARY.reduce((s,r)=>s+r.weight,0),35);
 assert.deepEqual(COMMON.find(r=>r[0]==="soiled-page"),["soiled-page",4,80,5]);
 assert.deepEqual(COMMON.find(r=>r[0]==="huasca-seed"),["huasca-seed",1,20,2]);
 assert.deepEqual(COMMON.find(r=>r[0]==="steel-cannonball"),["steel-cannonball",60,1200,3]);
 assert.equal(PRIMARY.find(x=>x.id==="hueycoatl-hide").quantity,3);
});

test("solo, duo and trio chance scaling and flat moon-key rate",()=>{
 assert.deepEqual(MODES.map(x=>x.share),[1,.5,.33]);
 close(rateOf("dragon-hunter-wand","solo"),1/105);
 close(rateOf("dragon-hunter-wand","duo"),1/210);
 close(rateOf("dragon-hunter-wand","trio"),.33/105);
 close(rateOf("hueycoatl-hide","solo"),11/315);
 close(rateOf("tome-of-earth-empty","solo"),1/90);
 close(rateOf("huberte","solo"),1/400);
 close(rateOf("huberte","duo"),1/800);
 close(rateOf("huberte","trio"),.33/400);
 for(const mode of MODES){
  close(rateOf("tooth-half-of-key-moon-key",mode.id),1/75);
  close(rateOf("clue-scroll-hard",mode.id),1/50);
  close(rateOf("clue-scroll-hard",mode.id,true),1/47);
 }
 assert.throws(()=>rateOf("huberte","mass"));
 assert.throws(()=>rateOf("huberte","solo","yes"));
});

test("Three kill count types contribute to exactly one combined inventory",()=>{
 const r=simulate(1,1,1,{rng:()=>0});
 assert.equal(r.kills,3);
 assert.deepEqual([r.soloKills,r.duoKills,r.trioKills],[1,1,1]);
 assert.equal(r.drops["dragon-hunter-wand"],3);
 assert.equal(r.drops["huberte"],3);
 assert.equal(r.drops["tooth-half-of-key-moon-key"],3);
 assert.equal(r.drops["clue-scroll-hard"],3);
 assert.equal(r.drops["big-bones"],1); // solo MVP, no inferred group MVP
 assert.equal(r.drops["rune-mace"],3); // minimum one in all modes
});

test("Unique hide remains a three-hide bundle even in trio",()=>{
 const sequence=[0,0,0,.2,.99,.99,.99];
 for(const counts of [[1,0,0],[0,1,0],[0,0,1]]){
  let n=0;
  const r=simulate(...counts,{rng:()=>sequence[n++]??.99});
  assert.equal(r.drops["hueycoatl-hide"],3);
  assert.equal(r.drops["dragon-hunter-wand"],undefined);
 }
});

test("Ordinary quantity is reduced by contribution, not rarity",()=>{
 assert.equal(scaledQuantity(1,20,1,()=>.999),20);
 assert.equal(scaledQuantity(1,20,.5,()=>.999),10);
 assert.equal(scaledQuantity(1,20,.33,()=>.999),7);
 assert.equal(scaledQuantity(1,20,.33,()=>0),1);
 assert.throws(()=>scaledQuantity(1,5,0));
 assert.throws(()=>scaledQuantity(1,5,2));
});

test("Combined dry odds convolve the three modes instead of averaging rates",()=>{
 const r=calculateDry(1,1,1);
 const p1=1/105,p2=p1/2,p3=p1*.33;
 close(r["dragon-hunter-wand"].atLeastOne,1-(1-p1)*(1-p2)*(1-p3));
 close(r["dragon-hunter-wand"].expected,p1+p2+p3);
 close(r["dragon-hunter-wand"].exact,(1-p1)*(1-p2)*(1-p3));
 const q1=1/18,q2=q1/2,q3=q1*.33;
 close(r.anyPrimary.atLeastOne,1-(1-q1)*(1-q2)*(1-q3));
 close(r.anyPrimary.expected,q1+q2+q3);
 close(r["huberte"].expected,(1+.5+.33)/400);
 close(r["hueycoatl-hide"].expected,3*(1+.5+.33)*11/315);
});

test("Three hides in one kill are a single rare-table hit",()=>{
 const item="hueycoatl-hide";
 const r=calculateDry(1,0,0,{[item]:3});
 close(r[item].exact,11/315);
 close(r[item].expected,3*11/315);
 close(r.anyPrimary.expected,1/18);
 assert.equal(r.anyPrimary.count,1);
 assert.throws(()=>calculateDry(1,0,0,{[item]:2}),/multiples of 3/);
 assert.throws(()=>calculateDry(1,0,0,{[item]:6}));
});

test("Probabilities remain normalized and validation rejects invalid inputs",()=>{
 for(const [a,b,c] of [[0,0,0],[1,0,0],[0,1,0],[0,0,1],[13,51,6],[1000,150,900],[MAX_KILLS,0,0]]){
  const r=calculateDry(a,b,c);
  assert.equal(r.kills,a+b+c);
  for(const item of [...UNIQUE.map(x=>x.id),"anyPrimary"]){
   const x=r[item];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(1,1,1,null));
 assert.throws(()=>calculateDry(1,1,1,[]));
 assert.throws(()=>calculateDry(1,1,1,{"huberte":4}));
 assert.throws(()=>calculateDry(1,0,0,{"dragon-hunter-wand":1,"tome-of-earth-empty":1}));
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>validateCounts(n,0,0));
  assert.throws(()=>simulate(n,0,0));
 }
 assert.throws(()=>simulate(1,0,0,{rng:()=>1}));
 assert.throws(()=>simulate(1,0,0,{hardCAs:"yes"}));
 assert.deepEqual({...simulate(0,0,0).drops},{});
});

test("Homepage and controls are wired and sprites bundled",()=>{
 const page=text("hueycoatl/index.html"),home=text("index.html"),app=text("hueycoatl/app.mjs");
 const docs=text("hueycoatl/README.md");
 assert.match(home,/href="\.\/hueycoatl\/"/);
 for(const id of ["kills-solo","kills-duo","kills-trio","hard-cas","mode-loot",
  "mode-dry","unique-grid","loot-grid","mode-summary","dry-inputs"])
  assert.ok(page.includes('id="'+id+'"'),"missing UI control "+id);
 assert.match(app,/calculateDry\(solo,duo,trio,readReceived\(solo\+duo\+trio\)\)/);
 assert.match(docs,/1\/75/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],
   "Missing PNG for "+item.id);
 }
});
