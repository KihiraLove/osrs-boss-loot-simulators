import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MAIN,RARE,SEEDS,FOSSILS,ITEMS,UNIQUE,DRY_ITEMS,
 STEEL_RING_CHANCE,validateKills,clueRate,rateOf,simulate
} from "../bosses/deranged-archaeologist/simulator.mjs";
import {calculateDry} from "../bosses/deranged-archaeologist/dry-calc.mjs";
const close=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
function ticket(id){
 let before=0;
 for(const row of MAIN){
  if(row[0]===id)return (before+row[3]/2)/131;
  before+=row[3];
 }
 throw Error("Missing "+id);
}
test("Steel ring is the sole 3/131 unique",()=>{
 assert.deepEqual(UNIQUE,[{id:"steel-ring",name:"Steel ring",rate:3/131}]);
 assert.deepEqual(DRY_ITEMS,UNIQUE);
 close(STEEL_RING_CHANCE,3/131);
 close(rateOf("steel-ring"),3/131);
 assert.equal(rateOf("rune-knife"),0);
});
test("131-ticket table and published quantities",()=>{
 assert.equal(MAIN.reduce((s,r)=>s+r[3],0),131);
 for(const [id,w,qty] of [["steel-ring",3,1],["black-dhide-body",6,1],
 ["rune-knife",6,25],["dragon-arrow",1,60],["black-dragonhide",5,8],
 ["crystal-key",7,1],["@seed",1,0],["@rare",6,0],["@gem",6,0]]){
  const row=MAIN.find(r=>r[0]===id);
  assert.ok(row,id+" missing");assert.equal(row[3],w);assert.equal(row[1],qty);
 }
 assert.equal(RARE.length,27);assert.equal(SEEDS.length,16);
 close(SEEDS.reduce((s,r)=>s+1/r[2],0),1/131,0.00005);
 close(RARE.reduce((s,r)=>s+1/r[2],0),12/131,0.00005);
});
test("Steel ring replaces other main loot; independent tertiary rolls",()=>{
 const x=simulate(1,{rng:()=>0,konarTask:true});
 assert.equal(x.drops.bones,1);
 assert.equal(x.drops["steel-ring"],1);
 assert.equal(x.drops["black-dhide-body"],undefined);
 assert.ok(x.drops.numulite>=5&&x.drops.numulite<=32);
 assert.equal(x.drops["unidentified-small-fossil"],1);
 assert.equal(x.drops["clue-scroll-elite"],1);
 assert.equal(x.drops["brimstone-key"],1);
 assert.equal(simulate(1,{rng:()=>0}).drops["brimstone-key"],undefined);
});
test("Seed and noted stack rolls preserve quantities",()=>{
 let i=0,seq=[ticket("@seed"),0,.99,.99,.99];
 const s=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(s.drops["ranarr-seed"],1);
 i=0;seq=[ticket("black-dragonhide"),.99,.99,.99];
 const m=simulate(1,{rng:()=>seq[i++]??.99});
 assert.equal(m.drops["black-dragonhide"],8);
});
test("Tertiary boosts, rates and options",()=>{
 close(clueRate(),1/200);
 close(clueRate({eliteCAs:true}),1/190);
 assert.throws(()=>clueRate({eliteCAs:1}),TypeError);
 assert.throws(()=>simulate(1,{konarTask:1}),TypeError);
 close(FOSSILS.reduce((sum,x)=>sum+x[1],0),.06857142857142857);
});
test("Steel ring dry calculator uses binomial odds",()=>{
 const one=calculateDry(1,{"steel-ring":1})["steel-ring"];
 close(one.exact,3/131);close(one.fewer,1-3/131);
 close(one.more,0);close(one.atLeastOne,3/131);
 close(one.expected,3/131);
 assert.equal(calculateDry(0)["steel-ring"].count,0);
 assert.throws(()=>calculateDry(1,{"steel-ring":2}));
 assert.throws(()=>calculateDry(1,{"steel-ring":-1}));
 assert.throws(()=>calculateDry(1,null));
 for(const n of [0,1,10,100,10000,MAX_KILLS]){
  const x=calculateDry(n)["steel-ring"];
  close(x.fewer+x.exact+x.more,1,1e-7);
  assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
 }
});
test("Kill bounds and RNG validation",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));assert.throws(()=>simulate(n));assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
});
test("Homepage, page controls and local PNG assets",()=>{
 const home=source("index.html"),page=source("bosses/deranged-archaeologist/index.html");
 const app=source("bosses/deranged-archaeologist/app.mjs");
 assert.match(home,/href="bosses\/deranged-archaeologist\/"/);
 for(const id of ["kill-count","elite-cas","konar-task","mode-loot","mode-dry","unique-grid","loot-grid"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 assert.match(app,/calculateDry\(kills,readReceived\(kills\)\)/);
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" missing PNG");
 }
});
