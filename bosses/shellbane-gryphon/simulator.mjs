import {wealthTable} from "../../shared/rare-tables.mjs";
// Shellbane gryphon: current OSRS Wiki table (Belle's folly 1/75 since July 2026).
// Two independent 128-ticket ordinary rolls per eligible kill.
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([
 {id:"belles-folly-tarnished",name:"Belle's folly (tarnished)",rate:1/75},
 {id:"jar-of-feathers",name:"Jar of Feathers",rate:1/2000},
 {id:"gull",name:"Gull",rate:1/3000}
]);
export const DRY_ITEMS=UNIQUE;
export const rateOf=id=>UNIQUE.find(x=>x.id===id)?.rate??0;
// Rows: [id,min,max,weight]. Ordinary table: 103 item tickets plus
// 15 general seed, 5 restricted seed, 6 herb, 5 combat herb, 1 gem = 128.
const rows=s=>s.trim().split(/\s+/).map(t=>{const [id,a,b,w]=t.split(":");return [id,+a,+b,+w];});
export const MAIN=Object.freeze(rows(
 "rune-claws:1:1:10 rune-scimitar:1:1:8 adamant-cannonball:35:50:8 rune-cannonball:20:30:6 "+
 "raw-swordfish:1:1:14 sweetcorn:1:1:10 watermelon:1:1:10 raw-sea-turtle:1:1:4 "+
 "elkhorn-frag:1:1:1 pillar-frag:1:1:1 gryphon-feather:35:50:11 shark-lure:3:5:10 basket:1:1:3 "+
 "@seed:0:0:15 @restricted-seed:0:0:5 @herb:0:0:6 @combat-herb:0:0:5 @gem:0:0:1"
));
export const SEEDS=Object.freeze(rows("potato-seed:1:4:8 onion-seed:1:3:4 cabbage-seed:1:3:2 @other-seeds:0:0:2"));
export const RESTRICTED_SEEDS=Object.freeze(rows("tomato-seed:1:2:8 sweetcorn-seed:1:2:4 strawberry-seed:1:1:2 watermelon-seed:1:1:1 snape-grass-seed:1:1:1"));
export const HERBS=Object.freeze(rows(
 "grimy-guam-leaf:1:1:32 grimy-marrentill:1:1:24 grimy-tarromin:1:1:18 "+
 "grimy-harralander:1:1:14 grimy-ranarr-weed:1:1:11 grimy-irit-leaf:1:1:8 "+
 "grimy-avantoe:1:1:6 grimy-kwuarm:1:1:5 grimy-cadantine:1:1:4 "+
 "grimy-lantadyme:1:1:3 grimy-dwarf-weed:1:1:3"
));
export const COMBAT_HERBS=Object.freeze(rows("grimy-kwuarm:1:1:5 grimy-dwarf-weed:1:1:4 grimy-cadantine:1:1:4 grimy-lantadyme:1:1:3"));
// Shared gem table including nested talismans. The exceptionally rare
// mega-rare subtable is omitted and represented as no modeled loot.
export const GEM=Object.freeze(rows(
 "@nothing:0:0:63 uncut-sapphire:1:1:32 uncut-emerald:1:1:16 uncut-ruby:1:1:8 "+
 "@talisman:0:0:3 uncut-diamond:1:1:2 rune-javelin:5:5:1 "+
 "loop-half-of-key:1:1:1 tooth-half-of-key:1:1:1 @unmodeled:0:0:1"
));
export const TALISMANS=Object.freeze(rows(
 "air-talisman:1:1:10 body-talisman:1:1:10 earth-talisman:1:1:10 "+
 "fire-talisman:1:1:10 mind-talisman:1:1:10 water-talisman:1:1:10 "+
 "cosmic-talisman:1:1:4 chaos-talisman:1:1:3 nature-talisman:1:1:3"
));
const LABELS={
 "belles-folly-tarnished":"Belle's folly (tarnished)",
 "jar-of-feathers":"Jar of Feathers","gull":"Gull",
 "gryphon-feather":"Gryphon feather",
 "clue-scroll-elite":"Clue scroll (elite)",
 "reward-casket-elite":"Reward casket (elite)","brimstone-key":"Brimstone key"
};
const label=id=>LABELS[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([
 ...UNIQUE.map(x=>x.id),
 ...[MAIN,SEEDS,RESTRICTED_SEEDS,HERBS,COMBAT_HERBS,GEM,TALISMANS].flat().map(x=>x[0]),
 "big-bones","gryphon-feather","long-bone","curved-bone",
 "clue-scroll-elite","brimstone-key","reward-casket-elite"
])].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}])));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter 0 to 1,000,000 completed Shellbane gryphon kills.");
 return n;
}
export function clueRate(eliteCAs=false){
 if(typeof eliteCAs!=="boolean")throw new TypeError("Elite CAs must be a boolean.");
 return eliteCAs?1/190:1/200;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value from 0 (inclusive) to 1 (exclusive).");
 return n;
}
function pick(table,rng){
 const total=table.reduce((n,x)=>n+x[3],0);
 let ticket=unit(rng)*total;
 for(const row of table){ticket-=row[3];if(ticket<0)return row;}
 return table.at(-1);
}
function amount(min,max,rng){return min===max?min:min+Math.floor(unit(rng)*(max-min+1));}
export function rollMain(rng=Math.random,ringOfWealth=false){
 let row=pick(MAIN,rng);
 if(row[0]==="@seed")row=pick(SEEDS,rng);
 if(row[0]==="@restricted-seed"||row[0]==="@other-seeds")row=pick(RESTRICTED_SEEDS,rng);
 if(row[0]==="@herb")row=pick(HERBS,rng);
 if(row[0]==="@combat-herb")row=pick(COMBAT_HERBS,rng);
 if(row[0]==="@gem"){
  row=pick(wealthTable(GEM,ringOfWealth,3,{nested:true}),rng);
  if(row[0]==="@talisman")row=pick(TALISMANS,rng);
 }
 if(row[0].startsWith("@"))return null;
 return [row[0],amount(row[1],row[2],rng)];
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if([eliteCAs].some(x=>typeof x!=="boolean"))
  throw new TypeError("Options must be booleans.");

 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let k=0;k<kills;k++){
  add("big-bones");
  add("gryphon-feather",amount(7,10,rng));
  if(unit(rng)<1/75)add("belles-folly-tarnished");
  for(let i=0;i<2;i++){const rolled=rollMain(rng,ringOfWealth);if(rolled)add(rolled[0],rolled[1]);}
  if(unit(rng)<1/2000)add("jar-of-feathers");
  if(unit(rng)<1/3000)add("gull");
  if(unit(rng)<1/400)add("long-bone");
  if(unit(rng)<1/5012.5)add("curved-bone");
  if(unit(rng)<clueRate(eliteCAs))add("clue-scroll-elite");

 }
 return {kills,eliteCAs,drops};
}
