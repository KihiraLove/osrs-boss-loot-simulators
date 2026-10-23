// Tempoross reward-pool simulator. A pull spends ONE reward permit, not a boss kill.
// Rates/tier brackets: https://oldschool.runescape.wiki/w/Reward_pool
export const MAX_PULLS=1_000_000;
export const MIN_FISHING=35,MAX_FISHING=99;
export const RARE_DENOMINATOR=8000;
export const RARE=[
 // One rare attempt first; weights out of 8,000 reward searches.
 ["soaked-page","Soaked page",5,9,149],
 ["fish-barrel","Fish barrel",1,1,20],
 ["tackle-box","Tackle box",1,1,20],
 ["big-harpoonfish","Big harpoonfish",1,1,5],
 ["tome-of-water-empty","Tome of water (empty)",1,1,5],
 ["dragon-harpoon","Dragon harpoon",1,1,1],
 ["tiny-tempor","Tiny tempor",1,1,1]
];
export const RARE_TOTAL=RARE.reduce((s,x)=>s+x[4],0);
export const BASE_DENOMINATOR=16000;
export const BASE=[
 // The published common/fish probabilities add up to exactly 1 before
 // the rare outcomes; these are relative weights when a rare roll misses.
 ["spirit-flakes","Spirit flakes",32,64,4000],
 ["casket-reward-pool","Casket (Reward pool)",1,1,800],
 ["plank","Plank",20,30,700],
 ["oak-plank","Oak plank",15,25,500],
 ["seaweed","Seaweed",20,60,400],
 ["steel-nails","Steel nails",300,500,200],
 ["feather","Feather",800,1600,200],
 ["fishing-bait","Fishing bait",800,1600,200]
];
export const FISH_WEIGHTS=Object.freeze([2250,2025,1800,1575,1350]);
export const FISH_AMOUNTS=Object.freeze([[30,40],[20,30],[10,20],[7,12],[5,10]]);
export const FISH_TIERS=Object.freeze([
 {min:35,max:39,label:"35–39",fish:["raw-herring","raw-mackerel","raw-pike","raw-salmon","raw-tuna"]},
 {min:40,max:45,label:"40–45",fish:["raw-mackerel","raw-pike","raw-salmon","raw-tuna","raw-lobster"]},
 {min:46,max:49,label:"46–49",fish:["raw-pike","raw-salmon","raw-tuna","raw-lobster","raw-bass"]},
 {min:50,max:75,label:"50–75",fish:["raw-salmon","raw-tuna","raw-lobster","raw-bass","raw-swordfish"]},
 {min:76,max:78,label:"76–78",fish:["raw-tuna","raw-lobster","raw-bass","raw-swordfish","raw-shark"]},
 {min:79,max:80,label:"79–80",fish:["raw-lobster","raw-bass","raw-swordfish","raw-shark","raw-sea-turtle"]},
 {min:81,max:99,label:"81–99",fish:["raw-bass","raw-swordfish","raw-shark","raw-sea-turtle","raw-manta-ray"]}
]);
export const UNIQUE=Object.freeze([
 {id:"fish-barrel",name:"Fish barrel",rate:1/400,oneTime:true},
 {id:"tackle-box",name:"Tackle box",rate:1/400,oneTime:true},
 {id:"big-harpoonfish",name:"Big harpoonfish",rate:1/1600},
 {id:"tome-of-water-empty",name:"Tome of water (empty)",rate:1/1600},
 {id:"dragon-harpoon",name:"Dragon harpoon",rate:1/8000},
 {id:"tiny-tempor",name:"Tiny tempor",rate:1/8000},
 {id:"spirit-flakes",name:"Spirit flakes",rate:(1-RARE_TOTAL/RARE_DENOMINATOR)/4},
 {id:"casket-reward-pool",name:"Casket (Reward pool)",rate:(1-RARE_TOTAL/RARE_DENOMINATOR)/20},
 {id:"soaked-page",name:"Soaked page",rate:149/8000}
]);
export const DRY_ITEMS=UNIQUE.filter(x=>x.id!=="soaked-page");
const names={"raw-manta-ray":"Raw manta ray","raw-sea-turtle":"Raw sea turtle",
 "tome-of-water-empty":"Tome of water (empty)","soaked-page":"Soaked page"};
function label(id){
 return names[id]??id.split("-").map(s=>s[0].toUpperCase()+s.slice(1)).join(" ");
}
const allIds=new Set([...RARE.map(x=>x[0]),...BASE.map(x=>x[0]),
 ...FISH_TIERS.flatMap(x=>x.fish)]);
export const ITEMS=Object.freeze(Object.fromEntries([...allIds].map(id=>
 [id,{id,name:RARE.find(x=>x[0]===id)?.[1]??BASE.find(x=>x[0]===id)?.[1]??label(id)}])));
export const rateOf=id=>UNIQUE.find(x=>x.id===id)?.rate??(id==="soaked-page"?149/8000:0);
export function validatePulls(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_PULLS)
  throw new RangeError("Enter 0 to 1,000,000 reward permits.");
 return n;
}
export function validateFishingLevel(n){
 if(!Number.isInteger(n)||n<MIN_FISHING||n>MAX_FISHING)
  throw new RangeError("Base Fishing level must be an integer between 35 and 99.");
 return n;
}
export function tierOf(level){
 validateFishingLevel(level);
 return FISH_TIERS.find(t=>level>=t.min&&level<=t.max);
}
function unit(rng){
 const x=rng();
 if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)
  throw new RangeError("Random generator must return [0, 1).");
 return x;
}
function amount(lo,hi,rng){return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));}
function weighted(table,total,rng){
 let roll=unit(rng)*total;
 for(const item of table){roll-=item[4];if(roll<0)return item;}
 return table.at(-1);
}
export function simulate(pulls,{rng=Math.random,fishingLevel=99,ownsBarrel=false,ownsTackleBox=false}={}){
 validatePulls(pulls);
 const tier=tierOf(fishingLevel);
 if(typeof rng!=="function")throw new TypeError("Random generator must be a function.");
 if(typeof ownsBarrel!=="boolean"||typeof ownsTackleBox!=="boolean")
  throw new TypeError("Ownership options must be booleans.");
 let barrel=ownsBarrel,tackle=ownsTackleBox;
 const drops=Object.create(null);
 const add=(id,n=1)=>{drops[id]=(drops[id]??0)+n;};
 const fish=tier.fish.map((id,i)=>[id,ITEMS[id].name,...FISH_AMOUNTS[i],FISH_WEIGHTS[i]]);
 const common=[...BASE,...fish];
 if(common.reduce((s,x)=>s+x[4],0)!==BASE_DENOMINATOR)
  throw new Error("Tempoross base reward weights must sum to 16,000.");
 for(let i=0;i<pulls;i++){
  // Exact published rare-event probabilities; a successful rare
  // substitutes for the ordinary outcome of this permit.
  const ticket=unit(rng)*RARE_DENOMINATOR;
  let chosen;
  if(ticket<RARE_TOTAL){
   let remaining=ticket;
   for(const row of RARE){remaining-=row[4];if(remaining<0){chosen=row;break;}}
  }else chosen=weighted(common,BASE_DENOMINATOR,rng);
  if(!chosen)throw new Error("No reward selected.");
  const [id,,lo,hi]=chosen;
  if(id==="fish-barrel"){
   if(barrel)add("soaked-page",25);
   else{add("fish-barrel");barrel=true;}
  }else if(id==="tackle-box"){
   if(tackle)add("soaked-page",25);
   else{add("tackle-box");tackle=true;}
  }else add(id,amount(lo,hi,rng));
 }
 return {pulls,fishingLevel,tier:tier.label,ownsBarrel:barrel,ownsTackleBox:tackle,drops};
}
