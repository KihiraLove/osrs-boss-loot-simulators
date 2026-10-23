import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,MODES,UNIQUE,DRY_ITEMS,EGGS,EGG_PET_RATE,STANDARD,ITEMS,
 validateKills,validateMode,validateOptions,rateOf,simulate
} from "../bosses/maggot-king/simulator.mjs";
import {calculateDry} from "../bosses/maggot-king/dry-calc.mjs";
const close=(actual,expected,e=1e-10)=>assert.ok(Math.abs(actual-expected)<=e,
 "Expected "+expected+"; got "+actual);
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Maggot King has two exclusive corpse modes and 159 ordinary tickets",()=>{
 assert.deepEqual(MODES,["stomach","eggs"]);
 assert.equal(STANDARD.reduce((sum,row)=>sum+row[4],0),159);
 assert.equal(STANDARD.find(row=>row[0]==="$supplies")[4],41);
 assert.deepEqual(STANDARD.find(row=>row[0]==="uncut-ruby"),["uncut-ruby","Uncut ruby",10,13,15]);
 assert.deepEqual(STANDARD.find(row=>row[0]==="adamantite-ore"),["adamantite-ore","Adamantite ore",30,40,10]);
 assert.deepEqual(STANDARD.find(row=>row[0]==="venator-fang"),["venator-fang","Venator fang",112,179,2]);
 assert.deepEqual(STANDARD.find(row=>row[0]==="tarnished-spear"),["tarnished-spear","Tarnished spear",1,1,12]);
 assert.deepEqual(UNIQUE.map(x=>x.id),["elder-venator-fang","crimson-kisten","maggot-marquess"]);
 assert.equal(DRY_ITEMS,UNIQUE);
});

test("Six published egg probabilities combine into pet odds about 1/1502.4",()=>{
 assert.deepEqual(EGGS.map(e=>e.tickets),[300,150,33,6,3,1]);
 assert.deepEqual(EGGS.map(e=>Math.round(1/e.petRate)),[3000,2500,1250,500,10,2]);
 assert.equal(EGGS.reduce((sum,e)=>sum+e.tickets,0),493);
 close(EGG_PET_RATE,EGGS.reduce((s,e)=>s+e.tickets/1500*e.petRate,0));
 close(1/EGG_PET_RATE,1502.403846153846,1e-5);
 close(rateOf("maggot-marquess","stomach"),1/3500);
 close(rateOf("maggot-marquess","eggs"),EGG_PET_RATE);
 close(rateOf("elder-venator-fang","stomach"),1/340);
 close(rateOf("crimson-kisten","stomach"),1/520);
 close(rateOf("elder-venator-fang","eggs"),0);
 close(rateOf("crimson-kisten","eggs"),0);
});

test("Stomach unique pre-roll, pet, clue, and Konar key are independent",()=>{
 const x=simulate(2,{rng:()=>0,konarTask:true});
 assert.equal(x.drops["elder-venator-fang"],2);
 assert.equal(x.drops["crimson-kisten"],undefined);
 assert.equal(x.drops["maggot-marquess"],2);
 assert.equal(x.drops["clue-scroll-elite"],2);
 assert.equal(x.drops["brimstone-key"],undefined);
 assert.equal(x.drops["stymphike-tartare"],undefined);
});

test("Supplies are paired as one ordinary-table roll",()=>{
 let i=0;
 const seq=[.99,0,0,.99,.99];
 const x=simulate(1,{rng:()=>seq[i++]??.99}).drops;
 assert.equal(x["stymphike-tartare"],2);
 assert.equal(x["dull-ancient-medal"],1);
 assert.equal(x["elder-venator-fang"],undefined);
});

test("Take-eggs automatically pop the obtained egg for the pet",()=>{
 const x=simulate(2,{mode:"eggs",rng:()=>0});
 assert.equal(x.drops["maggot-egg-base"],2);
 assert.equal(x.drops["maggot-marquess"],2);
 assert.equal(x.drops["clue-scroll-elite"],2);
 assert.equal(x.drops["elder-venator-fang"],undefined);
 assert.equal(x.drops["crimson-kisten"],undefined);
 const empty=simulate(1,{mode:"eggs",rng:()=>.999});
 assert.deepEqual({...empty.drops},{});
});

test("Dry calculator uses mode-specific binomial odds and either-weapon result",()=>{
 const s=calculateDry(1,{"elder-venator-fang":1},"stomach");
 close(s["elder-venator-fang"].exact,1/340);
 close(s["crimson-kisten"].atLeastOne,1/520);
 close(s["maggot-marquess"].atLeastOne,1/3500);
 close(s.anyWeapon.atLeastOne,1/340+1/520);
 const e=calculateDry(1,{"maggot-marquess":1},"eggs");
 close(e["maggot-marquess"].exact,EGG_PET_RATE);
 assert.equal(e.anyWeapon,undefined);
 assert.throws(()=>calculateDry(1,{"elder-venator-fang":1},"eggs"));
});

test("Zero to a million kills remain valid and dry probabilities normalize",()=>{
 for(const n of [0,1,50,1000,10000,MAX_KILLS]){
  for(const mode of MODES){
   const r=calculateDry(n,{},mode);
   for(const item of DRY_ITEMS){
    const odds=r[item.id];
    close(odds.fewer+odds.exact+odds.more,1,1e-8);
    assert.ok(odds.atLeastOne>=0&&odds.atLeastOne<=1);
   }
  }
 }
 assert.deepEqual({...simulate(0).drops},{});
});

test("Reject invalid counts, modes and RNGs",()=>{
 for(const n of [-1,NaN,Infinity,1.3,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateMode("other"));
 assert.doesNotThrow(()=>validateOptions({mode:"eggs",konarTask:true}));
 assert.throws(()=>validateOptions({eliteCAs:1}));
 assert.doesNotThrow(()=>simulate(1,{mode:"eggs",konarTask:true}));
 assert.throws(()=>simulate(1,{mode:"fish"}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{"maggot-marquess":2}));
});

test("All icons exist; page and homepage have correct links and controls",()=>{
 const home=source("index.html"),css=source("styles.css");
 const page=source("bosses/maggot-king/index.html"),app=source("bosses/maggot-king/app.mjs");
 assert.match(home,/href="bosses\/maggot-king\/"/);
 assert.match(home,/maggot-marquess\.png/);
 assert.match(css,/grid-template-columns:\s*repeat\(9,\s*minmax\(0,\s*1fr\)\)/);
 assert.match(css,/width:\s*72px;\s*height:\s*72px/);
 for(const id of ["stomach-count","eggs-count","elite-cas","mode-loot","mode-dry","unique-grid","loot-grid","dry-inputs"])
  assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
 assert.doesNotMatch(page,/name="corpse"/);
 assert.match(app,/simulateCombined as simulate/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
