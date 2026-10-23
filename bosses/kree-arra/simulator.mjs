import {wealthTable} from "../../shared/rare-tables.mjs";
// Kree'arra and all three Armadyl bodyguards; Old School RuneScape Wiki, 2026.
// A full room clear rolls one 127-ticket table for each of Kree'arra,
// Flight Kilisa, Wingman Skree and Flockleader Geerin, independently.
import {RARE,GEM,MEGA} from "../king-black-dragon/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const SOURCES=Object.freeze([
 {id:"kree",name:"Kree'arra"},
 {id:"kilisa",name:"Flight Kilisa"},
 {id:"skree",name:"Wingman Skree"},
 {id:"geerin",name:"Flockleader Geerin"}
]);
export const UNIQUE=Object.freeze([
 {id:"armadyl-helmet",name:"Armadyl helmet",boss:1/381,minion:1/16129},
 {id:"armadyl-chestplate",name:"Armadyl chestplate",boss:1/381,minion:1/16129},
 {id:"armadyl-chainskirt",name:"Armadyl chainskirt",boss:1/381,minion:1/16129},
 {id:"armadyl-hilt",name:"Armadyl hilt",boss:1/508,minion:0},
 {id:"godsword-shard-1",name:"Godsword shard 1",boss:1/762,minion:1/1524},
 {id:"godsword-shard-2",name:"Godsword shard 2",boss:1/762,minion:1/1524},
 {id:"godsword-shard-3",name:"Godsword shard 3",boss:1/762,minion:1/1524},
 {id:"pet-kree-arra",name:"Pet Kree'arra",boss:1/5000,minion:0}
]);
export const DRY_ITEMS=UNIQUE;
// All main rows are [sprite id, display name, min quantity, max quantity, weight].
// Boss table: 3 unique-table tickets + 72 common + 2 other + 10 rare + 40 coins = 127.
export const BOSS_MAIN=[
 ["@armour","Armadyl armour",0,0,1],
 ["@hilt","Armadyl hilt",0,0,1],
 ["@shard","Godsword shard",0,0,1],
 ["black-dhide-body","Black d'hide body",1,1,8],
 ["rune-crossbow","Rune crossbow",1,1,8],
 ["mind-rune","Mind rune",586,601,8],
 ["rune-arrow","Rune arrow",100,105,8],
 ["runite-bolts","Runite bolts",20,25,8],
 ["dragonstone-bolts-e","Dragonstone bolts (e)",5,10,8],
 ["@potions","Ranging potion(3) and Super defence(3)",0,0,8],
 ["grimy-dwarf-weed","Grimy dwarf weed",8,13,8],
 ["dwarf-weed-seed","Dwarf weed seed",2,2,8],
 ["crystal-key","Crystal key",1,1,1],
 ["yew-seed","Yew seed",1,1,1],
 ["@rare","God Wars rare drop table",0,0,8],
 ["@gem","God Wars gem table",0,0,2],
 ["coins","Coins",19500,20000,40]
];
// 2 rare-table tickets and 125 normal tickets per bodyguard.
export const MINION_MAIN=[
 ["@armour","Armadyl armour",0,0,1],
 ["@shard","Godsword shard",0,0,1],
 ["steel-arrow","Steel arrow",91,101,7],
 ["steel-dart","Steel dart",91,101,8],
 ["smoke-rune","Smoke rune",10,15,8],
 ["manta-ray","Manta ray",2,2,8],
 ["mushroom-potato","Mushroom potato",3,3,8],
 ["coins","Coins",1000,1100,70],
 ["crushed-nest","Crushed nest",2,2,8],
 ["grimy-kwuarm","Grimy kwuarm",1,1,8]
];
export const mainTickets=table=>table.reduce((sum,row)=>sum+row[4],0);
const ADDITIONAL=[
 ["big-bones","Big bones"],["bones","Bones"],["feather","Feather"],
 ["frozen-key-piece-armadyl","Frozen key piece (Armadyl)"],
 ["brimstone-key","Brimstone key"],["clue-scroll-hard","Clue scroll (hard)"],
 ["clue-scroll-elite","Clue scroll (elite)"],["long-bone","Long bone"],
 ["curved-bone","Curved bone"],["ranging-potion-3","Ranging potion(3)"],
 ["super-defence-3","Super defence(3)"],
 ["rune-sword","Rune sword"],["chaos-talisman","Chaos talisman"]
];
const all=[...BOSS_MAIN,...MINION_MAIN,...RARE.map(x=>[x[0],x[0]]),
 ...GEM.map(x=>[x[0],x[0]]),...MEGA.map(x=>[x[0],x[0]]),
 ...UNIQUE.map(x=>[x.id,x.name]),...ADDITIONAL];
const OVERRIDES=Object.fromEntries([
 ...UNIQUE.map(x=>[x.id,x.name]),
 ...BOSS_MAIN.map(x=>x.slice(0,2)),
 ...MINION_MAIN.map(x=>x.slice(0,2)),...ADDITIONAL
]);
const readable=id=>OVERRIDES[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries(all
 .filter(row=>!row[0].startsWith("@")&&row[0]!=="nothing"&&row[0]!=="runite-bar")
 .map(([id])=>[id,{id,name:readable(id)}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter 0 to 1,000,000 completed Kree'arra full-room kills.");
 return kills;
}
export function rateOf(id,source="room"){
 const item=UNIQUE.find(x=>x.id===id);
 if(!item)return 0;
 if(source==="kree")return item.boss;
 if(["kilisa","skree","geerin"].includes(source))return item.minion;
 if(source==="room")return -Math.expm1(Math.log1p(-item.boss)+3*Math.log1p(-item.minion));
 throw new RangeError("Unknown loot source.");
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return n;
}
function weighted(table,rng,index=4){
 let ticket=unit(rng)*table.reduce((sum,row)=>sum+row[index],0);
 for(const row of table){ticket-=row[index];if(ticket<0)return row;}
 return table.at(-1);
}
function amount(low,high,rng){
 return low===high?low:low+Math.floor(unit(rng)*(high-low+1));
}
const ARMOUR=UNIQUE.slice(0,3).map(x=>x.id);
const SHARDS=UNIQUE.slice(4,7).map(x=>x.id);
export const KONAR_RATE=Object.freeze({kree:1/50,kilisa:1/89,skree:1/92,geerin:1/91});
// Ordinary and unique tables are mutually exclusive: exactly one main roll.
function rollMain(rng,add,isBoss,feathers,ringOfWealth=false){
 const [id,,low,high]=weighted(isBoss?BOSS_MAIN:MINION_MAIN,rng);
 if(id==="@armour"){
  // Boss armour is a three-item table. Each minion has 3 / 127 subrolls.
  const ticket=unit(rng)*(isBoss?3:127);
  if(ticket<3)add(ARMOUR[Math.floor(ticket)]);
  else add("coins",amount(1000,1100,rng));
 }else if(id==="@hilt"){
  if(unit(rng)<1/4)add("armadyl-hilt");
  else add("coins",amount(20500,21000,rng));
 }else if(id==="@shard"){
  const ticket=unit(rng)*(isBoss?6:12);
  if(ticket<3)add(SHARDS[Math.floor(ticket)]);
  else add("coins",amount(isBoss?20500:1000,isBoss?21000:1100,rng));
 }else if(id==="@potions"){
  add("ranging-potion-3",3);
  add("super-defence-3",3);
 }else if(id==="@rare"||id==="@gem"){
  // Existing project GWD approximation, with canonical weight index 3.
  let table=id==="@rare"?RARE:GEM;
  for(let depth=0;depth<8;depth++){
   const [loot,min,max]=weighted(wealthTable(table,ringOfWealth,3,{nested:true}),rng,3);
   if(loot==="@gem"){table=GEM;continue;}
   if(loot==="@megaRare"){table=MEGA;continue;}
   if(loot==="@talisman"){add("chaos-talisman");return;}
   if(loot==="@nothing"||loot==="nothing"){
    add("coins",amount(19500,20000,rng));return;
   }
   const resolved=loot==="runite-bar"?"rune-sword":loot;
   add(resolved,resolved==="coins"?amount(19500,20000,rng):amount(min,max,rng));
   return;
  }
  throw new Error("Rare drop table nesting too deep.");
 }else if(id==="mind-rune"){
  add(id,585+feathers);
 }else if(id==="steel-arrow"||id==="steel-dart"){
  add(id,90+feathers);
 }else{
  add(id,amount(low,high,rng));
 }
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,hardCAs=false,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if([hardCAs,eliteCAs].some(v=>typeof v!=="boolean"))
  throw new TypeError("Combat Combat Achievement options must be boolean.");
 const bySource=Object.fromEntries(SOURCES.map(x=>[x.id,Object.create(null)]));
 const add=(source,id,n=1)=>{
  if(n>0)bySource[source][id]=(bySource[source][id]??0)+n;
 };
 for(let k=0;k<kills;k++){
  const feathers=amount(1,16,rng);
  add("kree","big-bones");add("kree","feather",feathers);
  rollMain(rng,(id,n)=>add("kree",id,n),true,feathers,ringOfWealth);
  if(unit(rng)<1/5000)add("kree","pet-kree-arra");
  if(unit(rng)<(eliteCAs?1/237:1/250))add("kree","clue-scroll-elite");
  if(unit(rng)<1/400)add("kree","long-bone");
  if(unit(rng)<1/5012.5)add("kree","curved-bone");

  for(const source of ["kilisa","skree","geerin"]){
   const minionFeathers=amount(1,11,rng);
   add(source,"bones");add(source,"feather",minionFeathers);
   rollMain(rng,(id,n)=>add(source,id,n),false,minionFeathers,ringOfWealth);
   if(unit(rng)<(hardCAs?1/121:1/128))add(source,"clue-scroll-hard");

  }
 }
 const drops=Object.create(null);
 for(const source of SOURCES)
  for(const [id,n] of Object.entries(bySource[source.id]))
   drops[id]=(drops[id]??0)+n;
 return {kills,bySource,drops};
}
