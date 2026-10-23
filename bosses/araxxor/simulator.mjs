import {wealthTable} from "../../shared/rare-tables.mjs";
// OSRS Araxxor: Harvest / Destroy. Rates: OSRS Wiki (Jul 2026).
import {RDT} from "../cerberus/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const HALBERD=[{id:"noxious-pommel",name:"Noxious pommel"},{id:"noxious-point",name:"Noxious point"},{id:"noxious-blade",name:"Noxious blade"}];
export const SIGNATURE=[...HALBERD,{id:"araxyte-fang",name:"Araxyte fang"}];
export const DRY_ITEMS=[...SIGNATURE,{id:"araxyte-head",name:"Araxyte head",rate:1/250},{id:"jar-of-venom",name:"Jar of venom",rate:1/1500},{id:"nid",name:"Nid",rate:1/3000}];
// [id,name,minimum,maximum,weight], exactly 115 tickets.
export const STANDARD=[
 ["$supplies","Supplies",0,0,15],
 ["rune-kiteshield","Rune kiteshield",2,2,8],["rune-platelegs","Rune platelegs",2,2,8],
 ["dragon-mace","Dragon mace",2,2,6],["rune-2h-sword","Rune 2h sword",5,5,1],["dragon-platelegs","Dragon platelegs",2,2,1],
 ["death-rune","Death rune",250,250,5],["nature-rune","Nature rune",80,80,2],["mud-rune","Mud rune",100,100,1],["blood-rune","Blood rune",180,180,1],
 ["yew-seed","Yew seed",1,1,4],["toadflax-seed","Toadflax seed",4,4,3],["ranarr-seed","Ranarr seed",3,3,1],["snapdragon-seed","Snapdragon seed",3,3,1],["magic-seed","Magic seed",2,2,1],
 ["coal","Coal",120,120,4],["adamantite-ore","Adamantite ore",85,85,4],["raw-shark","Raw shark",21,21,4],["yew-logs","Yew logs",70,70,3],
 ["runite-ore","Runite ore",12,12,2],["raw-shark","Raw shark",100,100,1],["raw-monkfish","Raw monkfish",120,120,1],["pure-essence","Pure essence",1200,1200,1],
 ["spider-cave-teleport","Spider cave teleport",3,3,8],["earth-orb","Earth orb",45,45,6],["araxyte-venom-sack","Araxyte venom sack",6,6,5],
 ["mort-myre-fungus","Mort myre fungus",24,24,4],["antidote-plus-plus-3","Antidote++(3)",6,6,4],["wine-of-zamorak","Wine of zamorak",8,8,3],
 ["red-spiders-eggs","Red spiders' eggs",40,40,2],["araxyte-venom-sack","Araxyte venom sack",12,12,2],["bark","Bark",15,15,1],
 ["$seeds","Tree-herb seeds",0,0,1],["$rdt","Rare drop table",0,0,1]
];
// Relative subtable weights derived from the wiki's rounded effective rates.
export const SEEDS=[
 ["ranarr-seed","Ranarr seed",1,1,115/958.33],["snapdragon-seed","Snapdragon seed",1,1,115/1026.79],
 ["torstol-seed","Torstol seed",1,1,115/1306.82],["watermelon-seed","Watermelon seed",15,15,115/1369.05],
 ["willow-seed","Willow seed",1,1,115/1437.5],["mahogany-seed","Mahogany seed",1,1,115/1597.22],
 ["maple-seed","Maple seed",1,1,115/1597.22],["teak-seed","Teak seed",1,1,115/1597.22],
 ["yew-seed","Yew seed",1,1,115/1597.22],["papaya-tree-seed","Papaya tree seed",1,1,115/2053.57],
 ["magic-seed","Magic seed",1,1,115/2613.64],["palm-tree-seed","Palm tree seed",1,1,115/2875],
 ["spirit-seed","Spirit seed",1,1,115/3593.75],["dragonfruit-tree-seed","Dragonfruit tree seed",1,1,115/4791.67],
 ["celastrus-seed","Celastrus seed",1,1,115/7187.5],["redwood-tree-seed","Redwood tree seed",1,1,115/7187.5]
];
export const ITEMS=Object.freeze(Object.fromEntries([
 ...DRY_ITEMS.map(x=>[x.id,x.name]),
 ...STANDARD.filter(x=>!x[0].startsWith("$")).map(([id,name])=>[id,name]),
 ...SEEDS.map(([id,name])=>[id,name]),
 ...RDT.filter(x=>x[0]!=="nothing").map(([id,name])=>[id,name]),
 ["prayer-potion-4","Prayer potion(4)"],["super-combat-potion-1","Super combat potion(1)"],
 ["shark","Shark"],["wild-pie","Wild pie"],["clue-scroll-elite","Clue scroll (elite)"],
].map(([id,name])=>[id,{id,name}])));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)throw new RangeError("Enter between 0 and 1,000,000 completed kills.");
 return n;
}
export function validateMode(mode){
 if(mode!=="harvest"&&mode!=="destroy")throw new RangeError("Choose Harvest or Destroy.");
 return mode;
}
function unit(rng){
 const n=rng();if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)throw new RangeError("RNG must return [0, 1).");return n;
}
function pick(table,rng){
 let t=unit(rng)*table.reduce((s,row)=>s+row[4],0);
 for(const row of table){t-=row[4];if(t<0)return row;}
 return table.at(-1);
}
function quantity(lo,hi,rng){return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));}
export function rateOf(id,mode="harvest"){
 validateMode(mode);
 if(id==="nid")return mode==="harvest"?1/3000:1/1500;
 if(mode==="destroy")return 0;
 if(HALBERD.some(x=>x.id===id)||id==="araxyte-fang")return 1/600;
 return DRY_ITEMS.find(x=>x.id===id)?.rate??0;
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,mode="harvest",eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);validateMode(mode);
 const drops=Object.create(null),missing=HALBERD.map(x=>x.id);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]||0)+count;};
 for(let k=0;k<kills;k++){
  if(mode==="harvest"){
   // Mutually exclusive 1/150 unique pre-roll: three parts or a fang.
   if(unit(rng)<1/150){
    if(unit(rng)<.75){
     if(missing.length===0)missing.push(...HALBERD.map(x=>x.id));
     add(missing.splice(Math.floor(unit(rng)*missing.length),1)[0]);
    }else add("araxyte-fang");
   }else{
    let chosen=pick(STANDARD,rng);
    if(chosen[0]==="$seeds")chosen=pick(SEEDS,rng);
    else if(chosen[0]==="$rdt")chosen=pick(wealthTable(RDT,ringOfWealth,4),rng);
    if(chosen[0]==="$supplies"){
     add(unit(rng)<.5?"araxyte-venom-sack":"super-combat-potion-1");
     add("prayer-potion-4");
     add(unit(rng)<.5?"shark":"wild-pie",quantity(2,3,rng));
    }else if(chosen[0]!=="nothing")add(chosen[0],quantity(chosen[2],chosen[3],rng));
   }
   if(unit(rng)<1/250)add("araxyte-head");
   if(unit(rng)<1/1500)add("jar-of-venom");

  }
  // Destroy forfeits all above, but leaves clues and doubles Nid.
  if(unit(rng)<(eliteCAs?1/47:1/50))add("clue-scroll-elite");
  if(unit(rng)<rateOf("nid",mode))add("nid");
 }
 return {kills,mode,drops};
}

export function simulateCombined(harvestKills,destroyKills,options={}) {
 validateKills(harvestKills);validateKills(destroyKills);
 const a=simulate(harvestKills,{...options,mode:"harvest"});
 const b=simulate(destroyKills,{...options,mode:"destroy"});
 const drops={...a.drops};
 for(const [id,count] of Object.entries(b.drops))drops[id]=(drops[id]??0)+count;
 return {kills:harvestKills+destroyKills,harvestKills,destroyKills,drops};
}
