import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,SOURCES,UNIQUE,ITEMS,BOSS_MAIN,MINION_MAIN,mainTickets,rateOf,simulate,validateKills} from "../kril-tsutsaroth/simulator.mjs";
import {calculateDry} from "../kril-tsutsaroth/dry-calc.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<eps,"Expected "+b+", got "+a);
test("K'ril and bodyguards have exact 127-ticket source distributions",()=>{
 assert.equal(mainTickets(BOSS_MAIN),127);
 assert.equal(mainTickets(MINION_MAIN),127);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@staff")[4],1);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@hilt")[4],1);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@shard")[4],1);
 assert.equal(MINION_MAIN.find(x=>x[0]==="@spear")[4],1);
 assert.equal(SOURCES.length,4);assert.equal(UNIQUE.length,8);
 close(rateOf("steam-battlestaff","kril"),1/127);
 close(rateOf("zamorakian-spear","kril"),1/127);
 close(rateOf("zamorakian-spear","tstanon"),3/16129);
 close(rateOf("staff-of-the-dead","balfrug"),0);
 close(rateOf("godsword-shard-3","zakln"),1/1524);
 close(rateOf("pet-kril-tsutsaroth","kril"),1/5000);
});
test("A full clear returns all four separate loot windows and distinct ashes",()=>{
 const r=simulate(1,{rng:()=>0});
 assert.deepEqual(Object.keys(r.bySource),SOURCES.map(x=>x.id));
 assert.equal(r.bySource.kril["infernal-ashes"],1);
 assert.equal(r.bySource.kril["steam-battlestaff"],1);
 assert.equal(r.bySource.kril["pet-kril-tsutsaroth"],1);
 for(const s of SOURCES.slice(1)){
  assert.equal(r.bySource[s.id]["malicious-ashes"],1);
  assert.equal(r.bySource[s.id]["zamorakian-spear"],1);
 }
 assert.equal(r.drops["zamorakian-spear"],3);
 assert.deepEqual({...simulate(0).drops},{});
});
test("Boss unique branches, paired potion rolls and key piece toggles",()=>{
 for(const [id,code] of [["steam-battlestaff",0],["zamorakian-spear",1]]){
  const r=simulate(1,{rng:()=>code===0?0:0.01});
  assert.equal(r.bySource.kril[id],1);
 }
 const slot=(id)=> {
  const idx=BOSS_MAIN.findIndex(x=>x[0]===id);
  return (BOSS_MAIN.slice(0,idx).reduce((n,r)=>n+r[4],0)+BOSS_MAIN[idx][4]/2)/127;
 };
 for(const [id,results] of [
  ["@attack",["super-attack-3","super-strength-3"]],
  ["@restore",["super-restore-3","zamorak-brew-3"]]]){
   const selected=slot(id);
   const r=simulate(1,{rng:()=>selected});
   for(const item of results)assert.equal(r.bySource.kril[item],3,item);
 }
 const no=simulate(1,{rng:()=>0});
 assert.equal(no.drops["frozen-key-piece-zamorak"],undefined);
 assert.equal(no.drops["brimstone-key"],undefined);
 const yes=simulate(1,{rng:()=>0,frozenDoor:true,konarTask:true});
 assert.equal(yes.drops["frozen-key-piece-zamorak"],4);
 assert.equal(yes.bySource.kril["brimstone-key"],1);
 for(const source of SOURCES.slice(1))
  assert.equal(yes.bySource[source.id]["brimstone-key"],undefined);
});
test("Dry odds combine 1 boss + 3 bodyguard spear and shard rolls",()=>{
 const p=1/127,q=3/16129;
 const r=calculateDry(1,{"zamorakian-spear":1});
 close(r["zamorakian-spear"].expected,p+3*q);
 close(r["zamorakian-spear"].exact,p*(1-q)**3+(1-p)*3*q*(1-q)**2);
 close(r["zamorakian-spear"].atLeastOne,1-(1-p)*(1-q)**3);
 close(r["godsword-shard-1"].expected,1/762+3/1524);
 close(r["zamorak-hilt"].atLeastOne,1/508);
 assert.throws(()=>calculateDry(1,{"pet-kril-tsutsaroth":2}));
 assert.throws(()=>calculateDry(1,{"zamorakian-spear":5}));
});
test("Dry probabilities remain normalized at one million full clears",()=>{
 for(const n of [0,1,100,1000,MAX_KILLS]){
  const res=calculateDry(n);
  for(const item of UNIQUE){
   const r=res[item.id];
   close(r.fewer+r.exact+r.more,1,1e-7);
   assert.ok(r.atLeastOne>=0&&r.atLeastOne<=1);
  }
 }
});
test("Validation and all options reject invalid inputs",()=>{
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{hardCAs:1}));
 assert.throws(()=>simulate(1,{frozenDoor:1}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
});
test("All separate loot panels, navigation, docs and sprite assets exist",()=>{
 const home=read("index.html"),html=read("kril-tsutsaroth/index.html");
 const app=read("kril-tsutsaroth/app.mjs"),docs=read("kril-tsutsaroth/README.md");
 assert.match(home,/href="\.\/kril-tsutsaroth\/"/);
 assert.match(read("README.md"),/kril-tsutsaroth\/README\.md/);
 assert.match(docs,/bodyguards/);
 for(const source of SOURCES)assert.match(html,new RegExp('data-source="'+source.id+'"'));
 for(const id of ["kill-count","hard-cas","elite-cas","konar-task","frozen-door",
 "source-panels","dry-results-grid","mode-loot","mode-dry"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/result\.bySource\[source\.id\]/);
 for(const item of Object.values(ITEMS)){
  const data=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
