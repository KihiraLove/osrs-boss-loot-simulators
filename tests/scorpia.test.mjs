import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,SHARD_CHANCE,ANY_SHARD_CHANCE,PET_CHANCE,DRAGON_2H_CHANCE,
 UNIQUE,DRY_ITEMS,MAIN,ITEMS,validateKills,validateTask,clueRate,rateOf,simulate
} from "../bosses/scorpia/simulator.mjs";
import {calculateDry,collectionLogOdds,COLLECTION_LOG_PER_KILL} from "../bosses/scorpia/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Scorpia has exclusive shard pre-roll and an exact 128-ticket ordinary table",()=>{
 close(SHARD_CHANCE,1/256);close(ANY_SHARD_CHANCE,1/128);
 close(PET_CHANCE,127/128/2000);close(DRAGON_2H_CHANCE,127/128/128);
 assert.deepEqual(UNIQUE.map(x=>x.id),[
  "odium-shard-3","malediction-shard-3","dragon-2h-sword","scorpias-offspring"
 ]);
 assert.equal(DRY_ITEMS,UNIQUE);
 assert.equal(MAIN.length,29);
 assert.equal(MAIN.reduce((sum,row)=>sum+row[4],0),128);
 assert.deepEqual(MAIN.find(x=>x[0]==="battlestaff"),["battlestaff","Battlestaff",5,8,6]);
 assert.deepEqual(MAIN.find(x=>x[0]==="dragon-2h-sword"),["dragon-2h-sword","Dragon 2h sword",1,1,1]);
 assert.deepEqual(MAIN.find(x=>x[0]==="coins"),["coins","Coins",25002,34962,7]);
 for(const item of UNIQUE)close(rateOf(item.id),item.rate);
 assert.equal(rateOf("battlestaff"),0);
});
test("Shard pre-roll replaces normal loot and prevents pet roll",()=>{
 const shard=simulate(1,{rng:()=>0});
 assert.equal(shard.drops["odium-shard-3"],1);
 assert.equal(shard.drops["malediction-shard-3"],undefined);
 assert.equal(shard.drops["scorpias-offspring"],undefined);
 assert.equal(shard.drops.battlestaff,undefined);
 assert.equal(shard.drops["looting-bag"],1);
 assert.equal(shard.drops["ensouled-scorpion-head"],1);
 assert.equal(shard.drops["clue-scroll-hard"],1);
 let calls=0;
 const second=simulate(1,{rng:()=>[1/256+0.001,0.99,0.99,0.99][calls++]??0.99});
 assert.equal(second.drops["malediction-shard-3"],1);
 assert.equal(second.drops["odium-shard-3"],undefined);
});
test("Ordinary Dragon 2h sword and offspring can occur together",()=>{
 let previous=0,position;
 for(const row of MAIN){
  if(row[0]==="dragon-2h-sword"){position=(previous+row[4]/2)/128;break;}
  previous+=row[4];
 }
 assert.ok(position!==undefined);
 let index=0;
 const seq=[0.99,position,0,0.99,0.99,0.99];
 const out=simulate(1,{rng:()=>seq[index++]??0.99});
 assert.equal(out.drops["dragon-2h-sword"],1);
 assert.equal(out.drops["scorpias-offspring"],1);
 assert.equal(out.drops["odium-shard-3"],undefined);
 assert.equal(out.drops["malediction-shard-3"],undefined);
});
test("Stack quantities and standard drops follow main table",()=>{
 let previous=0,pos;
 for(const row of MAIN){
  if(row[0]==="battlestaff"){pos=(previous+row[4]/2)/128;break;}
  previous+=row[4];
 }
 let calls=0;
 const seq=[.99,pos,.99,.99,.99,.99,.99];
 const out=simulate(1,{rng:()=>seq[calls++]??.99});
 assert.equal(out.drops.battlestaff,8);
});
test("Slayer task and hard clue options",()=>{
 close(clueRate(),1/100);
 close(clueRate({hardCAs:true}),1/95);
 close(clueRate({ringOfWealth:true}),1/50);
 close(clueRate({hardCAs:true,ringOfWealth:true}),1/47);
 const konar=simulate(1,{rng:()=>0,task:"konar"});
 assert.equal(konar.drops["brimstone-key"],1);
 assert.equal(konar.drops["larrans-key"],undefined);
 const krystilia=simulate(1,{rng:()=>0,task:"krystilia"});
 assert.equal(krystilia.drops["larrans-key"],1);
 assert.equal(krystilia.drops["slayers-enchantment"],1);
 assert.equal(krystilia.drops["brimstone-key"],undefined);
 assert.throws(()=>validateTask("both"));
 assert.throws(()=>clueRate({hardCAs:1}));
 assert.throws(()=>clueRate({ringOfWealth:"yes"}));
});
test("Dry calculator respects shard exclusivity and combined rare-count double drops",()=>{
 const p=COLLECTION_LOG_PER_KILL;
 close(p.p0+p.p1+p.p2,1);
 close(p.p2,(127/128)*(1/128)*(1/2000));
 const x=calculateDry(1,{"odium-shard-3":1});
 close(x["odium-shard-3"].exact,1/256);
 close(x["malediction-shard-3"].atLeastOne,1/256);
 close(x.anyShard.exact,1/128);
 close(x.anyUnique.fewer,p.p0);
 close(x.anyUnique.exact,p.p1);
 close(x.anyUnique.more,p.p2);
 close(x.anyUnique.atLeastOne,1-p.p0);
 const both=calculateDry(1,{"dragon-2h-sword":1,"scorpias-offspring":1});
 close(both.anyUnique.exact,p.p2);
 close(collectionLogOdds(1,0).exact,p.p0);
 close(collectionLogOdds(1,2).exact,p.p2);
 assert.throws(()=>calculateDry(1,{"odium-shard-3":1,"malediction-shard-3":1}));
 assert.throws(()=>calculateDry(1,{"odium-shard-3":1,"scorpias-offspring":1}));
 assert.throws(()=>calculateDry(1,{"odium-shard-3":1,"dragon-2h-sword":1}));
});
test("Probabilities normalize for small and very large kill counts",()=>{
 for(const kc of [0,1,2,10,100,1000,10000,MAX_KILLS]){
  const r=calculateDry(kc);
  for(const x of [...UNIQUE.map(i=>r[i.id]),r.anyShard,r.anyUnique]){
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
 assert.throws(()=>calculateDry(1,{"scorpias-offspring":2}));
 assert.throws(()=>calculateDry(1,{"odium-shard-3":-1}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
});
test("Kill limits and invalid RNG values are rejected",()=>{
 assert.deepEqual({...simulate(0).drops},{});
 for(const kc of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(kc));assert.throws(()=>simulate(kc));
  assert.throws(()=>calculateDry(kc));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:()=>NaN}));
 assert.throws(()=>simulate(1,{rng:null}));
});
test("README, home navigation, inputs and local sprite signatures",()=>{
 const home=read("index.html"),page=read("scorpia/index.html");
 const app=read("scorpia/app.mjs"),docs=read("scorpia/README.md");
 assert.match(home,/href="\.\/scorpia\/"/);
 assert.match(docs,/1\/256/);
 assert.match(app,/result\.anyShard/);
 for(const id of ["kill-count","hard-cas","ring-of-wealth","task-fieldset",
  "mode-loot","mode-dry","dry-inputs","unique-grid","loot-grid"])
  assert.ok(page.includes('id="'+id+'"'),"Missing "+id);
 for(const item of Object.values(ITEMS)){
  const file=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...file.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" PNG");
 }
});
