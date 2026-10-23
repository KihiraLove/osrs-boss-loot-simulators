import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,ITEMS,UNIQUE,DRY_ITEMS,PET_RATE,rateOf,vestigeHitRate,
 uniqueTableRate,quartzRate,validateKills,validateOptions,simulate
} from "../bosses/leviathan/simulator.mjs";
import {calculateDry,vestigeOdds} from "../bosses/leviathan/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Leviathan ordinary loot has 100 tickets with 78 named entries",()=>{
 assert.equal(MAIN.reduce((sum,row)=>sum+row[3],0),100);
 assert.equal(MAIN.find(row=>row[0]==="@nothing")[3],22);
 for(const row of [
  ["aether-catalyst",1500,2250,1],["coal",195,292,8],
  ["gold-ore",67,101,8],["runite-ore",27,40,2],
  ["dragon-bolts-unf",150,225,2],["onyx-bolt-tips",90,135,1],
  ["anglerfish",4,6,8],["smoke-rune",300,450,8],
  ["soul-rune",600,900,2]
 ])assert.deepEqual(MAIN.find(x=>x[0]===row[0]),row);
});

test("Normal and awakened unique rates and secondary drops",()=>{
 close(uniqueTableRate(false),1/96);
 close(uniqueTableRate(true),1/32);
 close(vestigeHitRate(false),1/256);
 close(vestigeHitRate(true),3/256);
 close(rateOf("venator-vestige"),1/768);
 close(rateOf("chromium-ingot"),3/768);
 close(rateOf("leviathans-lure"),1/768);
 close(rateOf("virtus-mask"),1/2304);
 close(rateOf("virtus-robe-bottom",true),1/768);
 close(rateOf("lilviathan"),PET_RATE);
 close(PET_RATE,1/2500);
 close(rateOf("awakeners-orb"),(95/96)/53);
 close(rateOf("smoke-quartz"),(95/96)*(52/53)*(24/25)/200);
 assert.equal(UNIQUE.length,10);
 assert.deepEqual(DRY_ITEMS,UNIQUE.slice(0,8));
});

test("Three hidden vestige hits award rings, rings, Venator vestige",()=>{
 const one=simulate(1,{rng:()=>0}),two=simulate(2,{rng:()=>0}),three=simulate(3,{rng:()=>0});
 assert.equal(one.drops["gold-ring"],1);
 assert.equal(one.vestigeProgress,1);
 assert.equal(two.drops["gold-ring"],3);
 assert.equal(two.vestigeProgress,2);
 assert.equal(three.drops["venator-vestige"],1);
 assert.equal(three.drops["gold-ring"],3);
 assert.equal(three.vestigeProgress,0);
 assert.equal(three.drops["lilviathan"],3);
 assert.equal(three.drops["clue-scroll-easy"],3);
});

test("Perfect kills select correct ordinary quantities",()=>{
 function point(id){
  let total=0;
  for(const row of MAIN){
   if(row[0]===id)return (total+row[3]/2)/100;
   total+=row[3];
  }
  throw Error(id);
 }
 function run(perfect){
  const seq=[.99,.99,.99,.99,.99,point("coal"),.99,.99];
  let i=0;
  return simulate(1,{rng:()=>seq[i++]??.99,perfect}).drops;
 }
 assert.equal(run(false).coal,195);
 assert.equal(run(true).coal,292);
});

test("Supplies use sea turtles and a ranging potion",()=>{
 const seq=[.99,.99,.99,.99,0,0,.99,.99];
 let i=0;
 const drops=simulate(1,{rng:()=>seq[i++]??.99,perfect:true}).drops;
 assert.equal(drops["sea-turtle"],3);
 assert.equal(drops["prayer-potion-3"],1);
 assert.equal(drops["ranging-potion-2"],1);
 assert.equal(drops["super-combat-potion-2"],undefined);
});

test("Konar applies only to normal mode",()=>{
 assert.equal(simulate(1,{rng:()=>0,konarTask:true}).drops["brimstone-key"],1);
 assert.equal(simulate(1,{rng:()=>0}).drops["brimstone-key"],undefined);
 assert.throws(()=>validateOptions({awakened:true,konarTask:true}));
 assert.throws(()=>simulate(1,{awakened:true,konarTask:true}));
});

test("First quartz scaling and subsequent quartz chance",()=>{
 close(quartzRate(300),1/50);
 close(quartzRate(1000),1/50);
 close(quartzRate(300,true),1/200);
 assert.throws(()=>quartzRate(0));
 assert.throws(()=>quartzRate(5,1));
});

test("Venator vestige dry odds use floor(hidden successes / 3)",()=>{
 const p=1/256,q=3/256;
 close(vestigeOdds(2,0).atLeastOne,0);
 close(vestigeOdds(3,1).exact,p**3,1e-11);
 close(vestigeOdds(3,0).exact,1-p**3,1e-11);
 close(vestigeOdds(3,1,true).exact,q**3,1e-11);
 close(vestigeOdds(3,1).atLeastOne,p**3,1e-11);
 assert.throws(()=>vestigeOdds(2,1));
 assert.throws(()=>calculateDry(2,{"venator-vestige":1}));
});

test("Dry odds sum to one across KC and reject impossible inputs",()=>{
 for(const kc of [0,1,100,1000,10000,MAX_KILLS]){
  const result=calculateDry(kc);
  for(const item of DRY_ITEMS){
   const stats=result[item.id];
   close(stats.fewer+stats.exact+stats.more,1,1e-7);
   assert.ok(stats.atLeastOne>=0&&stats.atLeastOne<=1);
  }
 }
 close(calculateDry(1,{"chromium-ingot":1})["chromium-ingot"].exact,3/768);
 close(calculateDry(1,{"chromium-ingot":1},true)["chromium-ingot"].exact,9/768);
 assert.throws(()=>calculateDry(1,{"lilviathan":2}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{},1));
});

test("Validation rejects invalid KC, RNG and options",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const kc of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(kc));
  assert.throws(()=>simulate(kc));
  assert.throws(()=>calculateDry(kc));
 }
 assert.throws(()=>validateOptions({perfect:1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
});

test("All sprites, UI controls and navigation exist",()=>{
 const page=source("leviathan/index.html"),home=source("index.html");
 const app=source("leviathan/app.mjs"),docs=source("leviathan/README.md");
 assert.match(home,/href="\.\/leviathan\/"/);
 assert.match(docs,/three-hit|three.hidden|third/i);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\),\$\("awakened"\)\.checked\)/);
 for(const id of ["mode-loot","mode-dry","kill-count","perfect","awakened","konar-task","unique-grid","loot-grid","vestige-progress"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG invalid");
 }
});
