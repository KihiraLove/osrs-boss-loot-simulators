// OSRS Corporeal Beast: solo kill gets one full main-table roll;
// the sigil table and tertiary items are independent of the main roll.
// https://oldschool.runescape.wiki/w/Corporeal_Beast
export const MAX_KILLS=1_000_000;
export const SIGIL_CHANCE=1/585;
export const ARCANE_CHANCE=SIGIL_CHANCE*3/7;
export const SPECTRAL_CHANCE=SIGIL_CHANCE*3/7;
export const ELYSIAN_CHANCE=SIGIL_CHANCE/7;
export const SPIRIT_CHANCE=8/512;
export const ELIXIR_CHANCE=3/512;
export const JAR_CHANCE=1/1000;
export const PET_CHANCE=1/5000;
export const UNIQUE=[
 {id:"pet-dark-core",name:"Pet dark core",rate:PET_CHANCE,rarity:"1/5,000"},
 {id:"elysian-sigil",name:"Elysian sigil",rate:ELYSIAN_CHANCE,rarity:"1/4,095"},
 {id:"spectral-sigil",name:"Spectral sigil",rate:SPECTRAL_CHANCE,rarity:"1/1,365"},
 {id:"arcane-sigil",name:"Arcane sigil",rate:ARCANE_CHANCE,rarity:"1/1,365"},
 {id:"spirit-shield",name:"Spirit shield",rate:SPIRIT_CHANCE,rarity:"8/512"},
 {id:"holy-elixir",name:"Holy elixir",rate:ELIXIR_CHANCE,rarity:"3/512"},
 {id:"jar-of-spirits",name:"Jar of spirits",rate:JAR_CHANCE,rarity:"1/1,000"}
];
export const DRY_ITEMS=UNIQUE;
const table=text=>text.trim().split(/\s+/).map(part=>{
 const [id,min,max,weight]=part.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
// Exactly 512 tickets (weapons/armour 92; runes/ammo 166;
// resources 143; other 99; gem table 12).
export const MAIN=table(
 "mystic-robe-top:1:1:18 mystic-robe-bottom:1:1:18 "+
 "mystic-air-staff:1:1:12 mystic-water-staff:1:1:12 mystic-earth-staff:1:1:12 mystic-fire-staff:1:1:12 spirit-shield:1:1:8 "+
 "soul-rune:250:250:32 runite-bolts:250:250:24 death-rune:300:300:22 onyx-bolts-e:175:175:20 "+
 "steel-cannonball:2000:2000:17 adamant-arrow:750:750:17 law-rune:250:250:17 cosmic-rune:500:500:17 "+
 "raw-shark:70:70:21 pure-essence:2500:2500:21 adamantite-bar:35:35:18 green-dragonhide:100:100:18 "+
 "adamantite-ore:125:125:17 runite-ore:20:20:12 teak-plank:100:100:12 mahogany-logs:150:150:12 magic-logs:75:75:12 "+
 "tuna-potato:30:30:20 white-berries:120:120:17 goat-horn:120:120:17 watermelon-seed:24:24:15 "+
 "coins:20000:50000:12 antidote-plus-plus-4:40:40:10 ranarr-seed:10:10:5 holy-elixir:1:1:3 @gem:0:0:12"
);
// A gem-table hit rolls this 128-ticket table TEN times.
// Removing the empty tickets models wearing a ring of wealth.
export const GEM=table(
 "@nothing:0:0:63 uncut-sapphire:1:1:32 uncut-emerald:1:1:16 uncut-ruby:1:1:8 "+
 "nature-talisman:1:1:3 uncut-diamond:1:1:2 rune-javelin:5:5:1 "+
 "loop-half-of-key:1:1:1 tooth-half-of-key:1:1:1 @mega:0:0:1"
);
// Mega-rare subtable: 113 empty, 8 rune spear, 4 shield half, 3 dragon spear.
export const MEGA=table("@nothing:0:0:113 rune-spear:1:1:8 shield-left-half:1:1:4 dragon-spear:1:1:3");
const NAMES={
 "pet-dark-core":"Pet dark core","jar-of-spirits":"Jar of spirits",
 "onyx-bolts-e":"Onyx bolts (e)","antidote-plus-plus-4":"Antidote++(4)",
 "clue-scroll-elite":"Clue scroll (elite)","rune-javelin":"Rune javelin",
 "goat-horn":"Goat horn"
};
const label=id=>NAMES[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),
 ...GEM.map(x=>x[0]),...MEGA.map(x=>x[0]),"clue-scroll-elite"])]
 .filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[
 id,{id,name:UNIQUE.find(item=>item.id===id)?.name??label(id)}
])));
export const rateOf=id=>UNIQUE.find(x=>x.id===id)?.rate??0;
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of solo Corporeal Beast kills from 0 to 1,000,000.");
 return kills;
}
export function clueRate(eliteCAs=false){
 if(typeof eliteCAs!=="boolean")throw new TypeError("Elite Combat Achievements must be a boolean.");
 return eliteCAs?1/190:1/200;
}
function unit(rng){
 const x=rng();
 if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return x;
}
function weighted(rows,rng){
 const total=rows.reduce((s,r)=>s+r[3],0);
 let ticket=unit(rng)*total;
 for(const row of rows){ticket-=row[3];if(ticket<0)return row;}
 throw new Error("Drop table weights inconsistent.");
}
function quantity(min,max,rng){
 return min===max?min:min+Math.floor(unit(rng)*(max-min+1));
}
function rollGems(rng,add,{ringOfWealth,legendsQuest}){
 const rows=ringOfWealth?GEM.filter(r=>r[0]!=="@nothing"):GEM;
 for(let i=0;i<10;i++){
  const [id,min,max]=weighted(rows,rng);
  if(id==="@nothing")continue;
  if(id==="@mega"){
   const [mega,qty]=weighted(MEGA,rng);
   if(mega!=="@nothing")add(legendsQuest?mega:"nature-talisman",qty);
  }else add(id,quantity(min,max,rng));
 }
}
export function simulate(kills,{
 rng=Math.random,eliteCAs=false,ringOfWealth=false,legendsQuest=true
}={}){
 validateKills(kills);clueRate(eliteCAs);
 if(typeof ringOfWealth!=="boolean"||typeof legendsQuest!=="boolean")
  throw new TypeError("Ring of wealth and Legends' Quest options must be booleans.");
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 for(let kill=0;kill<kills;kill++){
  // Solo: one full 512-ticket common roll is assigned to this player.
  const [id,min,max]=weighted(MAIN,rng);
  if(id==="@gem")rollGems(rng,add,{ringOfWealth,legendsQuest});
  else add(id,quantity(min,max,rng));
  // One sigil table; its three outcomes cannot occur together per kill.
  if(unit(rng)<SIGIL_CHANCE){
   const x=unit(rng)*7;
   add(x<1?"elysian-sigil":x<4?"spectral-sigil":"arcane-sigil");
  }
  if(unit(rng)<JAR_CHANCE)add("jar-of-spirits");
  if(unit(rng)<PET_CHANCE)add("pet-dark-core");
  if(unit(rng)<clueRate(eliteCAs))add("clue-scroll-elite");
 }
 return {kills,eliteCAs,ringOfWealth,legendsQuest,drops};
}
