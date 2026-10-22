import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,ITEMS,UNIQUE,DRY_ITEMS,PET_RATE,rateOf,vestigeHitRate,
 uniqueTableRate,quartzRate,validateKills,validateOptions,simulate
} from "../duke-sucellus/simulator.mjs";
import {calculateDry,vestigeOdds} from "../duke-sucellus/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+" got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Duke uses an exclusive 100-ticket standard table",()=>{
 assert.equal(MAIN.reduce((s,row)=>s+row[3],0),100);
 assert.equal(MAIN.find(row=>row[0]==="@nothing")[3],22);
 for(const [id,ordinary,perfect,weight] of [
  ["coal",216,325,8],["adamantite-ore",75,112,8],
  ["chaos-rune",100,150,9],["dragon-platelegs",5,7,1],
  ["rune-javelin-tips",60,90,8],["soul-rune",666,1000,2]
 ]){
  const row=MAIN.find(row=>row[0]===id);
  assert.deepEqual(row,[id,ordinary,perfect,weight]);
 }
});
test("Tradeable and tertiary rates follow the wiki",()=>{
 close(uniqueTableRate(false),1/90);
 close(uniqueTableRate(true),1/30);
 close(vestigeHitRate(false),1/240);
 close(vestigeHitRate(true),1/80);
 close(rateOf("magus-vestige"),1/720);
 close(rateOf("chromium-ingot"),3/720);
 close(rateOf("eye-of-the-duke"),1/720);
 close(rateOf("virtus-mask"),1/2160);
 close(rateOf("virtus-robe-top",true),1/720);
 close(rateOf("baron"),PET_RATE);
 close(rateOf("awakeners-orb"),(89/90)/48);
 assert.deepEqual(DRY_ITEMS,UNIQUE.slice(0,8));
});
test("Three hidden vestige hits give 1, then 2 gold rings, then a vestige",()=>{
 const x=simulate(3,{rng:()=>0});
 assert.equal(x.drops["magus-vestige"],1);
 assert.equal(x.drops["gold-ring"],3);
 assert.equal(x.vestigeProgress,0);
 assert.equal(x.drops.baron,3);
 assert.equal(x.drops["clue-scroll-easy"],3);
 const y=simulate(2,{rng:()=>0});
 assert.equal(y.vestigeProgress,2);
 assert.equal(y.drops["magus-vestige"],undefined);
 assert.equal(y.drops["gold-ring"],3);
});
test("Perfect kills select the correct amount, not a random range",()=>{
 const mainPoint=id=>{
  let prior=0;
  for(const row of MAIN){
   if(row[0]===id)return (prior+row[3]/2)/100;
   prior+=row[3];
  }
  throw Error(id+" is missing");
 };
 function run(perfect){
  let i=0;
  const seq=[.99,.99,.99,.99,.99,mainPoint("coal"),.99,.99];
  return simulate(1,{rng:()=>seq[i++]??.99,perfect}).drops;
 }
 assert.equal(run(false).coal,216);
 assert.equal(run(true).coal,325);
});
test("Supplies appear as a bundle and do not use the perfect multiplier",()=>{
 let i=0;
 const seq=[.99,.99,.99,.99,0,0,.99,.99];
 const x=simulate(1,{rng:()=>seq[i++]??.99,perfect:true}).drops;
 assert.equal(x["pineapple-pizza"],3);
 assert.equal(x["prayer-potion-3"],1);
 assert.equal(x["super-combat-potion-2"],1);
});
test("First quartz chance ramps; subsequent quartz rolls use base chance",()=>{
 close(quartzRate(300),1/50);
 close(quartzRate(600),1/50);
 close(quartzRate(300,true),1/200);
 assert.throws(()=>quartzRate(0));
 assert.throws(()=>quartzRate(100,1));
});
test("Magus dry calculator models floor(Binomial(kills,1/240)/3)",()=>{
 const p=1/240;
 close(vestigeOdds(2,0).atLeastOne,0);
 close(vestigeOdds(3,1).atLeastOne,p*p*p,1e-11);
 close(vestigeOdds(3,0).exact,1-p*p*p,1e-11);
 close(vestigeOdds(3,1).exact,p*p*p,1e-11);
 close(vestigeOdds(3,1,true).exact,1/80**3,1e-11);
 assert.throws(()=>vestigeOdds(2,1));
 assert.throws(()=>calculateDry(2,{"magus-vestige":1}));
});
test("Dry calculator validates and normalizes item probabilities",()=>{
 for(const n of [0,1,10,100,1000,10000,MAX_KILLS]){
  const r=calculateDry(n);
  for(const item of DRY_ITEMS){
   const x=r[item.id];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 const one=calculateDry(1,{"chromium-ingot":1});
 close(one["chromium-ingot"].exact,3/720);
 close(calculateDry(1,{"chromium-ingot":1},true)["chromium-ingot"].exact,3/240);
 assert.throws(()=>calculateDry(1,{"baron":2}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{},1));
});
test("Kill limits, option types and random generator are checked",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.1,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateOptions({perfect:1}));
 assert.throws(()=>simulate(1,{awakened:"yes"}));
 assert.throws(()=>simulate(1,{konarTask:1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
});
test("Homepage, controls, docs and all item PNG sprites are present",()=>{
 const home=source("index.html");
 const page=source("duke-sucellus/index.html");
 const app=source("duke-sucellus/app.mjs");
 const docs=source("duke-sucellus/README.md");
 assert.match(home,/href="\.\/duke-sucellus\/"/);
 for(const id of ["kill-count","perfect","awakened","konar-task","mode-loot",
   "mode-dry","unique-grid","loot-grid","vestige-progress"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 assert.match(app,/calculateDry\(kills,readReceived\(kills\),\$\("awakened"\)\.checked\)/);
 assert.match(docs,/third|three|3-hit/i);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG missing");
 }
});
