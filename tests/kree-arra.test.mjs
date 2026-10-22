import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,SOURCES,UNIQUE,ITEMS,BOSS_MAIN,MINION_MAIN,KONAR_RATE,mainTickets,rateOf,simulate,validateKills} from "../kree-arra/simulator.mjs";
import {calculateDry} from "../kree-arra/dry-calc.mjs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,"Expected "+b+", got "+a);

test("Kree'arra and bodyguards have separate accurate 127-ticket tables",()=>{
 assert.equal(mainTickets(BOSS_MAIN),127);
 assert.equal(mainTickets(MINION_MAIN),127);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@armour")[4],1);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@hilt")[4],1);
 assert.equal(BOSS_MAIN.find(x=>x[0]==="@shard")[4],1);
 assert.equal(MINION_MAIN.find(x=>x[0]==="@armour")[4],1);
 assert.equal(MINION_MAIN.find(x=>x[0]==="@shard")[4],1);
 assert.equal(SOURCES.length,4);
 assert.equal(UNIQUE.length,8);
 close(rateOf("armadyl-chestplate","kree"),1/381);
 close(rateOf("armadyl-chestplate","kilisa"),1/16129);
 close(rateOf("godsword-shard-1","skree"),1/1524);
 close(rateOf("armadyl-hilt","geerin"),0);
 close(rateOf("pet-kree-arra","kree"),1/5000);
});
test("One room clear yields boss loot and three independently tracked bodyguards",()=>{
 const x=simulate(1,{rng:()=>0});
 assert.deepEqual(Object.keys(x.bySource),SOURCES.map(x=>x.id));
 assert.equal(x.bySource.kree["big-bones"],1);
 assert.equal(x.bySource.kree.feather,1);
 assert.equal(x.bySource.kree["armadyl-helmet"],1);
 assert.equal(x.bySource.kree["pet-kree-arra"],1);
 for(const s of SOURCES.slice(1)){
  assert.equal(x.bySource[s.id].bones,1);
  assert.equal(x.bySource[s.id].feather,1);
  assert.equal(x.bySource[s.id]["armadyl-helmet"],1);
 }
 assert.equal(x.drops["armadyl-helmet"],4);
 assert.deepEqual({...simulate(0).drops},{});
});
test("Feathers determine quantities of mind runes and bodyguard ammunition",()=>{
 let count=0;
 // Kree feather amount first. Main roll second.
 const point=(BOSS_MAIN.slice(0,5).reduce((n,x)=>n+x[4],0)+4)/127;
 const x=simulate(1,{rng:()=>{const i=count++;return i===0?0.5:i===1?point:0;}});
 assert.equal(x.bySource.kree.feather,9);
 assert.equal(x.bySource.kree["mind-rune"],594);
 let next=0;
 // First kill: Kree feather, main roll, pet, elite clue, long bone,
 // curved bone, then Kilisa feather & main roll.
 const seq=[0,0.04,0.5,0.5,0.5,0.5,0,0.03];
 const y=simulate(1,{rng:()=>seq[next++]??0.5});
 assert.equal(y.bySource.kilisa["steel-arrow"],91);
 assert.equal(y.bySource.kilisa.feather,1);
});
test("Kree main table paired potion roll and conditional key rewards",()=>{
 const pre=BOSS_MAIN.slice(0,BOSS_MAIN.findIndex(row=>row[0]==="@potions")).reduce((n,row)=>n+row[4],0)+BOSS_MAIN.find(row=>row[0]==="@potions")[4]/2;
 let idx=0;
 const x=simulate(1,{rng:()=>idx++===1?pre/127:0.5});
 assert.equal(x.bySource.kree["ranging-potion-3"],3);
 assert.equal(x.bySource.kree["super-defence-3"],3);
 const base=simulate(1,{rng:()=>0});
 assert.equal(base.drops["frozen-key-piece-armadyl"],undefined);
 assert.equal(base.drops["brimstone-key"],undefined);
 const enabled=simulate(1,{rng:()=>0,frozenDoor:true,konarTask:true});
 assert.equal(enabled.drops["frozen-key-piece-armadyl"],4);
 assert.equal(enabled.bySource.kree["brimstone-key"],1);
 for(const guard of SOURCES.slice(1))assert.equal(enabled.bySource[guard.id]["brimstone-key"],1);
 close(KONAR_RATE.kilisa,1/89);
 close(KONAR_RATE.skree,1/92);
 close(KONAR_RATE.geerin,1/91);
});
test("The combined dry calculator includes the 3 bodyguards' armour and shard odds",()=>{
 const p=1/381,q=1/16129;
 const r=calculateDry(1,{"armadyl-helmet":1});
 close(r["armadyl-helmet"].expected,p+3*q);
 close(r["armadyl-helmet"].exact,p*(1-q)**3+(1-p)*3*q*(1-q)**2);
 close(r["armadyl-helmet"].atLeastOne,1-(1-p)*(1-q)**3);
 close(r["godsword-shard-1"].expected,1/762+3/1524);
 close(r["armadyl-hilt"].atLeastOne,1/508);
 assert.throws(()=>calculateDry(1,{"pet-kree-arra":2}));
 assert.throws(()=>calculateDry(1,{"armadyl-chestplate":5}));
});
test("Probability normalization up to one million room clears",()=>{
 for(const n of [0,1,20,1000,MAX_KILLS]){
  const results=calculateDry(n);
  for(const item of UNIQUE){
   const odds=results[item.id];
   close(odds.fewer+odds.exact+odds.more,1,1e-7);
   assert.ok(odds.atLeastOne>=0&&odds.atLeastOne<=1);
  }
 }
});
test("Input and option validation",()=>{
 for(const k of [-1,1.4,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(k));
  assert.throws(()=>simulate(k));
  assert.throws(()=>calculateDry(k));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:()=>NaN}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{hardCAs:1}));
 assert.throws(()=>simulate(1,{konarTask:1}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
});
test("Navigation, 4 source windows, README and all local sprites",()=>{
 const home=read("index.html"),html=read("kree-arra/index.html");
 const app=read("kree-arra/app.mjs"),docs=read("kree-arra/README.md");
 assert.match(home,/href="\.\/kree-arra\/"/);
 assert.match(read("README.md"),/kree-arra\/README\.md/);
 assert.match(docs,/bodyguards/);
 for(const s of SOURCES)assert.match(html,new RegExp('data-source="'+s.id+'"'));
 for(const id of ["kill-count","hard-cas","elite-cas","konar-task","frozen-door",
  "mode-loot","mode-dry","source-panels","dry-results-grid"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/result\.bySource\[source\.id\]/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
