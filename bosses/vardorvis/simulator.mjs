// Vardorvis reward sequencing and three-hit Ultor vestige.
// Source: https://oldschool.runescape.wiki/w/Vardorvis
export const MAX_KILLS=1_000_000;
export const PET_RATE=1/3000;
export const UNIQUE=[
 {id:"ultor-vestige",name:"Ultor vestige"},
 {id:"chromium-ingot",name:"Chromium ingot"},
 {id:"executioners-axe-head",name:"Executioner's axe head"},
 {id:"virtus-mask",name:"Virtus mask"},
 {id:"virtus-robe-top",name:"Virtus robe top"},
 {id:"virtus-robe-bottom",name:"Virtus robe bottom"},
 {id:"butch",name:"Butch"},
 {id:"awakeners-orb",name:"Awakener's orb"},
 {id:"strangled-tablet",name:"Strangled tablet"},
 {id:"blood-quartz",name:"Blood quartz"}
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
 "pure-essence:120:180:1 iron-ore:38:57:1 silver-ore:38:57:1 coal:130:195:8 "+
 "mithril-ore:38:57:1 adamantite-ore:45:67:8 runite-ore:18:27:2 "+
 "sapphire:17:25:1 emerald:17:25:1 ruby:17:25:1 uncut-ruby:25:37:5 uncut-diamond:25:37:5 "+
 "rune-javelin-tips:36:54:8 dragon-javelin-tips:36:54:8 dragon-dart-tip:100:150:2 raw-shark:200:300:1 "+
 "bronze-javelin:42:63:1 mithril-javelin:42:63:1 adamant-javelin:42:63:1 onyx-bolts-e:60:90:1 "+
 "mind-rune:120:180:1 fire-rune:120:180:1 lava-rune:200:300:8 blood-rune:200:300:8 soul-rune:400:600:2 "+
 "@nothing:0:0:22"
);
const LABELS={
 "executioners-axe-head":"Executioner's axe head","ultor-vestige":"Ultor vestige",
 "strangled-tablet":"Strangled tablet","blood-quartz":"Blood quartz",
 "executioners-axe-head":"Executioner's axe head","awakeners-orb":"Awakener's orb",
 "gold-ring":"Gold ring","prayer-potion-3":"Prayer potion(3)",
 "super-combat-potion-2":"Super combat potion(2)",
 "clue-scroll-easy":"Clue scroll (easy)","clue-scroll-medium":"Clue scroll (medium)",
 "clue-scroll-hard":"Clue scroll (hard)","clue-scroll-elite":"Clue scroll (elite)"
};
const label=id=>LABELS[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),
 "gold-ring","tuna-potato","prayer-potion-3","super-combat-potion-2",
 "clue-scroll-easy","clue-scroll-medium","clue-scroll-hard","clue-scroll-elite","brimstone-key"])].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of Vardorvis kills from 0 to 1,000,000.");
 return kills;
}
export function validateOptions({perfect=false,awakened=false,konarTask=false}={}){
 if([perfect,awakened,konarTask].some(v=>typeof v!=="boolean"))
  throw new TypeError("Perfect, awakened and Konar task must be booleans.");
 if(awakened&&konarTask)throw new RangeError("Konar tasks do not apply to awakened Vardorvis.");
}
export const uniqueTableRate=awakened=>awakened?3/136:1/136;
export const vestigeHitRate=awakened=>uniqueTableRate(awakened)*3/8;
export function rateOf(id,awakened=false){
 if(typeof awakened!=="boolean")throw new TypeError("Awakened must be a boolean.");
 const p=uniqueTableRate(awakened);
 if(id==="ultor-vestige")return vestigeHitRate(awakened)/3; // nominal; requires 3 hits
 if(id==="chromium-ingot")return p*3/8;
 if(id==="executioners-axe-head")return p/8;
 if(["virtus-mask","virtus-robe-top","virtus-robe-bottom"].includes(id))return p/24;
 if(id==="butch")return PET_RATE;
 if(id==="awakeners-orb")return (1-p)/80;
 if(id==="strangled-tablet")return (1-p)*(79/80)/25; // base before first-drop pity scaling
 if(id==="blood-quartz")return (1-p)*(79/80)*(24/25)/200; // base, ignores first-drop boost
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
// The first blood quartz improves from 1/200 to 1/50 over the first 300 KC.
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
    if(vestigeProgress===3){add("ultor-vestige");vestigeProgress=0;}
    else add("gold-ring",vestigeProgress);
   }else if(u<6/8)add("chromium-ingot");
   else if(u<7/8)add("executioners-axe-head");
   else add(["virtus-mask","virtus-robe-top","virtus-robe-bottom"][Math.floor(unit(rng)*3)]);
  }else if(unit(rng)<1/80)add("awakeners-orb");
  else if(!gotTablet&&unit(rng)<1/25){
   // Tablet pity scaling is unknown; use base chance until first tablet.
   add("strangled-tablet");gotTablet=true;
  }else if(unit(rng)<quartzRate(k,gotQuartz)){
   add("blood-quartz");gotQuartz=true;
  }else if(unit(rng)<1/5){
   add("tuna-potato",3+Math.floor(unit(rng)*2));
   add("prayer-potion-3");add("super-combat-potion-2");
  }else{
   const [id,ordinary,perfectAmount]=pickMain(rng);
   if(id!=="@nothing")add(id,perfect?perfectAmount:ordinary);
  }
  if(unit(rng)<PET_RATE)add("butch");
  if(unit(rng)<1/40)add(clues[Math.floor(unit(rng)*4)]);
  if(konarTask&&!awakened&&unit(rng)<1/50)add("brimstone-key");
 }
 return {kills,perfect,awakened,konarTask,vestigeProgress,drops};
}
