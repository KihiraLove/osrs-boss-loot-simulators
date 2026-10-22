import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,SOURCES,UNIQUE,ITEMS,BOSS_MAIN,MINION_MAIN,mainTickets,rateOf,simulate,validateKills} from "../commander-zilyana/simulator.mjs";
import {calculateDry} from "../commander-zilyana/dry-calc.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,"Expected "+b+", got "+a);

test("Saradomin boss and guards have 127-ticket tables and precise unique rates",()=>{
 assert.equal(mainTickets(BOSS_MAIN),127);
 assert.equal(mainTickets(MINION_MAIN),127);
 assert.equal(BOSS_MAIN.find(row=>row[0]==="@unique")[4],2);
 assert.equal(MINION_MAIN.find(row=>row[0]==="@unique")[4],1);
 assert.equal(SOURCES.length,4);assert.equal(UNIQUE.length,8);
 close(rateOf("saradomin-sword","zilyana"),1/127);
 close(rateOf("saradomin-sword","starlight"),3/16129);
 close(rateOf("godsword-shard-2","growler"),1/1524);
 close(rateOf("armadyl-crossbow","bree"),0);
 close(rateOf("pet-zilyana","zilyana"),1/5000);
});
test("A room clear rolls all four monsters and separates all inventories",()=>{
 const r=simulate(1,{rng:()=>0});
 assert.deepEqual(Object.keys(r.bySource),SOURCES.map(x=>x.id));
 for(const source of SOURCES){
  assert.equal(r.bySource[source.id].bones,1);
  assert.equal(r.bySource[source.id]["saradomin-sword"],1);
 }
 assert.equal(r.drops["saradomin-sword"],4);
 assert.equal(r.bySource.zilyana["pet-zilyana"],1);
 assert.equal(r.bySource.growler["pet-zilyana"],undefined);
 assert.deepEqual({...simulate(0).drops},{});
});
test("Boss uniques and paired potion rolls work",()=>{
 for(const [n,expected] of [[0,"saradomin-sword"],[0.5,"saradomins-light"],[0.75,"armadyl-crossbow"],[0.875,"saradomin-hilt"]]){
  let calls=0;
  const r=simulate(1,{rng:()=>calls++===1?n:0.99});
  assert.equal(r.bySource.zilyana[expected],1,expected);
 }
 let sum=0,point=null;
 for(const row of BOSS_MAIN){
  if(row[0]==="@brews"){point=(sum+row[4]/2)/127;break;}
  sum+=row[4];
 }
 let draws=0;
 const r=simulate(1,{rng:()=>draws++===0?point:0.5});
 assert.equal(r.bySource.zilyana["saradomin-brew-3"],3);
 assert.equal(r.bySource.zilyana["super-restore-4"],3);
});
test("Frozen door and Konar key rewards are conditional",()=>{
 const base=simulate(1,{rng:()=>0});
 assert.equal(base.drops["frozen-key-piece-saradomin"],undefined);
 assert.equal(base.drops["brimstone-key"],undefined);
 const r=simulate(1,{rng:()=>0,frozenDoor:true,konarTask:true});
 assert.equal(r.drops["frozen-key-piece-saradomin"],4);
 assert.equal(r.bySource.zilyana["brimstone-key"],1);
 assert.equal(r.bySource.bree["brimstone-key"],undefined);
});
test("Dry odds combine a boss roll with three independent guard rolls",()=>{
 const boss=1/127,guard=3/16129;
 const r=calculateDry(1,{"saradomin-sword":1});
 close(r["saradomin-sword"].expected,boss+3*guard);
 close(r["saradomin-sword"].atLeastOne,1-(1-boss)*(1-guard)**3);
 close(r["saradomin-sword"].exact,
  boss*(1-guard)**3+(1-boss)*3*guard*(1-guard)**2);
 close(r["godsword-shard-1"].expected,1/762+3/1524);
 close(r["saradomin-hilt"].atLeastOne,1/508);
 assert.throws(()=>calculateDry(1,{"armadyl-crossbow":2}));
 assert.throws(()=>calculateDry(1,{"saradomin-sword":5}));
});
test("Dry probabilities normalize through 1 million clears",()=>{
 for(const n of [0,1,100,1000,MAX_KILLS]){
  for(const item of UNIQUE){
   const v=calculateDry(n)[item.id];
   close(v.fewer+v.exact+v.more,1,1e-7);
   assert.ok(v.atLeastOne>=0&&v.atLeastOne<=1);
  }
 }
});
test("Input validation and correct per-monster option types",()=>{
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{hardCAs:1}));
 assert.throws(()=>simulate(1,{konarTask:1}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
});
test("Navigation, four distinct windows, documentation and local sprites",()=>{
 const home=read("index.html"),page=read("commander-zilyana/index.html");
 const script=read("commander-zilyana/app.mjs"),docs=read("commander-zilyana/README.md");
 assert.match(home,/href="\.\/commander-zilyana\/"/);
 assert.match(read("README.md"),/commander-zilyana\/README\.md/);
 assert.match(docs,/three bodyguards/);
 for(const source of SOURCES)
  assert.match(page,new RegExp('data-source="'+source.id+'"'));
 for(const id of ["kill-count","hard-cas","elite-cas","konar-task","frozen-door",
  "mode-loot","mode-dry","source-panels","dry-results-grid"])
  assert.ok(page.includes('id="'+id+'"'),id);
 assert.match(script,/result\.bySource\[source\.id\]/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
