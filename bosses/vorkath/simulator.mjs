import {wealthTable} from "../../shared/rare-tables.mjs";
// Vorkath: two independent 150-ticket regular rolls, guaranteed drops,
// then one independent roll per tertiary. Source: OSRS Wiki, October 2026.
// Table data: RSPSApp/osrsreboxed-db; subtable weights as documented below.
import {RDT} from "../cerberus/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const MAIN=[["rune-longsword","Rune longsword",2,3,5],["rune-kiteshield","Rune kiteshield",2,3,5],["battlestaff","Battlestaff",5,15,4],["dragon-battleaxe","Dragon battleaxe",1,1,2],["dragon-longsword","Dragon longsword",1,1,2],["dragon-platelegs","Dragon platelegs",1,1,2],["dragon-plateskirt","Dragon plateskirt",1,1,2],["chaos-rune","Chaos rune",250,350,6],["death-rune","Death rune",200,300,6],["wrath-rune","Wrath rune",30,60,3],["blue-dragonhide","Blue dragonhide",25,30,8],["green-dragonhide","Green dragonhide",25,30,7],["red-dragonhide","Red dragonhide",20,25,7],["black-dragonhide","Black dragonhide",15,25,7],["dragon-bolts-unf","Dragon bolts (unf)",50,100,8],["dragonstone-bolt-tips","Dragonstone bolt tips",11,25,5],["onyx-bolt-tips","Onyx bolt tips",5,10,4],["rune-dart-tip","Rune dart tip",75,100,3],["dragon-dart-tip","Dragon dart tip",10,50,6],["dragon-arrowtips","Dragon arrowtips",25,50,3],["adamantite-ore","Adamantite ore",10,30,7],["coins","Coins",20000,80000,5],["grapes","Grapes",250,300,5],["magic-logs","Magic logs",50,50,5],["dragon-bones","Dragon bones",15,20,4],["diamond","Diamond",10,20,4],["dragonstone","Dragonstone",2,3,3],["wrath-talisman","Wrath talisman",1,1,3],["@seed","Tree/herb seed",0,0,3],["@bolts","Bolt tip table",0,0,5],["@shark","Shark table",0,0,4],["@nothing","Unspecified table ticket",0,0,2],["@rdt","Rare drop table",0,0,5]];
export const BOLTS=[["diamond-bolt-tips","Diamond bolt tips",25,30,25],["emerald-bolt-tips","Emerald bolt tips",25,30,20],["ruby-bolt-tips","Ruby bolt tips",25,30,20],["dragonstone-bolt-tips","Dragonstone bolt tips",25,30,14],["onyx-bolt-tips","Onyx bolt tips",25,30,7],["sapphire-bolt-tips","Sapphire bolt tips",25,30,5]];
export const SHARKS=[["raw-shark","Raw shark",35,55,3],["shark-lure","Shark lure",70,110,3],["manta-ray","Manta ray",35,55,2]];
export const SEEDS=[["ranarr-seed","Ranarr seed",1,1,0.0023998080153587713],["snapdragon-seed","Snapdragon seed",1,1,0.008904719501335707],["torstol-seed","Torstol seed",1,1,0.008424599831508003],["watermelon-seed","Watermelon seed",15,15,0.0016801075268817202],["willow-seed","Willow seed",1,1,0.0016],["mahogany-seed","Mahogany seed",1,1,0.0014400921658986176],["maple-seed","Maple seed",1,1,0.0014400921658986176],["teak-seed","Teak seed",1,1,0.0014400921658986176],["yew-seed","Yew seed",1,1,0.0014400921658986176],["papaya-tree-seed","Papaya tree seed",1,1,0.0011199462425803561],["magic-seed","Magic seed",1,1,0.0008799718409010911],["palm-tree-seed","Palm tree seed",1,1,0.0008],["spirit-seed","Spirit seed",1,1,0.00064],["dragonfruit-tree-seed","Dragonfruit tree seed",1,1,0.0004800076801228819],["celastrus-seed","Celastrus seed",1,1,0.00032],["redwood-tree-seed","Redwood tree seed",1,1,0.00032]];
// The 3/150 seed branch uses normalized relative weights from rounded
// published effective rates; it is an approximation, not exact seed odds.
export const TERTIARY=[{"id":"scaly-blue-dragonhide","name":"Scaly blue dragonhide","rate":0.1},{"id":"vorkaths-head","name":"Vorkath's head","rate":0.02},{"id":"dragonbone-necklace","name":"Dragonbone necklace","rate":0.001},{"id":"jar-of-decay","name":"Jar of Decay","rate":0.0003333333333333333},{"id":"vorki","name":"Vorki","rate":0.0003333333333333333},{"id":"draconic-visage","name":"Draconic visage","rate":0.0002},{"id":"skeletal-visage","name":"Skeletal visage","rate":0.0002},{"id":"clue-scroll-elite","name":"Clue scroll (elite)","rate":0.015384615384615385}].filter(x=>x.id!=="clue-scroll-elite");
export const UNIQUE=TERTIARY.filter(x=>["vorkaths-head","dragonbone-necklace","jar-of-decay","vorki","draconic-visage","skeletal-visage"].includes(x.id));
export const DRY_ITEMS=UNIQUE;
const NAME_OVERRIDES={"brimstone-key":"Brimstone key","clue-scroll-elite":"Clue scroll (elite)","scaly-blue-dragonhide":"Scaly blue dragonhide"};
const items=[...MAIN.filter(x=>!x[0].startsWith("@")),...BOLTS,...SHARKS,...SEEDS,
 ...RDT.filter(x=>x[0]!=="nothing"),...TERTIARY.map(x=>[x.id,x.name]),
 ["superior-dragon-bones","Superior dragon bones"],["blue-dragonhide","Blue dragonhide"],
 ["brimstone-key","Brimstone key"],["clue-scroll-elite","Clue scroll (elite)"]];
export const ITEMS=Object.freeze(Object.fromEntries(items.map(([id,name])=>[id,{id,name:NAME_OVERRIDES[id]??name}])));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter between 0 and 1,000,000 completed Vorkath kills.");
 return n;
}
export function rateOf(id){
 return TERTIARY.find(x=>x.id===id)?.rate??0;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return finite values in [0, 1).");
 return n;
}
function choose(table,rng,index=4){
 let ticket=unit(rng)*table.reduce((s,r)=>s+r[index],0);
 for(const entry of table){ticket-=entry[index];if(ticket<0)return entry;}
 return table.at(-1);
}
function qty(lo,hi,rng){return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));}
function rollMain(add,rng,ringOfWealth=false){
 let row=choose(MAIN,rng);
 if(row[0]==="@rdt")row=choose(wealthTable(RDT,ringOfWealth,4),rng);
 else if(row[0]==="@bolts")row=choose(BOLTS,rng);
 else if(row[0]==="@shark")row=choose(SHARKS,rng);
 else if(row[0]==="@seed")row=choose(SEEDS,rng);
 if(row[0]==="nothing"||row[0]==="@nothing")return;
 // Shark lures only drop in even-numbered amounts.
 const amount=row[0]==="shark-lure"?(35+Math.floor(unit(rng)*21))*2:qty(row[2],row[3],rng);
 add(row[0],amount);
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if(typeof eliteCAs!=="boolean")
  throw new TypeError("Combat Achievement options must be boolean.");
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let k=1;k<=kills;k++){
  add("superior-dragon-bones",2);add("blue-dragonhide",2);
  rollMain(add,rng,ringOfWealth);rollMain(add,rng,ringOfWealth);
  for(const item of TERTIARY){
   if(item.id==="vorkaths-head"){
    // Guaranteed on the 50th KC; no separate random head roll that kill.
    if(k===50||unit(rng)<item.rate)add(item.id);
   }else if(unit(rng)<item.rate)add(item.id);
  }
  if(unit(rng)<(eliteCAs?1/61:1/65))add("clue-scroll-elite");

 }
 return {kills,drops};
}
