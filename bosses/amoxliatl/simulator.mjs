// Amoxliatl, repeatable post-quest fight. See OSRS Wiki / Amoxliatl.
// Each kill: two rolls from the 58-ticket primary table, one frozen-tear
// quantity roll, and independent tertiary drops. Rates are per completed kill.
export const MAX_KILLS=1_000_000;
export const UNIQUE=[
 {id:"pendant-of-ates-inert",name:"Pendant of ates (inert)",rate:1/25},
 {id:"glacial-temotli",name:"Glacial temotli",rate:1/100},
 {id:"moxi",name:"Moxi",rate:1/3000}
];
export const DRY_ITEMS=[...UNIQUE,
 {id:"tooth-half-of-key-moon",name:"Tooth half of key (moon key)",rate:1/125}
];
export const TERTIARY=[
 ...DRY_ITEMS,
 {id:"clue-scroll-elite",name:"Clue scroll (elite)",rate:1/200},
 {id:"brimstone-key",name:"Brimstone key",rate:1/54}
];
// Each standard drop is one ticket from the mutually exclusive 58-ticket
// primary table. [id, name, minimum quantity, maximum quantity, weight].
export const COMMON=[
 ["rune-mace","Rune mace",1,1,2],
 ["rune-pickaxe","Rune pickaxe",1,1,2],
 ["rune-platebody","Rune platebody",1,1,1],
 ["rune-platelegs","Rune platelegs",1,1,1],
 ["water-rune","Water rune",200,400,5],
 ["chaos-rune","Chaos rune",30,60,4],
 ["death-rune","Death rune",20,40,4],
 ["blood-rune","Blood rune",15,30,4],
 ["soul-rune","Soul rune",30,45,4],
 ["nature-rune","Nature rune",30,60,4],
 ["coal","Coal",20,30,5],
 ["gold-ore","Gold ore",20,30,5],
 ["adamantite-ore","Adamantite ore",5,10,4],
 ["prayer-potion-3","Prayer potion(3)",1,1,2],
 ["runite-ore","Runite ore",1,1,2],
 ["blessed-bone-shards","Blessed bone shards",60,100,2],
 ["water-orb","Water orb",10,20,2],
 ["water-talisman","Water talisman",1,1,2],
 ["huasca-seed","Huasca seed",1,1,1],
 ["$gem","Gem table",0,0,2]
];
// 16,384-ticket conditional gem table, preserving the reported per-roll
// rates (including "Nothing"). Ring of wealth is not modelled.
export const GEM=[
 ["nothing","Nothing",0,0,8177],
 ["uncut-sapphire","Uncut sapphire",1,1,4096],
 ["uncut-emerald","Uncut emerald",1,1,2048],
 ["uncut-ruby","Uncut ruby",1,1,1024],
 ["nature-talisman","Nature talisman",1,1,384],
 ["uncut-diamond","Uncut diamond",1,1,256],
 ["loop-half-of-key","Loop half of key",1,1,128],
 ["tooth-half-of-key","Tooth half of key",1,1,128],
 ["rune-javelin","Rune javelin",5,5,128],
 ["rune-spear","Rune spear",1,1,8],
 ["shield-left-half","Shield left half",1,1,4],
 ["dragon-spear","Dragon spear",1,1,3]
];
export const ITEMS=Object.freeze(Object.fromEntries([
 ["frozen-tear","Frozen tear"],
 ...COMMON.filter(row=>row[0]!=="$gem").map(([id,name])=>[id,name]),
 ...GEM.filter(row=>row[0]!=="nothing").map(([id,name])=>[id,name]),
 ...TERTIARY.map(item=>[item.id,item.name])
].map(([id,name])=>[id,{id,name}])));

export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter between 0 and 1,000,000 completed kills.");
 return kills;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("Random generator must return a value in [0, 1).");
 return n;
}
function weighted(rows,rng){
 const total=rows.reduce((sum,row)=>sum+row[4],0);
 let ticket=unit(rng)*total;
 for(const row of rows){ticket-=row[4];if(ticket<0)return row;}
 return rows.at(-1);
}
function quantity(lo,hi,rng){
 if(lo===hi)return lo;
 return lo+Math.floor(unit(rng)*(hi-lo+1));
}
export function rateOf(id){
 return TERTIARY.find(item=>item.id===id)?.rate??0;
}
export function simulate(kills,{rng=Math.random,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 for(let k=0;k<kills;k++){
  // Guaranteed frozen-tear roll, distinct from the two primary loot rolls.
  const tear=unit(rng);
  if(tear<.6)add("frozen-tear",quantity(2,4,rng));
  else if(tear<.9)add("frozen-tear",quantity(5,10,rng));
  else add("frozen-tear",quantity(10,20,rng));

  for(let roll=0;roll<2;roll++){
   const table=weighted(COMMON,rng);
   const item=table[0]==="$gem"?weighted(GEM,rng):table;
   if(item[0]!=="nothing")add(item[0],quantity(item[2],item[3],rng));
  }
  for(const item of DRY_ITEMS)if(unit(rng)<item.rate)add(item.id);
  if(unit(rng)<(eliteCAs?1/190:1/200))add("clue-scroll-elite");
  if(konarTask&&unit(rng)<1/54)add("brimstone-key");
 }
 return {kills,drops};
}
