// General Graardor and all three Bandos bodyguards, OSRS Wiki, October 2026.
// One "kill" means one boss kill and one kill of each of the three sergeants.
// Both primary tables use a single, mutually exclusive 127-ticket roll.
import {RARE,GEM,MEGA} from "../king-black-dragon/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const SOURCES=Object.freeze([
 {id:"graardor",name:"General Graardor"},
 {id:"strongstack",name:"Sergeant Strongstack"},
 {id:"steelwill",name:"Sergeant Steelwill"},
 {id:"grimspike",name:"Sergeant Grimspike"}
]);
export const UNIQUE=Object.freeze([
 {id:"bandos-chestplate",name:"Bandos chestplate",boss:1/381,minion:1/16256},
 {id:"bandos-tassets",name:"Bandos tassets",boss:1/381,minion:1/16256},
 {id:"bandos-boots",name:"Bandos boots",boss:1/381,minion:1/16256},
 {id:"bandos-hilt",name:"Bandos hilt",boss:1/508,minion:0},
 {id:"godsword-shard-1",name:"Godsword shard 1",boss:1/762,minion:1/1524},
 {id:"godsword-shard-2",name:"Godsword shard 2",boss:1/762,minion:1/1524},
 {id:"godsword-shard-3",name:"Godsword shard 3",boss:1/762,minion:1/1524},
 {id:"pet-general-graardor",name:"Pet General Graardor",boss:1/5000,minion:0}
]);
export const DRY_ITEMS=UNIQUE;
// [slug, display name, minimum amount, maximum amount, ticket weight].
export const BOSS_MAIN=[
 ["@armour","Bandos armour table",0,0,1],
 ["@hilt","Bandos hilt table",0,0,1],
 ["@shard","Godsword shard table",0,0,1],
 ["rune-longsword","Rune longsword",1,1,8],
 ["rune-2h-sword","Rune 2h sword",1,1,8],
 ["rune-platebody","Rune platebody",1,1,8],
 ["rune-pickaxe","Rune pickaxe",1,1,6],
 ["grimy-snapdragon","Grimy snapdragon",3,3,8],
 ["snapdragon-seed","Snapdragon seed",1,1,8],
 ["super-restore-4","Super restore(4)",3,3,8],
 ["adamantite-ore","Adamantite ore",15,20,8],
 ["coal","Coal",115,120,8],
 ["magic-logs","Magic logs",15,20,8],
 ["nature-rune","Nature rune",65,70,8],
 ["@rare","God Wars rare drop table",0,0,8],
 ["@gem","God Wars gem table",0,0,2],
 ["coins","Coins",19500,20000,28]
];
export const MINION_MAIN=[
 ["@armour","Bandos armour table",0,0,1],
 ["@shard","Godsword shard table",0,0,1],
 ["steel-arrow","Steel arrow",95,100,7],
 ["steel-dart","Steel dart",95,100,8],
 ["nature-rune","Nature rune",15,20,8],
 ["cosmic-rune","Cosmic rune",25,30,8],
 ["shark","Shark",2,2,8],
 ["chilli-potato","Chilli potato",3,3,8],
 ["coins","Coins",1400,1500,66],
 ["limpwurt-root","Limpwurt root",5,5,8],
 ["combat-potion-3","Combat potion(3)",1,1,2],
 ["super-strength-3","Super strength(3)",1,1,2]
];
export const mainTickets=table=>table.reduce((total,row)=>total+row[4],0);
const ADDITIONAL=[
 ["big-bones","Big bones"],["bones","Bones"],["frozen-key-piece-bandos","Frozen key piece (Bandos)"],
 ["brimstone-key","Brimstone key"],["clue-scroll-hard","Clue scroll (hard)"],
 ["clue-scroll-elite","Clue scroll (elite)"],["long-bone","Long bone"],
 ["curved-bone","Curved bone"],["goblin-champion-scroll","Goblin champion scroll"],
 ["kebab","Kebab"],["beer","Beer"],["right-eye-patch","Right eye patch"],
 ["rune-sword","Rune sword"],["chaos-talisman","Chaos talisman"]
];
const all=[...BOSS_MAIN,...MINION_MAIN,...RARE.map(x=>[x[0],x[0]]),
 ...GEM.map(x=>[x[0],x[0]]),...MEGA.map(x=>[x[0],x[0]]),
 ...UNIQUE.map(x=>[x.id,x.name]),...ADDITIONAL];
const TITLE_OVERRIDES=Object.fromEntries([
 ...UNIQUE.map(x=>[x.id,x.name]),...BOSS_MAIN.map(x=>x.slice(0,2)),
 ...MINION_MAIN.map(x=>x.slice(0,2)),...ADDITIONAL]);
const nice=id=>TITLE_OVERRIDES[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries(all
 .filter(x=>!x[0].startsWith("@")&&x[0]!=="nothing"&&x[0]!=="runite-bar")
 .map(([id])=>[id,{id,name:nice(id)}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of full-room Graardor kills from 0 to 1,000,000.");
 return kills;
}
export function rateOf(id,source="room"){
 const item=UNIQUE.find(x=>x.id===id);
 if(!item)return 0;
 if(source==="graardor")return item.boss;
 if(["strongstack","steelwill","grimspike"].includes(source))return item.minion;
 if(source==="room")return -Math.expm1(Math.log1p(-item.boss)+3*Math.log1p(-item.minion));
 throw new RangeError("Unknown loot source.");
}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("RNG must return a finite number in [0,1).");
 return v;
}
function weighted(rows,rng){
 let t=unit(rng)*mainTickets(rows);
 for(const row of rows){t-=row[4];if(t<0)return row;}
 return rows.at(-1);
}
function amount(low,high,rng){
 return low===high?low:low+Math.floor(unit(rng)*(high-low+1));
}
const ARMOUR=UNIQUE.slice(0,3).map(x=>x.id);
const SHARDS=UNIQUE.slice(4,7).map(x=>x.id);
function rollPrimary(rng,add,isBoss){
 const row=weighted(isBoss?BOSS_MAIN:MINION_MAIN,rng);
 const [id,,low,high]=row;
 if(id==="@armour"){
  // Boss: one of the 3 pieces; minions: 3 of 128, 125 of 128 coins.
  const r=unit(rng)*(isBoss?3:128);
  if(r<3)add(ARMOUR[Math.floor(r)]);
  else add("coins",amount(isBoss?20100:1400,isBoss?20600:1500,rng));
 }else if(id==="@hilt"){
  if(unit(rng)<1/4)add("bandos-hilt");
  else add("coins",amount(20100,20600,rng));
 }else if(id==="@shard"){
  // Boss shard table has 6 outcomes, minion table has 12.
  const r=unit(rng)*(isBoss?6:12);
  if(r<3)add(SHARDS[Math.floor(r)]);
  else add("coins",amount(isBoss?20100:1400,isBoss?20600:1500,rng));
 }else if(id==="@rare"||id==="@gem"){
  // Shared RDT/GDT with the God Wars substitutions: rune sword for
  // runite bar, and 19,500-20,000 coins for empty results.
  let current=id==="@rare"?RARE:GEM;
  for(let depth=0;depth<8;depth++){
   const [value,lo,hi]=weighted(current,rng);
   if(value==="@gem"){current=GEM;continue;}
   if(value==="@megaRare"){current=MEGA;continue;}
   if(value==="@talisman"){add("chaos-talisman");return;}
   if(value==="@nothing"||value==="nothing"){
    add("coins",amount(19500,20000,rng));return;
   }
   const resolved=value==="runite-bar"?"rune-sword":value;
   add(resolved,resolved==="coins"?amount(19500,20000,rng):amount(lo,hi,rng));
   return;
  }
  throw new Error("God Wars rare-drop table depth exceeded.");
 }else add(id,amount(low,high,rng));
}
export function simulate(kills,{rng=Math.random,hardCAs=false,eliteCAs=false,konarTask=false,frozenDoor=false}={}){
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if([hardCAs,eliteCAs,konarTask,frozenDoor].some(x=>typeof x!=="boolean"))
  throw new TypeError("Combat Achievement, Konar and Frozen Door options must be boolean.");
 const bySource=Object.fromEntries(SOURCES.map(x=>[x.id,Object.create(null)]));
 function add(source,id,n=1){
  if(n>0)bySource[source][id]=(bySource[source][id]??0)+n;
 }
 for(let k=0;k<kills;k++){
  const boss="graardor";
  add(boss,"big-bones");
  if(frozenDoor)add(boss,"frozen-key-piece-bandos");
  rollPrimary(rng,(id,n)=>add(boss,id,n),true);
  if(unit(rng)<1/5000)add(boss,"pet-general-graardor");
  if(unit(rng)<(eliteCAs?1/237:1/250))add(boss,"clue-scroll-elite");
  if(unit(rng)<1/400)add(boss,"long-bone");
  if(unit(rng)<1/5012.5)add(boss,"curved-bone");
  if(konarTask&&unit(rng)<1/50)add(boss,"brimstone-key");
  for(const source of ["strongstack","steelwill","grimspike"]){
   add(source,"bones");
   rollPrimary(rng,(id,n)=>add(source,id,n),false);
   const special=source==="strongstack"?"kebab":source==="steelwill"?"beer":"right-eye-patch";
   if(unit(rng)<1/6)add(source,special);
   if(frozenDoor&&unit(rng)<1/20)add(source,"frozen-key-piece-bandos");
   if(unit(rng)<(hardCAs?1/121:1/128))add(source,"clue-scroll-hard");
   if(unit(rng)<1/5000)add(source,"goblin-champion-scroll");
  }
 }
 const drops=Object.create(null);
 for(const source of SOURCES)
  for(const [id,n] of Object.entries(bySource[source.id]))drops[id]=(drops[id]??0)+n;
 return {kills,bySource,drops};
}
