// Grotesque Guardians: two primary rolls, one dust drop and independent tertiaries.
// https://oldschool.runescape.wiki/w/Grotesque_Guardians
export const MAX_KILLS=1_000_000;
export const PRIMARY=[
 {id:"granite-maul",name:"Granite maul",rate:1/250},
 {id:"granite-gloves",name:"Granite gloves",rate:1/500},
 {id:"granite-ring",name:"Granite ring",rate:1/500},
 {id:"granite-hammer",name:"Granite hammer",rate:1/750},
 {id:"black-tourmaline-core",name:"Black tourmaline core",rate:1/1000}
];
export const PRIMARY_RATE=PRIMARY.reduce((sum,x)=>sum+x.rate,0);
export const OTHER_RARES=[
 {id:"adamant-boots",name:"Adamant boots",rate:(1-PRIMARY_RATE)/142,perRoll:true},
 {id:"noon",name:"Noon",rate:1/3000},
 {id:"jar-of-stone",name:"Jar of stone",rate:1/5000}
];
export const UNIQUE=[...PRIMARY,...OTHER_RARES];
export const DRY_ITEMS=UNIQUE;
const rows=text=>text.trim().split(/\s+/).map(x=>{
 const [id,lo,hi,weight]=x.split(":");
 return [id,Number(lo),Number(hi),Number(weight)];
});
// Standard table: exactly 142 tickets. Bundle potions are a single 6-ticket entry.
export const MAIN=rows(
 "rune-pickaxe:1:1:6 rune-full-helm:1:1:5 rune-platelegs:1:1:5 "+
 "rune-2h-sword:1:1:4 rune-battleaxe:1:1:3 dragon-longsword:1:1:1 "+
 "adamant-boots:1:1:1 dragon-med-helm:1:1:1 "+
 "mushroom-potato:4:6:10 saradomin-brew-4:2:2:8 @potions:0:0:6 "+
 "prayer-potion-4:1:2:4 "+
 "gold-ore:40:50:7 adamantite-bar:25:40:6 gold-bar:35:50:6 "+
 "mithril-bar:35:45:6 coal:180:250:5 runite-ore:3:6:4 runite-bar:3:5:3 "+
 "@shark:0:0:4 "+
 "coins:10000:20000:10 chaos-rune:100:150:8 @coins25000:25000:25000:5 "+
 "crystal-key:1:1:5 death-rune:90:130:5 dragon-dart-tip:15:25:5 "+
 "diamond-bolt-tips:100:150:3 dragonstone-bolt-tips:20:40:2 "+
 "onyx-bolt-tips:10:15:2 dragon-arrowtips:50:150:1 soul-rune:20:40:1"
);
// A four-ticket shark subtable: 1.5, 1.5, 1 tickets.
export const SHARK=[
 ["raw-shark",20,20,1.5],["shark-lure",40,40,1.5],["raw-sea-turtle",20,20,1]
];
const NAMES={
 "jar-of-stone":"Jar of stone","black-tourmaline-core":"Black tourmaline core",
 "rune-2h-sword":"Rune 2h sword","saradomin-brew-4":"Saradomin brew(4)",
 "prayer-potion-4":"Prayer potion(4)","magic-potion-2":"Magic potion(2)",
 "ranging-potion-2":"Ranging potion(2)","super-combat-potion-2":"Super combat potion(2)",
 "clue-scroll-elite":"Clue scroll (elite)"
};
const label=id=>NAMES[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([
 ...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),...SHARK.map(x=>x[0]),
 "granite-dust","magic-potion-2","ranging-potion-2",
 "super-combat-potion-2","clue-scroll-elite","brimstone-key"
])].filter(x=>!x.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[
 id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}
])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Grotesque Guardians kills must be whole numbers from 0 to 1,000,000.");
 return kills;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("Random source must yield numbers in [0, 1).");
 return n;
}
function qty(lo,hi,rng){return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));}
function pick(table,rng,weight){
 let ticket=unit(rng)*weight;
 for(const row of table){ticket-=row[3];if(ticket<0)return row;}
 return table.at(-1);
}
export function rollPrimary(rng=Math.random){
 const roll=unit(rng);
 let total=0;
 for(const item of PRIMARY){total+=item.rate;if(roll<total)return item.id;}
 return null;
}
export function rateOf(id){
 const primary=PRIMARY.find(x=>x.id===id);
 if(primary)return primary.rate;
 return OTHER_RARES.find(x=>x.id===id)?.rate??0;
}
export function simulate(kills,{rng=Math.random,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("Random source must be a function.");
 if(typeof eliteCAs!=="boolean"||typeof konarTask!=="boolean")
  throw new TypeError("Combat Achievements and Konar task options must be booleans.");
 const drops=Object.create(null),add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let i=0;i<kills;i++){
  add("granite-dust",qty(50,100,rng));
  for(let roll=0;roll<2;roll++){
   const unique=rollPrimary(rng);
   if(unique){add(unique);continue;}
   let [id,lo,hi]=pick(MAIN,rng,142);
   if(id==="@shark")([id,lo,hi]=pick(SHARK,rng,4));
   else if(id==="@potions"){
    add("magic-potion-2");add("ranging-potion-2");add("super-combat-potion-2");continue;
   }else if(id==="@coins25000")id="coins";
   add(id,qty(lo,hi,rng));
  }
  if(unit(rng)<1/3000)add("noon");
  if(unit(rng)<1/5000)add("jar-of-stone");
  if(unit(rng)<(eliteCAs?1/218:1/230))add("clue-scroll-elite");
  if(konarTask&&unit(rng)<1/44)add("brimstone-key");
 }
 return {kills,drops};
}
