import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,UNIQUE,DRY_ITEMS,ITEMS,MAIN,SHARK,PRE_RATE,
 rateOf,clueRate,validateKills,validateOptions,simulate
} from "../bosses/thermonuclear-smoke-devil/simulator.mjs";
import {calculateDry} from "../bosses/thermonuclear-smoke-devil/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,`Expected ${b}, got ${a}`);
const file=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
function point(id){
 let weight=0;
 for(const row of MAIN){
  if(row[0]===id)return (weight+row[3]/2)/107;
  weight+=row[3];
 }
 throw new Error("Unknown table entry "+id);
}
test("107-ticket standard table and split shark/lure branch",()=>{
 assert.equal(MAIN.reduce((s,r)=>s+r[3],0),107);
 assert.deepEqual(MAIN.find(r=>r[0]==="@shark"),["@shark",0,0,1]);
 assert.deepEqual(SHARK,[["raw-shark",30,30,5],["shark-lure",60,60,3]]);
 assert.deepEqual(MAIN.find(r=>r[0]==="@gem"),["@gem",0,0,2]);
 for(const row of [["rune-dagger",1,1,5],["smoke-rune",100,100,10],
  ["air-rune",300,300,8],["soul-rune",100,100,8],
  ["coins",10000,19999,15],["rune-knife-p",50,50,1]])
  assert.deepEqual(MAIN.find(r=>r[0]===row[0]),row);
});
test("Published unique rates and combat-achievement clue tiers",()=>{
 assert.deepEqual(UNIQUE.map(i=>i.id),[
  "occult-necklace","smoke-battlestaff","dragon-chainbody","jar-of-smoke","pet-smoke-devil"]);
 close(rateOf("occult-necklace"),1/350);
 close(rateOf("smoke-battlestaff"),1/512);
 close(rateOf("dragon-chainbody"),1/2000);
 close(rateOf("jar-of-smoke"),1/2000);
 close(rateOf("pet-smoke-devil"),1/3000);
 close(PRE_RATE,1/350+1/512+1/2000);
 close(clueRate("hard"),1/96);
 close(clueRate("hard",true),1/91);
 close(clueRate("elite"),1/500);
 close(clueRate("elite",true),1/475);
 assert.throws(()=>clueRate("master"));
 assert.equal(DRY_ITEMS.length,5);
});
test("Occult pre-roll replaces normal loot; tertiary drops remain independent",()=>{
 const x=simulate(1,{rng:()=>0,konarTask:true}).drops;
 assert.equal(x.ashes,1);
 assert.equal(x["occult-necklace"],1);
 for(const id of ["jar-of-smoke","pet-smoke-devil","clue-scroll-hard","clue-scroll-elite"])assert.equal(x[id],1);
 assert.equal(x["rune-dagger"],undefined);
 assert.equal(x["smoke-battlestaff"],undefined);
});
test("All three pre-rolls are mutually exclusive",()=>{
 const outcomes=[["occult-necklace",0],["smoke-battlestaff",1/350+.0001],
  ["dragon-chainbody",1/350+1/512+.0001]];
 for(const [id,value] of outcomes){
  const x=simulate(1,{rng:()=>value}).drops;
  assert.equal(x[id],1);
  assert.equal(UNIQUE.slice(0,3).reduce((s,u)=>s+(x[u.id]??0),0),1);
 }
});
test("Standard loot uses its own random ticket, including coins range",()=>{
 const run=(amount)=>{let i=0;
  const rng=()=>[.99,point("coins"),amount,.99,.99,.99,.99][i++]??.99;
  return simulate(1,{rng}).drops;
 };
 assert.equal(run(0).coins,10000);
 assert.equal(run(.999999).coins,19999);
 assert.equal(run(0).ashes,1);
});
test("Raw sharks and shark lures share exactly one main-table branch",()=>{
 function go(which){let i=0;
  const rng=()=>[.99,point("@shark"),which,.99,.99,.99,.99][i++]??.99;
  return simulate(1,{rng}).drops;
 }
 assert.equal(go(0)["raw-shark"],30);
 assert.equal(go(0)["shark-lure"],undefined);
 assert.equal(go(.999)["shark-lure"],60);
 assert.equal(go(.999)["raw-shark"],undefined);
});
test("Gem subtable is a nested ordinary roll and ash is guaranteed",()=>{
 let i=0;const values=[.99,point("@gem"),0,.99,.99,.99,.99];
 const x=simulate(1,{rng:()=>values[i++]??.99}).drops;
 assert.equal(x.ashes,1);
 assert.equal(x["occult-necklace"],undefined);
 assert.equal(x["uncut-sapphire"],undefined); // first gem ticket is no-drop
});
test("Dry odds account for exclusive main pre-roll and independent tertiaries",()=>{
 const p=1-(1-PRE_RATE)*(1-1/2000)*(1-1/3000);
 close(calculateDry(1).anyUnique.atLeastOne,p);
 close(calculateDry(1).anyPrimary.atLeastOne,PRE_RATE);
 close(calculateDry(1,{"occult-necklace":1})["occult-necklace"].exact,1/350);
 for(const k of [0,1,2,10,100,1000,20000]){
  const r=calculateDry(k);
  for(const id of [...DRY_ITEMS.map(x=>x.id),"anyPrimary","anyUnique"]){
   const v=r[id];close(v.fewer+v.exact+v.more,1,1e-7);
   assert.ok(v.atLeastOne>=0&&v.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(1,{"occult-necklace":1,"smoke-battlestaff":1}));
 assert.throws(()=>calculateDry(1,{"occult-necklace":2}));
 assert.throws(()=>calculateDry(1,null));
});
test("Validation rejects invalid kills, flags and random values",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const n of [-1,NaN,1.2,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.doesNotThrow(()=>validateOptions({konarTask:1}));
 assert.throws(()=>simulate(1,{hardCAs:"yes"}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
});
test("Homepage, page controls, documentation and every required local sprite",()=>{
 const home=file("index.html"),page=file("bosses/thermonuclear-smoke-devil/index.html");
 const app=file("bosses/thermonuclear-smoke-devil/app.mjs");
 const docs=file("bosses/thermonuclear-smoke-devil/README.md");
 assert.match(home,/href="bosses\/thermonuclear-smoke-devil\/"/);
 assert.match(docs,/shark lures/i);
 for(const id of ["mode-loot","mode-dry","kill-count","hard-cas","elite-cas","dry-inputs","unique-grid","loot-grid"])
  assert.ok(page.includes('id="'+id+'"'),id+" missing");
 for(const id of ["hard-cas","elite-cas"])
  assert.ok(app.includes('$("'+id+'")'),id+" not wired");
 for(const item of Object.values(ITEMS)){
  const buf=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...buf.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
