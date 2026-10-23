import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,UNIQUE,DRY_ITEMS,SHARDS,MAIN,GEM,TERTIARY,TOTEM_PIECES,
 ITEMS,rateOf,eliteClueRate,validateKills,validateOptions,pickTotem,simulate
} from "../bosses/skotizo/simulator.mjs";
import {calculateDry} from "../bosses/skotizo/dry-calc.mjs";
const close=(x,y,eps=1e-9)=>assert.ok(Math.abs(x-y)<=eps,"Expected "+y+" got "+x);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Ancient shard and main rewards are two independent weighted rolls",()=>{
 assert.equal(SHARDS.reduce((n,row)=>n+row[2],0),100);
 assert.deepEqual(SHARDS.map(r=>r[2]),[75,15,5,4,1]);
 close(SHARDS.reduce((n,row)=>n+row[1]*row[2],0)/100,1.41);
 assert.equal(MAIN.reduce((n,row)=>n+row[2],0),99);
 assert.equal(MAIN.filter(r=>r[2]===7).length,14);
 assert.deepEqual(MAIN.find(r=>r[0]==="shield-left-half"),["shield-left-half",1,1]);
 assert.equal(GEM.reduce((n,row)=>n+row[2],0),1000);
 assert.equal(GEM.find(r=>r[0]==="uncut-onyx")[2],1);
});
test("Guaranteed rewards and multiple independent branches can coexist",()=>{
 const x=simulate(1,{rng:()=>0,eliteCAs:true,konarTask:true}).drops;
 assert.equal(x["infernal-ashes"],1);
 assert.equal(x["clue-scroll-hard"],1);
 assert.equal(x["ancient-shard"],1);
 assert.equal(x["rune-platebody"],3);
 assert.equal(x["uncut-dragonstone"],10);
 assert.equal(x["ensouled-demon-head"],1);
 assert.equal(x["dark-claw"],1);
 assert.equal(x.skotos,1);
 assert.equal(x["jar-of-darkness"],1);
 assert.equal(x["dark-totem"],1);
 assert.equal(x["clue-scroll-elite"],1);
 assert.equal(x["brimstone-key"],1);
});
test("High rolls still guarantee five shards and hard clue",()=>{
 const x=simulate(1,{rng:()=>.999999}).drops;
 assert.equal(x["ancient-shard"],5);
 assert.equal(x["shield-left-half"],1);
 assert.equal(x["infernal-ashes"],1);
 assert.equal(x["clue-scroll-hard"],1);
 assert.equal(x["uncut-onyx"],undefined);
 assert.equal(x["clue-scroll-elite"],undefined);
 assert.equal(x.skotos,undefined);
});
test("Dark totem subtable is complete 1/128 vs piece 3/128",()=>{
 const r=()=>.99;
 assert.equal(pickTotem({},()=>0),"dark-totem");
 assert.equal(pickTotem({},r),"dark-totem-base");
 assert.equal(pickTotem({"dark-totem-base":1},r),"dark-totem-middle");
 assert.equal(pickTotem({"dark-totem-base":1,"dark-totem-middle":1},r),"dark-totem-top");
 assert.equal(pickTotem({"dark-totem-base":2,"dark-totem-middle":2,"dark-totem-top":2},r),"dark-totem-base");
 assert.deepEqual(TOTEM_PIECES,["dark-totem-base","dark-totem-middle","dark-totem-top"]);
});
test("Unique rates, elite Combat Achievements and conditional keys",()=>{
 close(rateOf("ancient-shard"),1);
 close(rateOf("dark-claw"),1/25);
 close(rateOf("skotos"),1/65);
 close(rateOf("jar-of-darkness"),1/200);
 close(rateOf("uncut-onyx"),1/1000);
 close(rateOf("dark-totem"),1/128);
 assert.equal(rateOf("none"),0);
 close(eliteClueRate(),1/5);close(eliteClueRate(true),1/4);
 assert.ok(!DRY_ITEMS.some(x=>x.id==="ancient-shard"));
 assert.equal(UNIQUE.length,6);
 assert.equal(TERTIARY.length,4);
 assert.equal(simulate(1,{rng:()=>0}).drops["brimstone-key"],undefined);
 assert.equal(simulate(1,{rng:()=>0,konarTask:true}).drops["brimstone-key"],1);
});
test("Dry probabilities are binomial with independent tertiary rates",()=>{
 for(const k of [0,1,2,100,1000,100000,MAX_KILLS]){
  const res=calculateDry(k);
  for(const item of DRY_ITEMS){
   const odds=res[item.id];
   close(odds.fewer+odds.exact+odds.more,1,1e-7);
   assert.ok(odds.atLeastOne>=0&&odds.atLeastOne<=1);
  }
 }
 close(calculateDry(1,{"skotos":1}).skotos.exact,1/65);
 close(calculateDry(1,{"uncut-onyx":1})["uncut-onyx"].exact,1/1000);
 close(calculateDry(1,{"dark-totem":1})["dark-totem"].exact,1/128);
 assert.throws(()=>calculateDry(1,{"dark-claw":2}));
 assert.throws(()=>calculateDry(2,{"skotos":-1}));
 assert.throws(()=>calculateDry(1,null));
});
test("Inputs, random generator and toggles validate",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const k of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(k));
  assert.throws(()=>simulate(k));
  assert.throws(()=>calculateDry(k));
 }
 assert.throws(()=>validateOptions({eliteCAs:1}));
 assert.throws(()=>validateOptions({konarTask:"true"}));
 assert.throws(()=>eliteClueRate(1));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:()=>-1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>pickTotem(null,()=>.5));
});
test("Homepage, controls, README and every required sprite are present",()=>{
 const home=read("index.html"),page=read("skotizo/index.html"),app=read("skotizo/app.mjs");
 const docs=read("skotizo/README.md");
 assert.match(home,/href="\.\/skotizo\/"/);
 for(const id of ["kill-count","elite-cas","konar-task","mode-loot",
  "mode-dry","unique-grid","loot-grid","dry-results-grid"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 assert.ok(!page.includes('id="hard-cas"'));
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 assert.match(docs,/least|ties/i);
 for(const item of Object.values(ITEMS)){
  const icon=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
