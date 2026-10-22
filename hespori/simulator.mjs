// Hespori: one anima seed, one main reward, and a Farming-level pet roll.
// Source: https://oldschool.runescape.wiki/w/Hespori
export const MAX_KILLS=1_000_000;
export const MIN_FARMING_LEVEL=65;
export const MAX_FARMING_LEVEL=99;
export const BUCKET_RATE=1/35;
export const FARMING_XP=12_600;
export const FARMING_XP_OUTFIT=12_915;
export const ANIMA=[
 {id:"attas-seed",name:"Attas seed"},
 {id:"iasor-seed",name:"Iasor seed"},
 {id:"kronos-seed",name:"Kronos seed"}
];
export const UNIQUE=[
 {id:"bottomless-compost-bucket",name:"Bottomless compost bucket"},
 {id:"tangleroot",name:"Tangleroot"},
 {id:"white-lily-seed",name:"White lily seed"},
 ...ANIMA
];
export const DRY_ITEMS=UNIQUE.slice(0,2);
// [id, name, min quantity, max quantity, weight]; exactly 80 tickets.
export const MAIN=[["watermelon-seed","Watermelon seed",10,20,2],["snape-grass-seed","Snape grass seed",6,16,2],["white-lily-seed","White lily seed",8,18,5],["limpwurt-seed","Limpwurt seed",6,14,2],["wildblood-seed","Wildblood seed",10,20,2],["whiteberry-seed","Whiteberry seed",10,16,2],["poison-ivy-seed","Poison ivy seed",8,16,2],["irit-seed","Irit seed",2,8,3],["avantoe-seed","Avantoe seed",2,5,3],["kwuarm-seed","Kwuarm seed",2,5,3],["toadflax-seed","Toadflax seed",2,5,3],["cadantine-seed","Cadantine seed",2,5,3],["lantadyme-seed","Lantadyme seed",2,5,3],["dwarf-weed-seed","Dwarf weed seed",2,5,3],["ranarr-seed","Ranarr seed",1,2,2],["snapdragon-seed","Snapdragon seed",1,1,2],["torstol-seed","Torstol seed",1,1,2],["maple-seed","Maple seed",2,4,4],["willow-seed","Willow seed",2,5,3],["yew-seed","Yew seed",1,1,2],["magic-seed","Magic seed",1,1,1],["pineapple-seed","Pineapple seed",3,6,3],["papaya-tree-seed","Papaya tree seed",1,3,3],["palm-tree-seed","Palm tree seed",1,3,3],["dragonfruit-tree-seed","Dragonfruit tree seed",1,1,2],["teak-seed","Teak seed",2,5,4],["mahogany-seed","Mahogany seed",1,3,3],["cactus-seed","Cactus seed",4,14,2],["potato-cactus-seed","Potato cactus seed",4,14,2],["celastrus-seed","Celastrus seed",1,1,2],["spirit-seed","Spirit seed",1,1,1],["redwood-tree-seed","Redwood tree seed",1,1,1]];
export const ITEMS=Object.freeze(Object.fromEntries([
 ...MAIN.map(([id,name])=>[id,{id,name}]),
 ...UNIQUE.map(item=>[item.id,item])
]));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of kills from 0 to 1,000,000.");
 return kills;
}
export function validateFarmingLevel(level){
 if(!Number.isSafeInteger(level)||level<MIN_FARMING_LEVEL||level>MAX_FARMING_LEVEL)
  throw new RangeError("Farming level must be a whole number from 65 to 99.");
 return level;
}
export function petRate(farmingLevel=99){
 validateFarmingLevel(farmingLevel);
 return 1/(7000-25*farmingLevel);
}
export function rateOf(id,farmingLevel=99){
 if(id==="bottomless-compost-bucket")return BUCKET_RATE;
 if(id==="tangleroot")return petRate(farmingLevel);
 if(ANIMA.some(item=>item.id===id))return 1/3;
 const entry=MAIN.find(row=>row[0]===id);
 return entry? (1-BUCKET_RATE)*entry[4]/80 : 0;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return n;
}
function quantity(min,max,rng){
 return min===max?min:min+Math.floor(unit(rng)*(max-min+1));
}
function pickMain(rng){
 let ticket=unit(rng)*80;
 for(const entry of MAIN){ticket-=entry[4];if(ticket<0)return entry;}
 return MAIN.at(-1);
}
export function simulate(kills,{rng=Math.random,farmingLevel=99,farmerOutfit=false}={}){
 validateKills(kills);validateFarmingLevel(farmingLevel);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if(typeof farmerOutfit!=="boolean")throw new TypeError("Farmer's outfit must be a boolean.");
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 const pet=petRate(farmingLevel);
 for(let k=0;k<kills;k++){
  // One anima roll every harvest, with 1 or 2 of exactly one type.
  const anima=ANIMA[Math.floor(unit(rng)*ANIMA.length)];
  add(anima.id,quantity(1,2,rng));
  // Bottomless compost bucket pre-roll REPLACES the normal seed reward.
  if(unit(rng)<BUCKET_RATE)add("bottomless-compost-bucket");
  else{
   const [id,,min,max]=pickMain(rng);
   add(id,quantity(min,max,rng));
  }
  // Independent Farming-level-dependent tertiary pet roll.
  if(unit(rng)<pet)add("tangleroot");
 }
 return {kills,farmingLevel,farmerOutfit,
  farmingXp:kills*(farmerOutfit?FARMING_XP_OUTFIT:FARMING_XP),drops};
}
