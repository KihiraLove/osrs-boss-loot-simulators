import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,ITEMS,UNIQUE,DRY_ITEMS,PET_RATE,rateOf,
 vestigeHitRate,uniqueTableRate,quartzRate,validateKills,validateOptions,simulate
} from "../whisperer/simulator.mjs";
import {calculateDry,vestigeOdds} from "../whisperer/dry-calc.mjs";
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,"Expected "+b+" got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("The Whisperer 100-ticket table preserves listed published weights",()=>{
 assert.equal(MAIN.length,26);
 assert.equal(MAIN.reduce((sum,r)=>sum+r[3],0),100);
 assert.equal(MAIN.find(r=>r[0]==="@nothing")[3],22);
 for(const [id,n,perfect,weight] of [
  ["bronze-longsword",16,24,1],["battlestaff",70,105,2],
  ["pure-essence",280,420,1],["coal",303,455,8],
  ["runite-ore",42,63,2],["uncut-diamond",58,87,5],
  ["dragon-javelin-tips",84,126,8],["runite-bolts-unf",84,126,8],
  ["raw-monkfish",700,1050,1],["steam-rune",466,700,8],
  ["soul-rune",933,1400,2]
 ])assert.deepEqual(MAIN.find(x=>x[0]===id),[id,n,perfect,weight]);
});

test("Published normal and awakened unique and tertiary chances",()=>{
 close(uniqueTableRate(false),1/64);
 close(uniqueTableRate(true),3/64);
 close(vestigeHitRate(false),3/512);
 close(vestigeHitRate(true),9/512);
 close(rateOf("bellator-vestige"),1/512);
 close(rateOf("chromium-ingot"),3/512);
 close(rateOf("sirens-staff"),1/512);
 close(rateOf("virtus-mask"),1/1536);
 close(rateOf("virtus-robe-top",true),3/1536);
 close(rateOf("wisp"),PET_RATE);
 close(PET_RATE,1/2000);
 close(rateOf("awakeners-orb"),(63/64)/34);
 close(rateOf("shadow-quartz"),(63/64)*(33/34)*(24/25)/200);
 assert.equal(UNIQUE.length,10);
 assert.equal(DRY_ITEMS.length,8);
});

test("Three hidden Bellator hits give 1 ring, 2 rings, and then vestige",()=>{
 const x=simulate(3,{rng:()=>0});
 assert.equal(x.drops["gold-ring"],3);
 assert.equal(x.drops["bellator-vestige"],1);
 assert.equal(x.vestigeProgress,0);
 assert.equal(x.drops.wisp,3);
 assert.equal(x.drops["clue-scroll-easy"],3);
 const y=simulate(2,{rng:()=>0});
 assert.equal(y.vestigeProgress,2);
 assert.equal(y.drops["gold-ring"],3);
 assert.equal(y.drops["bellator-vestige"],undefined);
});

test("Standard loot selects fixed normal or perfect stacks",()=>{
 let prior=0,at=0;
 for(const row of MAIN){
  if(row[0]==="coal"){at=(prior+row[3]/2)/100;break;}
  prior+=row[3];
 }
 const run=perfect=>{
  let i=0;
  const seq=[.99,.99,.99,.99,.99,at,.99,.99];
  return simulate(1,{rng:()=>seq[i++]??.99,perfect}).drops;
 };
 assert.equal(run(false).coal,303);
 assert.equal(run(true).coal,455);
});

test("Whisperer supply bundle always contains manta rays, ancient brew and prayer",()=>{
 let i=0;const seq=[.99,.99,.99,.99,0,0,.99,.99];
 const drops=simulate(1,{rng:()=>seq[i++]??.99,perfect:true}).drops;
 assert.equal(drops["manta-ray"],3);
 assert.equal(drops["ancient-brew-2"],1);
 assert.equal(drops["prayer-potion-3"],1);
});

test("Konar task is optional and cannot be paired with awakened mode",()=>{
 assert.equal(simulate(1,{rng:()=>0,konarTask:true}).drops["brimstone-key"],1);
 assert.equal(simulate(1,{rng:()=>0}).drops["brimstone-key"],undefined);
 assert.throws(()=>validateOptions({awakened:true,konarTask:true}));
 assert.throws(()=>simulate(1,{awakened:true,konarTask:true}));
});

test("Shadow quartz pity approximation improves to 1/50 at 300 KC",()=>{
 close(quartzRate(300),1/50);
 close(quartzRate(500),1/50);
 close(quartzRate(300,true),1/200);
 assert.throws(()=>quartzRate(0));
 assert.throws(()=>quartzRate(1,1));
});

test("Bellator dry probability models floor(hidden hits/3)",()=>{
 const p=3/512,q=9/512;
 close(vestigeOdds(2,0).atLeastOne,0);
 close(vestigeOdds(3,1).atLeastOne,p**3,1e-11);
 close(vestigeOdds(3,1).exact,p**3,1e-11);
 close(vestigeOdds(3,1,true).exact,q**3,1e-11);
 close(vestigeOdds(3,0).exact,1-p**3,1e-11);
 assert.throws(()=>vestigeOdds(2,1));
 assert.throws(()=>calculateDry(2,{"bellator-vestige":1}));
});

test("Dry distributions normalize at high kills and validate counts",()=>{
 for(const kills of [0,1,10,100,1000,10000,MAX_KILLS]){
  const r=calculateDry(kills);
  for(const item of DRY_ITEMS){
   const x=r[item.id];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 close(calculateDry(1,{"chromium-ingot":1})["chromium-ingot"].exact,3/512);
 close(calculateDry(1,{"chromium-ingot":1},true)["chromium-ingot"].exact,9/512);
 assert.throws(()=>calculateDry(1,{"wisp":2}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{},1));
});

test("Kills, options, and RNG input bounds",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateOptions({perfect:1}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
});

test("Navigation, responsive homepage grid, UI fields, docs, and all local sprites",()=>{
 const home=source("index.html"),page=source("whisperer/index.html");
 const app=source("whisperer/app.mjs"),css=source("styles.css");
 const readme=source("whisperer/README.md");
 assert.match(home,/href="\.\/whisperer\/"/);
 assert.match(css,/grid-template-columns:\s*repeat\(7,\s*minmax\(0,\s*1fr\)\)/);
 assert.match(page,/oldschool\.runescape\.wiki\/w\/The_Whisperer/);
 assert.match(readme,/Bellator vestige/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\),\$\("awakened"\)\.checked\)/);
 for(const id of ["kill-count","perfect","awakened","konar-task",
  "mode-loot","mode-dry","unique-grid","loot-grid","vestige-progress"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG missing");
 }
});
