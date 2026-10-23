import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAIN,ITEMS,UNIQUE,mainTickets,MAX_KILLS,parameters,rateOf,
 resolveOptions,validateKills,simulate} from "../bosses/zalcano/simulator.mjs";
import {calculateDry} from "../bosses/zalcano/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("Zalcano main loot table has exactly 36 weighted tickets and 20 possible outcomes",()=>{
 assert.equal(mainTickets,36);assert.equal(MAIN.length,20);assert.equal(UNIQUE.length,4);
 assert.equal(MAIN.find(x=>x[0]==="silver-ore")[4],3);
 assert.equal(MAIN.find(x=>x[0]==="pure-essence")[4],1);
 assert.equal(MAIN.find(x=>x[0]==="runite-bar")[4],2);
});
test("Eligibility depends on both shield damage and total damage",()=>{
 const noShield=parameters({shieldDamage:4,hpDamage:1000});
 assert.equal(noShield.eligible,false);assert.equal(noShield.rareEligible,false);
 const noRare=parameters({shieldDamage:5,hpDamage:25});
 assert.equal(noRare.eligible,true);assert.equal(noRare.rareEligible,false);
 const minRare=parameters({shieldDamage:5,hpDamage:26});
 assert.equal(minRare.rareEligible,true);
 close(minRare.shardRate,1/1500);
 close(parameters({shieldDamage:300,hpDamage:400}).shardRate,1/750);
 close(parameters({shieldDamage:900,hpDamage:2000}).cappedPoints,1000);
});
test("The tool/onyx allocation shares one weighted 1/200 team roll",()=>{
 const solo=parameters({teamSize:1});
 const four=parameters({teamSize:4});
 close(solo.share,1);close(four.share,1/4);
 close(solo.seedRate,39/8000);close(solo.onyxRate,1/8000);
 close(four.seedRate,39/32000);close(four.onyxRate,1/32000);
 close(four.teamUnique,four.seedRate+four.onyxRate);
 close(parameters({teamSize:4,relativeContribution:200}).share,2/5);
 close(rateOf("smolcano",{teamSize:100}),1/2250);
 assert.equal(rateOf("smolcano",{shieldDamage:0}),0);
});
test("One kill receives the correct 2 guaranteed shards and ordinary resource loot",()=>{
 const r=simulate(1,{rng:()=>0});
 assert.equal(r.drops["crystal-shard"],2);
 assert.equal(r.drops["blood-rune"],64);
 assert.equal(r.drops["uncut-onyx"],1);
 assert.equal(r.drops["smolcano"],1);
 assert.equal(r.drops["zalcano-shard"],1);
 assert.equal(r.drops["crystal-tool-seed"],undefined);
 assert.deepEqual({...simulate(0).drops},{});
});
test("An unallocated group rare does not automatically belong to the player",()=>{
 let i=0;
 const r=simulate(1,{rng:()=>[0.9,0,0,0.99,0.99,0.99][i++]??0.99,teamSize:4});
 assert.equal(r.drops["crystal-tool-seed"],undefined);
 assert.equal(r.drops["uncut-onyx"],undefined);
});
test("Resource-focused, XP-focused and MVP rewards behave independently",()=>{
 const xp=simulate(1,{rng:()=>0,xpFocus:true});
 assert.equal(xp.drops["crystal-shard"],2);
 assert.equal(xp.drops["blood-rune"],undefined);
 assert.equal(xp.drops["uncut-onyx"],1);
 const mvp=simulate(1,{rng:()=>0,mvp:true});
 assert.equal(mvp.drops["crystal-shard"],3);
 assert.equal(mvp.drops["infernal-ashes"],1);
 assert.equal(mvp.drops["blood-rune"],71);
 assert.equal(simulate(1,{rng:()=>0}).drops["infernal-ashes"],undefined);
 const low=simulate(1,{rng:()=>0,hpDamage:25,shieldDamage:5});
 assert.equal(low.drops["crystal-shard"],1);
 assert.equal(low.drops["smolcano"],undefined);
 const none=simulate(1,{rng:()=>0,hpDamage:1000,shieldDamage:4});
 assert.deepEqual({...none.drops},{});
});
test("Dry calculator keeps seed and onyx mutually exclusive in combined rolls",()=>{
 const p=parameters(),r=calculateDry(1,{"crystal-tool-seed":1});
 close(r["crystal-tool-seed"].expected,p.seedRate);
 close(r["uncut-onyx"].expected,p.onyxRate);
 close(r["zalcano-shard"].expected,p.shardRate);
 close(r.smolcano.atLeastOne,1/2250);
 close(r.anyUnique.expected,p.teamUnique+p.shardRate+p.petRate);
 close(r.anyUnique.atLeastOne,1-(1-p.teamUnique)*(1-p.shardRate)*(1-p.petRate));
 const x=calculateDry(1,{"crystal-tool-seed":1,"uncut-onyx":1});
 assert.equal(x.anyUnique.count,2);
});
test("All probability distributions normalize from zero to one million kills",()=>{
 for(const kills of [0,1,100,10000,MAX_KILLS]){
  const r=calculateDry(kills);
  for(const item of [...UNIQUE.map(x=>x.id),"anyUnique"]){
   const x=r[item];
   close(x.fewer+x.exact+x.more,1,1e-7);
   assert.ok(x.atLeastOne>=0&&x.atLeastOne<=1);
  }
 }
});
test("Invalid settings and drop-count inputs are rejected",()=>{
 for(const kills of [-1,1.1,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(kills));
  assert.throws(()=>simulate(kills));
  assert.throws(()=>calculateDry(kills));
 }
 for(const [key,value] of [["teamSize",0],["teamSize",101],
  ["shieldDamage",-1],["hpDamage",1.1],["relativeContribution",0],
  ["relativeContribution",401],["mvp","yes"],["xpFocus",1]]){
  assert.throws(()=>resolveOptions({[key]:value}),key);
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{rng:null}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,[]));
 assert.throws(()=>calculateDry(1,{"smolcano":2}));
 assert.throws(()=>calculateDry(1,{"smolcano":1,"crystal-tool-seed":1,
  "uncut-onyx":1,"zalcano-shard":1}));
});
test("Published site, interactive fields, documentation and every item sprite exist",()=>{
 const home=read("index.html"),html=read("bosses/zalcano/index.html");
 const app=read("bosses/zalcano/app.mjs"),readme=read("bosses/zalcano/README.md");
 assert.match(home,/href="bosses\/zalcano\/"/);
 assert.match(read("README.md"),/zalcano\/README\.md/);
 assert.match(readme,/contribution/);
 for(const id of ["team-size","relative-contribution","shield-damage","hp-damage",
  "mvp","xp-focus","mode-loot","mode-dry","dry-inputs","summary-hint"]){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(app,/result\.drops/);
 for(const item of Object.values(ITEMS)){
  const data=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id);
 }
});
