import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {KINGS,MAIN,UNIQUE,ITEMS,MAX_KILLS,MAIN_RATE,ANY_MAIN_UNIQUE_RATE,PET_RATE,clueRates,simulate} from "../bosses/dagannoth-kings/simulator.mjs";
import {calculateDry} from "../bosses/dagannoth-kings/dry-calc.mjs";
const kc=(rex=0,prime=0,supreme=0)=>({rex,prime,supreme});
const close=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<=e,"Expected "+b+" got "+a);
test("Three 128-ticket tables and separate 1/128 uniques",()=>{
 assert.deepEqual(KINGS.map(k=>k.id),["rex","prime","supreme"]);
 for(const k of KINGS){
  assert.equal(MAIN[k.id].reduce((n,r)=>n+r.weight,0),128);
  for(const item of UNIQUE[k.id].slice(0,3))
   assert.equal(MAIN[k.id].find(row=>row.id===item.id)?.weight,1);
  for(const item of UNIQUE[k.id])close(item.rate,item.id.startsWith("pet-")?1/5000:1/128);
 }
 close(MAIN_RATE,1/128);close(ANY_MAIN_UNIQUE_RATE,3/128);close(PET_RATE,1/5000);
});
test("Loot does not combine Rex Prime and Supreme",()=>{
 const a=simulate(kc(2,0,1),{rng:()=>0});
 assert.equal(a.kings.rex.kills,2);
 assert.equal(a.kings.rex.drops["dagannoth-bones"],2);
 assert.equal(a.kings.prime.drops["dagannoth-bones"],undefined);
 assert.equal(a.kings.supreme.drops["dagannoth-bones"],1);
 assert.equal(a.kings.rex.drops["pet-dagannoth-rex"],2);
 assert.equal(a.kings.supreme.drops["pet-dagannoth-supreme"],1);
 assert.equal(a.kings.rex.drops["pet-dagannoth-supreme"],undefined);
});
test("Task and quest drops respect toggles, clue boosts are correct",()=>{
 assert.deepEqual(clueRates(),{hard:1/42,elite:1/750});
 assert.deepEqual(clueRates({hardCAs:true,eliteCAs:true}),{hard:1/39,elite:1/712});
 const a=simulate(kc(1),{rng:()=>0,konarTask:true,questRibs:true}).kings.rex.drops;
 for(const id of ["brimstone-key","dagannoth-ribs","clue-scroll-hard","clue-scroll-elite","ensouled-dagannoth-head"])
  assert.equal(a[id],1);
 const normal=simulate(kc(1),{rng:()=>0}).kings.rex.drops;
 assert.equal(normal["brimstone-key"],undefined);
 assert.equal(normal["dagannoth-ribs"],undefined);
});
test("Any-unique dry odds convolve exclusive main uniques with independent pet",()=>{
 const p=3/128,q=1/5000;
 const r=calculateDry(kc(1),{rex:{"berserker-ring":1}}).rex;
 close(r["berserker-ring"].exact,1/128);
 close(r.anyUnique.expected,p+q);
 close(r.anyUnique.fewer,(1-p)*(1-q));
 close(r.anyUnique.exact,p*(1-q)+(1-p)*q);
 close(r.anyUnique.more,p*q);
 assert.throws(()=>calculateDry(kc(1),{rex:{"berserker-ring":1,"warrior-ring":1}}));
 assert.throws(()=>calculateDry(kc(),{prime:{"pet-dagannoth-prime":1}}));
});
test("Zero and large KC, invalid counts and RNG",()=>{
 for(const n of [0,1,100,MAX_KILLS]){
  const r=calculateDry(kc(n)).rex;
  for(const item of [...UNIQUE.rex.map(x=>r[x.id]),r.anyUnique])
   close(item.fewer+item.exact+item.more,1,1e-7);
 }
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>simulate(kc(n)));assert.throws(()=>calculateDry(kc(n)));
 }
 assert.throws(()=>simulate(kc(1),{rng:()=>1}));
 assert.throws(()=>simulate(kc(1),{konarTask:"yes"}));
 assert.deepEqual({...simulate(kc()).kings.rex.drops},{});
});
test("Home link, three inputs, separate output sections and dry mode",()=>{
 const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
 const home=read("index.html"),page=read("dagannoth-kings/index.html");
 const app=read("dagannoth-kings/app.mjs");
 assert.match(home,/href="\.\/dagannoth-kings\/"/);
 for(const king of KINGS)assert.match(page,new RegExp('id="kills-'+king.id+'"'));
 for(const id of ["mode-loot","mode-dry","hard-cas","elite-cas","konar-task","quest-ribs"])
  assert.ok(page.includes('id="'+id+'"'));
 assert.match(app,/renderLoot/);assert.match(app,/renderDry/);
 assert.ok(Object.keys(ITEMS).length>70);
});
