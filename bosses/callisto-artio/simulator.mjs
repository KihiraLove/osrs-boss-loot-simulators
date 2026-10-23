// Callisto + Artio solo loot: independent kill counts, shared inventory.
// Primary unique outcomes are mutually exclusive per kill; pet is tertiary.
// Wiki https://oldschool.runescape.wiki/w/Callisto and /w/Artio
export const MAX_KILLS=1_000_000;
export const PRIMARY=[
 {id:"claws-of-callisto",name:"Claws of Callisto",callisto:1/196,artio:1/618},
 {id:"dragon-2h-sword",name:"Dragon 2h sword",callisto:1/256,artio:1/358},
 {id:"dragon-pickaxe",name:"Dragon pickaxe",callisto:1/256,artio:1/358},
 {id:"voidwaker-hilt",name:"Voidwaker hilt",callisto:1/360,artio:1/912},
 {id:"tyrannical-ring",name:"Tyrannical ring",callisto:1/512,artio:1/716}
];
export const PET={id:"callisto-cub",name:"Callisto cub",callisto:1/1500,artio:1/2800};
export const UNIQUE=[...PRIMARY,PET];
export const DRY_ITEMS=UNIQUE;
export const PRIMARY_RATE={
 callisto:PRIMARY.reduce((s,x)=>s+x.callisto,0),
 artio:PRIMARY.reduce((s,x)=>s+x.artio,0)
};
const rows=s=>s.trim().split(/\s+/).map(x=>{
 const [id,quantity,weight]=x.split(":");
 return [id,Number(quantity),Number(weight)];
});
// Each ordinary roll: Callisto 126 tickets, Artio 128.
export const CALLISTO_COMMON=rows("mystic-earth-staff:4:2 mystic-robe-top:4:2 mystic-robe-bottom:4:2 rune-pickaxe:5:8 rune-2h-sword:3:3 rune-kiteshield:4:2 rune-platebody:4:2 blood-rune:500:7 death-rune:700:7 chaos-rune:900:7 soul-rune:450:5 steel-cannonball:600:4 uncut-ruby:50:4 uncut-diamond:25:3 uncut-dragonstone:5:2 limpwurt-root:100:5 magic-logs:225:5 mahogany-logs:600:6 red-dragonhide:170:3 coconut:135:2 grimy-toadflax:100:1 grimy-dwarf-weed:45:1 grimy-ranarr-weed:45:1 grimy-snapdragon:45:1 ranarr-seed:11:5 snapdragon-seed:5:5 coins:50000:10 dark-crab:50:5 super-restore-4:10:5 supercompost:225:4 dragon-bones:75:3 blighted-anglerfish:100:1 wilderness-crabs-teleport:4:3");
export const ARTIO_COMMON=rows("dark-crab:9:5 super-restore-4:3:5 rune-2h-sword:1:3 rune-pickaxe:1:12 chaos-rune:300:7 death-rune:220:7 blood-rune:140:7 soul-rune:150:5 steel-cannonball:190:4 uncut-ruby:17:4 uncut-diamond:7:3 uncut-dragonstone:1:2 limpwurt-root:20:5 magic-logs:60:5 mahogany-logs:200:6 dragon-bones:25:3 grimy-toadflax:40:1 coconut:30:2 red-dragonhide:55:3 coins:12000:21 dark-fishing-bait:300:1 supercompost:60:4 yew-seed:1:1 magic-seed:1:1 ranarr-seed:3:5 snapdragon-seed:1:5 palm-tree-seed:1:1");
// Extra 1/3 supply chance per kill with six equally weighted choices.
export const SUPPLY=[
 ["blighted-anglerfish",5,6],["blighted-karambwan",5,6],
 ["blighted-super-restore-3",3,4],["blighted-super-restore-4",3,4],
 ["ranging-potion-2",2,3],["super-combat-potion-2",2,3]
];
export const TERTIARY={
 callisto:[["looting-bag",1/3],["clue-scroll-elite",1/100],
  ["long-bone",1/400],["curved-bone",2/10025]],
 artio:[["looting-bag",1/3],["clue-scroll-elite",1/100],
  ["long-bone",1/400],["curved-bone",1/5012.5]]
};
const knownNames={
 "rune-2h-sword":"Rune 2h sword","dragon-2h-sword":"Dragon 2h sword",
 "ranging-potion-2":"Ranging potion(2)","super-combat-potion-2":"Super combat potion(2)",
 "super-restore-4":"Super restore(4)",
 "blighted-super-restore-3":"Blighted super restore(3)",
 "blighted-super-restore-4":"Blighted super restore(4)",
 "clue-scroll-elite":"Clue scroll (elite)"
};
const label=id=>knownNames[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries([
 ...new Set([...UNIQUE.map(x=>x.id),
 ...CALLISTO_COMMON.map(x=>x[0]),...ARTIO_COMMON.map(x=>x[0]),
 ...SUPPLY.map(x=>x[0]),...TERTIARY.callisto.map(x=>x[0]),
 ...TERTIARY.artio.map(x=>x[0]),"big-bones"])
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
 if(boss!=="callisto"&&boss!=="artio")throw new RangeError("Unknown boss.");
 const ticket=unit(rng);let sum=0;
 for(const item of PRIMARY){sum+=item[boss];if(ticket<sum)return item.id;}
 return null;
}
export function simulate(callistoKills,artioKills,{rng=Math.random,imbuedRingOfWealth=false}={}){
 if(typeof imbuedRingOfWealth!=="boolean")throw new TypeError("Imbued Ring of wealth must be a boolean.");
 validateKills(callistoKills,"Callisto KC");validateKills(artioKills,"Artio KC");
 const drops=Object.create(null);
 const add=(id,q=1)=>{if(q>0)drops[id]=(drops[id]??0)+q;};
 function run(kills,boss){
  const rows=boss==="callisto"?CALLISTO_COMMON:ARTIO_COMMON;
  for(let i=0;i<kills;i++){
   add("big-bones");
   const unique=rollUnique(boss,rng);
   if(unique)add(unique);
   else {const [id,q]=weighted(rows,rng);add(id,q);}
   if(unit(rng)<1/3){
    const [id,min,max]=SUPPLY[Math.floor(unit(rng)*SUPPLY.length)];
    add(id,min+Math.floor(unit(rng)*(max-min+1)));
   }
   for(const [id,p] of TERTIARY[boss])if(unit(rng)<p*(id.startsWith("clue-scroll-")&&imbuedRingOfWealth?2:1))add(id);
   if(unit(rng)<PET[boss])add(PET.id);
  }
 }
 run(callistoKills,"callisto");run(artioKills,"artio");
 return {callistoKills,artioKills,kills:callistoKills+artioKills,drops};
}
