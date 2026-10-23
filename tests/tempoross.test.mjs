import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_PULLS,MIN_FISHING,MAX_FISHING,RARE,RARE_TOTAL,RARE_DENOMINATOR,
 BASE,BASE_DENOMINATOR,FISH_WEIGHTS,FISH_TIERS,FISH_AMOUNTS,
 UNIQUE,DRY_ITEMS,ITEMS,tierOf,rateOf,validatePulls,validateFishingLevel,simulate
} from "../bosses/tempoross/simulator.mjs";
import {calculateDry,oneTimeOdds} from "../bosses/tempoross/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Reward pool categories use published weights",()=>{
 assert.equal(RARE_DENOMINATOR,8000);
 assert.equal(RARE_TOTAL,201);
 assert.equal(RARE.reduce((s,r)=>s+r[4],0),201);
 assert.equal(BASE.reduce((s,r)=>s+r[4],0)+FISH_WEIGHTS.reduce((a,b)=>a+b,0),BASE_DENOMINATOR);
 assert.deepEqual(FISH_WEIGHTS,[2250,2025,1800,1575,1350]);
 assert.deepEqual(FISH_AMOUNTS,[[30,40],[20,30],[10,20],[7,12],[5,10]]);
 assert.equal(UNIQUE.length,9);assert.equal(DRY_ITEMS.length,8);
 close(rateOf("fish-barrel"),1/400);
 close(rateOf("tackle-box"),1/400);
 close(rateOf("big-harpoonfish"),1/1600);
 close(rateOf("tome-of-water-empty"),1/1600);
 close(rateOf("dragon-harpoon"),1/8000);
 close(rateOf("tiny-tempor"),1/8000);
 close(rateOf("soaked-page"),149/8000);
 close(rateOf("spirit-flakes"),(1-201/8000)/4);
 close(rateOf("casket-reward-pool"),(1-201/8000)/20);
});

test("Fishing tiers cover every integer from 35 through 99",()=>{
 assert.equal(FISH_TIERS.length,7);
 assert.equal(MIN_FISHING,35);assert.equal(MAX_FISHING,99);
 const wanted=[[35,39,"raw-herring"],[40,45,"raw-mackerel"],
 [46,49,"raw-pike"],[50,75,"raw-salmon"],[76,78,"raw-tuna"],
 [79,80,"raw-lobster"],[81,99,"raw-bass"]];
 for(const [lo,hi,id] of wanted){
  assert.equal(tierOf(lo).fish[0],id);
  assert.equal(tierOf(hi).fish[0],id);
 }
 for(let level=35;level<=99;level++){
  const tier=tierOf(level);assert.ok(tier.fish.length===5);
  assert.ok(tier.min<=level&&level<=tier.max);
 }
 assert.throws(()=>tierOf(34));assert.throws(()=>tierOf(100));
 assert.throws(()=>validateFishingLevel(78.5));
});

test("A reward permit produces one rare outcome when one is rolled",()=>{
 const s=simulate(1,{rng:()=>0});
 assert.equal(s.drops["soaked-page"],5);
 assert.equal(Object.keys(s.drops).length,1);
 const p=149/8000;
 const barrel=simulate(1,{rng:()=>p});
 assert.equal(barrel.drops["fish-barrel"],1);
 const tackle=simulate(1,{rng:()=>169/8000});
 assert.equal(tackle.drops["tackle-box"],1);
 const big=simulate(2,{rng:()=>189/8000});
 assert.equal(big.drops["big-harpoonfish"],2);
 const tome=simulate(1,{rng:()=>194/8000});
 assert.equal(tome.drops["tome-of-water-empty"],1);
 const harpoon=simulate(1,{rng:()=>199/8000});
 assert.equal(harpoon.drops["dragon-harpoon"],1);
 const pet=simulate(1,{rng:()=>200/8000});
 assert.equal(pet.drops["tiny-tempor"],1);
});

test("Duplicate fish barrel and tackle box rolls convert into 25 pages",()=>{
 const barrels=simulate(3,{rng:()=>149/8000});
 assert.equal(barrels.drops["fish-barrel"],1);
 assert.equal(barrels.drops["soaked-page"],50);
 assert.equal(barrels.ownsBarrel,true);
 const started=simulate(1,{rng:()=>149/8000,ownsBarrel:true});
 assert.equal(started.drops["fish-barrel"],undefined);
 assert.equal(started.drops["soaked-page"],25);
 const boxes=simulate(2,{rng:()=>169/8000});
 assert.equal(boxes.drops["tackle-box"],1);
 assert.equal(boxes.drops["soaked-page"],25);
 const owned=simulate(1,{rng:()=>169/8000,ownsTackleBox:true});
 assert.equal(owned.drops["tackle-box"],undefined);
 assert.equal(owned.drops["soaked-page"],25);
});

test("Common rewards use their exact relative weights after rare miss",()=>{
 let i=0;
 const flakes=simulate(1,{rng:()=>[0.99,0,0][i++]??0.99});
 assert.equal(flakes.drops["spirit-flakes"],32);
 i=0;
 const casket=simulate(1,{rng:()=>[0.99,0.275][i++]??0.99});
 assert.equal(casket.drops["casket-reward-pool"],1);
 assert.equal(Object.keys(casket.drops).length,1);
 const fishLevel=level=>{
  let j=0;
  return simulate(1,{fishingLevel:level,rng:()=>[0.99,0.5,0][j++]??0.99}).drops;
 };
 assert.equal(fishLevel(35)["raw-herring"],30);
 assert.equal(fishLevel(40)["raw-mackerel"],30);
 assert.equal(fishLevel(46)["raw-pike"],30);
 assert.equal(fishLevel(50)["raw-salmon"],30);
 assert.equal(fishLevel(76)["raw-tuna"],30);
 assert.equal(fishLevel(79)["raw-lobster"],30);
 assert.equal(fishLevel(81)["raw-bass"],30);
});

test("Geometric one-time drops and binomial repeatable drops are distinct",()=>{
 const p=1/400;
 close(oneTimeOdds(0,0,p).atLeastOne,0);
 close(oneTimeOdds(1,1,p).exact,p);
 close(oneTimeOdds(2,1,p).exact,1-(1-p)**2);
 close(oneTimeOdds(2,1,p).more,0);
 close(oneTimeOdds(2,0,p).more,1-(1-p)**2);
 assert.throws(()=>oneTimeOdds(100,2,p));
 assert.throws(()=>calculateDry(1,{"fish-barrel":2}));
 close(calculateDry(1,{"fish-barrel":1})["fish-barrel"].exact,p);
 close(calculateDry(1,{"tiny-tempor":1})["tiny-tempor"].exact,1/8000);
 close(calculateDry(1,{"spirit-flakes":1})["spirit-flakes"].exact,(1-201/8000)/4);
});

test("Dry results normalize at large pull counts",()=>{
 for(const pulls of [0,1,3,10,100,1000,10000,MAX_PULLS]){
  const r=calculateDry(pulls);
  for(const item of DRY_ITEMS){
   const row=r[item.id];
   close(row.fewer+row.exact+row.more,1,1e-7);
   assert.ok(row.atLeastOne>=0&&row.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(1,{"tackle-box":-1}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
});

test("Inputs and generator are validated",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const pulls of [-1,1.5,NaN,Infinity,MAX_PULLS+1]){
  assert.throws(()=>validatePulls(pulls));
  assert.throws(()=>simulate(pulls));
  assert.throws(()=>calculateDry(pulls));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:()=>NaN}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{ownsBarrel:1}));
 assert.throws(()=>simulate(1,{ownsTackleBox:"yes"}));
});

test("Tempoross page, README, homepage, and local PNG icons",()=>{
 const home=source("index.html"),page=source("bosses/tempoross/index.html");
 const app=source("bosses/tempoross/app.mjs"),docs=source("bosses/tempoross/README.md");
 assert.match(home,/href="bosses\/tempoross\/"/);
 assert.match(app,/calculateDry\(pulls,readReceived\(pulls\)\)/);
 assert.match(docs,/reward permits/i);
 for(const id of ["pull-count","fishing-level","mode-loot","mode-dry","dry-inputs","unique-grid","loot-grid","fishing-tier"])
  assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" sprite");
 }
});
