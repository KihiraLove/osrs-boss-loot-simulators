// The Whisperer reward sequencing and three-hit Bellator vestige.
// Source: https://oldschool.runescape.wiki/w/The_Whisperer
export const MAX_KILLS=1_000_000;
export const PET_RATE=1/2000;
export const UNIQUE=[
 {id:"bellator-vestige",name:"Bellator vestige"},
 {id:"chromium-ingot",name:"Chromium ingot"},
 {id:"sirens-staff",name:"Siren's staff"},
 {id:"virtus-mask",name:"Virtus mask"},
 {id:"virtus-robe-top",name:"Virtus robe top"},
 {id:"virtus-robe-bottom",name:"Virtus robe bottom"},
 {id:"wisp",name:"Wisp"},
 {id:"awakeners-orb",name:"Awakener's orb"},
 {id:"sirenic-tablet",name:"Sirenic tablet"},
 {id:"shadow-quartz",name:"Shadow quartz"}
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
 "bronze-longsword:16:24:1 mithril-longsword:7:10:1 adamant-longsword:9:14:1 battlestaff:70:105:2 dragon-plateskirt:7:10:1 "+
 "pure-essence:280:420:1 iron-ore:88:133:1 coal:303:455:8 gold-ore:88:133:1 mithril-ore:88:133:1 "+
 "adamantite-ore:105:157:8 runite-ore:42:63:2 sapphire:39:59:1 emerald:39:59:1 ruby:39:59:1 "+
 "uncut-ruby:58:87:5 uncut-diamond:58:87:5 dragon-javelin-tips:84:126:8 runite-bolts-unf:84:126:8 raw-monkfish:700:1050:1 "+
 "water-rune:280:420:1 steam-rune:466:700:8 chaos-rune:140:210:1 death-rune:466:700:8 soul-rune:933:1400:2 "+
 "@nothing:0:0:22"
);
const LABELS={
 "bellator-vestige":"Bellator vestige",
 "sirens-staff":"Siren's staff",
 "sirenic-tablet":"Sirenic tablet",
 "shadow-quartz":"Shadow quartz",
 "gold-ring":"Gold ring",
 "runite-bolts-unf":"Runite bolts (unf)",
 "onyx-bolts-e":"Onyx bolts (e)",
 "ancient-brew-2":"Ancient brew(2)",
 "prayer-potion-3":"Prayer potion(3)",
 "clue-scroll-easy":"Clue scroll (easy)",
 "clue-scroll-medium":"Clue scroll (medium)",
 "clue-scroll-hard":"Clue scroll (hard)",
 "clue-scroll-elite":"Clue scroll (elite)"
};
const label=id=>LABELS[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),
 "gold-ring","manta-ray","prayer-potion-3","ancient-brew-2",
 "clue-scroll-easy","clue-scroll-medium","clue-scroll-hard","clue-scroll-elite","brimstone-key"])].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of The Whisperer kills from 0 to 1,000,000.");
 return kills;
}
export function validateOptions({perfect=false,awakened=false}={}){
 if([perfect,awakened].some(v=>typeof v!=="boolean"))
  throw new TypeError("Perfect and awakened options must be booleans.");

}
export const uniqueTableRate=awakened=>awakened?3/64:1/64;
export const vestigeHitRate=awakened=>uniqueTableRate(awakened)*3/8;
export function rateOf(id,awakened=false){
 if(typeof awakened!=="boolean")throw new TypeError("Awakened must be a boolean.");
 const p=uniqueTableRate(awakened);
 if(id==="bellator-vestige")return vestigeHitRate(awakened)/3; // nominal; requires 3 hits
 if(id==="chromium-ingot")return p*3/8;
 if(id==="sirens-staff")return p/8;
 if(["virtus-mask","virtus-robe-top","virtus-robe-bottom"].includes(id))return p/24;
 if(id==="wisp")return PET_RATE;
 if(id==="awakeners-orb")return (1-p)/34;
 if(id==="sirenic-tablet")return (1-p)*(33/34)/25; // base before first-drop pity scaling
 if(id==="shadow-quartz")return (1-p)*(33/34)*(24/25)/200; // base, ignores first-drop boost
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
export function simulate(kills,{rng=Math.random,perfect=false,awakened=false}={}){
 validateKills(kills);validateOptions({perfect,awakened});
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
    if(vestigeProgress===3){add("bellator-vestige");vestigeProgress=0;}
    else add("gold-ring",vestigeProgress);
   }else if(u<6/8)add("chromium-ingot");
   else if(u<7/8)add("sirens-staff");
   else add(["virtus-mask","virtus-robe-top","virtus-robe-bottom"][Math.floor(unit(rng)*3)]);
  }else if(unit(rng)<1/34)add("awakeners-orb");
  else if(!gotTablet&&unit(rng)<1/25){
   // Tablet pity scaling is unknown; use base chance until first tablet.
   add("sirenic-tablet");gotTablet=true;
  }else if(unit(rng)<quartzRate(k,gotQuartz)){
   add("shadow-quartz");gotQuartz=true;
  }else if(unit(rng)<1/5){
   add("manta-ray",3+Math.floor(unit(rng)*2));
   add("prayer-potion-3");add("ancient-brew-2");
  }else{
   const [id,ordinary,perfectAmount]=pickMain(rng);
   if(id!=="@nothing")add(id,perfect?perfectAmount:ordinary);
  }
  if(unit(rng)<PET_RATE)add("wisp");
  if(unit(rng)<1/40)add(clues[Math.floor(unit(rng)*4)]);

 }
 return {kills,perfect,awakened,vestigeProgress,drops};
}
