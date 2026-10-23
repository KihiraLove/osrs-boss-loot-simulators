// Vet'ion + Calvar'ion solo loot: independent kill counts, shared inventory.
// Primary unique outcomes are mutually exclusive per kill; pet is tertiary.
// Wiki https://oldschool.runescape.wiki/w/Vet'ion and /w/Calvar'ion
export const MAX_KILLS=1_000_000;
export const PRIMARY=[
 {id:"skull-of-vetion",name:"Skull of Vet'ion",vetion:1/196,calvarion:1/618},
 {id:"dragon-2h-sword",name:"Dragon 2h sword",vetion:1/256,calvarion:1/358},
 {id:"dragon-pickaxe",name:"Dragon pickaxe",vetion:1/256,calvarion:1/358},
 {id:"voidwaker-blade",name:"Voidwaker blade",vetion:1/360,calvarion:1/912},
 {id:"ring-of-the-gods",name:"Ring of the gods",vetion:1/512,calvarion:1/716}
];
export const PET={id:"vetion-jr",name:"Vet'ion Jr.",vetion:1/1500,calvarion:1/2800};
export const UNIQUE=[...PRIMARY,PET];
export const DRY_ITEMS=UNIQUE;
export const PRIMARY_RATE={
 vetion:PRIMARY.reduce((s,x)=>s+x.vetion,0),
 calvarion:PRIMARY.reduce((s,x)=>s+x.calvarion,0)
};
const rows=s=>s.trim().split(/\s+/).map(x=>{
 const [id,quantity,weight]=x.split(":");
 return [id,Number(quantity),Number(weight)];
});
// Solo Vet'ion common table: 126 tickets. Calvar'ion: 128.
export const VETION_COMMON=rows("mystic-fire-staff:4:2 mystic-water-staff:4:2 mystic-robe-top:4:2 mystic-robe-bottom:4:2 rune-full-helm:4:2 rune-pickaxe:5:8 rune-dart:150:3 rune-knife:150:3 chaos-rune:900:7 death-rune:700:7 blood-rune:500:7 steel-cannonball:550:4 uncut-ruby:50:4 uncut-diamond:25:3 uncut-dragonstone:5:2 gold-ore:675:6 limpwurt-root:60:5 wine-of-zamorak:100:5 magic-logs:225:5 oak-plank:400:5 dragon-bones:150:3 mort-myre-fungus:450:2 grimy-ranarr-weed:100:1 grimy-dwarf-weed:45:1 grimy-snapdragon:45:1 grimy-toadflax:45:1 coins:50000:10 supercompost:225:4 super-restore-4:10:5 blighted-anglerfish:100:1 sanfew-serum-4:20:5 dark-crab:50:5 wilderness-crabs-teleport:4:3");
export const CALVARION_COMMON=rows("dark-crab:8:5 super-restore-4:3:5 ancient-staff:1:3 rune-2h-sword:1:3 rune-pickaxe:1:12 chaos-rune:220:7 death-rune:120:7 blood-rune:180:7 steel-cannonball:180:4 uncut-ruby:17:4 uncut-diamond:7:3 uncut-dragonstone:1:2 gold-ore:200:6 limpwurt-root:19:5 magic-logs:60:5 oak-plank:220:5 dragon-bones:60:3 mort-myre-fungus:120:2 wine-of-zamorak:35:5 grimy-ranarr-weed:60:1 coins:12000:21 yew-seed:1:1 magic-seed:1:1 palm-tree-seed:1:1 supercompost:60:4 sanfew-serum-4:6:5 dark-fishing-bait:280:1");
// Extra 1/3 supply chance per kill with six equally weighted choices.
export const SUPPLY=[
 ["blighted-anglerfish",5,6],["blighted-karambwan",5,6],
 ["blighted-super-restore-3",3,4],["blighted-super-restore-4",3,4],
 ["ranging-potion-2",2,3],["super-combat-potion-2",2,3]
];
export const TERTIARY={
 vetion:[["looting-bag",1/3],["clue-scroll-elite",1/100],
  ["long-bone",1/400],["curved-bone",1/5012.5],["skeleton-champion-scroll",1/5000]],
 calvarion:[["looting-bag",1/3],["clue-scroll-elite",1/100],
  ["long-bone",1/400],["curved-bone",1/5012.5],["skeleton-champion-scroll",1/5000]]
};
const knownNames={
 "rune-2h-sword":"Rune 2h sword",
 "sanfew-serum-4":"Sanfew serum(4)",
 "skeleton-champion-scroll":"Skeleton champion scroll","dragon-2h-sword":"Dragon 2h sword",
 "ranging-potion-2":"Ranging potion(2)","super-combat-potion-2":"Super combat potion(2)",
 "super-restore-4":"Super restore(4)",
 "blighted-super-restore-3":"Blighted super restore(3)",
 "blighted-super-restore-4":"Blighted super restore(4)",
 "clue-scroll-elite":"Clue scroll (elite)"
};
const label=id=>knownNames[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries([
 ...new Set([...UNIQUE.map(x=>x.id),
 ...VETION_COMMON.map(x=>x[0]),...CALVARION_COMMON.map(x=>x[0]),
 ...SUPPLY.map(x=>x[0]),...TERTIARY.vetion.map(x=>x[0]),
 ...TERTIARY.calvarion.map(x=>x[0]),"big-bones"])
].map(id=>[id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}])));
export function validateKills(n,label="kills"){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError(label+" must be a whole number from 0 to 1,000,000.");
 return n;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("Random must return a finite number in [0, 1).");
 return n;
}
function weighted(rows,rng){
 let ticket=unit(rng)*rows.reduce((s,r)=>s+r[2],0);
 for(const row of rows){ticket-=row[2];if(ticket<0)return row;}
 return rows.at(-1);
}
export function rollUnique(boss,rng=Math.random){
 if(boss!=="vetion"&&boss!=="calvarion")throw new RangeError("Unknown boss.");
 const ticket=unit(rng);let sum=0;
 for(const item of PRIMARY){sum+=item[boss];if(ticket<sum)return item.id;}
 return null;
}
export function simulate(vetionKills,calvarionKills,{rng=Math.random}={}){
 validateKills(vetionKills,"Vet'ion KC");validateKills(calvarionKills,"Calvar'ion KC");
 const drops=Object.create(null);
 const add=(id,q=1)=>{if(q>0)drops[id]=(drops[id]??0)+q;};
 function run(kills,boss){
  const rows=boss==="vetion"?VETION_COMMON:CALVARION_COMMON;
  for(let i=0;i<kills;i++){
   add("big-bones");
   const unique=rollUnique(boss,rng);
   if(unique)add(unique);
   else {const [id,q]=weighted(rows,rng);add(id,q);}
   if(unit(rng)<1/3){
    const [id,min,max]=SUPPLY[Math.floor(unit(rng)*SUPPLY.length)];
    add(id,min+Math.floor(unit(rng)*(max-min+1)));
   }
   for(const [id,p] of TERTIARY[boss])if(unit(rng)<p)add(id);
   if(unit(rng)<PET[boss])add(PET.id);
  }
 }
 run(vetionKills,"vetion");run(calvarionKills,"calvarion");
 return {vetionKills,calvarionKills,kills:vetionKills+calvarionKills,drops};
}
