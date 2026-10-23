import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAIN,SHARK,ITEMS,PRIMARY,PRIMARY_RATE,UNIQUE,MAX_KILLS,rateOf,rollPrimary,validateKills,simulate} from "../bosses/grotesque-guardians/simulator.mjs";
import {binomial,calculateDry} from "../bosses/grotesque-guardians/dry-calc.mjs";
const close=(x,y,tolerance=1e-9)=>assert.ok(Math.abs(x-y)<=tolerance,x+" !== "+y);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("142-ticket table and 4-ticket shark subtable are exact",()=>{
 assert.equal(MAIN.reduce((s,r)=>s+r[3],0),142);
 assert.equal(SHARK.reduce((s,r)=>s+r[3],0),4);
 assert.deepEqual(MAIN.find(r=>r[0]==="@potions"),["@potions",0,0,6]);
 assert.deepEqual(MAIN.find(r=>r[0]==="@shark"),["@shark",0,0,4]);
 assert.deepEqual(MAIN.find(r=>r[0]==="coal"),["coal",180,250,5]);
 assert.deepEqual(MAIN.find(r=>r[0]==="gold-ore"),["gold-ore",40,50,7]);
 assert.deepEqual(MAIN.find(r=>r[0]==="soul-rune"),["soul-rune",20,40,1]);
});
test("Primary rares are exclusive each roll and use published odds",()=>{
 const expected={"granite-maul":1/250,"granite-gloves":1/500,"granite-ring":1/500,
  "granite-hammer":1/750,"black-tourmaline-core":1/1000};
 for(const [id,p] of Object.entries(expected))close(rateOf(id),p);
 close(PRIMARY_RATE,Object.values(expected).reduce((a,b)=>a+b,0));
 assert.equal(rollPrimary(()=>0),"granite-maul");
 assert.equal(rollPrimary(()=>0.99),null);
 assert.equal(UNIQUE.length,8);
 assert.equal(rateOf("noon"),1/3000);
 assert.equal(rateOf("jar-of-stone"),1/5000);
});
test("Always 50-100 granite dust and exactly two primary opportunities",()=>{
 const results=simulate(3,{rng:()=>0});
 assert.equal(results.kills,3);
 assert.equal(results.drops["granite-dust"],150);
 assert.equal(results.drops["granite-maul"],6);
 assert.equal(results.drops.noon,3);
 assert.equal(results.drops["jar-of-stone"],3);
 assert.equal(results.drops["clue-scroll-elite"],3);
 assert.equal(results.drops["brimstone-key"],undefined);
 const maxDust=simulate(1,{rng:()=>0.999999});
 assert.equal(maxDust.drops["granite-dust"],100);
});
test("Main roll potion bundle and shark subtable are modeled",()=>{
 function midpoint(id){
  let before=0;
  for(const row of MAIN){
   if(row[0]===id)return (before+row[3]/2)/142;
   before+=row[3];
  }
  throw Error(id);
 }
 function one(mainChance,sharkChance){
  // dust, first unique check, main ticket, optional shark subtable,
  // second unique check and main ticket, pet, jar, clue, brimstone.
  let index=0;
  const seq=[0,0.9,mainChance,...(sharkChance===null?[]:[sharkChance]),0.9,midpoint("rune-pickaxe"),0.9,0.9,0.9];
  return simulate(1,{rng:()=>seq[index++]??0.9}).drops;
 }
 const potion=one(midpoint("@potions"),null);
 assert.equal(potion["magic-potion-2"],1);
 assert.equal(potion["ranging-potion-2"],1);
 assert.equal(potion["super-combat-potion-2"],1);
 const shark=one(midpoint("@shark"),0);
 assert.equal(shark["raw-shark"],20);
});
test("Dry odds use twice as many main rolls, but one tertiary roll",()=>{
 const results=calculateDry(1,{"granite-maul":1,"noon":1});
 close(results["granite-maul"].exact,2*(1/250)*(1-1/250));
 close(results.noon.exact,1/3000);
 close(results["jar-of-stone"].atLeastOne,1/5000);
 close(results.anyPrimary.expected,2*PRIMARY_RATE);
 close(results["adamant-boots"].expected,2*(1-PRIMARY_RATE)/142);
 const one=calculateDry(1,{"granite-maul":2});
 close(one["granite-maul"].exact,(1/250)**2);
 assert.throws(()=>calculateDry(1,{"noon":2}));
 assert.throws(()=>calculateDry(1,{"granite-maul":3}));
});
test("Binomial evaluator allows up to two million trials without underflow",()=>{
 for(const kills of [0,1,20,100,1000,20000,MAX_KILLS]){
  const result=calculateDry(kills);
  for(const item of UNIQUE){
   const v=result[item.id];
   close(v.fewer+v.exact+v.more,1,1e-7);
   assert.ok(v.atLeastOne>=0&&v.atLeastOne<=1);
  }
  close(result.anyPrimary.fewer+result.anyPrimary.exact+result.anyPrimary.more,1,1e-7);
 }
 const d=binomial(2*MAX_KILLS,1/1000);
 close(d.values.reduce((a,b)=>a+b,0),1,1e-8);
 assert.throws(()=>binomial(2*MAX_KILLS+1,0.01));
});
test("Elite clue and Konar are optional tertiary rewards",()=>{
 const first=simulate(1,{rng:()=>0,eliteCAs:true,konarTask:true});
 assert.equal(first.drops["brimstone-key"],1);
 assert.equal(first.drops["clue-scroll-elite"],1);
 assert.throws(()=>simulate(1,{eliteCAs:"yes"}));
 assert.throws(()=>simulate(1,{konarTask:1}));
});
test("Kill and random source validation",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const kills of [-1,1.25,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(kills));
  assert.throws(()=>simulate(kills));
  assert.throws(()=>calculateDry(kills));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>calculateDry(1,null));
});
test("Homepage, modes, options, docs, and all local icons",()=>{
 const index=source("index.html"),html=source("grotesque-guardians/index.html");
 const app=source("grotesque-guardians/app.mjs");
 assert.match(index,/href="\.\/grotesque-guardians\/"/);
 for(const id of ["kill-count","mode-loot","mode-dry","elite-cas","konar-task",
   "unique-grid","loot-grid","dry-inputs","dry-results-grid"])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 assert.match(source("grotesque-guardians/README.md"),/two independent main loot rolls/i);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
