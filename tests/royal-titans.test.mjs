import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MAX_KILLS,ENCOUNTERS,BRANDA,ELDRIC,PRIMARY,ITEMS,scaledQuantity,rateOf,primaryRate,validateOptions,simulate} from "../bosses/royal-titans/simulator.mjs";
import {calculateDry} from "../bosses/royal-titans/dry-calc.mjs";
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<=eps,a+" != "+b);
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Royal Titans keeps published tables and the four encounter shares",()=>{
 assert.deepEqual(ENCOUNTERS.map(group=>group.share),[1,1,.5,.5]);assert.equal(BRANDA.reduce((sum,row)=>sum+row[4],0),55);assert.equal(ELDRIC.reduce((sum,row)=>sum+row[4],0),56);assert.equal(PRIMARY.length,5);
 close(rateOf("fire-element-staff-crown","solo","branda"),1/75);close(rateOf("ice-element-staff-crown","duo","eldric"),1/150);
 close(rateOf("ice-element-staff-crown","solo","branda"),0);close(primaryRate("solo","branda"),2/75+1/16);
});

test("four encounter counts combine only their corresponding Titan loot",()=>{
 const counts=Object.fromEntries(ENCOUNTERS.map(group=>[group.id,1]));const result=simulate(counts,{rng:()=>0});
 assert.equal(result.kills,4);assert.equal(result.drops["fire-element-staff-crown"],2);assert.equal(result.drops["ice-element-staff-crown"],2);assert.equal(result.drops.bran,4);
 const eldric=simulate({duoEldric:1},{rng:()=>0});assert.equal(eldric.drops["fire-element-staff-crown"],undefined);
});

test("ordinary rewards retain two rolls and duo quantity scaling",()=>{
 for(const [id,key,quantity] of [["soloBranda","mystic-fire-staff",8],["duoBranda","mystic-fire-staff",4],["soloEldric","mystic-water-staff",8],["duoEldric","mystic-water-staff",4]]){
  const rolls=[.99,0,0,.99,.99,.99];assert.equal(simulate({[id]:1},{rng:()=>rolls.shift()??.99}).drops[key],quantity);
 }
 assert.equal(scaledQuantity(3,.5),2);assert.throws(()=>scaledQuantity(1,.33));
});

test("reward choices preserve pages, sacrifice pet rates and clues",()=>{
 const pages=simulate({soloBranda:1,duoEldric:1},{action:"pages",rng:()=>0});assert.equal(pages.drops["desiccated-page"],15);assert.equal(pages.drops.bran,2);assert.equal(pages.drops["fire-element-staff-crown"],undefined);
 const sacrifice=simulate({soloBranda:1,duoEldric:1},{action:"sacrifice",rng:()=>0});assert.deepEqual(Object.keys(sacrifice.drops).sort(),["bran","clue-scroll-hard","clue-scroll-elite"].sort());
 close(rateOf("bran","solo","branda",{action:"sacrifice"}),1/1500);close(rateOf("clue-scroll-hard","duo","eldric",{hardCAs:true}),1/23);close(rateOf("clue-scroll-elite","solo","branda",{eliteCAs:true}),1/95);
});

test("both prayer scrolls remain repeatable without ownership settings",()=>{
 close(rateOf("mystic-vigour-prayer-scroll","solo","branda"),1/75);close(rateOf("deadeye-prayer-scroll","duo","eldric"),1/150);
 assert.deepEqual(Object.keys(validateOptions()).sort(),["action","eliteCAs","hardCAs"]);
});

test("dry odds combine all four counts without averaging rates or mixing Titans",()=>{
 const result=calculateDry({soloBranda:2,soloEldric:3,duoBranda:5,duoEldric:7});
 close(result["fire-element-staff-crown"].expected,2/75+5/150);close(result["ice-element-staff-crown"].expected,3/75+7/150);close(result["giantsoul-amulet"].expected,5/16+12/32);close(result.bran.expected,17/3000);
 const p=1/75,q=1/150,one=calculateDry({soloBranda:1,duoBranda:1},{"fire-element-staff-crown":1});close(one["fire-element-staff-crown"].exact,p*(1-q)+(1-p)*q);
 close(calculateDry({soloBranda:1,duoEldric:1},{},{action:"sacrifice"}).bran.expected,2/1500);
});

test("dry probabilities normalize for zero and a million combined kills",()=>{
 for(const counts of [{},{soloBranda:250000,soloEldric:250000,duoBranda:250000,duoEldric:250000}])for(const row of Object.values(calculateDry(counts)).filter(row=>row&&typeof row==="object"&&"exact" in row))close(row.fewer+row.exact+row.more,1,1e-7);
});

test("Royal Titans rejects invalid plans, reward choices and unavailable drops",()=>{
 for(const counts of [null,[],{unknown:1},{soloBranda:-1},{duoEldric:.5},{soloBranda:MAX_KILLS,soloEldric:1}]){assert.throws(()=>simulate(counts));assert.throws(()=>calculateDry(counts));}
 assert.throws(()=>simulate({soloBranda:1},{rng:()=>1}));assert.throws(()=>validateOptions({action:"other"}));
 assert.throws(()=>calculateDry({soloBranda:1},{"ice-element-staff-crown":1}));assert.throws(()=>calculateDry({soloBranda:1},{"fire-element-staff-crown":1},{action:"pages"}));
 assert.throws(()=>calculateDry({soloBranda:1,soloEldric:1},{"fire-element-staff-crown":1,"mystic-vigour-prayer-scroll":1}));assert.throws(()=>calculateDry({},null));
});

test("Royal Titans has four kill inputs and reward radios with no ownership or target modes",()=>{
 const html=read("bosses/royal-titans/index.html");for(const group of ENCOUNTERS)assert.ok(html.includes('id="'+group.id+'"'));
 assert.equal((html.match(/name="reward-action" type="radio"/g)??[]).length,3);
 assert.doesNotMatch(html,/solo-titan|duo-titan|read-mystic|read-deadeye|<select/i);
 for(const item of Object.values(ITEMS))assert.deepEqual([...readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url)).subarray(0,8)],[137,80,78,71,13,10,26,10]);
});
