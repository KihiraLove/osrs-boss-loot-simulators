import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_PULLS,SKILLS,DEFAULT_LEVELS,RARE,PYRO_IDS,UNIQUE,DRY_ITEMS,ITEMS,
 EFFECTIVE_RATES,ORDINARY_RATE,COMMON_WEIGHTS,MATERIALS,rateOf,validatePulls,
 validateLevels,validateOwned,category,materialChoice,simulate
} from "../wintertodt/simulator.mjs";
import {calculateDry,cappedOdds,pyroPieceOdds} from "../wintertodt/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("2024 Reward Cart sequential rare checks and 25-ticket common table",()=>{
 assert.deepEqual(RARE.map(x=>x.id),[
  "phoenix","dragon-axe","tome-of-fire-empty","warm-gloves",
  "bruma-torch","pyromancer-garb","burnt-page"
 ]);
 const denominators=[5000,10000,1000,150,150,150,45];
 for(let i=0;i<RARE.length;i++)close(RARE[i].rawRate,1/denominators[i]);
 let miss=1;
 for(const row of RARE){
  close(EFFECTIVE_RATES[row.id],miss*row.rawRate);
  miss*=1-row.rawRate;
 }
 close(ORDINARY_RATE,miss);
 assert.equal(COMMON_WEIGHTS.reduce((sum,row)=>sum+row[1],0),25);
 assert.deepEqual(COMMON_WEIGHTS.slice(0,6).map(x=>x[1]),[3,3,3,3,3,3]);
 assert.deepEqual(COMMON_WEIGHTS.slice(6),[["coins",5],["saltpetre",1],["dynamite",1]]);
 assert.equal(Object.keys(MATERIALS).length,6);
 assert.equal(UNIQUE.length,10);
 assert.equal(DRY_ITEMS.length,9);
});

test("First successful rare check excludes all subsequent rewards",()=>{
 const phoenix=simulate(1,{rng:()=>0});
 assert.deepEqual({...phoenix.drops},{phoenix:1});
 const axe=simulate(1,{rng:(()=>{let x=0;return()=>[0.99,0][x++]??0.99;})()});
 assert.deepEqual({...axe.drops},{"dragon-axe":1});
 const tome=simulate(1,{rng:(()=>{let x=0;return()=>[0.99,0.99,0][x++]??0.99;})()});
 assert.deepEqual({...tome.drops},{"tome-of-fire-empty":1});
 const page=simulate(1,{rng:(()=>{let x=0;return()=>[0.99,0.99,0.99,0.99,0.99,0.99,0,0][x++]??0.99;})()});
 assert.deepEqual({...page.drops},{"burnt-page":7});
});

test("Pyromancer outfit uses least-owned tie-breaker order",()=>{
 let x=0;
 const rng=()=>{const i=x++%6;return i===5?0:0.99;};
 const data=simulate(5,{rng});
 assert.equal(data.drops["pyromancer-garb"],2);
 assert.equal(data.drops["pyromancer-hood"],1);
 assert.equal(data.drops["pyromancer-robe"],1);
 assert.equal(data.drops["pyromancer-boots"],1);
 assert.deepEqual(PYRO_IDS.map(id=>data.owned[id]),[2,1,1,1]);
});

test("Three owned gloves and torches convert rare hits to seeds",()=>{
 const glove=simulate(1,{rng:(()=>{let x=0;return()=>[0.99,0.99,0.99,0][x++]??0.99;})(),owned:{"warm-gloves":3}});
 assert.deepEqual({...glove.drops},{"magic-seed":1});
 const torch=simulate(1,{rng:(()=>{let x=0;return()=>[0.99,0.99,0.99,0.99,0,0][x++]??0.99;})(),owned:{"bruma-torch":3}});
 assert.deepEqual({...torch.drops},{"torstol-seed":2});
 const newGloves=simulate(1,{rng:(()=>{let x=0;return()=>[0.99,0.99,0.99,0][x++]??0.99;})()});
 assert.equal(newGloves.drops["warm-gloves"],1);
 assert.equal(newGloves.owned["warm-gloves"],1);
});

test("Material categories respect the published category chances, amounts and level gates",()=>{
 assert.equal(category(()=>0),"woodcutting");
 assert.equal(category(()=>(3.5/25)),"crafting");
 assert.equal(category(()=>(17.5/25)),"fishing");
 assert.equal(category(()=>(18.5/25)),"coins");
 assert.equal(category(()=>(23.5/25)),"saltpetre");
 assert.equal(category(()=>(24.5/25)),"dynamite");
 assert.equal(materialChoice("woodcutting",1,()=>0)[0],"oak-logs");
 for(const [skill,level,id] of [
  ["woodcutting",24,"mahogany-logs"],["woodcutting",49,"magic-logs"],
  ["mining",59,"runite-ore"],["herblore",63,"grimy-torstol"],
  ["farming",79,"spirit-seed"],["fishing",42,"raw-shark"]
 ])for(const roll of [0,.25,.5,.75,.999999])
  assert.notEqual(materialChoice(skill,level,()=>roll)[0],id);
 const base=[.99,.99,.99,.99,.99,.99,.99,(18.5/25),0];
 let x=0;
 assert.equal(simulate(1,{rng:()=>base[x++]??.99}).drops.coins,2000);
 assert.deepEqual(SKILLS,Object.keys(DEFAULT_LEVELS));
});

test("Dry odds use effective rates, cap gloves, and cycle Pyromancer pieces",()=>{
 close(calculateDry(1,{phoenix:1}).phoenix.exact,1/5000);
 close(calculateDry(1,{"dragon-axe":1})["dragon-axe"].exact,rateOf("dragon-axe"));
 const pyro=rateOf("pyromancer-garb");
 close(pyroPieceOdds(1,0,1).exact,pyro);
 close(pyroPieceOdds(1,1,1).exact,0);
 close(pyroPieceOdds(4,3,1).exact,pyro**4,1e-10);
 close(pyroPieceOdds(4,0,1).atLeastOne,1-(1-pyro)**4);
 const gloves=cappedOdds(3,0,"warm-gloves");
 close(gloves.atLeastOne,1-(1-rateOf("warm-gloves"))**3);
 close(cappedOdds(10000,3,"bruma-torch").more,0);
 assert.throws(()=>pyroPieceOdds(1,4,0));
 assert.throws(()=>cappedOdds(1,2,"warm-gloves"));
});

test("Dry distributions normalize over large numbers of pulls",()=>{
 for(const pulls of [0,1,5,100,1000,50000,MAX_PULLS]){
  const r=calculateDry(pulls);
  for(const item of DRY_ITEMS){
   const out=r[item.id];
   close(out.fewer+out.exact+out.more,1,1e-7);
   assert.ok(out.atLeastOne>=0&&out.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
 assert.throws(()=>calculateDry(0,{phoenix:1}));
 assert.throws(()=>calculateDry(1,{"warm-gloves":2}));
});

test("Invalid pull counts, levels, ownership and RNG inputs are rejected",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,1.5,NaN,Infinity,MAX_PULLS+1]){
  assert.throws(()=>validatePulls(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateLevels({...DEFAULT_LEVELS,woodcutting:100}));
 assert.throws(()=>validateLevels({...DEFAULT_LEVELS,fishing:0}));
 assert.throws(()=>validateOwned({"bruma-torch":4}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
});

test("Page, documentation, homepage links and every item sprite are included",()=>{
 const home=source("index.html"),page=source("wintertodt/index.html");
 const app=source("wintertodt/app.mjs"),docs=source("wintertodt/README.md");
 assert.match(home,/href="\.\/wintertodt\/"/);
 assert.match(app,/calculateDry\(pulls,readReceived\(pulls\)\)/);
 assert.match(docs,/October 2024/i);
 for(const id of ["pull-count","level-woodcutting","level-mining","level-fishing","level-crafting",
  "level-herblore","level-farming","owned-gloves","owned-torches",
  "mode-loot","mode-dry","dry-inputs","unique-grid","loot-grid","reward-summary"])
  assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" sprite");
 }
});
