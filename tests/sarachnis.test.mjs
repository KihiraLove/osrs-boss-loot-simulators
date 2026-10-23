import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,HERBS,RARE_SEEDS,UNIQUE,DRY_ITEMS,ITEMS,PAGES,TERTIARY,
 rateOf,clueRate,rollPrimary,simulate,validateKills,validateOptions
} from "../bosses/sarachnis/simulator.mjs";
import {calculateDry} from "../bosses/sarachnis/dry-calc.mjs";
const close=(a,b,epsilon=1e-9)=>assert.ok(Math.abs(a-b)<=epsilon,"Expected "+b+", got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Sarachnis primary 100-ticket table retains explicitly missing outcomes",()=>{
 assert.equal(MAIN.reduce((s,row)=>s+row[3],0),100);
 assert.equal(MAIN.find(row=>row[0]==="@nothing")[3],13);
 assert.equal(MAIN.find(row=>row[0]==="@gem")[3],1);
 assert.equal(MAIN.find(row=>row[0]==="@rare-seed")[3],2);
 assert.deepEqual(MAIN.find(row=>row[0]==="battlestaff"),["battlestaff",8,10,2]);
 assert.deepEqual(MAIN.find(row=>row[0]==="blood-rune"),["blood-rune",80,100,5]);
 assert.deepEqual(MAIN.find(row=>row[0]==="coins"),["coins",17000,25000,6]);
 assert.equal(HERBS.reduce((s,row)=>s+row[3],0),800);
 assert.equal(HERBS.find(row=>row[0]==="@nothing")[3],720);
 assert.deepEqual(HERBS.find(row=>row[0]==="grimy-kwuarm"),["grimy-kwuarm",10,15,15]);
 assert.equal(RARE_SEEDS.reduce((s,row)=>s+row[3],0),1090);
});

test("Sarachnis cudgel and dragon med helm have exclusive pre-rolls",()=>{
 assert.deepEqual(rollPrimary(()=>0),{id:"dragon-med-helm",quantity:1});
 assert.deepEqual(rollPrimary(()=>2.5/384),{id:"sarachnis-cudgel",quantity:1});
 let i=0;const seq=[.99,.005,0];
 assert.deepEqual(rollPrimary(()=>seq[i++]),{id:"battlestaff",quantity:8});
 assert.equal(simulate(1,{rng:()=>0}).drops["sarachnis-cudgel"],undefined);
 assert.equal(simulate(1,{rng:()=>2.5/384}).drops["sarachnis-cudgel"],1);
});

test("Independent tertiary rewards can coexist with a primary reward",()=>{
 const result=simulate(1,{rng:()=>0,konarTask:true});
 assert.equal(result.drops["dragon-med-helm"],1);
 assert.equal(result.drops["sarachnis-cudgel"],undefined);
 assert.equal(result.drops["grimy-kwuarm"],10);
 assert.equal(result.drops["tattered-moon-page"],1);
 assert.equal(result.drops["giant-egg-sac-full"],1);
 assert.equal(result.drops["grubby-key"],1);
 assert.equal(result.drops["pristine-spider-silk"],1);
 assert.equal(result.drops["jar-of-eyes"],1);
 assert.equal(result.drops.sraracha,1);
 assert.equal(result.drops["clue-scroll-hard"],1);
 assert.equal(result.drops["clue-scroll-elite"],1);
 assert.equal(result.drops["brimstone-key"],1);
 assert.equal(simulate(1,{rng:()=>0}).drops["brimstone-key"],undefined);
});

test("Shared 1/5 tattered page roll balances the three types",()=>{
 const drops=simulate(3,{rng:()=>0}).drops;
 for(const id of PAGES)assert.equal(drops[id],1);
 const none=simulate(4,{rng:()=>.99});
 for(const id of PAGES)assert.equal(none.drops[id]??0,0);
 assert.equal(PAGES.length,3);
});

test("Rarities and Combat Achievement bonuses are correct",()=>{
 close(rateOf("sarachnis-cudgel"),1/384);
 close(rateOf("pristine-spider-silk"),1/50);
 close(rateOf("jar-of-eyes"),1/2000);
 close(rateOf("sraracha"),1/3000);
 close(clueRate("hard"),1/40);close(clueRate("hard",true),1/38);
 close(clueRate("elite"),1/60);close(clueRate("elite",true),1/57);
 assert.equal(DRY_ITEMS.length,UNIQUE.length);
 assert.equal(TERTIARY.find(row=>row[0]==="giant-egg-sac-full")[1],1/20);
 assert.throws(()=>clueRate("none"));assert.throws(()=>clueRate("hard",2));
});

test("Dry probabilities return the expected independent outcomes",()=>{
 const p=1/384;
 close(calculateDry(1,{"sarachnis-cudgel":1})["sarachnis-cudgel"].exact,p);
 close(calculateDry(1,{"sarachnis-cudgel":0})["sarachnis-cudgel"].exact,1-p);
 close(calculateDry(384)["sarachnis-cudgel"].expected,1);
 close(calculateDry(3000).sraracha.expected,1);
 for(const n of [0,1,10,100,3000,100000,MAX_KILLS]){
  const r=calculateDry(n);
  for(const item of DRY_ITEMS){
   const x=r[item.id];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(1,{"sarachnis-cudgel":2}));
 assert.throws(()=>calculateDry(1,null));
});

test("Kill count, options, RNG are validated",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.3,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateOptions({hardCAs:1}));
 assert.throws(()=>simulate(1,{eliteCAs:3}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>rollPrimary(()=>-1));
});

test("Home, Sarachnis UI controls and local item assets",()=>{
 const home=source("index.html"),page=source("bosses/sarachnis/index.html");
 const app=source("bosses/sarachnis/app.mjs"),readme=source("bosses/sarachnis/README.md");
 assert.match(home,/href="bosses\/sarachnis\/"/);
 assert.match(readme,/1\/384/);
 for(const id of ["kill-count","hard-cas","elite-cas","konar-task",
  "mode-loot","mode-dry","unique-grid","loot-grid","dry-inputs"])
  assert.ok(page.includes('id="'+id+'"'),id+" input missing");
 assert.match(app,/hardCAs:\$\("hard-cas"\)\.checked/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 // Only check the Sarachnis-defined IDs (shared Giant Mole table owns its assets).
 const keys=new Set([...MAIN,...HERBS,...RARE_SEEDS].map(row=>row[0])
  .concat([...UNIQUE,...TERTIARY.map(([id])=>({id}))].map(x=>x.id),
   PAGES,["dragon-med-helm","brimstone-key","clue-scroll-hard","clue-scroll-elite"]));
 for(const id of keys){
  if(id.startsWith("@"))continue;
  assert.ok(ITEMS[id],id+" item metadata missing");
  const data=readFileSync(new URL("../assets/items/"+id+".png",import.meta.url));
  assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10],id+" PNG invalid");
 }
});
