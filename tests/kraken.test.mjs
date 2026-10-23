import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,UNIQUE,DRY_ITEMS,MAIN,ITEMS,rateOf,clueRate,
 validateKills,validateOptions,rollCommon,simulate
} from "../bosses/kraken/simulator.mjs";
import {calculateDry} from "../bosses/kraken/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+" got "+a);
const file=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Kraken boss has exactly 128 weighted common loot tickets",()=>{
 assert.equal(MAIN.reduce((sum,x)=>sum+x[3],0),128);
 const expected=[
 ["mystic-water-staff",1,1,3],["water-rune",400,400,10],
 ["chaos-rune",200,200,10],["coins",10000,19999,15],
 ["battlestaff",10,10,4],["watermelon-seed",24,24,3],
 ["kraken-tentacle",null,null,0]
 ];
 for(const [id,lo,hi,weight] of expected){
  const found=MAIN.find(x=>x[0]===id);
  if(weight===0)assert.equal(found,undefined);
  else assert.deepEqual(found,[id,lo,hi,weight]);
 }
 assert.deepEqual(MAIN.find(x=>x[0]==="@gem"),["@gem",0,0,2]);
});

test("Uniquely Kraken boss drop rates exclude cave Kraken",()=>{
 const rates={
  "trident-of-the-seas-full":1/512,
  "kraken-tentacle":1/400,
  "jar-of-dirt":1/1000,
  "pet-kraken":1/3000
 };
 assert.equal(UNIQUE.length,4);
 assert.deepEqual(DRY_ITEMS,UNIQUE);
 for(const [id,p] of Object.entries(rates))close(rateOf(id),p);
 close(rateOf("uncut-sapphire"),0);
 close(clueRate(),1/500);
 close(clueRate(true),1/475);
});

test("Common loot is one exclusive weighted outcome per kill",()=>{
 assert.deepEqual(rollCommon(()=>0),{id:"mystic-water-staff",quantity:1});
 let step=0;
 const x=rollCommon(()=>[0.99,0.00][step++]??0);
 assert.equal(x,null,"Gem table should preserve its nothing outcome");
 const point=id=>{
  let soFar=0;
  for(const row of MAIN){if(row[0]===id)return (soFar+row[3]/2)/128;soFar+=row[3];}
  throw new Error("Not found "+id);
 };
 // The coins range is inclusive 10,000–19,999. A 0.999 quantity roll
 // selects 19,990; use a value closer to 1 to test the maximum.
 for(const [fraction,quantity] of [[0,10000],[0.999,19990],[0.999999,19999]]){
  step=0;
  const coin=rollCommon(()=>[point("coins"),fraction][step++]);
  assert.deepEqual(coin,{id:"coins",quantity});
 }
 step=0;
 const gem=rollCommon(()=>[0.999,0.999,0.999][step++]);
 assert.deepEqual(gem,{id:"dragon-spear",quantity:1});
});

test("Trident, tentacle, jar, pet and clues are independent of common loot",()=>{
 const drops=simulate(1,{rng:()=>0,eliteCAs:true,konarTask:true}).drops;
 assert.equal(drops["mystic-water-staff"],1);
 for(const item of UNIQUE)assert.equal(drops[item.id],1);
 assert.equal(drops["clue-scroll-elite"],1);
 assert.equal(drops["brimstone-key"],1);
});

test("Kill count and toggle validation",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const bad of [-1,1.1,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(bad));
  assert.throws(()=>simulate(bad));
  assert.throws(()=>calculateDry(bad));
 }
 assert.throws(()=>validateOptions({konarTask:1}));
 assert.throws(()=>validateOptions({eliteCAs:"yes"}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{eliteCAs:"yes"}));
 assert.throws(()=>clueRate(1));
});

test("Dry chances are binomial for all four independently rolled rares",()=>{
 const r=calculateDry(1,{
  "trident-of-the-seas-full":1,"kraken-tentacle":1,
  "jar-of-dirt":1,"pet-kraken":1
 });
 for(const item of UNIQUE){
  const result=r[item.id];
  close(result.exact,item.rate);
  close(result.expected,item.rate);
  close(result.atLeastOne,item.rate);
 }
 for(const n of [0,1,100,1000,10000,MAX_KILLS]){
  const calc=calculateDry(n);
  for(const item of DRY_ITEMS){
   const d=calc[item.id];
   close(d.fewer+d.exact+d.more,1,1e-7);
   assert.ok(d.atLeastOne>=0&&d.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(2,{"kraken-tentacle":3}));
 assert.throws(()=>calculateDry(1,{"pet-kraken":-1}));
 assert.throws(()=>calculateDry(1,null));
});

test("Homepage, options, docs and item sprites are present",()=>{
 const homepage=file("index.html");
 const page=file("kraken/index.html");
 const doc=file("kraken/README.md");
 const app=file("kraken/app.mjs");
 assert.match(homepage,/href="\.\/kraken\/"/);
 assert.match(doc,/1\/512/);
 assert.match(doc,/1\/400/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 for(const id of ["kill-count","mode-loot","mode-dry","elite-cas",
  "konar-task","unique-grid","loot-grid","dry-results-grid"])
  assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
 for(const item of Object.values(ITEMS)){
  const data=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10],
   "Invalid/missing local sprite "+item.id);
 }
});
