// OSRS Chaos Elemental. One minor (5 equal tickets) and one major
// reward per kill, with a Dragon pickaxe pre-roll ahead of the
// 128-ticket ordinary major table. Tertiaries are independent.
// https://oldschool.runescape.wiki/w/Chaos_Elemental
export const MAX_KILLS=1_000_000;
export const PICKAXE_CHANCE=1/256;
export const DRAGON_2H_MAIN_CHANCE=2/128;
export const DRAGON_2H_CHANCE=(1-PICKAXE_CHANCE)*DRAGON_2H_MAIN_CHANCE;
export const PET_CHANCE=1/300;
export const PRIMARY_CHANCE=PICKAXE_CHANCE+DRAGON_2H_CHANCE;
export const UNIQUE=[
 {id:"dragon-2h-sword",name:"Dragon 2h sword",rate:DRAGON_2H_CHANCE},
 {id:"dragon-pickaxe",name:"Dragon pickaxe",rate:PICKAXE_CHANCE},
 {id:"pet-chaos-elemental",name:"Pet chaos elemental",rate:PET_CHANCE}
];
export const DRY_ITEMS=UNIQUE;
// One minor roll in addition to either the pickaxe or ordinary major.
export const MINOR=[
 ["blighted-anglerfish",2],
 ["blighted-karambwan",3],
 ["blighted-super-restore-4",1],
 ["dragon-bones",1],
 ["super-combat-potion-1",1]
];
const table=text=>text.trim().split(/\s+/).map(part=>{
 const [id,min,max,weight]=part.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
// Exactly 128 tickets: weapons 45, runes 21, herbs 14,
// resources 18, other materials 22, and rare drop table 8.
export const MAIN=table("rune-dart:100:100:5 rune-platelegs:1:1:4 rune-plateskirt:1:1:4 rune-2h-sword:1:1:3 rune-battleaxe:1:1:3 rune-full-helm:1:1:3 rune-kiteshield:1:1:3 mystic-air-staff:1:1:3 mystic-water-staff:1:1:3 mystic-earth-staff:1:1:3 mystic-fire-staff:1:1:3 dragon-dagger:1:1:2 dragon-2h-sword:1:1:2 dragon-platelegs:1:1:2 dragon-plateskirt:1:1:2 chaos-rune:300:500:8 blood-rune:100:250:8 rune-arrow:150:150:5 grimy-ranarr-weed:5:8:4 grimy-snapdragon:5:8:4 grimy-avantoe:5:8:3 grimy-kwuarm:5:8:3 coal:75:150:5 mahogany-plank:8:16:5 runite-bar:3:5:4 adamantite-bar:8:12:4 coins:20005:29995:7 blighted-ancient-ice-sack:20:40:5 blighted-karambwan:15:25:4 blighted-anglerfish:10:15:4 wilderness-crabs-teleport:2:2:2 @rare:0:0:8");
// RDT table probabilities are the published unboosted OVERALL
// chances, conditional on the 8/128 table branch (and reaching
// the table after the pickaxe pre-roll). Unlisted outcomes are empty.
// Rings of wealth are not modeled as boosts to the RDT.
export const RARE=[
 ["@nothing",0,1/88.19],["coins",3000,1/97.52],
 ["uncut-sapphire",1,1/409.6],["loop-half-of-key",1,1/101.61],
 ["nature-talisman",1,1/4369.07],["uncut-diamond",1,1/6553.6],
 ["rune-kiteshield",1,1/2048],["dragon-med-helm",1,1/2048],
 ["rune-spear",1,1/2162.01],["rune-javelin",5,1/13107.2],
 ["shield-left-half",1,1/4324.02],["dragon-spear",1,1/5765.37]
];
const NAMES={
 "dragon-2h-sword":"Dragon 2h sword","rune-2h-sword":"Rune 2h sword",
 "pet-chaos-elemental":"Pet chaos elemental",
 "blighted-super-restore-4":"Blighted super restore(4)",
 "super-combat-potion-1":"Super combat potion(1)",
 "blighted-ancient-ice-sack":"Blighted ancient ice sack",
 "clue-scroll-elite":"Clue scroll (elite)",
 "weapon-poison-plus-plus":"Weapon poison(++)",
 "slayers-enchantment":"Slayer's enchantment"
};
const label=id=>NAMES[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([
 ...UNIQUE.map(x=>x.id),...MINOR.map(x=>x[0]),...MAIN.map(x=>x[0]),
 ...RARE.map(x=>x[0]),"weapon-poison-plus-plus",
 "looting-bag","clue-scroll-elite","brimstone-key",
 "larrans-key","slayers-enchantment"
])].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[
 id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}
])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of Chaos Elemental kills from 0 to 1,000,000.");
 return kills;
}
export function validateTask(task){
 if(task!=="none"&&task!=="konar"&&task!=="krystilia")
  throw new RangeError("Choose None, Konar or Krystilia for Slayer task.");
 return task;
}
export function clueRate({eliteCAs=false,ringOfWealth=false}={}){
 if(typeof eliteCAs!=="boolean"||typeof ringOfWealth!=="boolean")
  throw new TypeError("Combat Achievement and ring options must be booleans.");
 return ringOfWealth?(eliteCAs?1/95:1/100):(eliteCAs?1/190:1/200);
}
export function rateOf(id){
 return UNIQUE.find(x=>x.id===id)?.rate??0;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return n;
}
function weighted(rows,rng){
 let r=unit(rng)*rows.reduce((s,x)=>s+x[3],0);
 for(const x of rows){r-=x[3];if(r<0)return x;}
 throw new Error("Drop weights are inconsistent.");
}
function qty(a,b,rng){return a===b?a:a+Math.floor(unit(rng)*(b-a+1));}
function rollRare(rng,add){
 const value=unit(rng);
 let threshold=0;
 for(const [id,count,overall] of RARE){
  threshold+=overall/(8/128);
  if(value<threshold){
   if(id!=="@nothing")add(id,count);
   return;
  }
 }
}
export function simulate(kills,{
 rng=Math.random,task="none",eliteCAs=false,ringOfWealth=false
}={}){
 validateKills(kills);validateTask(task);clueRate({eliteCAs,ringOfWealth});
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let kill=0;kill<kills;kill++){
  const minor=MINOR[Math.floor(unit(rng)*MINOR.length)];
  add(minor[0],minor[1]);
  if(unit(rng)<PICKAXE_CHANCE)add("dragon-pickaxe");
  else {
   const [id,min,max]=weighted(MAIN,rng);
   if(id==="@rare")rollRare(rng,add);
   else add(id,qty(min,max,rng));
  }
  if(unit(rng)<10/128)add("weapon-poison-plus-plus");
  if(unit(rng)<1/3)add("looting-bag");
  if(unit(rng)<clueRate({eliteCAs,ringOfWealth}))add("clue-scroll-elite");
  if(unit(rng)<PET_CHANCE)add("pet-chaos-elemental");
  if(task==="konar"&&unit(rng)<1/59)add("brimstone-key");
  if(task==="krystilia"){
   if(unit(rng)<1/58)add("larrans-key");
   if(unit(rng)<1/30)add("slayers-enchantment");
  }
 }
 return {kills,task,eliteCAs,ringOfWealth,drops};
}
