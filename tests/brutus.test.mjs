import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,PREROLL,PET,UNIQUE,DRY_ITEMS,GUARANTEED,COMMON,
 MEMBERS_MAIN,F2P_MAIN,ITEMS,mainTable,rateOf,validateKills,validateWorld,simulate
} from "../bosses/brutus/simulator.mjs";
import {calculateDry,anyUnique} from "../bosses/brutus/dry-calc.mjs";
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<=eps,"Expected "+b+", got "+a);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const total=table=>table.reduce((sum,row)=>sum+row[4],0);

test("Brutus pre-roll, full tables, F2P substitutions and tertiary rates",()=>{
 assert.equal(PREROLL.length,3);
 assert.equal(DRY_ITEMS.length,4);
 assert.equal(UNIQUE.length,4);
 assert.equal(GUARANTEED.length,2);
 assert.equal(total(MEMBERS_MAIN),81);
 assert.equal(total(F2P_MAIN),81);
 assert.equal(mainTable("members"),MEMBERS_MAIN);
 assert.equal(mainTable("f2p"),F2P_MAIN);
 assert.equal(MEMBERS_MAIN.find(row=>row[0]==="coins"),undefined);
 assert.ok(!F2P_MAIN.some(row=>["potato-seed","acorn","raw-t-bone-steak"].includes(row[0])));
 close(rateOf("mooleta"),5/150);
 close(rateOf("mooleta","f2p"),5/150);
 close(rateOf("bottomless-milk-bucket-empty"),4/150);
 close(rateOf("cow-slippers"),1/150);
 close(rateOf("beef"),1/1000);
 for(const id of ["bottomless-milk-bucket-empty","cow-slippers","beef","clue-scroll-easy"])
  close(rateOf(id,"f2p"),0);
 close(rateOf("clue-scroll-beginner","f2p"),1/15);
});
test("Every kill guarantees raw t-bone steak and bull bones",()=>{
 const one=simulate(1,{rng:()=>0});
 assert.equal(one.drops["bull-bones"],1);
 assert.equal(one.drops["raw-t-bone-steak"],1);
 assert.equal(one.drops.mooleta,1);
 assert.equal(one.drops.beef,1);
 assert.equal(one.drops["clue-scroll-beginner"],1);
 assert.equal(one.drops["clue-scroll-easy"],1);
 assert.equal(one.drops["iron-full-helm"],undefined);
 const many=simulate(20,{rng:()=>0});
 assert.equal(many.drops["bull-bones"],20);
 assert.equal(many.drops["raw-t-bone-steak"],20);
 assert.equal(many.drops.mooleta,20);
});
test("The exclusive pre-roll preserves 5/150, 4/150 and 1/150 ticket boundaries",()=>{
 const rng=t=>{let call=0;return ()=>call++===0?t:0.999;};
 assert.equal(simulate(1,{rng:rng(0)}).drops.mooleta,1);
 assert.equal(simulate(1,{rng:rng(5/150)}).drops["bottomless-milk-bucket-empty"],1);
 assert.equal(simulate(1,{rng:rng(9/150)}).drops["cow-slippers"],1);
 const member=simulate(1,{rng:rng(10/150)});
 assert.equal(member.drops.mooleta,undefined);
 assert.equal(member.drops["bottomless-milk-bucket-empty"],undefined);
 assert.equal(member.drops["cow-slippers"],undefined);
 assert.ok(Object.hasOwn(member.drops,"raw-t-bone-steak"));
 const f2p=simulate(1,{world:"f2p",rng:rng(5/150)});
 assert.equal(f2p.drops.mooleta,undefined);
 assert.equal(f2p.drops["bottomless-milk-bucket-empty"],undefined);
 assert.equal(f2p.drops["cow-slippers"],undefined);
 assert.equal(f2p.drops.beef,undefined);
});
test("Members and F2P have exclusive normal item lists, coins quantities are inclusive",()=>{
 const members=simulate(1,{rng:()=>.999,world:"members"});
 assert.equal(members.drops["raw-t-bone-steak"],4); // guaranteed + 3 noted
 assert.equal(members.drops.coins,undefined);
 const f2p=simulate(1,{rng:()=>.999,world:"f2p"});
 assert.equal(f2p.drops["raw-t-bone-steak"],1);
 assert.equal(f2p.drops.coins,120);
 assert.equal(f2p.drops["potato-seed"],undefined);
 assert.equal(f2p.drops.acorn,undefined);
 const no=simulate(1,{rng:()=>.0255,world:"members",easyCAs:false});
 const ca=simulate(1,{rng:()=>.0255,world:"members",easyCAs:true});
 assert.equal(no.drops["clue-scroll-easy"],undefined);
 assert.equal(ca.drops["clue-scroll-easy"],1);
 const noEasy=simulate(1,{rng:()=>0,world:"f2p",easyCAs:true});
 assert.equal(noEasy.drops["clue-scroll-easy"],undefined);
});
test("Dry probabilities preserve exclusive pre-roll and independent pet roll",()=>{
 const counts={"mooleta":1,"bottomless-milk-bucket-empty":0,"cow-slippers":0,"beef":0};
 const one=calculateDry(1,counts);
 close(one.mooleta.exact,5/150);
 close(one["bottomless-milk-bucket-empty"].expected,4/150);
 close(one["cow-slippers"].expected,1/150);
 close(one.beef.more,1/1000);
 close(one.anyUnique.exact,(10/150)*(1-1/1000)+(1-10/150)/1000);
 close(one.anyUnique.atLeastOne,1-(1-10/150)*(1-1/1000));
 const both=calculateDry(1,{"mooleta":1,"beef":1});
 close(both.anyUnique.exact,(10/150)*(1/1000));
 assert.throws(()=>calculateDry(1,{"mooleta":1,"cow-slippers":1}));
 assert.throws(()=>calculateDry(1,{"mooleta":1,"bottomless-milk-bucket-empty":1}));
 assert.equal(anyUnique(0,0).atLeastOne,0);
});
test("F2P dry probabilities include only Mooleta; member-only items cannot be observed",()=>{
 const one=calculateDry(1,{mooleta:1},"f2p");
 assert.deepEqual(Object.keys(one),["mooleta","anyUnique"]);
 close(one.mooleta.exact,1/30);
 close(one.anyUnique.exact,1/30);
 close(one.anyUnique.expected,1/30);
 close(one.anyUnique.atLeastOne,1/30);
 for(const id of ["bottomless-milk-bucket-empty","cow-slippers","beef"])
  assert.throws(()=>calculateDry(1,{[id]:1},"f2p"));
 assert.throws(()=>anyUnique(1,2,"f2p"));
});
test("Distribution normalization, validation, and numerical stability",()=>{
 for(const n of [0,1,100,10000,MAX_KILLS]){
  for(const world of ["members","f2p"]){
   const r=calculateDry(n,{},world);
   for(const item of DRY_ITEMS.filter(i=>rateOf(i.id,world)>0)){
    const x=r[item.id];
    close(x.expected,n*rateOf(item.id,world),1e-6);
    close(x.fewer+x.exact+x.more,1,1e-7);
   }
   close(r.anyUnique.fewer+r.anyUnique.exact+r.anyUnique.more,1,1e-7);
  }
 }
 for(const n of [-1,1.1,MAX_KILLS+1,Infinity,NaN]){
  assert.throws(()=>validateKills(n));
  assert.throws(()=>simulate(n));
  assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>validateWorld("solo"));
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{world:"wrong"}));
 assert.throws(()=>calculateDry(1,{"mooleta":2}));
 assert.throws(()=>calculateDry(1,{"mooleta":-1}));
});
test("Brutus page and all local sprites exist",()=>{
 const home=read("index.html"),page=read("bosses/brutus/index.html"),app=read("bosses/brutus/app.mjs");
 assert.match(home,/href="bosses\/brutus\/"/);
 assert.match(home,/assets\/items\/beef\.png/);
 assert.match(page,/id="mode-loot"/);
 assert.match(page,/id="mode-dry"/);
 assert.match(page,/name="world" value="members"/);
 assert.match(page,/name="world" value="f2p"/);
 assert.match(page,/id="easy-cas"/);
 assert.match(page,/id="kill-count"/);
 assert.match(app,/calculateDry/);
 assert.match(app,/updateWorld/);
 assert.doesNotMatch(page+app,/Demonic Brutus/);
 for(const item of Object.values(ITEMS)){
  const bytes=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" must have local PNG");
 }
});
