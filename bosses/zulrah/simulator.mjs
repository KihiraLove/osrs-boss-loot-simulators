// Zulrah loot table, OSRS Wiki (October 2026).
// Guaranteed scales, two independent ordinary rolls, one tertiary roll per kill.
// Every ordinary roll hits the four-item unique table with probability 1/256.
// The 249-ticket normal table contains the flax/mutagen and shark subtables.
import {RDT} from "../cerberus/simulator.mjs";

export const MAX_KILLS=1_000_000;
export const MUTAGEN_ROLL=(10/249)*(10/5264); // exact rate for EACH mutagen per main roll
export const UNIQUE=Object.freeze([
 {id:"tanzanite-fang",name:"Tanzanite fang",rolls:2,p:1/1024},
 {id:"magic-fang",name:"Magic fang",rolls:2,p:1/1024},
 {id:"serpentine-visage",name:"Serpentine visage",rolls:2,p:1/1024},
 {id:"uncut-onyx",name:"Uncut onyx",rolls:2,p:1/1024},
 {id:"tanzanite-mutagen",name:"Tanzanite mutagen",rolls:2,p:MUTAGEN_ROLL},
 {id:"magma-mutagen",name:"Magma mutagen",rolls:2,p:MUTAGEN_ROLL},
 {id:"jar-of-swamp",name:"Jar of Swamp",rolls:1,p:1/3000},
 {id:"pet-snakeling",name:"Pet Snakeling",rolls:1,p:1/4000}
]);
export const DRY_ITEMS=UNIQUE;
// [slug, display name, min quantity, max quantity, table tickets]
export const MAIN=[
 ["@flax","Flax / mutagen",0,0,10],
 ["battlestaff","Battlestaff",10,10,10],
 ["dragon-med-helm","Dragon med helm",1,1,2],
 ["dragon-halberd","Dragon halberd",1,1,2],
 ["death-rune","Death rune",250,250,12],
 ["law-rune","Law rune",200,200,12],
 ["chaos-rune","Chaos rune",400,400,12],
 ["snapdragon","Snapdragon",10,10,2],
 ["dwarf-weed","Dwarf weed",30,30,2],
 ["toadflax","Toadflax",25,25,2],
 ["torstol","Torstol",10,10,2],
 ["palm-tree-seed","Palm tree seed",1,1,6],
 ["papaya-tree-seed","Papaya tree seed",3,3,6],
 ["calquat-tree-seed","Calquat tree seed",2,2,6],
 ["magic-seed","Magic seed",1,1,4],
 ["toadflax-seed","Toadflax seed",2,2,2],
 ["snapdragon-seed","Snapdragon seed",1,1,2],
 ["dwarf-weed-seed","Dwarf weed seed",2,2,2],
 ["torstol-seed","Torstol seed",1,1,2],
 ["spirit-seed","Spirit seed",1,1,1],
 ["snakeskin","Snakeskin",35,35,11],
 ["runite-ore","Runite ore",2,2,11],
 ["pure-essence","Pure essence",1500,1500,10],
 ["yew-logs","Yew logs",35,35,10],
 ["adamantite-bar","Adamantite bar",20,20,8],
 ["coal","Coal",200,200,8],
 ["dragon-bones","Dragon bones",12,12,8],
 ["mahogany-logs","Mahogany logs",50,50,8],
 ["@shark","Shark table",0,0,12],
 ["zul-andra-teleport","Zul-andra teleport",4,4,15],
 ["antidote-plus-plus-4","Antidote++(4)",10,10,9],
 ["dragonstone-bolt-tips","Dragonstone bolt tips",12,12,8],
 ["grapes","Grapes",250,250,6],
 ["coconut","Coconut",20,20,6],
 ["swamp-tar","Swamp tar",1000,1000,5],
 ["zulrahs-scales","Zulrah's scales",500,500,5],
 ["@rdt","Rare drop table",0,0,10]
];
export const SHARK=[
 ["raw-shark","Raw shark",35,35,3],
 ["shark-lure","Shark lure",70,70,3],
 ["manta-ray","Manta ray",35,35,2]
];
export const TABLE_TICKETS=MAIN.reduce((s,row)=>s+row[4],0);
const extras=[
 ["flax","Flax"],["clue-scroll-elite","Clue scroll (elite)"],
 ["brimstone-key","Brimstone key"]
];
const all=[...MAIN.filter(x=>!x[0].startsWith("@")),
 ...SHARK,...UNIQUE.map(x=>[x.id,x.name]),
 ...RDT.filter(x=>x[0]!=="nothing"),...extras];
export const ITEMS=Object.freeze(Object.fromEntries(all.map(([id,name])=>[id,{id,name}])));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter a whole number of Zulrah kills from 0 to 1,000,000.");
 return n;
}
export function rateOf(id){
 const item=UNIQUE.find(x=>x.id===id);
 return item? -Math.expm1(item.rolls*Math.log1p(-item.p)):0;
}
function unit(rng){
 const value=rng();
 if(typeof value!=="number"||!Number.isFinite(value)||value<0||value>=1)
  throw new RangeError("RNG must return a finite number in [0, 1).");
 return value;
}
function weighted(table,rng){
 let ticket=unit(rng)*table.reduce((s,row)=>s+row[4],0);
 for(const row of table){ticket-=row[4];if(ticket<0)return row;}
 return table.at(-1);
}
function rollMain(rng,add){
 // 1/256 per main roll for one of the four equally weighted uniques.
 if(unit(rng)<1/256){
  const choice=Math.floor(unit(rng)*4);
  add(UNIQUE[choice].id);
  return;
 }
 const row=weighted(MAIN,rng);
 if(row[0]==="@flax"){
  // Conditional on the 10/249 flax branch, mutagen subtable
  // has 10/5264 tickets for each of the two mutagens.
  const ticket=unit(rng)*5264;
  if(ticket<10)add("tanzanite-mutagen");
  else if(ticket<20)add("magma-mutagen");
  else add("flax",1000);
 }else if(row[0]==="@shark"){
  const shark=weighted(SHARK,rng);
  add(shark[0],shark[2]);
 }else if(row[0]==="@rdt"){
  const rare=weighted(RDT,rng);
  if(rare[0]!=="nothing")add(rare[0],rare[2]===rare[3]
   ?rare[2]:rare[2]+Math.floor(unit(rng)*(rare[3]-rare[2]+1)));
 }else add(row[0],row[2]);
}
export function simulate(kills,{rng=Math.random,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if(typeof eliteCAs!=="boolean"||typeof konarTask!=="boolean")
  throw new TypeError("Combat Achievement and Konar options must be boolean.");
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 for(let k=0;k<kills;k++){
  add("zulrahs-scales",100+Math.floor(unit(rng)*200));
  rollMain(rng,add);
  rollMain(rng,add);
  if(unit(rng)<1/3000)add("jar-of-swamp");
  if(unit(rng)<1/4000)add("pet-snakeling");
  if(unit(rng)<(eliteCAs?1/71:1/75))add("clue-scroll-elite");
  if(konarTask&&unit(rng)<1/50)add("brimstone-key");
 }
 return {kills,drops};
}
