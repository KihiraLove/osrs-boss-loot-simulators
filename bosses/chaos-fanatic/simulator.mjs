import {wealthTable} from "../../shared/rare-tables.mjs";
// Chaos Fanatic: one exclusive 1/128 shard pre-roll (each shard 1/256)
// before the 128-ticket ordinary table; separate tertiary rolls.
// Source: https://oldschool.runescape.wiki/w/Chaos_Fanatic
export const MAX_KILLS=1_000_000;
export const SHARD_CHANCE=1/256;
export const ANY_SHARD_CHANCE=1/128;
export const PET_CHANCE=1/1000;
export const UNIQUE=[
 {id:"odium-shard-1",name:"Odium shard 1",rate:SHARD_CHANCE},
 {id:"malediction-shard-1",name:"Malediction shard 1",rate:SHARD_CHANCE},
 {id:"pet-chaos-elemental",name:"Pet chaos elemental",rate:PET_CHANCE}
];
export const DRY_ITEMS=UNIQUE;
const table=text=>text.trim().split(/\s+/).map(part=>{
 const [id,min,max,weight]=part.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
// 128 tickets including the 4/128 rare and 4/128 gem branches.
// Paired Zamorak robes and paired emerald/sapphire stacks are single rolls.
export const MAIN=table(
 "battlestaff:5:5:5 splitbark-body:1:1:5 splitbark-legs:1:1:5 @robes:0:0:4 ancient-staff:1:1:1 "+
 "fire-rune:250:250:4 smoke-rune:30:30:4 chaos-rune:175:175:4 blood-rune:50:50:4 "+
 "monkfish:3:3:8 shark:1:1:8 prayer-potion-4:1:1:8 anchovy-pizza:8:8:4 "+
 "coins:499:3998:18 grimy-lantadyme:4:4:8 ring-of-life:1:1:7 "+
 "chaos-talisman:1:1:6 wine-of-zamorak:10:10:6 @gems-pair:0:0:5 "+
 "sinister-key:1:1:4 pure-essence:250:250:2 @rare:0:0:4 @gem:0:0:4"
);
// OSRS Wiki's published unboosted *overall* rare + gem drop probabilities.
// One shared secondary outcome pool covers both 4-ticket branches.
// The denominators are rounded on the Wiki, so normalize their weights.
// Ring of wealth is applied within the shared rare and gem subtables.
export const RARE=[
 ["@nothing",0,47.02],["coins",3000,195.05],
 ["uncut-sapphire",1,110.7],["loop-half-of-key",1,193.61],
 ["tooth-half-of-key",1,193.61],["uncut-emerald",1,221.41],
 ["uncut-ruby",1,442.81],["runite-bar",1,819.2],
 ["nature-rune",67,1365.33],["rune-2h-sword",1,1365.33],
 ["rune-battleaxe",1,1365.33],["law-rune",45,2048],
 ["death-rune",45,2048],["steel-arrow",150,2048],
 ["rune-arrow",42,2048],["adamant-javelin",20,2048],
 ["rune-sq-shield",1,2048],["dragonstone",1,2048],
 ["silver-ore",100,2048],["nature-talisman",1,1180.83],
 ["uncut-diamond",1,1771.24],["rune-kiteshield",1,4096],
 ["dragon-med-helm",1,4096],["rune-spear",1,4056.39],
 ["rune-javelin",5,3542.49],["shield-left-half",1,8112.77],
 ["dragon-spear",1,10817.03]
];
const NAMES={
 "odium-shard-1":"Odium shard 1",
 "malediction-shard-1":"Malediction shard 1",
 "pet-chaos-elemental":"Pet chaos elemental",
 "prayer-potion-4":"Prayer potion(4)",
 "clue-scroll-hard":"Clue scroll (hard)",
 "larrans-key":"Larran's key",
 "slayers-enchantment":"Slayer's enchantment",
 "rune-2h-sword":"Rune 2h sword",
 "rune-sq-shield":"Rune sq shield",
 "wine-of-zamorak":"Wine of Zamorak"
};
const label=id=>NAMES[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([
 ...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),...RARE.map(x=>x[0]),
 "bones","zamorak-monk-top","zamorak-monk-bottom",
 "uncut-emerald","uncut-sapphire","looting-bag","brimstone-key",
 "clue-scroll-hard","larrans-key","slayers-enchantment"
])].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[
 id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}
])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of Chaos Fanatic kills from 0 to 1,000,000.");
 return kills;
}
export function clueRate({hardCAs=false,imbuedRingOfWealth=false}={}){
 if(typeof hardCAs!=="boolean"||typeof imbuedRingOfWealth!=="boolean")
  throw new TypeError("Combat Achievement and ring options must be booleans.");
 return (hardCAs?1/121:1/128)*(imbuedRingOfWealth?2:1);
}
export const rateOf=id=>UNIQUE.find(x=>x.id===id)?.rate??0;
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return n;
}
function weighted(rows,rng,weight){
 let r=unit(rng)*rows.reduce((sum,row)=>sum+weight(row),0);
 for(const row of rows){r-=weight(row);if(r<0)return row;}
 return rows[rows.length-1];
}
const amount=(min,max,rng)=>min===max?min:min+Math.floor(unit(rng)*(max-min+1));
function rollRare(rng,add,ringOfWealth=false,kind="rare"){
 const [id,count]=weighted(wealthTable(RARE,ringOfWealth,2,{reciprocal:true,kind}),rng,row=>1/row[2]);
 if(id!=="@nothing")add(id,count);
}
export function simulate(kills,{rng=Math.random,hardCAs=false,imbuedRingOfWealth=false}={}){
 validateKills(kills);clueRate({hardCAs,imbuedRingOfWealth});
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let kill=0;kill<kills;kill++){
  add("bones");
  const shard=unit(rng);
  if(shard<ANY_SHARD_CHANCE){
   add(shard<SHARD_CHANCE?"odium-shard-1":"malediction-shard-1");
  }else{
   const [id,min,max]=weighted(MAIN,rng,row=>row[3]);
   if(id==="@robes"){
    add("zamorak-monk-top");add("zamorak-monk-bottom");
   }else if(id==="@gems-pair"){
    add("uncut-emerald",6);add("uncut-sapphire",4);
   }else if(id==="@rare"||id==="@gem")rollRare(rng,add,imbuedRingOfWealth,id==="@gem"?"gem":"rare");
   else add(id,amount(min,max,rng));
  }
  if(unit(rng)<1/3)add("looting-bag");
  if(unit(rng)<clueRate({hardCAs,imbuedRingOfWealth}))add("clue-scroll-hard");
  if(unit(rng)<PET_CHANCE)add("pet-chaos-elemental");

 }
 return {kills,hardCAs,imbuedRingOfWealth,drops};
}
