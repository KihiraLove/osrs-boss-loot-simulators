import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,EQUIPMENT,BOSS_UNIQUES,DRY_ITEMS,SUPPLIES,STANDARD,LOCKBOX,DOSSIER,
 ALL_ITEMS,rates,itemRate,simulate,validateKills,validateContribution,validatePlan
} from "../yama/simulator.mjs";
import {calculateDry,anyRare} from "../yama/dry-calc.mjs";

const close=(a,b,tolerance=1e-9)=>
 assert.ok(Math.abs(a-b)<=tolerance,"Expected "+b+", got "+a);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const plan=(solo,duo)=>({solo,duo});

test("Yama Wiki rates are preserved separately for solo and duo",()=>{
 assert.equal(MAX_KILLS,1000000);
 assert.equal(EQUIPMENT.reduce((s,i)=>s+i.weight,0),5);
 assert.equal(SUPPLIES.length,6);
 assert.equal(STANDARD.reduce((s,i)=>s+i[3],0),63);
 assert.equal(LOCKBOX.reduce((s,i)=>s+i[3],0),403);
 assert.equal(DOSSIER.reduce((s,i)=>s+i[3],0),1740);
 close(rates(1).gear,1/120);
 close(rates(.5).gear,1/240);
 close(rates(.5).dossier/(1-rates(.5).gear),1/24);
 close(rates(1).box/(1-rates(1).gear-rates(1).dossier),1/30);
 close(rates(.5).box/(1-rates(.5).gear-rates(.5).dossier),1/30);
 close(rates(.5).pet,1/2500);
 close(itemRate("soulflame-horn",1),1/300);
 close(itemRate("soulflame-horn",.5),1/600);
 close(itemRate("oathplate-chest",1),1/600);
 close(itemRate("oathplate-chest",.5),1/1200);
 close(rates(1).gear+rates(1).dossier+rates(1).box+rates(1).shards+rates(1).common,1);
});

test("one combined session accepts solo and duo kills with a shared loot inventory",()=>{
 const result=simulate(plan(1,1),{rng:()=>0});
 assert.equal(result.kills,2);
 assert.equal(result.soloKills,1);
 assert.equal(result.duoKills,1);
 assert.equal(result.drops["oathplate-helm"],2);
 assert.equal(result.drops.yami,2);
 assert.equal(result.drops["clue-scroll-elite"],2);
 const solo=simulate(plan(1,0),{rng:()=>.005});
 const duo=simulate(plan(0,1),{rng:()=>.005});
 assert.equal(solo.drops["oathplate-helm"],1);
 assert.equal(duo.drops["oathplate-helm"],undefined);
 const standard=simulate(plan(1,1),{rng:()=>.99});
 assert.equal(standard.drops["onyx-bolt-tips"],225);
});

test("lockboxes from either contribution are opened into one separate loot section",()=>{
 let i=0;
 const rolls=[.1,0,.99,.99,.06,0,.99,.99];
 const result=simulate(plan(1,1),{rng:()=>rolls[i++]});
 assert.equal(result.lockboxes,2);
 assert.equal(result.drops["forgotten-lockbox"],2);
 assert.equal(result.boxes["dragon-bolts-unf"],250);
 assert.equal(result.drops["dragon-bolts-unf"],undefined);
 assert.equal(result.dossierCount,0);
});

test("rite guarantee crosses the combined 100-KC boundary and can occur only once",()=>{
 const before=simulate(plan(60,39),{rng:()=>.02});
 assert.equal(before.dossierCount,99);
 assert.equal(before.dossiers["rite-of-vile-transference"],undefined);
 const after=simulate(plan(60,40),{rng:()=>.02});
 assert.equal(after.dossierCount,100);
 assert.equal(after.dossiers["rite-of-vile-transference"],1);
 assert.equal(after.drops["rite-of-vile-transference"],undefined);
 const repeated=simulate(plan(100,100),{rng:()=>.02});
 assert.equal(repeated.dossiers["rite-of-vile-transference"],1);
});

test("invalid solo/duo plans and RNG are rejected with a combined one-million cap",()=>{
 assert.deepEqual({...simulate(plan(0,0)).drops},{});
 assert.deepEqual(validatePlan(plan(5,7)),{solo:5,duo:7,total:12});
 assert.equal(validateKills(MAX_KILLS),MAX_KILLS);
 assert.equal(validateContribution(.5),.5);
 for(const bad of [
  plan(-1,0),plan(0,1.2),plan(MAX_KILLS,1),plan(0,MAX_KILLS+1),
  plan(NaN,0),plan(0,Infinity),null,{solo:1},{}
 ]){
  assert.throws(()=>validatePlan(bad));
  assert.throws(()=>simulate(bad));
  assert.throws(()=>calculateDry(bad));
 }
 assert.throws(()=>simulate(plan(1,0),{rng:()=>1}));
});

test("mixed drop counts use the solo and duo rates, not an averaged rate",()=>{
 const pS=itemRate("oathplate-helm",1),pD=itemRate("oathplate-helm",.5);
 const one=calculateDry(plan(1,1),{"oathplate-helm":1});
 close(one["oathplate-helm"].exact,pS*(1-pD)+pD*(1-pS));
 close(one["oathplate-helm"].expected,pS+pD);
 close(one.yami.expected,2/2500);
 close(one["oathplate-helm"].fewer,(1-pS)*(1-pD));
 const two=calculateDry(plan(1,1),{"oathplate-helm":2});
 close(two["oathplate-helm"].exact,pS*pD);
 const solo=calculateDry(plan(1,0),{"oathplate-helm":1});
 const duo=calculateDry(plan(0,1),{"oathplate-helm":1});
 close(solo["oathplate-helm"].exact,pS);
 close(duo["oathplate-helm"].exact,pD);
});

test("shards are summed as 12-item solo and 6-item duo batches",()=>{
 const pS=itemRate("oathplate-shards",1);
 const pD=itemRate("oathplate-shards",.5);
 const combinations=[
  [0,(1-pS)*(1-pD)],
  [6,(1-pS)*pD],
  [12,pS*(1-pD)],
  [18,pS*pD]
 ];
 for(const [observed,probability] of combinations){
  const result=calculateDry(plan(1,1),{"oathplate-shards":observed});
  close(result["oathplate-shards"].exact,probability);
  close(result["oathplate-shards"].expected,12*pS+6*pD);
 }
 assert.throws(()=>calculateDry(plan(1,0),{"oathplate-shards":6}));
 assert.throws(()=>calculateDry(plan(0,1),{"oathplate-shards":12}));
 assert.throws(()=>calculateDry(plan(1,1),{"oathplate-shards":13}));
 assert.throws(()=>calculateDry(plan(1,1),{"oathplate-shards":24}));
 const result=calculateDry(plan(1,1),{"oathplate-shards":18});
 assert.equal(result["oathplate-shards"].count,18);
});

test("combined Any equipment or Yami reflects mutually exclusive gear and independent pet rolls",()=>{
 const rS=rates(1),rD=rates(.5);
 const result=calculateDry(plan(1,1),{"oathplate-helm":1,"yami":1}).anyUnique;
 const expected=1-(1-rS.gear)*(1-rD.gear)*Math.pow(1-rS.pet,2);
 close(result.atLeastOne,expected);
 close(result.expected,rS.gear+rD.gear+2*rS.pet);
 close(anyRare(plan(1,0),2).exact,rS.gear*rS.pet);
 assert.throws(()=>anyRare(plan(1,0),3));
});

test("dry results are normalized and preserve expected counts up to a million kills",()=>{
 for(const {solo,duo} of [
  plan(0,0),plan(1,0),plan(0,1),plan(10,30),
  plan(200,150),plan(1000000,0),plan(0,1000000),plan(500000,500000)
 ]){
  const result=calculateDry(plan(solo,duo));
  for(const item of DRY_ITEMS){
   const row=result[item.id];
   close(row.fewer+row.exact+row.more,1,1e-7);
   const expected=item.id==="oathplate-shards"
    ?12*solo*itemRate(item.id,1)+6*duo*itemRate(item.id,.5)
    :solo*itemRate(item.id,1)+duo*itemRate(item.id,.5);
   close(row.expected,expected,1e-6);
  }
  close(result.anyUnique.fewer+result.anyUnique.exact+result.anyUnique.more,1,1e-7);
  close(result.anyUnique.expected,solo*(rates(1).gear+1/2500)+duo*(rates(.5).gear+1/2500),1e-6);
 }
});

test("Yama has two kill inputs, no contribution radio, and local assets",()=>{
 const home=read("index.html"),page=read("yama/index.html"),app=read("yama/app.mjs");
 assert.match(home,/href="\.\/yama\/"/);
 assert.match(page,/id="mode-loot"/);
 assert.match(page,/id="mode-dry"/);
 assert.match(page,/id="solo-kills"/);
 assert.match(page,/id="duo-kills"/);
 assert.doesNotMatch(page,/name="contribution"/);
 assert.match(app,/validatePlan/);
 assert.match(app,/calculateDry\(plan,readDry\(plan\)\)/);
 assert.match(page,/id="box-grid"/);
 assert.match(page,/id="dossier-grid"/);
 assert.doesNotMatch(app,/https:\/\/oldschool\.runescape\.wiki\/images/);
 for(const id of new Set(ALL_ITEMS.map(i=>i.id))){
  const image=readFileSync(new URL("../assets/items/"+id+".png",import.meta.url));
  assert.deepEqual([...image.subarray(0,8)],[137,80,78,71,13,10,26,10],
   id+" missing PNG");
 }
 assert.ok(BOSS_UNIQUES.length>4);
});
