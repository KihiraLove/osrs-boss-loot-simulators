import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,SOURCES,UNIQUE,ITEMS,BOSS_MAIN,MINION_MAIN,mainTickets,simulate,rateOf,validateKills} from "../bosses/general-graardor/simulator.mjs";
import {calculateDry} from "../bosses/general-graardor/dry-calc.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<eps,"Expected "+b+", got "+a);

test("Graardor and bodyguard main rolls use the exact 127-ticket structure",()=>{
 assert.equal(mainTickets(BOSS_MAIN),127);
 assert.equal(mainTickets(MINION_MAIN),127);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@armour")[4],1);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@hilt")[4],1);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@shard")[4],1);
 assert.equal(MINION_MAIN.find(x=>x[0]==="@shard")[4],1);
 assert.equal(SOURCES.length,4);
 close(rateOf("bandos-chestplate","graardor"),1/381);
 close(rateOf("bandos-chestplate","strongstack"),1/16256);
 close(rateOf("godsword-shard-1","grimspike"),1/1524);
 close(rateOf("bandos-hilt","steelwill"),0);
 close(rateOf("pet-general-graardor","graardor"),1/5000);
});
test("Every full-room kill produces four distinct source windows and four bone drops",()=>{
 const x=simulate(1,{rng:()=>0});
 assert.equal(x.kills,1);
 assert.deepEqual(Object.keys(x.bySource),SOURCES.map(x=>x.id));
 assert.equal(x.bySource.graardor["big-bones"],1);
 assert.equal(x.bySource.graardor["bandos-chestplate"],1);
 for(const source of SOURCES.slice(1)){
  assert.equal(x.bySource[source.id].bones,1);
  assert.equal(x.bySource[source.id]["bandos-chestplate"],1);
 }
 assert.equal(x.drops["bandos-chestplate"],4);
 assert.equal(x.bySource.graardor["pet-general-graardor"],1);
 assert.equal(x.bySource.strongstack.kebab,1);
 assert.equal(x.bySource.steelwill.beer,1);
 assert.equal(x.bySource.grimspike["right-eye-patch"],1);
 assert.deepEqual({...simulate(0).drops},{});
});
test("Frozen door and Konar-only rewards stay conditional per monster",()=>{
 const no=simulate(2,{rng:()=>0});
 assert.equal(no.drops["frozen-key-piece-bandos"],undefined);
 assert.equal(no.drops["brimstone-key"],undefined);
 const yes=simulate(2,{rng:()=>0,frozenDoor:true,konarTask:true});
 assert.equal(yes.bySource.graardor["frozen-key-piece-bandos"],2);
 for(const source of SOURCES.slice(1)){
  assert.equal(yes.bySource[source.id]["frozen-key-piece-bandos"],2);
  assert.equal(yes.bySource[source.id]["brimstone-key"],undefined);
 }
 assert.equal(yes.bySource.graardor["brimstone-key"],2);
});
test("Hard and elite combat achievements improve different clues",()=>{
 const high=simulate(1,{rng:()=>0,eliteCAs:true,hardCAs:true});
 assert.equal(high.bySource.graardor["clue-scroll-elite"],1);
 for(const s of SOURCES.slice(1))assert.equal(high.bySource[s.id]["clue-scroll-hard"],1);
});
test("Dry calculator correctly combines boss and three guard probabilities",()=>{
 const p=1/381,q=1/16256;
 const r=calculateDry(1,{"bandos-chestplate":1});
 close(r["bandos-chestplate"].expected,p+3*q);
 close(r["bandos-chestplate"].atLeastOne,1-(1-p)*Math.pow(1-q,3));
 const exactly=(p*Math.pow(1-q,3))+
  ((1-p)*3*q*Math.pow(1-q,2));
 close(r["bandos-chestplate"].exact,exactly);
 close(r["bandos-hilt"].exact,1-1/508);
 close(r["pet-general-graardor"].atLeastOne,1/5000);
 close(r["godsword-shard-1"].expected,1/762+3/1524);
 assert.throws(()=>calculateDry(1,{"pet-general-graardor":2}));
 assert.throws(()=>calculateDry(1,{"bandos-chestplate":5}));
});
test("Dry probabilities remain normalized through one million clears",()=>{
 for(const kills of [0,1,100,1000,MAX_KILLS]){
  const results=calculateDry(kills);
  for(const item of UNIQUE){
   const r=results[item.id];
   close(r.fewer+r.exact+r.more,1,1e-7);
   assert.ok(r.atLeastOne>=0&&r.atLeastOne<=1);
  }
 }
});
test("Validation and RNG bounds",()=>{
 for(const n of [-1,1.2,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{hardCAs:1}));
 assert.throws(()=>simulate(1,{eliteCAs:"yes"}));
 assert.throws(()=>simulate(1,{konarTask:1}));
 assert.throws(()=>simulate(1,{frozenDoor:null}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
});
test("Four visually independent panels, README, and local PNG sprites",()=>{
 const home=read("index.html"),html=read("bosses/general-graardor/index.html"),
  app=read("bosses/general-graardor/app.mjs"),docs=read("bosses/general-graardor/README.md");
 assert.match(home,/href="bosses\/general-graardor\/"/);
 assert.match(read("README.md"),/general-graardor\/README\.md/);
 assert.match(docs,/three guards/);
 for(const source of SOURCES){
  assert.match(html,new RegExp('class="panel source-window" data-source="'+source.id+'"'));
 }
 for(const id of ["kill-count","hard-cas","elite-cas","konar-task","frozen-door",
 "mode-loot","mode-dry","dry-inputs","source-panels","dry-results-grid"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/result\.bySource\[source\.id\]/);
 for(const item of Object.values(ITEMS)){
  const data=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
