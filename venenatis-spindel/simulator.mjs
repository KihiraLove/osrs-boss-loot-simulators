// Venenatis + Spindel solo loot: independent kill counts, shared inventory.
// Primary unique outcomes are mutually exclusive per kill; pet is tertiary.
// Wiki https://oldschool.runescape.wiki/w/Venenatis and /w/Spindel
export const MAX_KILLS=1_000_000;
export const PRIMARY=[
 {id:"fangs-of-venenatis",name:"Fangs of Venenatis",venenatis:1/196,spindel:1/618},
 {id:"dragon-2h-sword",name:"Dragon 2h sword",venenatis:1/256,spindel:1/358},
 {id:"dragon-pickaxe",name:"Dragon pickaxe",venenatis:1/256,spindel:1/358},
 {id:"voidwaker-gem",name:"Voidwaker gem",venenatis:1/360,spindel:1/912},
 {id:"treasonous-ring",name:"Treasonous ring",venenatis:1/512,spindel:1/716}
];
export const PET={id:"venenatis-spiderling",name:"Venenatis spiderling",venenatis:1/1500,spindel:1/2800};
export const UNIQUE=[...PRIMARY,PET];
export const DRY_ITEMS=UNIQUE;
export const PRIMARY_RATE={
 venenatis:PRIMARY.reduce((s,x)=>s+x.venenatis,0),
 spindel:PRIMARY.reduce((s,x)=>s+x.spindel,0)
};
const rows=s=>s.trim().split(/\s+/).map(x=>{
 const [id,quantity,weight]=x.split(":");
 return [id,Number(quantity),Number(weight)];
});
// Each ordinary roll: Venenatis 126 tickets, Spindel 128.
export const VENENATIS_COMMON=rows("mystic-air-staff:4:2 rune-pickaxe:5:8 rune-dart:150:3 rune-knife:150:5 rune-platelegs:4:2 rune-sq-shield:4:2 dragon-dagger:6:2 chaos-rune:500:7 death-rune:700:7 blood-rune:900:7 diamond-bolts-e:300:5 steel-cannonball:600:4 uncut-ruby:50:1 uncut-diamond:25:8 gold-ore:675:6 onyx-bolt-tips:150:5 magic-logs:225:5 limpwurt-root:100:5 red-spiders-eggs:500:3 unicorn-horn:225:1 uncut-dragonstone:5:2 grimy-ranarr-weed:45:1 grimy-snapdragon:100:1 grimy-toadflax:45:1 battlestaff:12:2 coins:50000:10 supercompost:225:4 antidote-plus-plus-4:20:3 super-restore-4:10:5 dark-crab:50:5 blighted-anglerfish:100:1 wilderness-crabs-teleport:4:3");
export const SPINDEL_COMMON=rows("dark-crab:8:5 super-restore-4:3:5 rune-knife:30:5 rune-pickaxe:1:12 rune-2h-sword:1:3 chaos-rune:180:7 blood-rune:150:7 death-rune:220:7 steel-cannonball:200:4 diamond-bolts-e:60:5 uncut-diamond:7:8 gold-ore:180:6 magic-logs:60:5 limpwurt-root:18:5 onyx-bolt-tips:35:5 red-spiders-eggs:250:3 uncut-dragonstone:1:2 uncut-ruby:14:1 grimy-snapdragon:40:1 unicorn-horn:60:1 coins:14000:21 supercompost:60:4 antidote-plus-plus-4:6:3 dark-fishing-bait:200:1 magic-seed:1:1 palm-tree-seed:1:1");
// Extra 1/3 supply chance per kill with six equally weighted choices.
export const SUPPLY=[
 ["blighted-anglerfish",5,6],["blighted-karambwan",5,6],
 ["blighted-super-restore-3",3,4],["blighted-super-restore-4",3,4],
 ["ranging-potion-2",2,3],["super-combat-potion-2",2,3]
];
export const TERTIARY={
 venenatis:[["looting-bag",1/3],["strange-fruit",1/5],
  ["clue-scroll-elite",1/100],["long-bone",1/400],["curved-bone",1/5012.5]],
 spindel:[["looting-bag",1/3],["strange-fruit",1/5],
  ["clue-scroll-elite",1/100]]
};
const knownNames={
 "rune-2h-sword":"Rune 2h sword",
 "diamond-bolts-e":"Diamond bolts (e)",
 "antidote-plus-plus-4":"Antidote++(4)",
 "red-spiders-eggs":"Red spiders\' eggs","dragon-2h-sword":"Dragon 2h sword",
 "ranging-potion-2":"Ranging potion(2)","super-combat-potion-2":"Super combat potion(2)",
 "super-restore-4":"Super restore(4)",
 "blighted-super-restore-3":"Blighted super restore(3)",
 "blighted-super-restore-4":"Blighted super restore(4)",
 "clue-scroll-elite":"Clue scroll (elite)"
};
const label=id=>knownNames[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries([
 ...new Set([...UNIQUE.map(x=>x.id),
 ...VENENATIS_COMMON.map(x=>x[0]),...SPINDEL_COMMON.map(x=>x[0]),
 ...SUPPLY.map(x=>x[0]),...TERTIARY.venenatis.map(x=>x[0]),
 ...TERTIARY.spindel.map(x=>x[0]),"big-bones"])
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
 if(boss!=="venenatis"&&boss!=="spindel")throw new RangeError("Unknown boss.");
 const ticket=unit(rng);let sum=0;
 for(const item of PRIMARY){sum+=item[boss];if(ticket<sum)return item.id;}
 return null;
}
export function simulate(venenatisKills,spindelKills,{rng=Math.random}={}){
 validateKills(venenatisKills,"Venenatis KC");validateKills(spindelKills,"Spindel KC");
 const drops=Object.create(null);
 const add=(id,q=1)=>{if(q>0)drops[id]=(drops[id]??0)+q;};
 function run(kills,boss){
  const rows=boss==="venenatis"?VENENATIS_COMMON:SPINDEL_COMMON;
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
 run(venenatisKills,"venenatis");run(spindelKills,"spindel");
 return {venenatisKills,spindelKills,kills:venenatisKills+spindelKills,drops};
}
