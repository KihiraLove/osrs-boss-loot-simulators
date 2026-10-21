// Scurrius solo/MVP and non-MVP loot.
// Source: https://oldschool.runescape.wiki/w/Scurrius (21 October 2026)
// A spine is limited to one recipient per group kill. Each simulation
// represents one player's received loot, not every participant's loot.
export const MAX_KILLS=1_000_000;
export const UNIQUE=[
 {id:"scurrius-spine",name:"Scurrius' spine",rate:1/33},
 {id:"scurry",name:"Scurry",rate:1/3000,mvpOnly:true}
];
export const DRY_ITEMS=UNIQUE;
export const GUARANTEED={
 mvp:[["big-bones",1],["raw-rat-meat",1]],
 nonMvp:[["big-bones",1]]
};
const rows=s=>s.trim().split(/\s+/).map(entry=>{
 const [id,min,max,weight]=entry.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
// Exactly 100 tickets. The listed chances for a main MVP loot roll sum to 1.
export const MVP_COMMON=rows("adamant-platebody:1:1:6 rune-med-helm:1:1:6 rune-full-helm:1:1:6 rune-sq-shield:1:1:6 rune-chainbody:1:1:6 rune-battleaxe:1:1:6 adamant-arrow:20:50:6 rune-arrow:20:50:6 chaos-rune:70:125:6 death-rune:40:90:3 law-rune:10:30:3 trout:1:3:6 tuna:1:3:6 shark:1:1:3 lobster:1:3:6 ranging-potion-1:1:1:3 super-strength-1:1:1:3 cheese:1:1:1 prayer-potion-4:1:1:6 coins:1000:9000:6");
// The published non-MVP ordinary rows sum to 32/33. The residual
// 1/33 represents an empty common-loot roll (bones still guaranteed).
export const NON_MVP_COMMON=rows("adamant-arrow:20:35:3 rune-arrow:20:35:3 chaos-rune:40:70:3 death-rune:30:50:3 law-rune:5:15:3 trout:1:3:3 tuna:1:3:3 lobster:1:3:3 shark:1:1:1 ranging-potion-1:1:1:3 super-strength-1:1:1:3 cheese:1:1:1 @nothing:0:0:1");
export const TERTIARY={
 mvp:[
  {id:"clue-scroll-medium",rate:1/25},
  {id:"scurrius-spine",rate:1/33},
  {id:"long-bone",rate:1/400},
  {id:"curved-bone",rate:1/5012.5},
  {id:"scurry",rate:1/3000}
 ],
 nonMvp:[{id:"scurrius-spine",rate:1/33}]
};
const overrides={
 "scurrius-spine":"Scurrius' spine",
 "raw-rat-meat":"Raw rat meat",
 "rune-sq-shield":"Rune sq shield",
 "clue-scroll-medium":"Clue scroll (medium)",
 "ranging-potion-1":"Ranging potion(1)",
 "super-strength-1":"Super strength(1)",
 "prayer-potion-4":"Prayer potion(4)"
};
const title=id=>overrides[id]??id.split("-").map(part=>part[0].toUpperCase()+part.slice(1)).join(" ");
const allIds=[...new Set([...UNIQUE.map(x=>x.id),
 ...MVP_COMMON.map(x=>x[0]),...NON_MVP_COMMON.map(x=>x[0]),
 ...Object.values(GUARANTEED).flat().map(x=>x[0]),
 ...Object.values(TERTIARY).flat().map(x=>x.id)])].filter(x=>!x.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(allIds.map(id=>[
 id,{id,name:UNIQUE.find(x=>x.id===id)?.name??title(id)}
])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of Scurrius kills between 0 and 1,000,000.");
 return kills;
}
export function validateMode(mode){
 if(mode!=="mvp"&&mode!=="nonMvp")
  throw new RangeError("Select Solo/MVP or Non-MVP.");
 return mode;
}
export function rateOf(id,mode="mvp",mediumCAs=false){
 validateMode(mode);
 if(id==="scurrius-spine")return 1/33;
 if(id==="scurry")return mode==="mvp"?1/3000:0;
 if(id==="clue-scroll-medium")return mode==="mvp"?(mediumCAs?1/23:1/25):0;
 if(id==="long-bone")return mode==="mvp"?1/400:0;
 if(id==="curved-bone")return mode==="mvp"?1/5012.5:0;
 return 0;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return n;
}
function roll(table,rng){
 let ticket=unit(rng)*table.reduce((acc,r)=>acc+r[3],0);
 for(const r of table){ticket-=r[3];if(ticket<0)return r;}
 throw new Error("Invalid loot table.");
}
function quantity(min,max,rng){
 return min===max?min:min+Math.floor(unit(rng)*(max-min+1));
}
export function simulate(kills,{rng=Math.random,mode="mvp",mediumCAs=false}={}){
 validateKills(kills);validateMode(mode);
 if(typeof mediumCAs!=="boolean")
  throw new TypeError("Medium Combat Achievements must be checked or unchecked.");
 const drops=Object.create(null);
 const add=(id,amount=1)=>{if(amount>0)drops[id]=(drops[id]??0)+amount;};
 const table=mode==="mvp"?MVP_COMMON:NON_MVP_COMMON;
 for(let k=0;k<kills;k++){
  for(const [id,q] of GUARANTEED[mode])add(id,q);
  const [id,min,max]=roll(table,rng);
  if(id!=="@nothing")add(id,quantity(min,max,rng));
  for(const item of TERTIARY[mode])
   if(unit(rng)<rateOf(item.id,mode,mediumCAs))add(item.id);
 }
 return {kills,mode,mediumCAs,drops};
}
