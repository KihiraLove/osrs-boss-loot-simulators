import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MAX_KILLS,SIGIL_CHANCE,ARCANE_CHANCE,SPECTRAL_CHANCE,ELYSIAN_CHANCE,
 SPIRIT_CHANCE,ELIXIR_CHANCE,JAR_CHANCE,PET_CHANCE,
 MAIN,GEM,MEGA,UNIQUE,ITEMS,rateOf,validateKills,clueRate,simulate
} from "../bosses/corporeal-beast/simulator.mjs";
import {calculateDry} from "../bosses/corporeal-beast/dry-calc.mjs";
const close=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<=e,"Expected "+b+" but got "+a);
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const spot=(rows,id)=>{let before=0;const all=rows.reduce((s,r)=>s+r[3],0);
 for(const row of rows){if(row[0]===id)return (before+row[3]/2)/all;before+=row[3];}
 throw Error("No row "+id);
};
test("Corp has exactly seven collection-log rewards and correct odds",()=>{
 assert.deepEqual(UNIQUE.map(x=>x.id),["pet-dark-core","elysian-sigil","spectral-sigil",
 "arcane-sigil","spirit-shield","holy-elixir","jar-of-spirits"]);
 close(SIGIL_CHANCE,1/585);close(ELYSIAN_CHANCE,1/4095);
 close(ARCANE_CHANCE,1/1365);close(SPECTRAL_CHANCE,1/1365);
 close(SPIRIT_CHANCE,8/512);close(ELIXIR_CHANCE,3/512);
 close(JAR_CHANCE,1/1000);close(PET_CHANCE,1/5000);
 for(const x of UNIQUE)close(rateOf(x.id),x.rate);
});
test("512 main tickets and 128-tick gem and mega tables",()=>{
 assert.equal(MAIN.reduce((s,r)=>s+r[3],0),512);
 assert.equal(GEM.reduce((s,r)=>s+r[3],0),128);
 assert.equal(MEGA.reduce((s,r)=>s+r[3],0),128);
 for(const [id,w] of [["spirit-shield",8],["holy-elixir",3],["soul-rune",32],
 ["onyx-bolts-e",20],["raw-shark",21],["pure-essence",21],["coins",12],["@gem",12]])
 assert.equal(MAIN.find(x=>x[0]===id)?.[3],w);
});
test("A solo kill receives a common roll, exclusive sigil and independent tertiaries",()=>{
 let i=0;
 const r=simulate(1,{rng:()=>[spot(MAIN,"spirit-shield"),0,0,0,0,0][i++]??.99});
 assert.equal(r.drops["spirit-shield"],1);
 assert.equal(r.drops["elysian-sigil"],1);
 assert.equal(r.drops["jar-of-spirits"],1);
 assert.equal(r.drops["pet-dark-core"],1);
 assert.equal(r.drops["clue-scroll-elite"],1);
 assert.equal(r.drops["holy-elixir"],undefined);
});
test("Sigil outcomes are mutually exclusive",()=>{
 for(const [x,name] of [[0,"elysian-sigil"],[.4,"spectral-sigil"],[.9,"arcane-sigil"]]){
  let i=0;const seq=[spot(MAIN,"soul-rune"),0,x,.999,.999,.999];
  const r=simulate(1,{rng:()=>seq[i++]??.999});
  assert.equal(r.drops[name],1);
  assert.equal(UNIQUE.filter(y=>y.id.endsWith("sigil")&&r.drops[y.id]).length,1);
  assert.equal(r.drops["soul-rune"],250);
 }
});
test("Gem branch supplies ten independent rolls, ROW removes empty slots",()=>{
 let i=0,seq=[spot(MAIN,"@gem"),...Array(10).fill(0),.99,.99,.99,.99];
 const empty=simulate(1,{rng:()=>seq[i++]??.99});
 assert.deepEqual({...empty.drops},{});
 i=0;seq=[spot(MAIN,"@gem"),...Array(10).fill(0),.99,.99,.99,.99];
 const boosted=simulate(1,{rng:()=>seq[i++]??.99,ringOfWealth:true});
 assert.equal(boosted.drops["uncut-sapphire"],10);
});
test("Legends Quest requirement on mega-rare outcomes",()=>{
 const pick=()=>{let n=0;return ()=>[spot(MAIN,"@gem"),spot(GEM,"@mega"),spot(MEGA,"rune-spear"),
 ...Array(9).fill(spot(GEM,"@nothing")),.99,.99,.99,.99][n++]??.99;};
 const a=simulate(1,{rng:pick()});
 assert.equal(a.drops["rune-spear"],1);
 const b=simulate(1,{rng:pick(),legendsQuest:false});
 assert.equal(b.drops["nature-talisman"],1);
 assert.equal(b.drops["rune-spear"],undefined);
});
test("Elite combat achievement controls clue chance",()=>{
 close(clueRate(),1/200);close(clueRate(true),1/190);
});
test("Dry calculator respects exclusive common and sigil groups",()=>{
 const r=calculateDry(1,{"arcane-sigil":1});
 const p=SIGIL_CHANCE,q=SPIRIT_CHANCE+ELIXIR_CHANCE,j=JAR_CHANCE,t=PET_CHANCE;
 close(r["arcane-sigil"].exact,1/1365);
 close(r.anyUnique.expected,p+q+j+t);
 close(r.anyUnique.fewer,(1-p)*(1-q)*(1-j)*(1-t));
 close(r.anyUnique.atLeastOne,1-(1-p)*(1-q)*(1-j)*(1-t));
 assert.throws(()=>calculateDry(1,{"arcane-sigil":1,"spectral-sigil":1}));
 assert.throws(()=>calculateDry(1,{"spirit-shield":1,"holy-elixir":1}));
 const both=calculateDry(1,{"arcane-sigil":1,"spirit-shield":1,"jar-of-spirits":1,"pet-dark-core":1});
 assert.ok(both.anyUnique.exact>0);
});
test("Dry normalization at zero, 1, 100 and one million KC",()=>{
 for(const n of [0,1,100,10000,MAX_KILLS]){
  const x=calculateDry(n);
  for(const v of [...UNIQUE.map(y=>x[y.id]),x.anyUnique]){
   close(v.fewer+v.exact+v.more,1,1e-7);
   assert.ok(v.atLeastOne>=0&&v.atLeastOne<=1);
  }
 }
 assert.deepEqual({...simulate(0).drops},{});
});
test("Inputs and RNG are strictly validated",()=>{
 for(const n of [-1,1.5,NaN,Infinity,MAX_KILLS+1]){
  assert.throws(()=>validateKills(n));assert.throws(()=>simulate(n));assert.throws(()=>calculateDry(n));
 }
 assert.throws(()=>simulate(1,{rng:()=>1}));
 assert.throws(()=>simulate(1,{eliteCAs:1}));
 assert.throws(()=>simulate(1,{ringOfWealth:1}));
 assert.throws(()=>simulate(1,{legendsQuest:1}));
 assert.throws(()=>calculateDry(1,null));
 assert.throws(()=>calculateDry(1,{"pet-dark-core":2}));
});
test("Solo simulator page and all drop items have real local PNGs",()=>{
 const home=read("index.html"),html=read("corporeal-beast/index.html");
 assert.match(home,/href="\.\/corporeal-beast\/"/);
 assert.match(html,/Completed solo kills/);
 assert.doesNotMatch(html,/name="slayer-task"|group-size|team-size|contribution/i);
 for(const id of ["mode-loot","mode-dry","kill-count","elite-cas","ring-of-wealth",
 "legends-quest","unique-grid","loot-grid"])assert.match(html,new RegExp('id="'+id+'"'));
 for(const item of Object.values(ITEMS)){
  const png=readFileSync(new URL("../assets/items/"+item.id+".png",import.meta.url));
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10],item.id+" needs local PNG");
 }
 const readme=read("corporeal-beast/README.md");
 assert.match(readme,/solo kills only/);
 assert.match(read("README.md"),/corporeal-beast\/README.md/);
});
