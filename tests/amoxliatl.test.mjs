import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,UNIQUE,DRY_ITEMS,TERTIARY,COMMON,GEM,ITEMS,
 rateOf,simulate,validateKills
} from "../bosses/amoxliatl/simulator.mjs";
import {calculateDry,anySignature} from "../bosses/amoxliatl/dry-calc.mjs";
const close=(actual,expected,tolerance=1e-8)=>
 assert.ok(Math.abs(actual-expected)<=tolerance,"Expected "+expected+", got "+actual);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Amoxliatl's two primary rolls use a complete 58-ticket table",()=>{
 assert.equal(COMMON.reduce((sum,row)=>sum+row[4],0),58);
 assert.equal(GEM.reduce((sum,row)=>sum+row[4],0),16384);
 assert.equal(DRY_ITEMS.length,4);
 assert.equal(UNIQUE.length,3);
 close(rateOf("pendant-of-ates-inert"),1/25);
 close(rateOf("glacial-temotli"),1/100);
 close(rateOf("moxi"),1/3000);
 close(rateOf("tooth-half-of-key-moon"),1/125);
 close(rateOf("clue-scroll-elite"),1/200);
 close(rateOf("brimstone-key"),1/54);
});
test("One kill yields frozen tears, two primary drops, and tertiary rolls",()=>{
 const result=simulate(1,{rng:()=>0});
 assert.equal(result.drops["frozen-tear"],2);
 assert.equal(result.drops["rune-mace"],2);
 for(const item of DRY_ITEMS)assert.equal(result.drops[item.id],1);
 assert.equal(result.drops["clue-scroll-elite"],1);
 assert.equal(result.drops["brimstone-key"],undefined);
 const ten=simulate(10,{rng:()=>0});
 assert.equal(ten.drops["frozen-tear"],20);
 assert.equal(ten.drops["rune-mace"],20);
});
test("Frozen tear quantity tiers have the correct weighted boundaries",()=>{
 // 0.6 => 5-10; 0.9 => 10-20. Each roll consumes a separate quantity random.
 assert.equal(simulate(1,{rng:()=>0.6}).drops["frozen-tear"],8);
 assert.equal(simulate(1,{rng:()=>0.9}).drops["frozen-tear"],19);
});
test("The gem subtable and Konar/key/clue toggles are applied",()=>{
 const result=simulate(1,{rng:()=>.99999});
 assert.equal(result.drops["dragon-spear"],2);
 assert.equal(result.drops["brimstone-key"],undefined);
 assert.equal(simulate(1,{rng:()=>0,konarTask:true}).drops["brimstone-key"],1);
 assert.equal(simulate(1,{rng:()=>.0051,eliteCAs:false}).drops["clue-scroll-elite"],undefined);
 assert.equal(simulate(1,{rng:()=>.0051,eliteCAs:true}).drops["clue-scroll-elite"],1);
});
test("Independent tertiary rolls use binomial distributions",()=>{
 const one=calculateDry(1,{
  "pendant-of-ates-inert":1,
  "glacial-temotli":1,
  "moxi":1,
  "tooth-half-of-key-moon":1
 });
 close(one["pendant-of-ates-inert"].exact,1/25);
 close(one["glacial-temotli"].exact,1/100);
 close(one.moxi.exact,1/3000);
 close(one["tooth-half-of-key-moon"].exact,1/125);
 close(one.anyUnique.exact,1/25/100/3000);
 close(one.anyUnique.expected,1/25+1/100+1/3000);
 close(one.anyUnique.atLeastOne,1-(1-1/25)*(1-1/100)*(1-1/3000));
 assert.equal(one.anyUnique.count,3);
 assert.ok(!("clue-scroll-elite" in one));
});
test("Dry distributions normalize and invalid inputs are rejected",()=>{
 for(const n of [0,1,100,10000,MAX_KILLS]){
  const result=calculateDry(n);
  for(const item of DRY_ITEMS){
   const row=result[item.id];
   close(row.expected,n*item.rate,1e-6);
   close(row.fewer+row.exact+row.more,1,1e-7);
  }
  close(result.anyUnique.fewer+result.anyUnique.exact+result.anyUnique.more,1,1e-7);
 }
 for(const n of [-1,1.25,MAX_KILLS+1,Infinity,NaN]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>calculateDry(1,{"moxi":2}));
 assert.throws(()=>anySignature(1,4));
 assert.throws(()=>simulate(1,{rng:()=>1}));
});
test("Boss picker, calculator modes, and every reward icon are local",()=>{
 const home=read("index.html"),page=read("amoxliatl/index.html"),app=read("amoxliatl/app.mjs");
 assert.match(home,/href="\.\/amoxliatl\/"/);
 assert.match(home,/assets\/items\/moxi\.png/);
 assert.match(page,/href="\.\.\/"/);
 assert.match(page,/id="mode-loot"/);
 assert.match(page,/id="mode-dry"/);
 assert.match(page,/id="elite-cas"/);
 assert.match(page,/id="konar-task"/);
 assert.match(page,/assets\/items\/moxi\.png/);
 assert.match(app,/calculateDry/);
 assert.doesNotMatch(home+page+app,/oldschool\.runescape\.wiki\/images/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],
   item.id+" must have a local PNG");
 }
});
