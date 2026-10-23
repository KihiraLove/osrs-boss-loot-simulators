import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,UNIQUE,DRY_ITEMS,GUARANTEED,TERTIARY,MVP_COMMON,
 NON_MVP_COMMON,ITEMS,validateKills,validateMode,rateOf,simulate
} from "../bosses/scurrius/simulator.mjs";
import {calculateDry} from "../bosses/scurrius/dry-calc.mjs";
const approx=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t,"Expected "+b+", got "+a);
const total=table=>table.reduce((sum,row)=>sum+row[3],0);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Only Scurrius' spine and Scurry are collection-log rewards",()=>{
 assert.deepEqual(UNIQUE.map(item=>item.id),["scurrius-spine","scurry"]);
 assert.deepEqual(DRY_ITEMS,UNIQUE);
 assert.equal(rateOf("scurrius-spine"),1/33);
 assert.equal(rateOf("scurry"),1/3000);
 assert.equal(rateOf("scurrius-spine","nonMvp"),1/33);
 assert.equal(rateOf("scurry","nonMvp"),0);
 assert.equal(rateOf("clue-scroll-medium"),1/25);
 assert.equal(rateOf("clue-scroll-medium","mvp",true),1/23);
 assert.equal(rateOf("clue-scroll-medium","nonMvp"),0);
});
test("MVP main table is 100 tickets, non-MVP is 33 tickets including empty reward",()=>{
 assert.equal(total(MVP_COMMON),100);
 assert.equal(total(NON_MVP_COMMON),33);
 assert.equal(MVP_COMMON.filter(x=>x[3]===6).length,14);
 assert.ok(NON_MVP_COMMON.some(x=>x[0]==="@nothing"&&x[3]===1));
 assert.equal(GUARANTEED.mvp.length,2);
 assert.equal(GUARANTEED.nonMvp.length,1);
 assert.equal(TERTIARY.mvp.length,5);
 assert.equal(TERTIARY.nonMvp.length,1);
});
test("MVP always receives bones and raw rat meat; non-MVP only bones",()=>{
 const m=simulate(2,{rng:()=>0});
 assert.equal(m.drops["big-bones"],2);
 assert.equal(m.drops["raw-rat-meat"],2);
 assert.equal(m.drops["adamant-platebody"],2);
 assert.equal(m.drops["scurrius-spine"],2);
 assert.equal(m.drops["scurry"],2);
 assert.equal(m.drops["clue-scroll-medium"],2);
 assert.equal(m.drops["long-bone"],2);
 assert.equal(m.drops["curved-bone"],2);
 const n=simulate(2,{mode:"nonMvp",rng:()=>0});
 assert.equal(n.drops["big-bones"],2);
 assert.equal(n.drops["raw-rat-meat"],undefined);
 assert.equal(n.drops["adamant-arrow"],40);
 assert.equal(n.drops["scurrius-spine"],2);
 assert.equal(n.drops["scurry"],undefined);
 assert.equal(n.drops["clue-scroll-medium"],undefined);
 assert.equal(n.drops["long-bone"],undefined);
});
test("Ordinary main rolls respect item quantities and empty non-MVP ticket",()=>{
 const m=simulate(1,{rng:()=>.99999});
 assert.equal(m.drops["big-bones"],1);
 assert.equal(m.drops["raw-rat-meat"],1);
 assert.ok(m.drops.coins>=1000&&m.drops.coins<=9000);
 assert.equal(m.drops["scurry"],undefined);
 const n=simulate(1,{mode:"nonMvp",rng:()=>.99999});
 assert.deepEqual({...n.drops},{"big-bones":1});
});
test("Medium Combat Achievements alter medium clue only",()=>{
 const a=simulate(1,{rng:()=>0,mediumCAs:true});
 const b=simulate(1,{rng:()=>0,mediumCAs:false});
 assert.equal(a.mediumCAs,true);
 assert.equal(a.drops["clue-scroll-medium"],1);
 assert.equal(b.drops["clue-scroll-medium"],1);
 assert.equal(rateOf("scurry","mvp",true),rateOf("scurry","mvp",false));
});
test("Spine dry odds apply to both modes; non-MVP never rolls pet",()=>{
 const m=calculateDry(1,{"scurrius-spine":1,"scurry":1});
 approx(m["scurrius-spine"].exact,1/33);
 approx(m.scurry.exact,1/3000);
 approx(m.anyUnique.expected,1/33+1/3000);
 approx(m.anyUnique.exact,1/33/3000);
 approx(m.anyUnique.more,0);
 const one=calculateDry(1,{"scurrius-spine":1});
 approx(one.anyUnique.exact,(1/33)*(1-1/3000)+(1-1/33)*(1/3000));
 approx(one.anyUnique.more,1/33/3000);
 approx(m.anyUnique.atLeastOne,1-(1-1/33)*(1-1/3000));
 const n=calculateDry(1,{"scurrius-spine":1},"nonMvp");
 assert.equal(n.scurry,undefined);
 approx(n.anyUnique.exact,1/33);
 approx(n.anyUnique.more,0);
 assert.throws(()=>calculateDry(1,{"scurry":1},"nonMvp"));
});
test("Zero and high KC dry results are properly normalized",()=>{
 for(const mode of ["mvp","nonMvp"]){
  for(const kills of [0,1,100,10000,MAX_KILLS]){
   const d=calculateDry(kills,{},mode);
   for(const item of [...Object.values(d).filter(x=>x&&x.expected!==undefined)]){
    approx(item.fewer+item.exact+item.more,1,1e-7);
    assert.ok(item.atLeastOne>=0&&item.atLeastOne<=1);
   }
  }
 }
});
test("Invalid kills, mode, RNG and claimed rare counts are rejected",()=>{
 for(const n of [-1,.3,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateMode("other"));
 assert.throws(()=>simulate(1,{mode:"other"}));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{mediumCAs:1}));
 assert.throws(()=>calculateDry(1,{"scurrius-spine":-1}));
 assert.throws(()=>calculateDry(1,{"scurrius-spine":2}));
 assert.throws(()=>calculateDry(1,null));
 assert.equal(simulate(0).kills,0);
 assert.deepEqual({...simulate(0).drops},{});
});
test("Scurrius HTML, MVP selector and local item images are complete",()=>{
 const html=read("bosses/scurrius/index.html"),app=read("bosses/scurrius/app.mjs"),home=read("index.html");
 assert.match(home,/href="bosses\/scurrius\/"/);
 assert.match(home,/assets\/items\/scurry\.png/);
 assert.match(html,/id="kill-count"/);
 assert.match(html,/name="encounter-mode"/);
 assert.match(html,/value="mvp"/);
 assert.match(html,/value="nonMvp"/);
 assert.match(html,/id="medium-cas"/);
 assert.match(html,/id="mode-loot"/);
 assert.match(html,/id="mode-dry"/);
 assert.match(html,/id="unique-grid"/);
 assert.match(html,/id="dry-inputs"/);
 assert.match(app,/simulate\(kills,\{mode:encounterMode\(\),mediumCAs:/);
 assert.match(app,/calculateDry\(kills,readReceived\(kills\),encounterMode\(\)\)/);
 assert.doesNotMatch(html,/name="world"/);
 for(const item of Object.values(ITEMS)){
  const icon=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" must have local PNG");
 }
});
