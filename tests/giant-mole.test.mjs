import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,RARE,GEM,MEGA,TALISMAN,SUBTABLES,ITEMS,
 UNIQUE,DRY_ITEMS,TERTIARY,simulate,rateOf,clueRate,validateKills
} from "../bosses/giant-mole/simulator.mjs";
import {calculateDry} from "../bosses/giant-mole/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+" got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Giant Mole published main and nested table weights are exact",()=>{
 for(const [name,table,expected] of [
  ["main",MAIN,131],["rare",RARE,128],["gem",GEM,128],
  ["mega",MEGA,128],["talisman",TALISMAN,70]
 ])assert.equal(table.reduce((sum,r)=>sum+r[3],0),expected,name);
 assert.equal(MAIN.find(row=>row[0]==="@rare")[3],4);
 assert.equal(MAIN.find(row=>row[0]==="@gem")[3],6);
 for(const [id,quantity,weight] of [
  ["adamant-longsword",1,10],["blood-rune",15,19],
  ["yew-logs",100,10],["iron-arrow",690,10],["mole-claw",undefined,undefined]
 ]){
  if(id==="mole-claw")continue;
  const row=MAIN.find(row=>row[0]===id);
  assert.ok(row,id+" missing");assert.equal(row[1],quantity);assert.equal(row[3],weight);
 }
 assert.deepEqual(Object.keys(SUBTABLES),["rare","gem","mega","talisman"]);
 assert.equal(GEM.find(row=>row[0]==="@nothing")[3],63);
});

test("Guarantees 1 claw, 1 big bones and 1 to 3 skins per kill",()=>{
 const low=simulate(2,{rng:()=>0});
 assert.equal(low.drops["mole-claw"],2);
 assert.equal(low.drops["mole-skin"],2);
 assert.equal(low.drops["big-bones"],2);
 const high=simulate(2,{rng:()=>0.999999});
 assert.equal(high.drops["mole-claw"],2);
 assert.equal(high.drops["mole-skin"],6);
 assert.equal(high.drops["big-bones"],2);
});

test("Gem branch can resolve via mega rare, never multi-rolls ordinary items",()=>{
 const result=simulate(1,{rng:()=>0.999999});
 assert.equal(result.drops["dragon-spear"],1);
 assert.equal(result.drops["mole-claw"],1);
 assert.equal(result.drops["baby-mole"],undefined);
 assert.equal(result.drops["immaculate-mole-skin"],undefined);
 const normalEntries=Object.keys(result.drops).filter(id=>!["big-bones","mole-claw","mole-skin"].includes(id));
 assert.deepEqual(normalEntries,["dragon-spear"]);
});

test("Independent tertiary rewards and elite clue and Konar rates",()=>{
 const result=simulate(1,{rng:()=>0,konarTask:true,eliteCAs:true});
 for(const id of ["immaculate-mole-skin","baby-mole","long-bone","curved-bone","clue-scroll-elite"])
  assert.equal(result.drops[id],1,id);
 close(rateOf("immaculate-mole-skin"),1/50);
 close(rateOf("baby-mole"),1/3000);
 close(clueRate(),1/500);
 close(clueRate(true),1/475);
 assert.deepEqual(DRY_ITEMS,UNIQUE);
 assert.equal(TERTIARY.find(x=>x.id==="curved-bone").rate,1/5012.5);
 assert.throws(()=>clueRate(1));
 assert.throws(()=>simulate(1,{eliteCAs:1}));
 assert.doesNotThrow(()=>simulate(1,{konarTask:"yes"}));
});

test("Dry calculator is binomial and handles zero and high kill counts",()=>{
 const zero=calculateDry(0);
 assert.equal(zero["baby-mole"].exact,1);
 assert.equal(zero["immaculate-mole-skin"].expected,0);
 const one=calculateDry(1,{"immaculate-mole-skin":1,"baby-mole":1});
 close(one["immaculate-mole-skin"].exact,1/50);
 close(one["baby-mole"].exact,1/3000);
 for(const kills of [1,10,100,1000,10000,1000000]){
  const results=calculateDry(kills);
  for(const item of DRY_ITEMS){
   const r=results[item.id];
   close(r.fewer+r.exact+r.more,1,1e-7);
   assert.ok(r.atLeastOne>=0&&r.atLeastOne<=1);
   close(r.expected,kills*rateOf(item.id),1e-7);
  }
 }
 assert.throws(()=>calculateDry(1,{"baby-mole":2}));
 assert.throws(()=>calculateDry(1,{"baby-mole":.5}));
 assert.throws(()=>calculateDry(1,null));
});

test("Input and RNG boundaries are rejected",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const invalid of [-1,1.2,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(invalid));
  assert.throws(()=>simulate(invalid));
  assert.throws(()=>calculateDry(invalid));
 }
 for(const fn of [()=>-0.01,()=>1,()=>Infinity,()=>NaN])
  assert.throws(()=>simulate(1,{rng:fn}));
 assert.throws(()=>simulate(1,{rng:null}));
});

test("Local sprites and page navigation exist",()=>{
 const index=source("index.html");
 const page=source("bosses/giant-mole/index.html");
 const app=source("bosses/giant-mole/app.mjs");
 const readme=source("bosses/giant-mole/README.md");
 assert.match(index,/href="bosses\/giant-mole\/"/);
 assert.match(index,/assets\/items\/baby-mole\.png/);
 for(const id of ["mode-loot","mode-dry","kill-count","elite-cas","unique-grid","loot-grid","dry-inputs","dry-results-grid"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 assert.match(readme,/Immaculate mole skin/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
