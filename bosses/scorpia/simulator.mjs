// Scorpia drops — OSRS Wiki 128-ticket table with exclusive ward shard pre-roll.
// https://oldschool.runescape.wiki/w/Scorpia
export const MAX_KILLS=1_000_000;
export const SHARD_CHANCE=1/256;
export const ANY_SHARD_CHANCE=1/128;
export const PET_CHANCE=(1-ANY_SHARD_CHANCE)/2000;
export const DRAGON_2H_CHANCE=(1-ANY_SHARD_CHANCE)/128;
// All four Scorpia collection-log drops.
export const UNIQUE=Object.freeze([
 {id:"odium-shard-3",name:"Odium shard 3",rate:SHARD_CHANCE},
 {id:"malediction-shard-3",name:"Malediction shard 3",rate:SHARD_CHANCE},
 {id:"dragon-2h-sword",name:"Dragon 2h sword",rate:DRAGON_2H_CHANCE},
 {id:"scorpias-offspring",name:"Scorpia's offspring",rate:PET_CHANCE}
]);
export const DRY_ITEMS=UNIQUE;
// [sprite id, display name, minimum stack, maximum stack, weight]
// Listed probabilities apply to the ordinary table only (128 tickets).
export const MAIN=Object.freeze([
 [
  "battlestaff",
  "Battlestaff",
  5,
  8,
  6
 ],
 [
  "rune-2h-sword",
  "Rune 2h sword",
  1,
  1,
  5
 ],
 [
  "rune-pickaxe",
  "Rune pickaxe",
  1,
  1,
  5
 ],
 [
  "rune-kiteshield",
  "Rune kiteshield",
  1,
  1,
  5
 ],
 [
  "rune-chainbody",
  "Rune chainbody",
  1,
  1,
  4
 ],
 [
  "rune-platelegs",
  "Rune platelegs",
  1,
  1,
  4
 ],
 [
  "rune-scimitar",
  "Rune scimitar",
  1,
  1,
  4
 ],
 [
  "rune-warhammer",
  "Rune warhammer",
  1,
  1,
  4
 ],
 [
  "mystic-earth-staff",
  "Mystic earth staff",
  1,
  1,
  4
 ],
 [
  "mystic-robe-top",
  "Mystic robe top",
  1,
  1,
  1
 ],
 [
  "mystic-robe-bottom",
  "Mystic robe bottom",
  1,
  1,
  1
 ],
 [
  "dragon-scimitar",
  "Dragon scimitar",
  1,
  1,
  1
 ],
 [
  "dragon-2h-sword",
  "Dragon 2h sword",
  1,
  1,
  1
 ],
 [
  "death-rune",
  "Death rune",
  100,
  150,
  8
 ],
 [
  "blood-rune",
  "Blood rune",
  100,
  150,
  8
 ],
 [
  "chaos-rune",
  "Chaos rune",
  150,
  200,
  8
 ],
 [
  "grimy-kwuarm",
  "Grimy kwuarm",
  10,
  15,
  5
 ],
 [
  "grimy-dwarf-weed",
  "Grimy dwarf weed",
  10,
  15,
  5
 ],
 [
  "grimy-torstol",
  "Grimy torstol",
  10,
  15,
  5
 ],
 [
  "grimy-snapdragon",
  "Grimy snapdragon",
  4,
  7,
  5
 ],
 [
  "uncut-ruby",
  "Uncut ruby",
  15,
  20,
  6
 ],
 [
  "uncut-diamond",
  "Uncut diamond",
  10,
  15,
  4
 ],
 [
  "runite-ore",
  "Runite ore",
  3,
  3,
  4
 ],
 [
  "dragon-javelin-tips",
  "Dragon javelin tips",
  30,
  50,
  4
 ],
 [
  "onyx-bolt-tips",
  "Onyx bolt tips",
  6,
  10,
  2
 ],
 [
  "coins",
  "Coins",
  25002,
  34962,
  7
 ],
 [
  "blighted-anglerfish",
  "Blighted anglerfish",
  15,
  25,
  5
 ],
 [
  "blighted-super-restore-4",
  "Blighted super restore(4)",
  5,
  5,
  5
 ],
 [
  "wilderness-crabs-teleport",
  "Wilderness crabs teleport",
  2,
  2,
  2
 ]
]);
const EXTRA=[
 ["looting-bag","Looting bag"],["ensouled-scorpion-head","Ensouled scorpion head"],
 ["clue-scroll-hard","Clue scroll (hard)"],["brimstone-key","Brimstone key"],
 ["larrans-key","Larran's key"],["slayers-enchantment","Slayer's enchantment"]
];
export const ITEMS=Object.freeze(Object.fromEntries([
 ...MAIN.map(([id,name])=>[id,{id,name}]),
 ...EXTRA.map(([id,name])=>[id,{id,name}]),
 ...UNIQUE.map(item=>[item.id,{id:item.id,name:item.name}])
]));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter 0 to 1,000,000 completed Scorpia kills.");
 return kills;
}
export function clueRate({hardCAs=false,imbuedRingOfWealth=false}={}){
 if(typeof hardCAs!=="boolean"||typeof imbuedRingOfWealth!=="boolean")
  throw new TypeError("Hard Combat Achievements and imbued ring of wealth must be booleans.");
 return (hardCAs?1/95:1/100)*(imbuedRingOfWealth?2:1);
}
export const rateOf=id=>UNIQUE.find(item=>item.id===id)?.rate??0;
function unit(rng){
 const x=rng();
 if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)
  throw new RangeError("RNG must return a finite number between 0 (inclusive) and 1 (exclusive).");
 return x;
}
function weightedMain(rng){
 let ticket=unit(rng)*128;
 for(const row of MAIN){ticket-=row[4];if(ticket<0)return row;}
 return MAIN.at(-1);
}
function amount(min,max,rng){return min===max?min:min+Math.floor(unit(rng)*(max-min+1));}
export function simulate(kills,{rng=Math.random,hardCAs=false,imbuedRingOfWealth=false}={}){
 validateKills(kills);clueRate({hardCAs,imbuedRingOfWealth});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let i=0;i<kills;i++){
  const pre=unit(rng);
  if(pre<ANY_SHARD_CHANCE){
   add(pre<SHARD_CHANCE?"odium-shard-3":"malediction-shard-3");
  }else{
   // The shard pre-roll supersedes ordinary loot and the offspring pet roll.
   const [id,,min,max]=weightedMain(rng);
   add(id,amount(min,max,rng));
   if(unit(rng)<1/2000)add("scorpias-offspring");
  }
  if(unit(rng)<1/3)add("looting-bag");
  if(unit(rng)<1/18)add("ensouled-scorpion-head");
  if(unit(rng)<clueRate({hardCAs,imbuedRingOfWealth}))add("clue-scroll-hard");

 }
 return {kills,hardCAs,imbuedRingOfWealth,drops};
}
