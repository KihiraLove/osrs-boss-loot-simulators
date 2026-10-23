// Duke Sucellus reward sequencing and three-hit Magus vestige.
// Source: https://oldschool.runescape.wiki/w/Duke_Sucellus
export const MAX_KILLS=1_000_000;
export const PET_RATE=1/2500;
export const UNIQUE=[
 {id:"magus-vestige",name:"Magus vestige"},
 {id:"chromium-ingot",name:"Chromium ingot"},
 {id:"eye-of-the-duke",name:"Eye of the Duke"},
 {id:"virtus-mask",name:"Virtus mask"},
 {id:"virtus-robe-top",name:"Virtus robe top"},
 {id:"virtus-robe-bottom",name:"Virtus robe bottom"},
 {id:"baron",name:"Baron"},
 {id:"awakeners-orb",name:"Awakener's orb"},
 {id:"frozen-tablet",name:"Frozen tablet"},
 {id:"ice-quartz",name:"Ice quartz"}
];
export const DRY_ITEMS=UNIQUE.slice(0,8);
// Each standard-table row: [id, normal quantity, perfect quantity, weight].
// The Wiki lists normal/perfect amounts, not a random min/max range.
// Listed published tickets total 78; the remaining 22 are left blank
// rather than silently rescaling published relative item probabilities.
const rows=text=>text.trim().split(/\s+/).map(part=>{
 const [id,ordinary,perfect,weight]=part.split(":");
 return [id,+ordinary,+perfect,+weight];
});
export const MAIN=rows(
 "bronze-chainbody:11:17:1 mithril-chainbody:5:7:1 adamant-chainbody:6:10:1 dragon-platelegs:5:7:1 "+
 "pure-essence:200:300:1 iron-ore:63:95:1 coal:216:325:8 mithril-ore:33:50:1 "+
 "adamantite-ore:75:112:8 runite-ore:30:45:2 sapphire:28:42:1 emerald:28:42:1 ruby:28:42:1 "+
 "uncut-ruby:41:62:5 uncut-diamond:41:62:5 bronze-bar:63:95:1 dragon-arrowtips:166:250:2 "+
 "rune-javelin-tips:60:90:8 dragon-javelin-tips:60:90:8 raw-sea-turtle:200:300:1 "+
 "air-rune:200:300:1 mist-rune:100:150:8 chaos-rune:100:150:9 soul-rune:666:1000:2 "+
 "@nothing:0:0:22"
);
const LABELS={
 "eye-of-the-duke":"Eye of the Duke","awakeners-orb":"Awakener's orb",
 "gold-ring":"Gold ring","prayer-potion-3":"Prayer potion(3)",
 "super-combat-potion-2":"Super combat potion(2)",
 "clue-scroll-easy":"Clue scroll (easy)","clue-scroll-medium":"Clue scroll (medium)",
 "clue-scroll-hard":"Clue scroll (hard)","clue-scroll-elite":"Clue scroll (elite)"
};
const label=id=>LABELS[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),
 "gold-ring","pineapple-pizza","prayer-potion-3","super-combat-potion-2",
 "clue-scroll-easy","clue-scroll-medium","clue-scroll-hard","clue-scroll-elite","brimstone-key"])].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of Duke Sucellus kills from 0 to 1,000,000.");
 return kills;
}
export function validateOptions({perfect=false,awakened=false,konarTask=false}={}){
 if([perfect,awakened,konarTask].some(v=>typeof v!=="boolean"))
  throw new TypeError("Perfect, awakened and Konar task must be booleans.");
}
export const uniqueTableRate=awakened=>awakened?1/30:1/90;
export const vestigeHitRate=awakened=>uniqueTableRate(awakened)*3/8;
export function rateOf(id,awakened=false){
 if(typeof awakened!=="boolean")throw new TypeError("Awakened must be a boolean.");
 const p=uniqueTableRate(awakened);
 if(id==="magus-vestige")return vestigeHitRate(awakened)/3; // nominal; requires 3 hits
 if(id==="chromium-ingot")return p*3/8;
 if(id==="eye-of-the-duke")return p/8;
 if(["virtus-mask","virtus-robe-top","virtus-robe-bottom"].includes(id))return p/24;
 if(id==="baron")return PET_RATE;
 if(id==="awakeners-orb")return (1-p)/48;
 if(id==="frozen-tablet")return (1-p)*(47/48)/25; // initial, not a repeatable reward
 if(id==="ice-quartz")return (1-p)*(47/48)*(24/25)/200; // base, ignores first-drop boost
 return 0;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return n;
}
function pickMain(rng){
 let ticket=unit(rng)*100;
 for(const entry of MAIN){ticket-=entry[3];if(ticket<0)return entry;}
 return MAIN.at(-1);
}
// The first quartz improves from 1/200 to 1/50 over the first 300 KC.
// Exact intermediate scaling is not public; interpolate the denominator.
export function quartzRate(kill,alreadyObtained=false){
 if(!Number.isSafeInteger(kill)||kill<1)throw new RangeError("Kill index must be positive.");
 if(typeof alreadyObtained!=="boolean")throw new TypeError("Quartz state must be a boolean.");
 return alreadyObtained?1/200:1/(200-Math.min(kill,300)/2);
}
export function simulate(kills,{rng=Math.random,perfect=false,awakened=false,konarTask=false}={}){
 validateKills(kills);validateOptions({perfect,awakened,konarTask});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null),add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 let vestigeProgress=0,gotTablet=false,gotQuartz=false;
 const p=uniqueTableRate(awakened);
 const clues=["clue-scroll-easy","clue-scroll-medium","clue-scroll-hard","clue-scroll-elite"];
 for(let k=1;k<=kills;k++){
  if(unit(rng)<p){
   const u=unit(rng);
   if(u<3/8){
    vestigeProgress++;
    if(vestigeProgress===3){add("magus-vestige");vestigeProgress=0;}
    else add("gold-ring",vestigeProgress);
   }else if(u<6/8)add("chromium-ingot");
   else if(u<7/8)add("eye-of-the-duke");
   else add(["virtus-mask","virtus-robe-top","virtus-robe-bottom"][Math.floor(unit(rng)*3)]);
  }else if(unit(rng)<1/48)add("awakeners-orb");
  else if(!gotTablet&&unit(rng)<1/25){
   // Tablet pity scaling is unknown; use base chance until first tablet.
   add("frozen-tablet");gotTablet=true;
  }else if(unit(rng)<quartzRate(k,gotQuartz)){
   add("ice-quartz");gotQuartz=true;
  }else if(unit(rng)<1/5){
   add("pineapple-pizza",3+Math.floor(unit(rng)*2));
   add("prayer-potion-3");add("super-combat-potion-2");
  }else{
   const [id,ordinary,perfectAmount]=pickMain(rng);
   if(id!=="@nothing")add(id,perfect?perfectAmount:ordinary);
  }
  if(unit(rng)<PET_RATE)add("baron");
  if(unit(rng)<1/40)add(clues[Math.floor(unit(rng)*4)]);
  if(konarTask&&unit(rng)<1/50)add("brimstone-key");
 }
 return {kills,perfect,awakened,konarTask,vestigeProgress,drops};
}
