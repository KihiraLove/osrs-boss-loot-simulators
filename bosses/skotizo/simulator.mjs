import {wealthTable} from "../../shared/rare-tables.mjs";
// Skotizo rewards: independent guaranteed, shard, standard, gem and tertiary rolls.
// Sources: https://oldschool.runescape.wiki/w/Skotizo
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([
 {id:"ancient-shard",name:"Ancient shard",rate:1},
 {id:"dark-claw",name:"Dark claw",rate:1/25},
 {id:"skotos",name:"Skotos",rate:1/65},
 {id:"jar-of-darkness",name:"Jar of Darkness",rate:1/200},
 {id:"uncut-onyx",name:"Uncut onyx",rate:1/1000},
 {id:"dark-totem",name:"Dark totem",rate:1/128}
]);
export const DRY_ITEMS=Object.freeze(UNIQUE.filter(item=>item.id!=="ancient-shard"));
export const SHARDS=Object.freeze([
 ["ancient-shard",1,75],["ancient-shard",2,15],
 ["ancient-shard",3,5],["ancient-shard",4,4],["ancient-shard",5,1]
]);
// One separate ordinary roll per kill: 14 seven-ticket outcomes + 1 rare = 99.
export const MAIN=Object.freeze([
 ["rune-platebody",3,7],["rune-platelegs",3,7],["rune-plateskirt",3,7],
 ["death-rune",500,7],["soul-rune",450,7],["blood-rune",450,7],
 ["adamantite-ore",75,7],["grimy-snapdragon",20,7],["grimy-torstol",20,7],
 ["raw-anglerfish",60,7],["runite-bar",20,7],["mahogany-plank",150,7],
 ["battlestaff",25,7],["onyx-bolt-tips",40,7],
 ["shield-left-half",1,1]
]);
export const GEM=Object.freeze([
 ["uncut-dragonstone",10,9],["uncut-onyx",1,1],["@nothing",0,990]
]);
export const TOTEM_PIECES=Object.freeze([
 "dark-totem-base","dark-totem-middle","dark-totem-top"
]);
export const TERTIARY=Object.freeze([
 ["ensouled-demon-head",1/10],["dark-claw",1/25],["skotos",1/65],
 ["jar-of-darkness",1/200]
]);
const NAME={
 "clue-scroll-hard":"Clue scroll (hard)",
 "clue-scroll-elite":"Clue scroll (elite)",
 "jar-of-darkness":"Jar of Darkness",
 "skotos":"Skotos","dark-claw":"Dark claw",
 "ancient-shard":"Ancient shard","dark-totem":"Dark totem",
 "dark-totem-base":"Dark totem base","dark-totem-middle":"Dark totem middle",
 "dark-totem-top":"Dark totem top",
 "ensouled-demon-head":"Ensouled demon head",
 "shield-left-half":"Shield left half","uncut-onyx":"Uncut onyx",
 "uncut-dragonstone":"Uncut dragonstone",
 "brimstone-key":"Brimstone key"
};
const label=id=>NAME[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
const ids=[...new Set([
 ...UNIQUE.map(x=>x.id),...SHARDS.map(x=>x[0]),...MAIN.map(x=>x[0]),
 ...GEM.filter(x=>!x[0].startsWith("@")).map(x=>x[0]),
 ...TOTEM_PIECES,...TERTIARY.map(x=>x[0]),
 "infernal-ashes","clue-scroll-hard","clue-scroll-elite","brimstone-key"
])];
export const ITEMS=Object.freeze(Object.fromEntries(
 ids.map(id=>[id,{id,name:label(id)}])
));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Skotizo kills must be a whole number from 0 to 1,000,000.");
 return n;
}
export function validateOptions({eliteCAs=false}={}){
 if(typeof eliteCAs!=="boolean")
  throw new TypeError("Combat Achievements must be boolean.");
}
export function rateOf(id){
 return UNIQUE.find(item=>item.id===id)?.rate??0;
}
export function eliteClueRate(eliteCAs=false){
 if(typeof eliteCAs!=="boolean")throw new TypeError("Elite Combat Achievements must be a boolean.");
 return eliteCAs?1/4:1/5;
}
function unit(rng){
 const x=rng();
 if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)
  throw new RangeError("Random generator must produce finite numbers in [0, 1).");
 return x;
}
function choose(table,rng){
 let ticket=unit(rng)*table.reduce((sum,row)=>sum+row[2],0);
 for(const row of table){ticket-=row[2];if(ticket<0)return row;}
 return table.at(-1);
}
// The 1/32 totem-table roll is shared: 1/4 whole totem,
// otherwise award the least-held piece, resolving ties base > middle > top.
export function pickTotem(drops,rng=Math.random){
 if(!drops||typeof drops!=="object")throw new TypeError("Drop inventory is required.");
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if(unit(rng)<1/4)return "dark-totem";
 let min=Infinity;
 for(const id of TOTEM_PIECES)min=Math.min(min,drops[id]??0);
 return TOTEM_PIECES.find(id=>(drops[id]??0)===min);
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);validateOptions({eliteCAs});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,q=1)=>{if(q>0)drops[id]=(drops[id]??0)+q;};
 for(let k=0;k<kills;k++){
  // Guaranteed each kill. Hard clue restrictions / scroll-box state not modeled.
  add("infernal-ashes");add("clue-scroll-hard");
  // The drop database flattens the 100-ticket shard roll and the 99-ticket
  // ordinary table into 199; these are actually two independent rolls.
  const shard=choose(SHARDS,rng);add(shard[0],shard[1]);
  const ordinary=choose(MAIN,rng);add(ordinary[0],ordinary[1]);
  // Separate gem table: 9/1000 dragonstones, 1/1000 onyx.
  const gem=choose(wealthTable(GEM,ringOfWealth,3,{nested:true}),rng);if(gem[0]!=="@nothing")add(gem[0],gem[1]);
  // Independent tertiary rolls can occur together.
  for(const [id,p] of TERTIARY)if(unit(rng)<p)add(id);
  if(unit(rng)<1/32)add(pickTotem(drops,rng));
  if(unit(rng)<eliteClueRate(eliteCAs))add("clue-scroll-elite");

 }
 return {kills,drops,eliteCAs};
}
