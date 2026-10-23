// OSRS Kalphite Queen. Each kill gives one 126-ticket normal table
// outcome, one 9-ticket consumable, and independent tertiary rolls.
// Source: https://oldschool.runescape.wiki/w/Kalphite_Queen
// The guaranteed one-time tattered head needs an initial KC and is omitted.
export const MAX_KILLS=1000000;
export const UNIQUE=[
 {id:"kq-head",name:"Kq head",rate:1/128},
 {id:"dragon-chainbody",name:"Dragon chainbody",rate:1/128},
 {id:"dragon-2h-sword",name:"Dragon 2h sword",rate:1/256},
 {id:"dragon-pickaxe",name:"Dragon pickaxe",rate:1/400},
 {id:"jar-of-sand",name:"Jar of Sand",rate:1/2000},
 {id:"kalphite-princess",name:"Kalphite Princess",rate:1/3000}
];
export const DRY_ITEMS=UNIQUE;
export const TERTIARY=[
 {id:"ensouled-kalphite-head",rate:1/20},
 {id:"clue-scroll-elite",rate:1/100},
 ...UNIQUE
];
const rows=s=>s.trim().split(/\s+/).map(part=>{
 const [id,min,max,weight]=part.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
export const MAIN=rows("battlestaff:10:10:5 rune-chainbody:1:1:4 red-dhide-body:1:1:4 rune-knife-pplusplus:25:25:4 lava-battlestaff:1:1:2 death-rune:150:150:6 blood-rune:100:100:6 mithril-arrow:500:500:5 rune-arrow:250:250:3 grimy-toadflax:25:25:2 grimy-ranarr-weed:25:25:2 grimy-snapdragon:25:25:2 grimy-torstol:25:25:2 torstol-seed:2:2:4 watermelon-seed:25:25:3 papaya-tree-seed:2:2:3 palm-tree-seed:2:2:3 magic-seed:2:2:3 runite-bar:3:3:5 bucket-of-sand:100:100:4 gold-ore:250:250:4 magic-logs:60:60:4 uncut-emerald:25:25:3 uncut-ruby:25:25:3 uncut-diamond:25:25:3 wine-of-zamorak:60:60:10 potato-cactus:100:100:8 coins:15000:20000:5 grapes:100:100:5 weapon-poison-plus-plus:5:5:5 cactus-spine:10:10:3 @rare:0:0:1");
export const CONSUMABLES=rows("monkfish:3:3:1 shark:2:2:1 dark-crab:2:2:1 saradomin-brew-4:1:1:1 prayer-potion-4:2:2:1 super-restore-4:1:1:1 super-combat-potion-2:1:1:1 ranging-potion-3:1:1:1 superantipoison-2:1:1:1");
// The single 1/126 rare-drop-table ticket has these published base
// (no Ring of Wealth) overall odds; unlisted results are empty.
export const RDT=[
 ["coins",3000,1/768],["uncut-sapphire",1,1/3225.6],
 ["loop-half-of-key",1,1/800.15],["tooth-half-of-key",1,1/800.15],
 ["uncut-emerald",1,1/6451.2],["uncut-ruby",1,1/12902.4],
 ["runite-bar",1,1/3225.6],["nature-rune",67,1/5376],
 ["rune-2h-sword",1,1/5376],["rune-battleaxe",1,1/5376]
];
const NAME={
 "red-dhide-body":"Red d'hide body",
 "rune-knife-pplusplus":"Rune knife(p++)",
 "weapon-poison-plus-plus":"Weapon poison(++)",
 "rune-2h-sword":"Rune 2h sword",
 "saradomin-brew-4":"Saradomin brew(4)",
 "prayer-potion-4":"Prayer potion(4)",
 "super-restore-4":"Super restore(4)",
 "super-combat-potion-2":"Super combat potion(2)",
 "ranging-potion-3":"Ranging potion(3)",
 "superantipoison-2":"Superantipoison(2)",
 "clue-scroll-elite":"Clue scroll (elite)"
};
const nameOf=id=>NAME[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
const ids=[...new Set([...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),
 ...CONSUMABLES.map(x=>x[0]),...TERTIARY.map(x=>x.id),
 ...RDT.map(x=>x[0]),"brimstone-key"])].filter(x=>!x.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[
 id,{id,name:UNIQUE.find(x=>x.id===id)?.name??nameOf(id)}
])));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter a whole number of Kalphite Queen kills from 0 to 1,000,000.");
 return n;
}
function random(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("Random number must be in [0, 1).");
 return v;
}
function pick(table,rng){
 let r=random(rng)*table.reduce((s,row)=>s+row[3],0);
 for(const row of table){r-=row[3];if(r<0)return row;}
 throw new RangeError("No matching drop-table ticket.");
}
function quantity(min,max,rng){
 return min===max?min:min+Math.floor(random(rng)*(max-min+1));
}
function rare(rng,add){
 let chance=0;const roll=random(rng);
 for(const [id,qty,overall] of RDT){
  chance+=overall*126;
  if(roll<chance){add(id,qty);return;}
 }
}
export function rateOf(id,eliteCAs=false){
 const item=UNIQUE.find(x=>x.id===id);
 if(item)return item.rate;
 if(id==="ensouled-kalphite-head")return 1/20;
 if(id==="clue-scroll-elite")return eliteCAs?1/95:1/100;
 if(id==="brimstone-key")return 1/54;
 return 0;
}
export function simulate(kills,{rng=Math.random,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);
 if(typeof eliteCAs!=="boolean"||typeof konarTask!=="boolean")
  throw new TypeError("Elite Combat Achievements and Konar task settings must be booleans.");
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let i=0;i<kills;i++){
  const [main,min,max]=pick(MAIN,rng);
  if(main==="@rare")rare(rng,add);
  else add(main,quantity(min,max,rng));
  const [id,cmin,cmax]=pick(CONSUMABLES,rng);
  add(id,quantity(cmin,cmax,rng));
  for(const item of TERTIARY)if(random(rng)<rateOf(item.id,eliteCAs))add(item.id);
  if(konarTask&&random(rng)<1/54)add("brimstone-key");
 }
 return {kills,eliteCAs,konarTask,drops};
}
