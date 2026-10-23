import {wealthTable} from "../../shared/rare-tables.mjs";
// Deranged Archaeologist: one exclusive 131-ticket main roll per kill.
// Source: https://oldschool.runescape.wiki/w/Deranged_archaeologist
export const MAX_KILLS=1_000_000;
export const STEEL_RING_CHANCE=3/131;
export const UNIQUE=Object.freeze([{id:"steel-ring",name:"Steel ring",rate:STEEL_RING_CHANCE}]);
export const DRY_ITEMS=UNIQUE;
const table=text=>text.trim().split(/\s+/).map(part=>{
 const [id,min,max,weight]=part.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
export const MAIN=table(
 "steel-ring:1:1:3 black-dhide-body:1:1:6 rune-2h-sword:1:1:3 rune-sword:1:1:4 "+
 "water-rune:100:100:6 mud-rune:40:40:6 rune-knife:25:25:6 dragon-arrow:60:60:1 steel-cannonball:80:80:4 "+
 "@seed:0:0:1 grimy-dwarf-weed:4:4:8 white-berries:10:10:7 runite-limbs:1:1:5 "+
 "black-dragonhide:8:8:5 gold-ore:10:10:6 uncut-diamond:5:5:5 onyx-bolt-tips:6:6:6 "+
 "anchovy-pizza:2:2:4 prayer-potion-3:1:1:8 potato-with-cheese:3:3:8 shark:2:2:8 "+
 "crystal-key:1:1:7 long-bone:1:1:2 @rare:0:0:6 @gem:0:0:6"
);
// Published overall unboosted probabilities. Rare and gem tickets (6/131
// each) share this pool. Rounded probabilities are normalized.
export const RARE=[
 ["@nothing",0,32.08],["coins",3000,133.08],
 ["uncut-sapphire",1,75.53],["loop-half-of-key",1,132.1],
 ["tooth-half-of-key",1,132.1],["uncut-emerald",1,151.06],
 ["uncut-ruby",1,302.13],["runite-bar",1,558.93],
 ["nature-rune",67,931.56],["rune-2h-sword",1,931.56],
 ["rune-battleaxe",1,931.56],["law-rune",45,1397.33],
 ["death-rune",45,1397.33],["steel-arrow",150,1397.33],
 ["rune-arrow",42,1397.33],["adamant-javelin",20,1397.33],
 ["rune-sq-shield",1,1397.33],["dragonstone",1,1397.33],
 ["silver-ore",100,1397.33],["nature-talisman",1,805.67],
 ["uncut-diamond",1,1208.5],["rune-kiteshield",1,2794.67],
 ["dragon-med-helm",1,2794.67],["rune-spear",1,2767.64],
 ["rune-javelin",5,2417.01],["shield-left-half",1,5535.28],
 ["dragon-spear",1,7380.37]
];
// A single 1/131 tree-herb seed branch, weighted by the Wiki's
// published overall drop rates.
export const SEEDS=[
 ["ranarr-seed",1,1091.7],["snapdragon-seed",1,1169.6],
 ["torstol-seed",1,1488.6],["watermelon-seed",15,1559.5],
 ["willow-seed",1,1637.5],["mahogany-seed",1,1819.4],
 ["maple-seed",1,1819.4],["teak-seed",1,1819.4],
 ["yew-seed",1,1819.4],["papaya-tree-seed",1,2339.3],
 ["magic-seed",1,2977.3],["palm-tree-seed",1,3275],
 ["spirit-seed",1,4093.8],["dragonfruit-tree-seed",1,5458.3],
 ["celastrus-seed",1,8187.5],["redwood-tree-seed",1,8187.5]
];
export const FOSSILS=[
 ["unidentified-small-fossil",12/350],
 ["unidentified-medium-fossil",12/700],
 ["unidentified-large-fossil",12/875],
 ["unidentified-rare-fossil",12/3500]
];
const NAMES={
 "steel-ring":"Steel ring","black-dhide-body":"Black d'hide body",
 "rune-2h-sword":"Rune 2h sword","rune-sq-shield":"Rune sq shield",
 "rune-knife":"Rune knife","grimy-dwarf-weed":"Grimy dwarf weed",
 "black-dragonhide":"Black dragonhide","prayer-potion-3":"Prayer potion(3)",
 "uncut-diamond":"Uncut diamond","runite-limbs":"Runite limbs",
 "onyx-bolt-tips":"Onyx bolt tips","numulite":"Numulite",
 "clue-scroll-elite":"Clue scroll (elite)","brimstone-key":"Brimstone key"
};
const label=id=>NAMES[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([
 ...UNIQUE.map(x=>x.id),...MAIN.map(x=>x[0]),
 ...RARE.map(x=>x[0]),...SEEDS.map(x=>x[0]),
 ...FOSSILS.map(x=>x[0]),"bones","numulite","brimstone-key","clue-scroll-elite"
])].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[
 id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}
])));
export const rateOf=id=>UNIQUE.find(x=>x.id===id)?.rate??0;
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of Deranged Archaeologist kills from 0 to 1,000,000.");
 return kills;
}
export function clueRate({eliteCAs=false}={}){
 if(typeof eliteCAs!=="boolean")throw new TypeError("Elite Combat Achievements must be a boolean.");
 return eliteCAs?1/190:1/200;
}
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
function secondary(rows,rng,add){
 const [id,count]=weighted(rows,rng,row=>1/row[2]);
 if(id!=="@nothing")add(id,count);
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);clueRate({eliteCAs});

 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let kill=0;kill<kills;kill++){
  add("bones");
  const [id,min,max]=weighted(MAIN,rng,row=>row[3]);
  if(id==="@seed")secondary(SEEDS,rng,add);
  else if(id==="@rare"||id==="@gem")secondary(wealthTable(RARE,ringOfWealth,2,{reciprocal:true,kind:id==="@gem"?"gem":"rare"}),rng,add);
  else add(id,amount(min,max,rng));
  if(unit(rng)<108/175)add("numulite",amount(5,32,rng));
  // One fossil type may drop per kill; types are mutually exclusive.
  const fossilRoll=unit(rng);
  let threshold=0;
  for(const [fossil,rate] of FOSSILS){
   threshold+=rate;
   if(fossilRoll<threshold){add(fossil);break;}
  }
  if(unit(rng)<clueRate({eliteCAs}))add("clue-scroll-elite");

 }
 return {kills,eliteCAs,drops};
}
