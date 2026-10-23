import {wealthTable} from "../../shared/rare-tables.mjs";
// Sarachnis loot: mutually exclusive pre-roll and main drop, separate herb + tertiary.
import {GEM,MEGA,TALISMAN,ITEMS as SHARED_ITEMS} from "../giant-mole/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([
 {id:"sarachnis-cudgel",name:"Sarachnis cudgel",rate:1/384},
 {id:"pristine-spider-silk",name:"Pristine spider silk",rate:1/50},
 {id:"jar-of-eyes",name:"Jar of Eyes",rate:1/2000},
 {id:"sraracha",name:"Sraracha",rate:1/3000}
]);
export const DRY_ITEMS=UNIQUE;
// Published ordinary table: 87 named tickets, 13 unspecified / empty tickets.
export const MAIN=Object.freeze([["battlestaff",8,10,2],["rune-platebody",1,1,2],["rune-med-helm",1,1,2],["rune-2h-sword",1,1,2],["blood-rune",80,100,5],["chaos-rune",175,200,5],["cosmic-rune",125,150,5],["death-rune",80,100,5],["soul-rune",80,100,5],["mithril-arrow",450,600,2],["mithril-bolts",175,225,2],["mithril-ore",60,90,6],["red-dragonhide",15,25,5],["uncut-sapphire",20,30,4],["adamantite-ore",30,40,3],["uncut-emerald",20,30,3],["onyx-bolt-tips",8,10,2],["uncut-ruby",20,30,2],["runite-ore",4,6,1],["uncut-diamond",20,30,1],["coins",17000,25000,6],["dragon-bones",10,15,5],["egg-potato",5,8,5],["weapon-poison-plus-plus",4,6,2],["crystal-key",1,1,1],["spider-carcass",10,10,1],["@gem",0,0,1],["@rare-seed",0,0,2],["@nothing",0,0,13]]);
// Independent herb table: 80 named tickets, 720 empty tickets out of 800.
export const HERBS=Object.freeze([["grimy-kwuarm",10,15,15],["grimy-dwarf-weed",10,15,12],["grimy-cadantine",10,15,12],["grimy-avantoe",5,10,10],["grimy-lantadyme",10,15,9],["grimy-snapdragon",5,10,8],["grimy-ranarr-weed",5,10,8],["grimy-torstol",5,10,6],["@nothing",0,0,720]]);
export const RARE_SEEDS=Object.freeze([["toadflax-seed",1,1,216],["irit-seed",1,1,148],["belladonna-seed",1,1,143],["avantoe-seed",1,1,103],["poison-ivy-seed",1,1,101],["cactus-seed",1,1,96],["potato-cactus-seed",1,1,70],["kwuarm-seed",1,1,69],["snapdragon-seed",1,1,46],["cadantine-seed",1,1,32],["lantadyme-seed",1,1,23],["snape-grass-seed",3,3,20],["dwarf-weed-seed",1,1,14],["torstol-seed",1,1,9]]);
export const PAGES=Object.freeze(["tattered-moon-page","tattered-sun-page","tattered-temple-page"]);
export const TERTIARY=Object.freeze([
 ["giant-egg-sac-full",1/20],["grubby-key",1/15],
 ["pristine-spider-silk",1/50],["jar-of-eyes",1/2000],["sraracha",1/3000]
]);
const NAMES={"dragon-med-helm":"Dragon med helm","sarachnis-cudgel":"Sarachnis cudgel","battlestaff":"Battlestaff","rune-platebody":"Rune platebody","rune-med-helm":"Rune med helm","rune-2h-sword":"Rune 2h sword","blood-rune":"Blood rune","chaos-rune":"Chaos rune","cosmic-rune":"Cosmic rune","death-rune":"Death rune","soul-rune":"Soul rune","mithril-arrow":"Mithril arrow","mithril-bolts":"Mithril bolts","mithril-ore":"Mithril ore","red-dragonhide":"Red dragonhide","uncut-sapphire":"Uncut sapphire","adamantite-ore":"Adamantite ore","uncut-emerald":"Uncut emerald","onyx-bolt-tips":"Onyx bolt tips","uncut-ruby":"Uncut ruby","runite-ore":"Runite ore","uncut-diamond":"Uncut diamond","coins":"Coins","dragon-bones":"Dragon bones","egg-potato":"Egg potato","weapon-poison-plus-plus":"Weapon poison(++)","crystal-key":"Crystal key","spider-carcass":"Spider carcass","grimy-kwuarm":"Grimy kwuarm","grimy-dwarf-weed":"Grimy dwarf weed","grimy-cadantine":"Grimy cadantine","grimy-avantoe":"Grimy avantoe","grimy-lantadyme":"Grimy lantadyme","grimy-snapdragon":"Grimy snapdragon","grimy-ranarr-weed":"Grimy ranarr weed","grimy-torstol":"Grimy torstol","tattered-moon-page":"Tattered moon page","tattered-sun-page":"Tattered sun page","tattered-temple-page":"Tattered temple page","giant-egg-sac-full":"Giant egg sac(full)","grubby-key":"Grubby key","pristine-spider-silk":"Pristine spider silk","jar-of-eyes":"Jar of Eyes","sraracha":"Sraracha","clue-scroll-hard":"Clue scroll (hard)","clue-scroll-elite":"Clue scroll (elite)","toadflax-seed":"Toadflax seed","irit-seed":"Irit seed","belladonna-seed":"Belladonna seed","avantoe-seed":"Avantoe seed","poison-ivy-seed":"Poison ivy seed","cactus-seed":"Cactus seed","potato-cactus-seed":"Potato cactus seed","kwuarm-seed":"Kwuarm seed","snapdragon-seed":"Snapdragon seed","cadantine-seed":"Cadantine seed","lantadyme-seed":"Lantadyme seed","snape-grass-seed":"Snape grass seed","dwarf-weed-seed":"Dwarf weed seed","torstol-seed":"Torstol seed","brimstone-key":"Brimstone key"};
const label=id=>NAMES[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
const ids=new Set([
 ...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),...HERBS.map(x=>x[0]),
 ...RARE_SEEDS.map(x=>x[0]),...PAGES,
 "dragon-med-helm","clue-scroll-hard","clue-scroll-elite","brimstone-key",
 ...TERTIARY.map(x=>x[0])
]);
export const ITEMS=Object.freeze({
 ...SHARED_ITEMS,
 ...Object.fromEntries([...ids].filter(id=>!id.startsWith("@")).map(id=>[id,{id,name:label(id)}]))
});
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Sarachnis kills must be a whole number from 0 to 1,000,000.");
 return n;
}
export function validateOptions({hardCAs=false,eliteCAs=false}={}){
 if([hardCAs,eliteCAs].some(v=>typeof v!=="boolean"))
  throw new TypeError("Combat Achievements must be boolean.");
}
export function rateOf(id){return UNIQUE.find(x=>x.id===id)?.rate??0;}
export function clueRate(tier,enabled=false){
 if(typeof enabled!=="boolean")throw new TypeError("Combat Achievement toggle must be boolean.");
 if(tier==="hard")return enabled?1/38:1/40;
 if(tier==="elite")return enabled?1/57:1/60;
 throw new RangeError("Unknown clue tier.");
}
function unit(rng){
 const value=rng();
 if(typeof value!=="number"||!Number.isFinite(value)||value<0||value>=1)
  throw new RangeError("RNG must return a finite number in [0, 1).");
 return value;
}
function pick(rows,rng){
 let ticket=unit(rng)*rows.reduce((sum,r)=>sum+r[3],0);
 for(const r of rows){ticket-=r[3];if(ticket<0)return r;}
 return rows.at(-1);
}
function quantity(lo,hi,rng){return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));}
// 2/384 dragon med helm, 1/384 cudgel, otherwise one ordinary outcome.
export function rollPrimary(rng=Math.random,ringOfWealth=false){
 const pre=unit(rng)*384;
 if(pre<2)return {id:"dragon-med-helm",quantity:1};
 if(pre<3)return {id:"sarachnis-cudgel",quantity:1};
 let row=pick(MAIN,rng);
 const subtables={"@gem":GEM,"@mega":MEGA,"@talisman":TALISMAN,"@rare-seed":RARE_SEEDS};
 for(let depth=0;row[0].startsWith("@")&&row[0]!=="@nothing";depth++){
  if(depth>6)throw new Error("Unexpected nested drop depth.");
  const table=subtables[row[0]];
  if(!table)throw new Error("Unrecognized shared loot table.");
  row=pick(wealthTable(table,ringOfWealth,3,{nested:true}),rng);
 }
 if(row[0]==="@nothing")return null;
 return {id:row[0],quantity:quantity(row[1],row[2],rng)};
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,hardCAs=false,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);validateOptions({hardCAs,eliteCAs});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null),add=(id,q=1)=>{if(q>0)drops[id]=(drops[id]??0)+q;};
 for(let k=0;k<kills;k++){
  const primary=rollPrimary(rng,ringOfWealth);if(primary)add(primary.id,primary.quantity);
  const herb=pick(HERBS,rng);
  if(herb[0]!=="@nothing")add(herb[0],quantity(herb[1],herb[2],rng));
  // One page at 1/5: choose uniformly from the least-collected types.
  if(unit(rng)<1/5){
   const count=Math.min(...PAGES.map(id=>drops[id]??0));
   const eligible=PAGES.filter(id=>(drops[id]??0)===count);
   add(eligible[Math.floor(unit(rng)*eligible.length)]);
  }
  for(const [id,rate] of TERTIARY)if(unit(rng)<rate)add(id);
  if(unit(rng)<clueRate("hard",hardCAs))add("clue-scroll-hard");
  if(unit(rng)<clueRate("elite",eliteCAs))add("clue-scroll-elite");

 }
 return {kills,drops,hardCAs,eliteCAs};
}
