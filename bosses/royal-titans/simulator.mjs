import { validateEncounterCounts } from "../../shared/encounters.mjs";
// Royal Titans; loot Branda or Eldric after the encounter.
// https://oldschool.runescape.wiki/w/Royal_Titans
export const MAX_KILLS=1_000_000;
export const MODES=Object.freeze([{id:"solo",label:"Solo (100%)",share:1},{id:"duo",label:"Duo (50%)",share:.5}]);
export const TITANS=Object.freeze([
 {id:"branda",label:"Branda the Fire Queen",crown:"fire-element-staff-crown",scroll:"mystic-vigour-prayer-scroll"},
 {id:"eldric",label:"Eldric the Ice King",crown:"ice-element-staff-crown",scroll:"deadeye-prayer-scroll"}
]);
export const ENCOUNTERS=Object.freeze([
 {id:"soloBranda",label:"Solo Branda",mode:"solo",titan:"branda",share:1},
 {id:"soloEldric",label:"Solo Eldric",mode:"solo",titan:"eldric",share:1},
 {id:"duoBranda",label:"Duo Branda",mode:"duo",titan:"branda",share:.5},
 {id:"duoEldric",label:"Duo Eldric",mode:"duo",titan:"eldric",share:.5}
]);
export function validatePlan(counts){return validateEncounterCounts(counts,ENCOUNTERS,MAX_KILLS);}
export const ACTIONS=Object.freeze(["loot","sacrifice","pages"]);
export const BRANDA=Object.freeze([["mystic-fire-staff","Mystic fire staff",4,4,2],["fire-battlestaff","Fire battlestaff",6,6,2],["rune-plateskirt","Rune plateskirt",2,2,2],["rune-scimitar","Rune scimitar",2,2,2],["rune-pickaxe","Rune pickaxe",2,2,2],["fire-rune","Fire rune",1500,3000,2],["chaos-rune","Chaos rune",200,400,2],["death-rune","Death rune",150,300,2],["nature-rune","Nature rune",100,150,2],["law-rune","Law rune",100,150,2],["soul-rune","Soul rune",100,150,2],["blood-rune","Blood rune",100,150,2],["rune-arrow","Rune arrow",100,300,2],["coal","Coal",280,320,2],["gold-ore","Gold ore",60,100,2],["fire-orb","Fire orb",20,40,2],["grimy-avantoe","Grimy avantoe",6,8,2],["grimy-cadantine","Grimy cadantine",6,8,2],["grimy-dwarf-weed","Grimy dwarf weed",6,8,2],["grimy-irit-leaf","Grimy irit leaf",6,8,2],["grimy-kwuarm","Grimy kwuarm",6,8,2],["grimy-lantadyme","Grimy lantadyme",6,8,2],["grimy-ranarr-weed","Grimy ranarr weed",6,8,2],["maple-seed","Maple seed",4,6,1],["palm-tree-seed","Palm tree seed",2,2,1],["yew-seed","Yew seed",2,2,1],["coins","Coins",10000,30000,2],["prayer-potion-4","Prayer potion(4)",2,4,2],["desiccated-page","Desiccated page",6,24,2]]);
export const ELDRIC=Object.freeze([["mystic-water-staff","Mystic water staff",4,4,2],["water-battlestaff","Water battlestaff",6,6,2],["rune-platelegs","Rune platelegs",2,2,2],["rune-sq-shield","Rune sq shield",2,2,2],["rune-axe","Rune axe",2,2,2],["rune-pickaxe","Rune pickaxe",2,2,1],["water-rune","Water rune",1500,3000,2],["chaos-rune","Chaos rune",200,400,2],["death-rune","Death rune",150,300,2],["nature-rune","Nature rune",100,150,2],["law-rune","Law rune",100,150,2],["soul-rune","Soul rune",100,150,2],["blood-rune","Blood rune",100,150,2],["rune-arrow","Rune arrow",100,300,2],["coal","Coal",280,320,2],["gold-ore","Gold ore",60,100,2],["water-orb","Water orb",20,40,2],["avantoe-seed","Avantoe seed",4,4,2],["cadantine-seed","Cadantine seed",4,4,2],["dwarf-weed-seed","Dwarf weed seed",3,3,2],["irit-seed","Irit seed",4,4,2],["kwuarm-seed","Kwuarm seed",4,4,2],["lantadyme-seed","Lantadyme seed",4,4,2],["ranarr-seed","Ranarr seed",4,4,2],["maple-seed","Maple seed",4,6,1],["palm-tree-seed","Palm tree seed",2,2,1],["yew-seed","Yew seed",2,2,1],["coins","Coins",10000,30000,2],["prayer-potion-4","Prayer potion(4)",2,4,2],["desiccated-page","Desiccated page",6,24,2]]);
export const COMMON=Object.freeze({branda:BRANDA,eldric:ELDRIC});
export const PRIMARY=Object.freeze([
 {id:"fire-element-staff-crown",name:"Fire element staff crown",titan:"branda",rate:1/75},
 {id:"mystic-vigour-prayer-scroll",name:"Mystic vigour prayer scroll",titan:"branda",rate:1/75},
 {id:"ice-element-staff-crown",name:"Ice element staff crown",titan:"eldric",rate:1/75},
 {id:"deadeye-prayer-scroll",name:"Deadeye prayer scroll",titan:"eldric",rate:1/75},
 {id:"giantsoul-amulet",name:"Giantsoul amulet",titan:null,rate:1/16}
]);
export const PET={id:"bran",name:"Bran"};
export const UNIQUE=Object.freeze([...PRIMARY,PET]);
export const DRY_ITEMS=UNIQUE;
const OTHER=[
 ["desiccated-page","Desiccated page"],
 ["clue-scroll-hard","Clue scroll (hard)"],
 ["clue-scroll-elite","Clue scroll (elite)"]
];
export const ITEMS=Object.freeze(Object.fromEntries(
 [...PRIMARY.map(x=>[x.id,x.name]),[PET.id,PET.name],
  ...BRANDA.map(([id,name])=>[id,name]),...ELDRIC.map(([id,name])=>[id,name]),...OTHER]
 .map(([id,name])=>[id,{id,name}])
));
export function validateOptions(options={}) {
 if(!options||typeof options!=="object"||Array.isArray(options))throw new TypeError("Invalid Royal Titans settings.");
 const {action="loot",hardCAs=false,eliteCAs=false}=options;
 if(!ACTIONS.includes(action))throw new RangeError("Unknown reward selection.");
 if([hardCAs,eliteCAs].some(value=>typeof value!=="boolean"))throw new TypeError("Combat Achievement settings must be boolean.");
 return {action,hardCAs,eliteCAs};
}
export function rateOf(id,mode="solo",titan="branda",options={}){
 const m=MODES.find(x=>x.id===mode);
 if(!m)throw new RangeError("Unknown party size.");
 if(!TITANS.some(entry=>entry.id===titan))throw new RangeError("Unknown Titan.");
 const opts=validateOptions(options);
 if(id===PET.id)return opts.action==="sacrifice"?1/1500:1/3000;
 if(id==="clue-scroll-hard")return 1/(opts.hardCAs?23:25);
 if(id==="clue-scroll-elite")return 1/(opts.eliteCAs?95:100);
 if(opts.action!=="loot")return 0;
 const item=PRIMARY.find(x=>x.id===id);
 return item&&(item.titan===null||item.titan===titan)?item.rate*m.share:0;
}
export function primaryRate(mode="solo",titan="branda",options={}){
 return PRIMARY.reduce((sum,x)=>sum+rateOf(x.id,mode,titan,options),0);
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite number in [0, 1).");
 return n;
}
function amount(min,max,rng){return min===max?min:min+Math.floor(unit(rng)*(max-min+1));}
function row(table,rng){
 let ticket=unit(rng)*table.reduce((s,item)=>s+item[4],0);
 for(const item of table){ticket-=item[4];if(ticket<0)return item;}
 return table.at(-1);
}
function uniqueRoll(mode,titan,opts,rng){
 let ticket=unit(rng);
 for(const item of PRIMARY){
  const rate=rateOf(item.id,mode,titan,opts);
  if(ticket<rate)return item.id;
  ticket-=rate;
 }
 return null;
}
// 50% loot shares retain the two rolls but halve the reward stack per roll.
// Contribution rounds to a whole stack, minimum one item.
export function scaledQuantity(quantity,share){
 if(!Number.isSafeInteger(quantity)||quantity<1)throw new RangeError("Invalid loot quantity.");
 if(share!==1&&share!==.5)throw new RangeError("Invalid share.");
 return Math.max(1,Math.round(quantity*share));
}
export function simulate(counts,{rng=Math.random,...options}={}){
 const plan=validatePlan(counts);
 const opts=validateOptions(options);
 if(typeof rng!=="function")throw new TypeError("Random generator must be a function.");
 const drops=Object.create(null);
 const add=(id,q=1)=>{if(q>0)drops[id]=(drops[id]||0)+q;};
 for(const encounter of plan.groups){
  const {titan,share}=encounter;
  for(let i=0;i<encounter.count;i++){
   if(opts.action==="pages"){
    // The desiccated page reward replaces all primary loot.
    add("desiccated-page",scaledQuantity(amount(10,19,rng),share));
   }else if(opts.action==="loot"){
    const picked=uniqueRoll(encounter.mode,titan,opts,rng);
    if(picked)add(picked);
    else for(let n=0;n<2;n++){
     const [id,,min,max]=row(COMMON[titan],rng);
     add(id,scaledQuantity(amount(min,max,rng),share));
    }
   }
   // Tertiary pet and clue rolls ignore player contribution and reward target.
   if(unit(rng)<rateOf(PET.id,encounter.mode,titan,opts))add(PET.id);
   if(unit(rng)<rateOf("clue-scroll-hard",encounter.mode,titan,opts))add("clue-scroll-hard");
   if(unit(rng)<rateOf("clue-scroll-elite",encounter.mode,titan,opts))add("clue-scroll-elite");
  }
 }
 return {counts:plan.counts,kills:plan.total,options:opts,drops};
}
