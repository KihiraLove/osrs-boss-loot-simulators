import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,UNIQUE,DRY_ITEMS,MAIN,HERBS,SEEDS,SUPPLIES,ITEMS,rateOf,validateKills,uniqueRoll,simulate} from "../bosses/phantom-muspah/simulator.mjs";
import {calculateDry} from "../bosses/phantom-muspah/dry-calc.mjs";
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`Expected ${b}; got ${a}`);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Phantom Muspah main table uses 235 tickets and two regular rolls",()=>{
 close(MAIN.reduce((s,row)=>s+row[4],0),235);
 close(MAIN.find(x=>x[0]==="@herbs")[4],5);
 close(MAIN.find(x=>x[0]==="@seeds")[4],5);
 close(MAIN.find(x=>x[0]==="rare-drop-table")[4],5);
 close(MAIN.filter(x=>["raw-shark","shark-lure","manta-ray"].includes(x[0])).reduce((s,x)=>s+x[4],0),10);
 close(HERBS.reduce((s,x)=>s+x[4],0),16);
 close(SEEDS.reduce((s,x)=>s+x[4],0),1);
 assert.equal(SUPPLIES.length,3);
 assert.equal(SUPPLIES[0].length,2);
});
test("Unique table is exactly 100 tickets; essence quantities are stepped",()=>{
 const u=[.001,.61,.90,.94,.98,.995];
 const outs=u.map(x=>uniqueRoll(()=>x)[0]);
 assert.deepEqual(outs,["ancient-essence","ancient-essence","ancient-essence","frozen-cache","ancient-icon","venator-shard"]);
 close(UNIQUE.slice(0,4).reduce((s,x)=>s+x.rate,0),1);
 const low=uniqueRoll(()=>0);
 assert.deepEqual(low,["ancient-essence",540]);
 const mid=uniqueRoll(()=>.7);
 assert.equal((mid[1]-885)%5,0);
 const high=uniqueRoll(()=>.9);
 assert.equal((high[1]-1970)%10,0);
});
test("A Venator shard suppresses all other normal and tertiary loot",()=>{
 const x=simulate(4,{rng:()=>.995,konarTask:true,hardCAs:true,eliteCAs:true});
 assert.equal(x.drops["venator-shard"],4);
 assert.equal(Object.keys(x.drops).length,1);
});
test("Supply bundle replaces one standard roll and contains all three groups",()=>{
 let idx=0;
 // Two essence draws, the supplies branch, three paired supply draws,
 // the remaining ordinary roll, pet, hard clue, and elite clue.
 const vals=[
  .1,.5, // essence roll and quantity
  0, // choose the supplies bundle
  0,0, // shark and quantity
  0,0, // ancient brew and quantity
  0,0, // super restore and quantity
  0, // ordinary-table roll
  0, // pet
  0, // hard clue
  0 // elite clue
 ];
 const rng=()=>{if(idx>=vals.length)throw new Error("RNG fixture exhausted");return vals[idx++];};
 const x=simulate(1,{rng,konarTask:true}).drops;
 assert.equal(idx,vals.length);
 assert.equal(x["ancient-essence"],570);
 assert.equal(x.shark,4);
 assert.equal(x["ancient-brew-3"],1);
 assert.equal(x["super-restore-3"],2);
 assert.equal(x["rune-kiteshield"],3);
 assert.equal(x.muphin,1);
 assert.equal(x["clue-scroll-hard"],1);
 assert.equal(x["clue-scroll-elite"],1);
 assert.equal(x["brimstone-key"],undefined);
});
test("Charged ice is excluded from simulated loot",()=>{
 assert.equal(simulate(0,{chargedIce:true}).drops["charged-ice"],undefined);
 assert.equal(simulate(2,{rng:()=>0,chargedIce:true}).drops["charged-ice"],undefined);
 assert.equal(simulate(10,{rng:()=>0}).drops["charged-ice"],undefined);
});
test("Dry probabilities model independent kills with mutually exclusive unique outcomes",()=>{
 close(rateOf("frozen-cache"),.04);
 close(rateOf("ancient-icon"),.02);
 close(rateOf("venator-shard"),.01);
 close(rateOf("muphin"),1/2500);
 assert.equal(DRY_ITEMS.length,4);
 const result=calculateDry(1,{"venator-shard":1});
 close(result["venator-shard"].exact,.01);
 close(result["frozen-cache"].exact,.96);
 close(result["ancient-icon"].exact,.98);
 close(result.muphin.atLeastOne,.99/2500);
 for(const n of [0,1,10,100,1000,10000,MAX_KILLS]){
  for(const item of DRY_ITEMS){
   const x=calculateDry(n)[item.id];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
});
test("Validate kill counts, RNG bounds, option types and dry item counts",()=>{
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.doesNotThrow(()=>simulate(1,{konarTask:1}));
 assert.throws(()=>calculateDry(1,{"frozen-cache":2}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{"muphin":-1}));
});
test("Homepage, simulator options and local sprites are present",()=>{
 const home=source("index.html"),page=source("bosses/phantom-muspah/index.html");
 const app=source("bosses/phantom-muspah/app.mjs"),docs=source("bosses/phantom-muspah/README.md");
 assert.match(home,/href="bosses\/phantom-muspah\/"/);
 assert.match(docs,/Venator shard/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 for(const id of ["kill-count","mode-loot","mode-dry","hard-cas","elite-cas","unique-grid","loot-grid"])
  assert.ok(page.includes('id="'+id+'"'),id+" not present");
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
