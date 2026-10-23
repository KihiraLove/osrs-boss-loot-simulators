import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MOON_RATE,ANY_UNIQUE_RATE,SETS,UNIQUE,DRY_ITEMS,COMMON,ITEMS,
 rateOf,validateKills,simulate
} from "../bosses/moons-of-peril/simulator.mjs";
import {pieceOdds,completionChance,calculateDry} from "../bosses/moons-of-peril/dry-calc.mjs";
const close=(x,y,epsilon=1e-9)=>assert.ok(Math.abs(x-y)<=epsilon,
 "Expected "+y+" but got "+x);
const file=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Full-clear table has three four-piece sets, 30 tickets and six rolls",()=>{
 assert.equal(SETS.length,3);assert.equal(UNIQUE.length,12);
 assert.equal(new Set(UNIQUE.map(item=>item.id)).size,12);
 assert.ok(SETS.every(set=>set.items.length===4));
 assert.equal(COMMON.reduce((sum,row)=>sum+row[4],0),30);
 assert.equal(DRY_ITEMS.length,12);
 close(MOON_RATE,1/56);
 close(ANY_UNIQUE_RATE,1-(55/56)**3);
 for(const item of UNIQUE)close(rateOf(item.id),1/224);
 for(const row of [["atlatl-dart",72,120,5],["blessed-bone-shards",160,179,2],
 ["wyrmling-bones",42,54,1],["sun-kissed-bones",6,12,3],
 ["swamp-tar",79,119,4],["water-orb",30,45,2],["supercompost",6,12,3],
 ["soft-clay",15,25,3],["grimy-harralander",12,18,3],
 ["grimy-irit-leaf",12,18,1],["maple-seed",1,2,2],["yew-seed",1,1,1]])
  assert.deepEqual(COMMON.find(r=>r[0]===row[0]).slice(2),row.slice(1));
});
test("Each of three moons independently awards an item in one chest",()=>{
 const r=simulate(1,{rng:()=>0});
 assert.equal(r.chests,1);
 assert.equal(r.uniqueChests,1);
 assert.equal(r.uniqueDrops,3);
 for(const set of SETS)assert.equal(r.drops[set.items[0].id],1);
 assert.equal(r.drops["atlatl-dart"],undefined);
});
test("Sets give four distinct first pieces, then random repeats",()=>{
 const r=simulate(5,{rng:()=>0});
 assert.equal(r.uniqueDrops,15);
 assert.equal(r.uniqueChests,5);
 for(const set of SETS){
  assert.equal(r.drops[set.items[0].id],2);
  for(const item of set.items.slice(1))assert.equal(r.drops[item.id],1);
 }
 assert.equal(r.completedSets.filter(x=>x.completed).length,3);
});
test("One unique suppresses all common rolls even if other two miss",()=>{
 let i=0;
 const r=simulate(1,{rng:()=>{
  const sequence=[0,0,.9,.9];
  return sequence[i++]??0;
 }});
 assert.equal(r.uniqueChests,1);
 assert.equal(r.uniqueDrops,1);
 assert.equal(r.drops[SETS[0].items[0].id],1);
 assert.equal(Object.keys(r.drops).length,1);
});
test("Absent uniques cause exactly six common rolls, with inclusive quantities",()=>{
 let i=0;
 const seq=[.99,.99,.99];
 const a=simulate(1,{rng:()=>seq[i++]??0});
 assert.equal(a.uniqueChests,0);
 assert.equal(a.uniqueDrops,0);
 assert.equal(a.drops["atlatl-dart"],6*72);
 assert.equal(Object.keys(a.drops).length,1);
 const b=simulate(1,{rng:()=>.999999});
 assert.equal(b.drops["yew-seed"],6);
});
test("Zero and invalid chest inputs, invalid generators",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.5,Infinity,NaN,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:()=>-1}));
 assert.throws(()=>simulate(1,{rng:null}));
});
test("Item dry probabilities account for per-set duplicate protection",()=>{
 close(pieceOdds(0,0).exact,1);
 close(pieceOdds(1,1).exact,1/224);
 close(pieceOdds(2,1).atLeastOne,2/224);
 close(pieceOdds(3,2).exact,0);
 close(pieceOdds(4,1).atLeastOne,4/224);
 close(pieceOdds(4,2).exact,0);
 assert.ok(pieceOdds(5,2).exact>0);
 assert.throws(()=>pieceOdds(1,2));
});
test("Chance of finishing twelve pieces requires four hits from each moon",()=>{
 close(completionChance(0),0);
 close(completionChance(3),0);
 assert.ok(completionChance(4)>0);
 assert.ok(completionChance(320)>0.1);
 assert.ok(completionChance(320)<0.9);
 assert.ok(completionChance(1_000_000)>.9999);
});
test("Any unique count includes possible simultaneous multi-moon drops",()=>{
 close(calculateDry(1).anyUnique.atLeastOne,1-(55/56)**3);
 close(calculateDry(1,{[UNIQUE[0].id]:1}).anyUnique.exact,
  3*(1/56)*(55/56)**2);
 const a=calculateDry(2,{[UNIQUE[0].id]:2});
 assert.equal(a.anyUnique.count,2);
 assert.throws(()=>calculateDry(1,{[UNIQUE[0].id]:2}));
 const three=calculateDry(1,Object.fromEntries(SETS.map(s=>[s.items[0].id,1])));
 assert.equal(three.anyUnique.count,3);
 close(three.anyUnique.exact,(1/56)**3);
});
test("All dry distributions are normalized, including maximum KC",()=>{
 for(const n of [0,1,4,56,320,5000,MAX_KILLS]){
  const result=calculateDry(n);
  for(const item of UNIQUE){
   const x=result[item.id];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
  close(result.anyUnique.fewer+result.anyUnique.exact+result.anyUnique.more,1,1e-7);
 }
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{"eclipse-atlatl":1.5}));
});
test("All item sprites, navigation and restricted full-clear form present",()=>{
 const home=file("index.html"),page=file("bosses/moons-of-peril/index.html");
 const app=file("bosses/moons-of-peril/app.mjs"),readme=file("bosses/moons-of-peril/README.md");
 assert.match(home,/href="bosses\/moons-of-peril\/"/);
 assert.match(page,/aria-label="Lunar Chests opened after defeating all three moons"/);
 for(const id of ["kill-count","mode-loot","mode-dry","unique-grid","loot-grid",
  "dry-inputs","completion-chance","loot-summary"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 assert.ok(!page.includes('id="elite-cas"'));
 assert.match(app,/simulate\(kills\)/);
 assert.match(readme,/duplicate protection/i);
 for(const item of Object.values(ITEMS)){
  const icon=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" sprite");
 }
});
