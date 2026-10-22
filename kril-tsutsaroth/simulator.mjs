// K'ril Tsutsaroth + 3 Zamorak bodyguards; OSRS Wiki, October 2026.
// Each full-room kill has four independent, 127-ticket main-table rolls.
// Boss-only unique rates and the bodyguards' Zamorakian spear chance are exact.
import {RARE,GEM,MEGA} from "../king-black-dragon/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const SOURCES=Object.freeze([
 {id:"kril",name:"K'ril Tsutsaroth"},
 {id:"tstanon",name:"Tstanon Karlak"},
 {id:"balfrug",name:"Balfrug Kreeyath"},
 {id:"zakln",name:"Zakl'n Gritch"}
]);
export const UNIQUE=Object.freeze([
 {id:"steam-battlestaff",name:"Steam battlestaff",boss:1/127,minion:0},
 {id:"zamorakian-spear",name:"Zamorakian spear",boss:1/127,minion:3/16129},
 {id:"staff-of-the-dead",name:"Staff of the Dead",boss:1/508,minion:0},
 {id:"zamorak-hilt",name:"Zamorak hilt",boss:1/508,minion:0},
 {id:"godsword-shard-1",name:"Godsword shard 1",boss:1/762,minion:1/1524},
 {id:"godsword-shard-2",name:"Godsword shard 2",boss:1/762,minion:1/1524},
 {id:"godsword-shard-3",name:"Godsword shard 3",boss:1/762,minion:1/1524},
 {id:"pet-kril-tsutsaroth",name:"Pet K'ril Tsutsaroth",boss:1/5000,minion:0}
]);
export const DRY_ITEMS=UNIQUE;
// [item id, display name, low quantity, high quantity, ticket weight].
// The four boss unique branches are 1/127,1/127,1/508,1/508 per kill.
export const BOSS_MAIN=[
 ["steam-battlestaff","Steam battlestaff",1,1,1],
 ["zamorakian-spear","Zamorakian spear",1,1,1],
 ["@staff","Staff of the Dead table",0,0,1],
 ["@hilt","Zamorak hilt table",0,0,1],
 ["@shard","Godsword shard table",0,0,1],
 ["adamant-arrow-p++","Adamant arrow(p++)",295,300,8],
 ["rune-scimitar","Rune scimitar",1,1,8],
 ["adamant-platebody","Adamant platebody",1,1,8],
 ["rune-platelegs","Rune platelegs",1,1,7],
 ["dragon-dagger-p++","Dragon dagger(p++)",1,1,2],
 ["@attack","Super attack and strength(3)",0,0,8],
 ["@restore","Super restore and Zamorak brew(3)",0,0,8],
 ["grimy-lantadyme","Grimy lantadyme",10,10,8],
 ["lantadyme-seed","Lantadyme seed",3,3,8],
 ["death-rune","Death rune",120,125,8],
 ["blood-rune","Blood rune",80,85,8],
 ["@rare","God Wars rare drop table",0,0,8],
 ["@gem","God Wars gem drop table",0,0,2],
 ["coins","Coins",19500,20000,31]
];
export const MINION_MAIN=[
 ["@spear","Zamorakian spear table",0,0,1],
 ["@shard","Godsword shard table",0,0,1],
 ["steel-arrow","Steel arrow",95,100,7],
 ["steel-dart","Steel dart",95,100,8],
 ["death-rune","Death rune",5,10,8],
 ["blood-rune","Blood rune",5,10,8],
 ["coins","Coins",1300,1400,66],
 ["shark","Shark",3,3,8],
 ["tuna-potato","Tuna potato",2,2,8],
 ["wine-of-zamorak","Wine of Zamorak",5,10,8],
 ["super-attack-3","Super attack(3)",1,1,2],
 ["super-strength-3","Super strength(3)",1,1,2]
];
export const mainTickets=table=>table.reduce((n,row)=>n+row[4],0);
const ADDITIONAL=[
 ["infernal-ashes","Infernal ashes"],["malicious-ashes","Malicious ashes"],
 ["frozen-key-piece-zamorak","Frozen key piece (Zamorak)"],
 ["brimstone-key","Brimstone key"],["clue-scroll-hard","Clue scroll (hard)"],
 ["clue-scroll-elite","Clue scroll (elite)"],
 ["super-attack-3","Super attack(3)"],["super-strength-3","Super strength(3)"],
 ["super-restore-3","Super restore(3)"],["zamorak-brew-3","Zamorak brew(3)"],
 ["rune-sword","Rune sword"],["chaos-talisman","Chaos talisman"]
];
const all=[...BOSS_MAIN,...MINION_MAIN,...RARE.map(x=>[x[0],x[0]]),
 ...GEM.map(x=>[x[0],x[0]]),...MEGA.map(x=>[x[0],x[0]]),
 ...UNIQUE.map(x=>[x.id,x.name]),...ADDITIONAL];
const OVERRIDES=Object.fromEntries([
 ...UNIQUE.map(x=>[x.id,x.name]),...BOSS_MAIN.map(x=>x.slice(0,2)),
 ...MINION_MAIN.map(x=>x.slice(0,2)),...ADDITIONAL
]);
const label=id=>OVERRIDES[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries(all
 .filter(x=>!x[0].startsWith("@")&&x[0]!=="nothing"&&x[0]!=="runite-bar")
 .map(([id])=>[id,{id,name:label(id)}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of full-room K'ril kills between 0 and 1,000,000.");
 return kills;
}
export function rateOf(id,source="room"){
 const item=UNIQUE.find(x=>x.id===id);
 if(!item)return 0;
 if(source==="kril")return item.boss;
 if(["tstanon","balfrug","zakln"].includes(source))return item.minion;
 if(source==="room")return -Math.expm1(Math.log1p(-item.boss)+3*Math.log1p(-item.minion));
 throw new RangeError("Unknown loot source.");
}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("RNG must return a finite number in [0,1).");
 return v;
}
function weighted(table,rng,index=4){
 let ticket=unit(rng)*table.reduce((n,x)=>n+x[index],0);
 for(const row of table){ticket-=row[index];if(ticket<0)return row;}
 return table.at(-1);
}
function qty(low,high,rng){
 return low===high?low:low+Math.floor(unit(rng)*(high-low+1));
}
const SHARDS=UNIQUE.slice(4,7).map(x=>x.id);
function rollMain(rng,add,isBoss){
 const [id,,lo,hi]=weighted(isBoss?BOSS_MAIN:MINION_MAIN,rng);
 if(id==="@staff"){
  if(unit(rng)<1/4)add("staff-of-the-dead");
  else add("coins",qty(19500,20000,rng));
 }else if(id==="@hilt"){
  if(unit(rng)<1/4)add("zamorak-hilt");
  else add("coins",qty(19500,20000,rng));
 }else if(id==="@spear"){
  // 1/127 main-table roll * 3/127 chance from the minion subtable.
  if(unit(rng)<3/127)add("zamorakian-spear");
  else add("coins",qty(1300,1400,rng));
 }else if(id==="@shard"){
  // Boss: each shard 1/6 of this branch. Guards: each 1/12.
  const slot=Math.floor(unit(rng)*(isBoss?6:12));
  if(slot<3)add(SHARDS[slot]);
  else add("coins",qty(isBoss?19500:1300,isBoss?20000:1400,rng));
 }else if(id==="@attack"){
  add("super-attack-3",3);add("super-strength-3",3);
 }else if(id==="@restore"){
  add("super-restore-3",3);add("zamorak-brew-3",3);
 }else if(id==="@rare"||id==="@gem"){
  // Shared rare and gem subtables have [id, min, max, weight] rows.
  let table=id==="@rare"?RARE:GEM;
  for(let depth=0;depth<8;depth++){
   const [name,min,max]=weighted(table,rng,3);
   if(name==="@gem"){table=GEM;continue;}
   if(name==="@megaRare"){table=MEGA;continue;}
   if(name==="@talisman"){add("chaos-talisman");return;}
   if(name==="@nothing"||name==="nothing"){
    add("coins",qty(19500,20000,rng));return;
   }
   const resolved=name==="runite-bar"?"rune-sword":name;
   add(resolved,resolved==="coins"?qty(19500,20000,rng):qty(min,max,rng));return;
  }
  throw new Error("Rare-drop subtable exceeded maximum depth.");
 }else add(id,qty(lo,hi,rng));
}
export function simulate(kills,{rng=Math.random,hardCAs=false,eliteCAs=false,konarTask=false,frozenDoor=false}={}){
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if([hardCAs,eliteCAs,konarTask,frozenDoor].some(x=>typeof x!=="boolean"))
  throw new TypeError("Achievement, Konar and Frozen Door options must be boolean.");
 const bySource=Object.fromEntries(SOURCES.map(x=>[x.id,Object.create(null)]));
 const add=(source,id,n=1)=>{if(n>0)bySource[source][id]=(bySource[source][id]??0)+n;};
 for(let i=0;i<kills;i++){
  add("kril","infernal-ashes");
  if(frozenDoor)add("kril","frozen-key-piece-zamorak");
  rollMain(rng,(id,n)=>add("kril",id,n),true);
  if(unit(rng)<1/5000)add("kril","pet-kril-tsutsaroth");
  if(unit(rng)<(eliteCAs?1/237:1/250))add("kril","clue-scroll-elite");
  if(konarTask&&unit(rng)<1/50)add("kril","brimstone-key");
  for(const source of ["tstanon","balfrug","zakln"]){
   add(source,"malicious-ashes");
   rollMain(rng,(id,n)=>add(source,id,n),false);
   if(frozenDoor&&unit(rng)<1/20)add(source,"frozen-key-piece-zamorak");
   if(unit(rng)<(hardCAs?1/121:1/128))add(source,"clue-scroll-hard");
  }
 }
 const drops=Object.create(null);
 for(const s of SOURCES)
  for(const [id,n] of Object.entries(bySource[s.id]))
   drops[id]=(drops[id]??0)+n;
 return {kills,bySource,drops};
}
