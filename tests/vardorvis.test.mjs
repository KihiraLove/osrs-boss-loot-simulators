import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,ITEMS,UNIQUE,DRY_ITEMS,PET_RATE,rateOf,vestigeHitRate,
 uniqueTableRate,quartzRate,validateKills,validateOptions,simulate
} from "../bosses/vardorvis/simulator.mjs";
import {calculateDry,vestigeOdds} from "../bosses/vardorvis/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Published 100-ticket ordinary table retains 78 named and 22 unlisted outcomes",()=>{
 assert.equal(MAIN.reduce((s,r)=>s+r[3],0),100);
 assert.equal(MAIN.find(r=>r[0]==="@nothing")[3],22);
 for(const [id,normal,perfect,weight] of [
  ["pure-essence",120,180,1],["coal",130,195,8],["adamantite-ore",45,67,8],
  ["runite-ore",18,27,2],["uncut-ruby",25,37,5],
  ["dragon-dart-tip",100,150,2],["onyx-bolts-e",60,90,1],
  ["blood-rune",200,300,8],["soul-rune",400,600,2]
 ])assert.deepEqual(MAIN.find(r=>r[0]===id),[id,normal,perfect,weight]);
});

test("Normal and awakened unique rolls have Vardorvis rates",()=>{
 close(uniqueTableRate(false),1/136);close(uniqueTableRate(true),3/136);
 close(vestigeHitRate(false),3/1088);close(vestigeHitRate(true),9/1088);
 close(rateOf("ultor-vestige"),1/1088);
 close(rateOf("chromium-ingot"),3/1088);
 close(rateOf("executioners-axe-head"),1/1088);
 close(rateOf("virtus-mask"),1/3264);
 close(rateOf("virtus-mask",true),3/3264);
 close(rateOf("butch"),PET_RATE);
 close(rateOf("awakeners-orb"),(135/136)/80);
 close(rateOf("blood-quartz"),(135/136)*(79/80)*(24/25)/200);
 assert.equal(UNIQUE.length,10);assert.equal(DRY_ITEMS.length,8);
});

test("Three hidden vestige successes give gold rings before Ultor",()=>{
 const x=simulate(3,{rng:()=>0});
 assert.equal(x.drops["gold-ring"],3);
 assert.equal(x.drops["ultor-vestige"],1);
 assert.equal(x.vestigeProgress,0);
 assert.equal(x.drops.butch,3);
 assert.equal(x.drops["clue-scroll-easy"],3);
 const twice=simulate(2,{rng:()=>0});
 assert.equal(twice.vestigeProgress,2);
 assert.equal(twice.drops["gold-ring"],3);
 assert.equal(twice.drops["ultor-vestige"],undefined);
 assert.equal(twice.drops["chromium-ingot"],undefined);
});

test("Normal and perfect ordinary drops have fixed correct quantities",()=>{
 function point(id){
  let past=0;
  for(const row of MAIN){if(row[0]===id)return (past+row[3]/2)/100;past+=row[3];}
  throw Error(id);
 }
 function run(perfect){
  const seq=[.99,.99,.99,.99,.99,point("coal"),.99,.99];
  let i=0;
  return simulate(1,{rng:()=>seq[i++]??.99,perfect}).drops;
 }
 assert.equal(run(false).coal,130);
 assert.equal(run(true).coal,195);
});

test("Supply roll awards all three foods and potions",()=>{
 const seq=[.99,.99,.99,.99,0,0,.99,.99];
 let i=0;
 const x=simulate(1,{rng:()=>seq[i++]??.99,perfect:true}).drops;
 assert.equal(x["tuna-potato"],3);
 assert.equal(x["prayer-potion-3"],1);
 assert.equal(x["super-combat-potion-2"],1);
});

test("Konar keys are only valid for normal encounters",()=>{
 assert.equal(simulate(1,{rng:()=>0,konarTask:true}).drops["brimstone-key"],1);
 assert.equal(simulate(1,{rng:()=>0}).drops["brimstone-key"],undefined);
 assert.throws(()=>validateOptions({konarTask:true,awakened:true}));
 assert.throws(()=>simulate(1,{awakened:true,konarTask:true}));
});

test("Quartz first-drop threshold and state return to base rate",()=>{
 close(quartzRate(300),1/50);
 close(quartzRate(301),1/50);
 close(quartzRate(300,true),1/200);
 assert.throws(()=>quartzRate(0));
 assert.throws(()=>quartzRate(1,1));
});

test("Ultor dry odds use floor(binomial hidden rolls / 3)",()=>{
 const p=3/1088,q=9/1088;
 close(vestigeOdds(2,0).atLeastOne,0);
 close(vestigeOdds(3,1).exact,p**3,1e-11);
 close(vestigeOdds(3,0).exact,1-p**3,1e-11);
 close(vestigeOdds(3,1,true).exact,q**3,1e-11);
 close(vestigeOdds(3,1).atLeastOne,p**3,1e-11);
 assert.throws(()=>vestigeOdds(2,1));
 assert.throws(()=>calculateDry(2,{"ultor-vestige":1}));
});

test("Dry odds normalized at high KC, validate counts and awakened rates",()=>{
 for(const n of [0,1,10,100,1000,10000,MAX_KILLS]){
  const r=calculateDry(n);
  for(const item of DRY_ITEMS){
   const result=r[item.id];
   close(result.fewer+result.exact+result.more,1,1e-7);
   assert.ok(result.atLeastOne>=0&&result.atLeastOne<=1);
  }
 }
 close(calculateDry(1,{"chromium-ingot":1})["chromium-ingot"].exact,3/1088);
 close(calculateDry(1,{"chromium-ingot":1},true)["chromium-ingot"].exact,9/1088);
 assert.throws(()=>calculateDry(1,{"butch":2}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{},1));
});

test("Kill validation, RNG and option checks",()=>{
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

test("Page navigation, 7-column desktop grid and all local item sprites",()=>{
 const home=source("index.html"),page=source("bosses/vardorvis/index.html");
 const app=source("bosses/vardorvis/app.mjs"),css=source("styles.css");
 assert.match(home,/href="bosses\/vardorvis\/"/);
 assert.match(css,/grid-template-columns:\s*repeat\(7,\s*minmax\(0,\s*1fr\)\)/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\),\$\("awakened"\)\.checked\)/);
 assert.match(app,/konar-task/);
 for(const id of ["kill-count","perfect","awakened","konar-task",
  "mode-loot","mode-dry","unique-grid","loot-grid","vestige-progress"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 for(const item of Object.values(ITEMS)){
  const icon=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
