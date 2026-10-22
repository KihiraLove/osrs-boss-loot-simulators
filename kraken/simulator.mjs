// Kraken boss (level 291). Excludes the ordinary cave kraken Slayer monster.
// Source: https://oldschool.runescape.wiki/w/Kraken
import {GEM, MEGA, TALISMAN, ITEMS as SHARED_ITEMS} from "../giant-mole/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([
 {
  "id": "trident-of-the-seas-full",
  "name": "Trident of the seas (full)",
  "rate": 0.001953125
 },
 {
  "id": "kraken-tentacle",
  "name": "Kraken tentacle",
  "rate": 0.0025
 },
 {
  "id": "jar-of-dirt",
  "name": "Jar of dirt",
  "rate": 0.001
 },
 {
  "id": "pet-kraken",
  "name": "Pet kraken",
  "rate": 0.0003333333333333333
 }
]);
export const DRY_ITEMS=UNIQUE;
// One ordinary drop per kill, exactly 128 weighted tickets; quantity is inclusive.
export const MAIN=Object.freeze([["mystic-water-staff",1,1,3],["rune-warhammer",1,1,2],["rune-longsword",1,1,2],["mystic-robe-top",1,1,1],["mystic-robe-bottom",1,1,1],["water-rune",400,400,10],["mist-rune",100,100,4],["chaos-rune",200,200,10],["death-rune",150,150,10],["blood-rune",60,60,10],["soul-rune",50,50,7],["watermelon-seed",24,24,3],["torstol-seed",2,2,1],["magic-seed",1,1,1],["seaweed",125,125,3],["battlestaff",10,10,4],["unpowered-orb",50,50,2],["diamond",8,8,1],["oak-plank",60,60,3],["runite-bar",2,2,1],["raw-shark",50,50,2],["raw-monkfish",100,100,2],["grimy-snapdragon",6,6,2],["coins",10000,19999,15],["shark",5,5,7],["pirate-boots",1,1,4],["sanfew-serum-4",2,2,4],["edible-seaweed",5,5,3],["harpoon",1,1,1],["bucket",1,1,1],["crystal-key",1,1,1],["rusty-sword",1,1,2],["antidote-4",2,2,2],["dragonstone-ring",1,1,1],["@gem",0,0,2]]);
const NAMED={"mystic-water-staff":"Mystic water staff","rune-warhammer":"Rune warhammer","rune-longsword":"Rune longsword","mystic-robe-top":"Mystic robe top","mystic-robe-bottom":"Mystic robe bottom","water-rune":"Water rune","mist-rune":"Mist rune","chaos-rune":"Chaos rune","death-rune":"Death rune","blood-rune":"Blood rune","soul-rune":"Soul rune","watermelon-seed":"Watermelon seed","torstol-seed":"Torstol seed","magic-seed":"Magic seed","seaweed":"Seaweed","battlestaff":"Battlestaff","unpowered-orb":"Unpowered orb","diamond":"Diamond","oak-plank":"Oak plank","runite-bar":"Runite bar","raw-shark":"Raw shark","raw-monkfish":"Raw monkfish","grimy-snapdragon":"Grimy snapdragon","coins":"Coins","shark":"Shark","pirate-boots":"Pirate boots","sanfew-serum-4":"Sanfew serum(4)","edible-seaweed":"Edible seaweed","harpoon":"Harpoon","bucket":"Bucket","crystal-key":"Crystal key","rusty-sword":"Rusty sword","antidote-4":"Antidote++(4)","dragonstone-ring":"Dragonstone ring"};
export const ITEMS=Object.freeze({
 ...SHARED_ITEMS,
 ...Object.fromEntries(Object.entries(NAMED).map(([id,name])=>[id,{id,name}])),
 ...Object.fromEntries(UNIQUE.map(x=>[x.id,{id:x.id,name:x.name}])),
 "clue-scroll-elite":{id:"clue-scroll-elite",name:"Clue scroll (elite)"},
 "brimstone-key":{id:"brimstone-key",name:"Brimstone key"}
});
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Completed Kraken kills must be a whole number from 0 to 1,000,000.");
 return n;
}
export function validateOptions({eliteCAs=false,konarTask=false}={}){
 if(typeof eliteCAs!=="boolean"||typeof konarTask!=="boolean")
  throw new TypeError("Combat Achievements and Konar task options must be booleans.");
}
export function rateOf(id){
 return UNIQUE.find(x=>x.id===id)?.rate??0;
}
export function clueRate(eliteCAs=false){
 if(typeof eliteCAs!=="boolean")throw new TypeError("Elite Combat Achievements must be boolean.");
 return eliteCAs?1/475:1/500;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("Random generator must return a number in [0, 1).");
 return n;
}
function pick(rows,rng){
 const max=rows.reduce((sum,row)=>sum+row[3],0);
 let ticket=unit(rng)*max;
 for(const row of rows){ticket-=row[3];if(ticket<0)return row;}
 return rows.at(-1);
}
function amount(low,high,rng){
 return low===high?low:low+Math.floor(unit(rng)*(high-low+1));
}
// GEM has nested branches with their own 128-ticket tables; do not
// accidentally normalize away the 63/128 empty gem-table outcomes.
export function rollCommon(rng=Math.random){
 let row=pick(MAIN,rng);
 const subtables={"@gem":GEM,"@mega":MEGA,"@talisman":TALISMAN};
 for(let depth=0;depth<5&&row[0].startsWith("@")&&row[0]!=="@nothing";depth++){
  const table=subtables[row[0]];
  if(!table)throw new Error("Unrecognized shared table "+row[0]);
  row=pick(table,rng);
 }
 if(row[0].startsWith("@"))return null;
 return {id:row[0],quantity:amount(row[1],row[2],rng)};
}
export function simulate(kills,{rng=Math.random,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);validateOptions({eliteCAs,konarTask});
 if(typeof rng!=="function")throw new TypeError("Random generator must be a function.");
 const drops=Object.create(null);
 const add=(id,qty=1)=>{if(qty>0)drops[id]=(drops[id]??0)+qty;};
 for(let kill=0;kill<kills;kill++){
  const normal=rollCommon(rng);
  if(normal)add(normal.id,normal.quantity);
  // Unique drops are separate independent rolls, not the 128-ticket table.
  for(const reward of UNIQUE)
   if(unit(rng)<reward.rate)add(reward.id);
  if(unit(rng)<clueRate(eliteCAs))add("clue-scroll-elite");
  if(konarTask&&unit(rng)<1/49)add("brimstone-key");
 }
 return {kills,drops,eliteCAs,konarTask};
}
