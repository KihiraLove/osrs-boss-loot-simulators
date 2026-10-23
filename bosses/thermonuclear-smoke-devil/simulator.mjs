import {wealthTable} from "../../shared/rare-tables.mjs";
// Thermonuclear smoke devil, OSRS Wiki 2026-10.
// One pre-roll replaces the standard loot; pet, jar and clues are tertiary.
import {GEM,MEGA,TALISMAN,ITEMS as SHARED_ITEMS} from "../king-black-dragon/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([{"id":"occult-necklace","name":"Occult necklace","rate":0.002857142857142857},{"id":"smoke-battlestaff","name":"Smoke battlestaff","rate":0.001953125},{"id":"dragon-chainbody","name":"Dragon chainbody","rate":0.0005},{"id":"jar-of-smoke","name":"Jar of Smoke","rate":0.0005},{"id":"pet-smoke-devil","name":"Pet Smoke Devil","rate":0.0003333333333333333}]);
export const DRY_ITEMS=UNIQUE;
export const PRE_ROLL=UNIQUE.slice(0,3);
export const PRE_RATE=PRE_ROLL.reduce((s,r)=>s+r.rate,0);
export const MAIN=[["rune-dagger",1,1,5],["rune-chainbody",1,1,4],["red-dhide-body",1,1,3],["rune-battleaxe",1,1,3],["mystic-air-staff",1,1,3],["mystic-fire-staff",1,1,3],["rune-scimitar",1,1,2],["rune-knife-p",50,50,1],["dragon-scimitar",1,1,1],["ancient-staff",1,1,1],["smoke-rune",100,100,10],["air-rune",300,300,8],["soul-rune",100,100,8],["rune-arrow",100,100,2],["ugthanki-kebab",3,3,1],["tuna-potato",3,3,3],["sanfew-serum-4",2,2,3],["prayer-potion-4",2,2,1],["pure-essence",300,300,2],["molten-glass",100,100,2],["mithril-bar",20,20,2],["magic-logs",20,20,2],["gold-ore",200,200,2],["diamond",10,10,1],["coins",10000,19999,15],["tinderbox",1,1,1],["fire-talisman",1,1,1],["goat-horn",50,50,2],["grimy-toadflax",15,15,2],["onyx-bolt-tips",12,12,2],["snapdragon-seed",2,2,2],["ranarr-seed",2,2,2],["grapes",100,100,1],["magic-seed",1,1,1],["dragonstone-ring",1,1,1],["crystal-key",1,1,1],["@gem",0,0,2],["@shark",0,0,1]];
export const SHARK=[["raw-shark",30,30,5],["shark-lure",60,60,3]];
export const TABLES=Object.freeze({gem:GEM,megaRare:MEGA,talisman:TALISMAN});
const NAMES={"ashes":"Ashes","occult-necklace":"Occult necklace","rune-dagger":"Rune dagger","rune-chainbody":"Rune chainbody","red-dhide-body":"Red d'hide body","rune-battleaxe":"Rune battleaxe","mystic-air-staff":"Mystic air staff","mystic-fire-staff":"Mystic fire staff","rune-scimitar":"Rune scimitar","rune-knife-p":"Rune knife(p++)","dragon-scimitar":"Dragon scimitar","ancient-staff":"Ancient staff","smoke-rune":"Smoke rune","air-rune":"Air rune","soul-rune":"Soul rune","rune-arrow":"Rune arrow","ugthanki-kebab":"Ugthanki kebab","tuna-potato":"Tuna potato","sanfew-serum-4":"Sanfew serum(4)","prayer-potion-4":"Prayer potion(4)","pure-essence":"Pure essence","molten-glass":"Molten glass","mithril-bar":"Mithril bar","magic-logs":"Magic logs","gold-ore":"Gold ore","diamond":"Diamond","coins":"Coins","tinderbox":"Tinderbox","fire-talisman":"Fire talisman","goat-horn":"Goat horn","grimy-toadflax":"Grimy toadflax","onyx-bolt-tips":"Onyx bolt tips","snapdragon-seed":"Snapdragon seed","ranarr-seed":"Ranarr seed","grapes":"Grapes","magic-seed":"Magic seed","dragonstone-ring":"Dragonstone ring","crystal-key":"Crystal key","raw-shark":"Raw shark","shark-lure":"Shark lure","smoke-battlestaff":"Smoke battlestaff","dragon-chainbody":"Dragon chainbody","jar-of-smoke":"Jar of Smoke","pet-smoke-devil":"Pet Smoke Devil","clue-scroll-hard":"Clue scroll (hard)","clue-scroll-elite":"Clue scroll (elite)","brimstone-key":"Brimstone key"};
const ids=[...new Set([...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),
  ...SHARK.map(x=>x[0]),...GEM.map(x=>x[0]),
  ...MEGA.map(x=>x[0]),...TALISMAN.map(x=>x[0]),
  "ashes","clue-scroll-hard","clue-scroll-elite","brimstone-key"])].filter(x=>!x.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[id,{
 id,name:NAMES[id]??SHARED_ITEMS[id]?.name??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ")
}])));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter a whole number of Thermonuclear Smoke Devil kills from 0 to 1,000,000.");
 return n;
}
export function validateOptions({hardCAs=false,eliteCAs=false}={}){
 if([hardCAs,eliteCAs].some(v=>typeof v!=="boolean"))
  throw new TypeError("Combat Achievement options must be boolean.");
}
export const clueRate=(tier,boost=false)=>{
 if(tier==="hard")return boost?1/91:1/96;
 if(tier==="elite")return boost?1/475:1/500;
 throw new RangeError("Unknown clue tier.");
};
export const rateOf=id=>UNIQUE.find(x=>x.id===id)?.rate??0;
function unit(rng){
 const x=rng();
 if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)
  throw new RangeError("RNG must return a finite number in [0, 1).");
 return x;
}
function weighted(table,rng){
 let ticket=unit(rng)*table.reduce((s,r)=>s+r[3],0);
 for(const row of table){ticket-=row[3];if(ticket<0)return row;}
 return table.at(-1);
}
function quantity(low,high,rng){return low===high?low:low+Math.floor(unit(rng)*(high-low+1));}
function standardRoll(rng,add,ringOfWealth=false){
 let table=MAIN;
 for(let depth=0;depth<6;depth++){
  const [id,low,high]=weighted(wealthTable(table,ringOfWealth&&table!==MAIN&&table!==SHARK,3,{nested:true}),rng);
  if(id==="@nothing")return;
  if(id==="@shark"){table=SHARK;continue;}
  if(id.startsWith("@")){
   table=TABLES[id.slice(1)];
   if(!table)throw new RangeError("Unknown drop subtable: "+id);
   continue;
  }
  add(id,quantity(low,high,rng));return;
 }
 throw new Error("Drop subtable nesting too deep.");
}
// The three listed rare pre-rolls are mutually exclusive, with their
// advertised marginal rates, and replace the standard drop.
export function simulate(kills,{ringOfWealth=false,rng=Math.random,hardCAs=false,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);validateOptions({hardCAs,eliteCAs});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 for(let k=0;k<kills;k++){
  add("ashes");
  const ticket=unit(rng);let cumulative=0,pre=null;
  for(const item of PRE_ROLL){cumulative+=item.rate;if(ticket<cumulative){pre=item.id;break;}}
  if(pre)add(pre);else standardRoll(rng,add,ringOfWealth);
  if(unit(rng)<rateOf("jar-of-smoke"))add("jar-of-smoke");
  if(unit(rng)<rateOf("pet-smoke-devil"))add("pet-smoke-devil");
  if(unit(rng)<clueRate("hard",hardCAs))add("clue-scroll-hard");
  if(unit(rng)<clueRate("elite",eliteCAs))add("clue-scroll-elite");

 }
 return {kills,drops,hardCAs,eliteCAs};
}
