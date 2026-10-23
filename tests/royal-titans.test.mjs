import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,BRANDA,ELDRIC,PRIMARY,PET,UNIQUE,ITEMS,
 MODES,scaledQuantity,rateOf,primaryRate,validateOptions,simulate
} from "../bosses/royal-titans/simulator.mjs";
import {calculateDry} from "../bosses/royal-titans/dry-calc.mjs";
const close=(a,b,epsilon=1e-10)=>
 assert.ok(Math.abs(a-b)<=epsilon,`Expected ${b}, received ${a}`);
const file=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Solo and duo shares; main-table weights from published drop tables",()=>{
 assert.deepEqual(MODES.map(m=>m.share),[1,.5]);
 assert.equal(BRANDA.reduce((s,r)=>s+r[4],0),55);
 assert.equal(ELDRIC.reduce((s,r)=>s+r[4],0),56);
 assert.equal(BRANDA.find(x=>x[0]==="coal")[2],280);
 assert.equal(ELDRIC.find(x=>x[0]==="water-orb")[3],40);
 close(rateOf("fire-element-staff-crown","solo","branda"),1/75);
 close(rateOf("fire-element-staff-crown","duo","branda"),1/150);
 close(rateOf("ice-element-staff-crown","solo","branda"),0);
 close(rateOf("ice-element-staff-crown","duo","eldric"),1/150);
 close(rateOf("giantsoul-amulet","solo","eldric"),1/16);
 close(rateOf("giantsoul-amulet","duo","eldric"),1/32);
 close(primaryRate("solo","branda"),2/75+1/16);
 close(primaryRate("duo","eldric"),1/75+1/32);
 assert.equal(PRIMARY.length,5);
 assert.equal(PET.id,"bran");
 assert.equal(UNIQUE.length,6);
});

test("Scroll read status, reward choice and Combat Achievements affect rates",()=>{
 close(rateOf("mystic-vigour-prayer-scroll","solo","branda",{readMystic:true}),0);
 close(rateOf("deadeye-prayer-scroll","duo","eldric",{readDeadeye:true}),0);
 close(rateOf("clue-scroll-hard","duo","eldric",{hardCAs:true}),1/23);
 close(rateOf("clue-scroll-elite","solo","branda",{eliteCAs:true}),1/95);
 close(rateOf("bran","solo","branda",{action:"sacrifice"}),1/1500);
 close(rateOf("bran","duo","branda"),1/3000);
 close(rateOf("fire-element-staff-crown","solo","branda",{action:"pages"}),0);
 close(rateOf("giantsoul-amulet","duo","eldric",{action:"sacrifice"}),0);
});

test("Exclusive unique pre-roll selects the selected Titan only",()=>{
 const a=simulate(1,0,{rng:()=>0,soloTitan:"branda"}).drops;
 assert.equal(a["fire-element-staff-crown"],1);
 assert.equal(a["ice-element-staff-crown"],undefined);
 assert.equal(a["clue-scroll-hard"],1);
 assert.equal(a["bran"],1);
 const b=simulate(0,1,{rng:()=>0,duoTitan:"eldric"}).drops;
 assert.equal(b["ice-element-staff-crown"],1);
 assert.equal(b["fire-element-staff-crown"],undefined);
 const c=simulate(1,0,{rng:()=>0,soloTitan:"branda",readMystic:true}).drops;
 assert.equal(c["fire-element-staff-crown"],1);
 assert.equal(c["mystic-vigour-prayer-scroll"],undefined);
});

test("No unique: two ordinary rolls; 50% halves quantities",()=>{
 function run(solo){
  // First .99 bypasses the exclusive pre-roll. The common table's
  // first entry has a fixed quantity (four mystic fire staffs).
  const rolls=[.99,0,0,.99,.99,.99];
  let i=0;
  return simulate(solo?1:0,solo?0:1,{rng:()=>rolls[i++]??.99}).drops;
 }
 assert.equal(run(true)["mystic-fire-staff"],8);
 assert.equal(run(false)["mystic-fire-staff"],4);
 assert.equal(scaledQuantity(3,.5),2);
 assert.equal(scaledQuantity(1,.5),1);
 assert.throws(()=>scaledQuantity(1,.33));
});

test("Pages and sacrifice exclude uniques and ordinary loot, retain tertiaries",()=>{
 const p=simulate(1,1,{rng:()=>0,action:"pages"}).drops;
 assert.equal(p["desiccated-page"],15); // 10 solo + 5 duo
 assert.equal(p["fire-element-staff-crown"],undefined);
 assert.equal(p["mystic-fire-staff"],undefined);
 assert.equal(p.bran,2);
 const s=simulate(1,1,{rng:()=>0,action:"sacrifice"}).drops;
 assert.deepEqual(Object.keys(s).sort(),["bran","clue-scroll-elite","clue-scroll-hard"].sort());
 assert.equal(s.bran,2);
});

test("Combined dry odds for 100% solo and 50% duo",()=>{
 const r=calculateDry(1,1);
 const p=1/75,q=1/150;
 close(r["fire-element-staff-crown"].expected,p+q);
 close(r["fire-element-staff-crown"].atLeastOne,1-(1-p)*(1-q));
 const r1=calculateDry(1,1,{"fire-element-staff-crown":1});
 close(r1["fire-element-staff-crown"].exact,p*(1-q)+(1-p)*q);
 close(r.bran.expected,2/3000);
 const sacrifice=calculateDry(1,1,{}, {action:"sacrifice"});
 close(sacrifice.bran.expected,2/1500);
 close(sacrifice["fire-element-staff-crown"].atLeastOne,0);
});

test("Different solo and duo targets are combined correctly",()=>{
 const result=calculateDry(2,3,{}, {soloTitan:"branda",duoTitan:"eldric"});
 close(result["fire-element-staff-crown"].expected,2/75);
 close(result["ice-element-staff-crown"].expected,3/150);
 close(result["giantsoul-amulet"].expected,2/16+3/32);
 const unavailable=calculateDry(0,1,{}, {duoTitan:"eldric",readDeadeye:true});
 close(unavailable["deadeye-prayer-scroll"].atLeastOne,0);
 close(calculateDry(0,1,{"fire-element-staff-crown":1},{duoTitan:"eldric"})["fire-element-staff-crown"].exact,0);
});

test("Probability mass sums to one; limits reject invalid counts",()=>{
 for(const n of [0,1,200,1000,10000]){
  const r=calculateDry(n,Math.floor(n/2));
  for(const item of UNIQUE){
   const s=r[item.id];
   close(s.fewer+s.exact+s.more,1,1e-7);
   assert.ok(s.atLeastOne>=0&&s.atLeastOne<=1);
  }
  close(r.anyPrimary.fewer+r.anyPrimary.exact+r.anyPrimary.more,1,1e-7);
 }
 assert.throws(()=>calculateDry(1,0,{"bran":2}));
 assert.throws(()=>calculateDry(0,0,null));
 assert.throws(()=>calculateDry(-1,0));
 assert.throws(()=>calculateDry(1,0,{}, {soloTitan:"foo"}));
 assert.throws(()=>simulate(1,0,{rng:()=>1}));
 assert.throws(()=>simulate(1,0,{rng:null}));
 assert.throws(()=>simulate(MAX_KILLS+1,0));
 assert.throws(()=>validateOptions({action:"other"}));
});

test("Homepage/docs/controls and every required local sprite",()=>{
 const home=file("index.html");
 const page=file("bosses/royal-titans/index.html");
 const app=file("bosses/royal-titans/app.mjs");
 const docs=file("bosses/royal-titans/README.md");
 assert.match(home,/href="bosses\/royal-titans\/"/);
 assert.match(docs,/Solo|solo/);
 assert.match(app,/calculateDry\(solo,duo,readReceived\(solo\+duo\),options\)/);
 for(const id of ["kills-solo","kills-duo","solo-titan","duo-titan","reward-action",
  "hard-cas","elite-cas","read-mystic","read-deadeye","mode-loot","mode-dry",
  "unique-grid","loot-grid","dry-inputs"])
  assert.ok(page.includes('id="'+id+'"'),"Missing input "+id);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" sprite");
 }
});
