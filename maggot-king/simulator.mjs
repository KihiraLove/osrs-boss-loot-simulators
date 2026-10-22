// OSRS Maggot King: exclusive corpse harvest choices and published drop rates.
// Source: https://oldschool.runescape.wiki/w/Maggot_king
export const MAX_KILLS=1_000_000;
export const MODES=["stomach","eggs"];
export const UNIQUE=[
 {id:"elder-venator-fang",name:"Elder venator fang",rate:1/340},
 {id:"crimson-kisten",name:"Crimson kisten",rate:1/520},
 {id:"maggot-marquess",name:"Maggot marquess",rate:1/3500}
];
export const DRY_ITEMS=UNIQUE;
// The six eggs have published 1,500-ticket probabilities and different
// pet odds when popped. Their pet probability sums to 1 / 1502.4.
export const EGGS=[
 {id:"maggot-egg-base",name:"Maggot egg (base)",tickets:300,petRate:1/3000},
 {id:"maggot-egg-sickly",name:"Maggot egg (sickly)",tickets:150,petRate:1/2500},
 {id:"maggot-egg-warm",name:"Maggot egg (warm)",tickets:33,petRate:1/1250},
 {id:"maggot-egg-pulsating",name:"Maggot egg (pulsating)",tickets:6,petRate:1/500},
 {id:"maggot-egg-wriggling",name:"Maggot egg (wriggling)",tickets:3,petRate:1/10},
 {id:"maggot-egg-writhing",name:"Maggot egg (writhing)",tickets:1,petRate:1/2}
];
export const EGG_PET_RATE=EGGS.reduce((sum,e)=>sum+e.tickets/1500*e.petRate,0);
// Normal loot table. Supply pairing is ONE 41-ticket entry,
// not two independent 41-ticket rewards. Tickets sum to 159.
// [item ID, display name, minimum amount, maximum amount, tickets].
export const STANDARD=[
 ["$supplies","Supplies",0,0,41],
 ["uncut-ruby","Uncut ruby",10,13,15],
 ["stymphike-feather","Stymphike feather",51,74,10],
 ["mort-myre-fungus","Mort myre fungus",50,76,10],
 ["letvek","Letvek",23,34,10],
 ["runite-ore","Runite ore",12,15,5],
 ["blood-sac","Blood sac",8,11,5],
 ["gold-ore","Gold ore",24,32,5],
 ["mithril-ore","Mithril ore",36,41,5],
 ["adamantite-ore","Adamantite ore",30,40,10],
 ["orikalkum-gravel","Orikalkum gravel",4,5,4],
 ["venator-fang","Venator fang",112,179,2],
 ["venator-tooth","Venator tooth",178,219,2],
 ["tarnished-spear","Tarnished spear",1,1,12],
 ["tarnished-ring","Tarnished ring",1,1,6],
 ["tarnished-bracelet","Tarnished bracelet",1,1,3],
 ["tarnished-necklace","Tarnished necklace",1,1,3],
 ["tarnished-amulet","Tarnished amulet",1,1,3],
 ["tarnished-battleaxe","Tarnished battleaxe",1,1,2],
 ["tarnished-longsword","Tarnished longsword",1,1,2],
 ["tarnished-halberd","Tarnished halberd",1,1,2],
 ["tarnished-2h-sword","Tarnished 2h sword",1,1,2]
];
export const ITEMS=Object.freeze(Object.fromEntries(
 [...UNIQUE,...EGGS,
  ...STANDARD.filter(x=>x[0]!=="$supplies").map(([id,name])=>({id,name})),
  {id:"stymphike-tartare",name:"Stymphike tartare"},
  {id:"dull-ancient-medal",name:"Dull ancient medal"},
  {id:"brimstone-key",name:"Brimstone key"},
  {id:"clue-scroll-elite",name:"Clue scroll (elite)"}
 ].map(item=>[item.id,{id:item.id,name:item.name}])
));
export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter a whole number of Maggot King kills from 0 to 1,000,000.");
 return n;
}
export function validateMode(mode){
 if(!MODES.includes(mode))throw new RangeError("Choose Open-stomach or Take-eggs.");
 return mode;
}
export function validateOptions({mode="stomach",eliteCAs=false,konarTask=false}={}){
 validateMode(mode);
 if(typeof eliteCAs!=="boolean"||typeof konarTask!=="boolean")
  throw new TypeError("Combat Achievements and Konar task must be booleans.");
 if(mode==="eggs"&&konarTask)
  throw new RangeError("Brimstone keys are modeled only for Open-stomach.");
}
export function rateOf(id,mode="stomach"){
 validateMode(mode);
 if(id==="maggot-marquess")return mode==="eggs"?EGG_PET_RATE:1/3500;
 if(mode==="eggs")return 0;
 return UNIQUE.find(item=>item.id===id)?.rate??0;
}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("Random generator must return a finite value in [0, 1).");
 return v;
}
function quantity(lo,hi,rng){return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));}
function pick(table,scale,rng){
 let ticket=unit(rng)*scale;
 for(const row of table){ticket-=row[4];if(ticket<0)return row;}
 return null;
}
export function simulate(kills,{mode="stomach",rng=Math.random,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);validateOptions({mode,eliteCAs,konarTask});
 if(typeof rng!=="function")throw new TypeError("Random generator must be a function.");
 const drops=Object.create(null);
 const add=(id,amount=1)=>{if(amount>0)drops[id]=(drops[id]??0)+amount;};
 for(let k=0;k<kills;k++){
  if(mode==="stomach"){
   // Weapon uniques are mutually exclusive pre-rolls.
   const unique=unit(rng);
   if(unique<1/340)add("elder-venator-fang");
   else if(unique<1/340+1/520)add("crimson-kisten");
   else{
    const row=pick(STANDARD,159,rng);
    if(!row)throw new Error("Normal loot table does not cover all 159 tickets.");
    if(row[0]==="$supplies"){
     add("stymphike-tartare",quantity(2,4,rng));
     add("dull-ancient-medal");
    }else add(row[0],quantity(row[2],row[3],rng));
   }
   if(unit(rng)<1/3500)add("maggot-marquess");
   if(konarTask&&unit(rng)<1/50)add("brimstone-key");
  }else{
   const ticket=unit(rng)*1500;
   let lower=0;
   for(const egg of EGGS){
    lower+=egg.tickets;
    if(ticket<lower){
     // Display obtained eggs by type and assume each is popped for pet.
     // An egg awarded a pet is counted as having been obtained.
     add(egg.id);
     if(unit(rng)<egg.petRate)add("maggot-marquess");
     break;
    }
   }
   // The remaining 1007/1500 are unmodeled empty / supply outcomes:
   // the Wiki does not give a rate for the two alternatives.
  }
  if(unit(rng)<(eliteCAs?1/38:1/40))add("clue-scroll-elite");
 }
 return {kills,mode,drops};
}
