// Lunar Chest, all three Moons of Peril defeated before every chest.
// Source: https://oldschool.runescape.wiki/w/Lunar_Chest
export const MAX_KILLS=1_000_000;
export const MOON_RATE=1/56;
export const SETS=Object.freeze([
 {id:"eclipse",name:"Eclipse Moon",items:[
  {id:"eclipse-atlatl",name:"Eclipse atlatl"},
  {id:"eclipse-moon-helm",name:"Eclipse moon helm"},
  {id:"eclipse-moon-chestplate",name:"Eclipse moon chestplate"},
  {id:"eclipse-moon-tassets",name:"Eclipse moon tassets"}]},
 {id:"blood",name:"Blood Moon",items:[
  {id:"dual-macuahuitl",name:"Dual macuahuitl"},
  {id:"blood-moon-helm",name:"Blood moon helm"},
  {id:"blood-moon-chestplate",name:"Blood moon chestplate"},
  {id:"blood-moon-tassets",name:"Blood moon tassets"}]},
 {id:"blue",name:"Blue Moon",items:[
  {id:"blue-moon-spear",name:"Blue moon spear"},
  {id:"blue-moon-helm",name:"Blue moon helm"},
  {id:"blue-moon-chestplate",name:"Blue moon chestplate"},
  {id:"blue-moon-tassets",name:"Blue moon tassets"}]}
]);
export const UNIQUE=Object.freeze(SETS.flatMap(set=>set.items));
export const DRY_ITEMS=UNIQUE;
export const ANY_UNIQUE_RATE=1-(1-MOON_RATE)**3;
// [id, name, minimum, maximum, ticket count]. Exactly 30 tickets per
// ordinary roll, rolled six times per chest ONLY if no moon gives a unique.
export const COMMON=Object.freeze([
 ["atlatl-dart","Atlatl dart",72,120,5],
 ["blessed-bone-shards","Blessed bone shards",160,179,2],
 ["wyrmling-bones","Wyrmling bones",42,54,1],
 ["sun-kissed-bones","Sun-kissed bones",6,12,3],
 ["swamp-tar","Swamp tar",79,119,4],
 ["water-orb","Water orb",30,45,2],
 ["supercompost","Supercompost",6,12,3],
 ["soft-clay","Soft clay",15,25,3],
 ["grimy-harralander","Grimy harralander",12,18,3],
 ["grimy-irit-leaf","Grimy irit leaf",12,18,1],
 ["maple-seed","Maple seed",1,2,2],
 ["yew-seed","Yew seed",1,1,1]
]);
export const ITEMS=Object.freeze(Object.fromEntries([
 ...UNIQUE.map(item=>[item.id,item]),
 ...COMMON.map(([id,name])=>[id,{id,name}])
]));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter 0 to 1,000,000 complete three-moon chests.");
 return n;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite number between 0 and 1 (exclusive).");
 return n;
}
function pickCommon(rng){
 let ticket=unit(rng)*30;
 for(const row of COMMON){ticket-=row[4];if(ticket<0)return row;}
 return COMMON.at(-1);
}
function amount(lo,hi,rng){
 return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));
}
export function rateOf(id){
 return UNIQUE.some(item=>item.id===id)?MOON_RATE/4:0;
}
export function simulate(kills,{rng=Math.random}={}){
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,amount=1)=>{drops[id]=(drops[id]??0)+amount;};
 const obtained=SETS.map(()=>new Set());
 let uniqueChests=0,uniqueDrops=0;
 for(let chest=0;chest<kills;chest++){
  let hasUnique=false;
  for(let moon=0;moon<SETS.length;moon++){
   if(unit(rng)>=MOON_RATE)continue;
   hasUnique=true;uniqueDrops++;
   const items=SETS[moon].items,seen=obtained[moon];
   // Until all four are obtained, choose uniformly from missing pieces.
   // Once completed, ALL four are eligible again independently.
   const pool=seen.size===items.length?items:items.filter(item=>!seen.has(item.id));
   const item=pool[Math.floor(unit(rng)*pool.length)];
   add(item.id);seen.add(item.id);
  }
  if(hasUnique){uniqueChests++;continue;}
  for(let roll=0;roll<6;roll++){
   const [id,,lo,hi]=pickCommon(rng);
   add(id,amount(lo,hi,rng));
  }
 }
 return {kills,chests:kills,uniqueChests,uniqueDrops,drops,
  completedSets:SETS.map((set,i)=>({id:set.id,completed:obtained[i].size===4}))};
}
