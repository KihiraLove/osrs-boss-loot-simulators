import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAIN,RARE,GEM,MEGA,TALISMAN,ITEMS,UNIQUE,MAX_KILLS,
 validateKills,validateOptions,rateOf,clueRate,simulate
} from "../bosses/king-black-dragon/simulator.mjs";
import {calculateDry} from "../bosses/king-black-dragon/dry-calc.mjs";
const close=(a,b,epsilon=1e-10)=>assert.ok(Math.abs(a-b)<epsilon,`Expected ${b}, got ${a}`);
const file=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
function point(table,id){
 let used=0;
 for(const row of table){if(row[0]===id)return (used+row[3]/2)/table.reduce((n,r)=>n+r[3],0);used+=row[3];}
 throw new Error("Missing "+id);
}
test("KBD normal table and nested subtables have their published ticket totals",()=>{
 for(const [table,total] of [[MAIN,128],[RARE,128],[GEM,128],[MEGA,128],[TALISMAN,70]])
  assert.equal(table.reduce((n,row)=>n+row[3],0),total);
 for(const [id,low,high,weight] of [
  ["rune-longsword",1,1,10],["runite-bolts",10,20,10],
  ["dragon-javelin-tips",15,15,5],["@rareDrop",0,0,8],["@gem",0,0,2],
  ["dragon-arrowtips",5,14,5],["air-rune",300,300,10]
 ])assert.deepEqual(MAIN.find(row=>row[0]===id),[id,low,high,weight]);
});
test("Four unique drops have independent published rates",()=>{
 assert.deepEqual(UNIQUE.map(item=>item.id),[
  "dragon-pickaxe","kbd-heads","draconic-visage","prince-black-dragon"]);
 close(rateOf("dragon-pickaxe"),1/1000);
 close(rateOf("kbd-heads"),1/128);
 close(rateOf("draconic-visage"),1/5000);
 close(rateOf("prince-black-dragon"),1/3000);
 close(clueRate(false),1/450);close(clueRate(true),1/427);
});
test("Pickaxe pre-roll replaces primary drop but not the guaranteed or tertiary loot",()=>{
 const {drops}=simulate(1,{rng:()=>0,konarTask:true});
 assert.equal(drops["dragon-bones"],1);
 assert.equal(drops["black-dragonhide"],2);
 for(const id of ["dragon-pickaxe","kbd-heads","prince-black-dragon",
  "draconic-visage","clue-scroll-elite","brimstone-key"])
  assert.equal(drops[id],1,id);
 assert.equal(drops["rune-longsword"],undefined);
});
test("Monkey Madness II switches exactly five fire rune / javelin tickets",()=>{
 const p=point(MAIN,"dragon-javelin-tips");
 const rng=()=>{throw new Error("Use sequence");};
 function doKill(mm2){
  const values=[0.5,p,0.99,0.99,0.99,0.99];
  let i=0;
  return simulate(1,{monkeyMadness2:mm2,rng:()=>values[i++]??0.99}).drops;
 }
 assert.equal(doKill(true)["dragon-javelin-tips"],15);
 assert.equal(doKill(true)["fire-rune"],undefined);
 assert.equal(doKill(false)["fire-rune"],300);
 assert.equal(doKill(false)["dragon-javelin-tips"],undefined);
});
test("RDT and gem subtables roll recursively and do not alter the guaranteed loot",()=>{
 function run(which){
  const values=[.5,point(MAIN,which),0,.99,.99,.99,.99];
  let i=0;
  return simulate(1,{rng:()=>values[i++]??.99}).drops;
 }
 assert.equal(run("@rareDrop")["nature-rune"],67);
 const gem=run("@gem");
 assert.equal(gem["dragon-bones"],1);
 assert.equal(gem["black-dragonhide"],2);
 assert.equal(gem["uncut-sapphire"],undefined);
});
test("Random amount rolls stay in their published limits",()=>{
 const p=point(MAIN,"runite-bolts");
 function run(q){
  const values=[.99,p,q,.99,.99,.99,.99];
  let i=0;
  return simulate(1,{rng:()=>values[i++]??.99}).drops["runite-bolts"];
 }
 assert.equal(run(0),10);assert.equal(run(.999),20);
});
test("Dry probabilities are normalized and combined without exclusive-drop assumptions",()=>{
 const zero=calculateDry(0);
 assert.equal(zero.anyUnique.count,0);
 close(zero.anyUnique.atLeastOne,0);
 const expected=1-(1-1/1000)*(1-1/128)*(1-1/5000)*(1-1/3000);
 close(calculateDry(1).anyUnique.atLeastOne,expected);
 const one=calculateDry(1,{"dragon-pickaxe":1});
 close(one["dragon-pickaxe"].exact,1/1000);
 for(const n of [0,1,10,100,1000,20000]){
  const stats=calculateDry(n);
  for(const item of [...UNIQUE.map(x=>x.id),"anyUnique"]){
   const x=stats[item];close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(1,{"kbd-heads":2}));
 assert.throws(()=>calculateDry(0,{"dragon-pickaxe":1}));
 assert.throws(()=>calculateDry(1,null));
});
test("Invalid kill counts, flags and RNG are rejected",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,NaN,2.5,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateOptions({monkeyMadness2:1}));
 assert.throws(()=>simulate(1,{konarTask:"yes"}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
});
test("Local sprite assets, navigation, controls and boss README exist",()=>{
 const home=file("index.html"),html=file("bosses/king-black-dragon/index.html");
 const app=file("bosses/king-black-dragon/app.mjs"),docs=file("bosses/king-black-dragon/README.md");
 assert.match(home,/href="bosses\/king-black-dragon\/"/);
 assert.match(docs,/dragon pickaxe/i);
 for(const id of ["mode-loot","mode-dry","kill-count","monkey-madness-2",
  "elite-cas","konar-task","dry-inputs","unique-grid","loot-grid"]){
  assert.ok(html.includes('id="'+id+'"'),id+" missing from page");
 }
 for(const id of ["monkey-madness-2","elite-cas","konar-task"]){
  assert.ok(app.includes('$("'+id+'")'),id+" not wired");
 }
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
