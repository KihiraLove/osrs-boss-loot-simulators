import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAIN,ITEMS,UNIQUE,mainTickets,MAX_KILLS,ENCOUNTERS,parameters,rateOf,validatePlan,simulate} from "../bosses/zalcano/simulator.mjs";
import {calculateDry} from "../bosses/zalcano/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,a+" != "+b);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Zalcano retains the complete 36-ticket ordinary table and local rewards",()=>{
 assert.equal(mainTickets,36);assert.equal(MAIN.length,20);assert.equal(UNIQUE.length,4);
 for(const item of Object.values(ITEMS))assert.deepEqual([...readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url)).subarray(0,8)],[137,80,78,71,13,10,26,10]);
});

test("Trios uses one-third contribution and Mass uses minimum rare-eligible damage",()=>{
 const trio=parameters("trios"),mass=parameters("mass");close(trio.share,1/3);close(trio.points,1000/3);
 assert.equal(mass.hpDamage,26);assert.equal(mass.shieldDamage,5);assert.equal(mass.points,36);close(mass.shardRate,1/1500);close(mass.share,36/1000);
 for(const mode of ENCOUNTERS){const p=parameters(mode.id);close(p.seedRate+p.onyxRate,p.teamUnique);close(p.teamUnique,p.share/200);close(p.petRate,1/2250);}
});

test("MVP is automatic every third Trio kill and never advances from Mass kills",()=>{
 for(const [trios,mass,mvp] of [[0,3,0],[2,5,0],[3,0,1],[6,2,2]]){
  const result=simulate({trios,mass},{rng:()=>0});assert.equal(result.mvpKills,mvp);assert.equal(result.drops["infernal-ashes"]??0,mvp);assert.equal(result.drops["crystal-shard"],2*(trios+mass)+mvp);
 }
});

test("Mass uses minimum resource quantities and MVP boosts only the third Trio stack",()=>{
 assert.equal(simulate({mass:1},{rng:()=>0}).drops["blood-rune"],64);
 assert.equal(simulate({trios:1},{rng:()=>0}).drops["blood-rune"],192);
 assert.equal(simulate({trios:2},{rng:()=>0}).drops["blood-rune"],384);
 assert.equal(simulate({trios:3},{rng:()=>0}).drops["blood-rune"],596);
 assert.deepEqual({...simulate({}).drops},{});
});

test("team seed and onyx allocations share one mutually exclusive roll",()=>{
 const unallocated=[0,0,.99,.99,.99];const no=simulate({trios:1},{rng:()=>unallocated.shift()??.99});assert.equal(no.drops["crystal-tool-seed"],undefined);assert.equal(no.drops["uncut-onyx"],undefined);
 const seedRoll=[0,0,0,.5,.99,.99];const seed=simulate({mass:1},{rng:()=>seedRoll.shift()??.99});assert.equal(seed.drops["crystal-tool-seed"],1);assert.equal(seed.drops["uncut-onyx"],undefined);
 const onyx=simulate({mass:1},{rng:()=>0});assert.equal(onyx.drops["uncut-onyx"],1);assert.equal(onyx.drops["crystal-tool-seed"],undefined);
});

test("mixed dry odds keep distinct contribution-dependent rates",()=>{
 const a=parameters("trios"),b=parameters("mass"),result=calculateDry({trios:3,mass:5});
 close(result["crystal-tool-seed"].expected,3*a.seedRate+5*b.seedRate);close(result["zalcano-shard"].expected,3*a.shardRate+5*b.shardRate);close(result.smolcano.expected,8/2250);
 const none=p=>(1-p.teamUnique)*(1-p.shardRate)*(1-p.petRate);close(result.anyUnique.atLeastOne,1-none(a)**3*none(b)**5);
 const one=calculateDry({trios:1,mass:1},{"crystal-tool-seed":1});close(one["crystal-tool-seed"].exact,a.seedRate*(1-b.seedRate)+(1-a.seedRate)*b.seedRate);
 close(rateOf("smolcano","mass"),rateOf("smolcano","trios"));
});

test("Zalcano dry probabilities normalize from zero to a million combined kills",()=>{
 for(const counts of [{},{trios:1},{mass:100},{trios:500000,mass:500000}])for(const row of Object.values(calculateDry(counts)).filter(row=>row&&typeof row==="object"&&"exact" in row))close(row.fewer+row.exact+row.more,1,1e-7);
});

test("invalid Zalcano plans and impossible mutually exclusive counts are rejected",()=>{
 for(const counts of [null,[],{other:1},{trios:-1},{mass:.5},{trios:MAX_KILLS,mass:1}]){assert.throws(()=>validatePlan(counts));assert.throws(()=>simulate(counts));assert.throws(()=>calculateDry(counts));}
 assert.throws(()=>simulate({trios:1},{rng:()=>1}));assert.throws(()=>simulate({mass:1},{rng:null}));assert.throws(()=>parameters("other"));
 assert.throws(()=>calculateDry({},null));assert.throws(()=>calculateDry({mass:1},{"smolcano":2}));assert.throws(()=>calculateDry({trios:1},{"crystal-tool-seed":1,"uncut-onyx":1}));
});

test("Zalcano exposes only Trios and Mass plan inputs",()=>{
 const html=read("bosses/zalcano/index.html");for(const group of ENCOUNTERS)assert.ok(html.includes('id="'+group.id+'"'));
 assert.doesNotMatch(html,/id="(?:kill-count|team-size|relative-contribution|shield-damage|hp-damage|mvp|xp-focus)"/);
 assert.match(read("bosses/zalcano/app.mjs"),/setupEncounterCalculator/);
});
