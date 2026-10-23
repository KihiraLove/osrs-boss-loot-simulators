// Old School RuneScape Nex: contribution-equivalent loot inferred from NIHIL SHARDS RECEIVED.
// Shards do not record actual kill count, team size or damage contribution.
// Sources: https://oldschool.runescape.wiki/w/Nex and /w/Nihil_shard
export const MAX_SHARDS=1_000_000;
export const UNIQUE_RATE=1/43;
export const SHARDS_PER_KILL=(5/82)*(80+85)/2+(8/209)*(85+95)/2;
export const UNIQUE=Object.freeze([
 {id:"ancient-hilt",name:"Ancient hilt",weight:1,rate:1/516},
 {id:"nihil-horn",name:"Nihil horn",weight:2,rate:1/258},
 {id:"torva-full-helm-damaged",name:"Torva full helm (damaged)",weight:2,rate:1/258},
 {id:"torva-platebody-damaged",name:"Torva platebody (damaged)",weight:2,rate:1/258},
 {id:"torva-platelegs-damaged",name:"Torva platelegs (damaged)",weight:2,rate:1/258},
 {id:"zaryte-vambraces",name:"Zaryte vambraces",weight:3,rate:1/172},
 {id:"nexling",name:"Nexling",weight:0,rate:1/500}
]);
export const DRY_ITEMS=UNIQUE;
export const OTHER_RATES=Object.freeze([
 {id:"blood-essence",name:"Blood essence",rate:1/82,low:1,high:2},
 {id:"rune-sword",name:"Rune sword",rate:1/209,low:1,high:1},
 {id:"clue-scroll-elite",name:"Clue scroll (elite)",rate:1/48,low:1,high:1}
]);
// Common rewards have no published numeric relative weights. These are explicitly
// ILLUSTRATIVE weights, *not* observed wiki rates or promised personal drops.
// Quantities represent approximate full-kill equivalents; they do not model
// individual team-share rounding or MVP bonuses.
export const COMMON_POOL=Object.freeze([
 ["air-rune","Air rune",123,10000,4],
 ["fire-rune","Fire rune",1,10000,4],
 ["water-rune","Water rune",193,10000,4],
 ["blood-rune","Blood rune",84,876,8],
 ["death-rune","Death rune",85,986,8],
 ["soul-rune","Soul rune",86,592,8],
 ["dragon-bolts-unf","Dragon bolts (unf)",12,283,8],
 ["onyx-bolts-e","Onyx bolts (e)",11,29,4],
 ["steel-cannonball","Steel cannonball",42,2252,8],
 ["air-orb","Air orb",6,100,5],
 ["coal","Coal",23,2354,4],
 ["runite-ore","Runite ore",2,30,4],
 ["uncut-ruby","Uncut ruby",3,80,5],
 ["uncut-diamond","Uncut diamond",3,64,5],
 ["wine-of-zamorak","Wine of Zamorak",4,64,5],
 ["@shark-prayer","Sharks and prayer potions",0,0,8],
 ["@brew-restore","Saradomin brews and super restores",0,0,8],
 ["ecumenical-key-shard","Ecumenical key shard",6,39,7],
 ["coins","Coins",8539,26748,4]
]);
const all=[...UNIQUE.map(x=>[x.id,x.name]),...OTHER_RATES.map(x=>[x.id,x.name]),
 ...COMMON_POOL.map(x=>x.slice(0,2)),["nihil-shard","Nihil shard"],
 ["shark","Shark"],["prayer-potion-4","Prayer potion(4)"],
 ["saradomin-brew-4","Saradomin brew(4)"],
 ["super-restore-4","Super restore(4)"]];
export const ITEMS=Object.freeze(Object.fromEntries(all
 .filter(x=>!x[0].startsWith("@"))
 .map(([id,name])=>[id,{id,name}])));
export function validateShards(shards){
 if(!Number.isSafeInteger(shards)||shards<0||shards>MAX_SHARDS)
  throw new RangeError("Nihil shards received must be a whole number between 0 and 1,000,000.");
 return shards;
}
export function exposureOf(shards){
 return validateShards(shards)/SHARDS_PER_KILL;
}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("Random must return a finite number in [0, 1).");
 return v;
}
function uniformInt(lo,hi,rng){
 return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));
}
// Poisson approximates fractional contribution exposure, and is efficient at high
// shard totals using independent chunks of at most 20 expected occurrences.
export function samplePoisson(mean,rng=Math.random){
 if(typeof mean!=="number"||!Number.isFinite(mean)||mean<0||mean>MAX_SHARDS)
  throw new RangeError("Invalid Poisson mean.");
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 let remaining=mean,count=0;
 while(remaining>0){
  const part=Math.min(20,remaining),limit=Math.exp(-part);
  let product=1,k=0;
  do{product*=unit(rng);k++;}while(product>limit);
  count+=k-1;
  remaining-=part;
  if(remaining<1e-12)break;
 }
 return count;
}
function weightedCommon(rng){
 const max=COMMON_POOL.reduce((n,x)=>n+x[4],0);
 let ticket=unit(rng)*max;
 for(const row of COMMON_POOL){ticket-=row[4];if(ticket<0)return row;}
 return COMMON_POOL.at(-1);
}
export function simulate(shards,{rng=Math.random,eliteCAs=false}={}){
 validateShards(shards);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if(typeof eliteCAs!=="boolean")throw new TypeError("Elite Combat Achievements must be boolean.");
 const exposure=exposureOf(shards);
 const rares=Object.create(null),other=Object.create(null),common=Object.create(null);
 const add=(dest,id,n=1)=>{if(n>0)dest[id]=(dest[id]??0)+n;};
 // OSRS rolls unique chances per player, based on contribution. Multiple
 // players can receive uniques in one kill. Shard-derived personal exposure
 // is approximated with independent Poisson item counts here.
 for(const item of UNIQUE)
  add(rares,item.id,samplePoisson(exposure*item.rate,rng));
 for(const item of OTHER_RATES){
  const p=item.id==="clue-scroll-elite"?(eliteCAs?1/45:1/48):item.rate;
  const copies=samplePoisson(exposure*p,rng);
  for(let i=0;i<copies;i++)add(other,item.id,uniformInt(item.low,item.high,rng));
 }
 add(other,"nihil-shard",shards); // user-provided actual number, never rerolled
 // Each full Nex kill has two guaranteed common drops, but individual
 // contribution quantities & exact common weights cannot be reconstructed.
 const estimatedRolls=2*exposure;
 const count=Math.floor(estimatedRolls)+(unit(rng)<estimatedRolls%1?1:0);
 for(let i=0;i<count;i++){
  const [id,,lo,hi]=weightedCommon(rng);
  if(id==="@shark-prayer"){
   add(common,"shark",10);add(common,"prayer-potion-4",3);
  }else if(id==="@brew-restore"){
   add(common,"saradomin-brew-4",uniformInt(1,10,rng));
   add(common,"super-restore-4",uniformInt(1,5,rng));
  }else add(common,id,uniformInt(lo,hi,rng));
 }
 const drops=Object.create(null);
 for(const part of [rares,other,common])
  for(const [id,count] of Object.entries(part))add(drops,id,count);
 return {shards,exposure,rares,other,common,drops,estimatedCommonRolls:count};
}
