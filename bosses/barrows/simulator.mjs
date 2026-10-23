// Barrows chest: all six brothers defeated, fixed seven rolls at 1/102 each.
// Equipment choices do not repeat within one chest. The reward-potential
// setting changes only non-equipment loot, never the equipment odds.
// Source: OSRS Wiki Chest (Barrows), revision 16 July 2026.
export const MAX_CHESTS=1_000_000;
export const ROLLS=7;
export const UNIQUE_RATE=1/102;
// Repeated selections of the same item in a chest are discarded. One
// particular piece is therefore found with chance 1-(1-1/2448)^7,
// matching the Wiki's approximately 1/350.14 per chest.
export const SPECIFIC_RATE=-Math.expm1(ROLLS*Math.log1p(-UNIQUE_RATE/24));
export const BROTHERS=[
 {name:"Ahrim's",items:[
  ["ahrims-hood","Ahrim's hood"],["ahrims-robetop","Ahrim's robetop"],
  ["ahrims-robeskirt","Ahrim's robeskirt"],["ahrims-staff","Ahrim's staff"]]},
 {name:"Dharok's",items:[
  ["dharoks-helm","Dharok's helm"],["dharoks-platebody","Dharok's platebody"],
  ["dharoks-platelegs","Dharok's platelegs"],["dharoks-greataxe","Dharok's greataxe"]]},
 {name:"Guthan's",items:[
  ["guthans-helm","Guthan's helm"],["guthans-platebody","Guthan's platebody"],
  ["guthans-chainskirt","Guthan's chainskirt"],["guthans-warspear","Guthan's warspear"]]},
 {name:"Karil's",items:[
  ["karils-coif","Karil's coif"],["karils-leathertop","Karil's leathertop"],
  ["karils-leatherskirt","Karil's leatherskirt"],["karils-crossbow","Karil's crossbow"]]},
 {name:"Torag's",items:[
  ["torags-helm","Torag's helm"],["torags-platebody","Torag's platebody"],
  ["torags-platelegs","Torag's platelegs"],["torags-hammers","Torag's hammers"]]},
 {name:"Verac's",items:[
  ["veracs-helm","Verac's helm"],["veracs-brassard","Verac's brassard"],
  ["veracs-plateskirt","Verac's plateskirt"],["veracs-flail","Verac's flail"]]}
];
export const UNIQUE=BROTHERS.flatMap(b=>b.items.map(([id,name])=>({id,name,brother:b.name})));
export const COMMON=[
 {id:"coins",name:"Coins",start:1,end:380,min:2,max:774},
 {id:"mind-rune",name:"Mind rune",start:381,end:505,min:253,max:336,rune:true},
 {id:"chaos-rune",name:"Chaos rune",start:506,end:630,min:112,max:139,rune:true},
 {id:"death-rune",name:"Death rune",start:631,end:755,min:70,max:83,rune:true},
 {id:"blood-rune",name:"Blood rune",start:756,end:880,min:37,max:43,rune:true},
 {id:"bolt-rack",name:"Bolt rack",start:881,end:1005,min:35,max:40},
 {id:"loop-half-of-key",name:"Loop half of key",start:1006,end:1008,min:1,max:1},
 {id:"tooth-half-of-key",name:"Tooth half of key",start:1009,end:1011,min:1,max:1},
 {id:"dragon-med-helm",name:"Dragon med helm",start:1012,end:1012,min:1,max:1}
];
export const ITEMS=Object.freeze(Object.fromEntries([
 ...UNIQUE.map(item=>[item.id,item.name]),
 ...COMMON.map(item=>[item.id,item.name]),
 ["clue-scroll-elite","Clue scroll (elite)"]
].map(([id,name])=>[id,{id,name}])));
export function validateChests(chests){
 if(!Number.isSafeInteger(chests)||chests<0||chests>MAX_CHESTS)
  throw new RangeError("Enter between 0 and 1,000,000 completed Barrows chests.");
 return chests;
}
export function validatePotential(potential){
 if(potential!==880&&potential!==1012)
  throw new RangeError("Choose 880 (86.8%) or 1,012 (full) reward potential.");
 return potential;
}
function unit(rng){
 const value=rng();
 if(typeof value!=="number"||!Number.isFinite(value)||value<0||value>=1)
  throw new RangeError("Random generator must return a number in [0, 1).");
 return value;
}
export function regularReward(potential,rng,hardDiary=false){
 validatePotential(potential);
 const roll=1+Math.floor(unit(rng)*potential);
 const item=COMMON.find(row=>roll>=row.start&&roll<=row.end);
 // Quantity increases with the reward-point roll. Reported wiki ranges
 // are used as exact endpoints; intermediate amounts are interpolated.
 const ratio=item.start===item.end?0:(roll-item.start)/(item.end-item.start);
 let quantity=item.min+Math.floor(ratio*(item.max-item.min));
 if(item.rune&&hardDiary)quantity=Math.floor(quantity*1.5);
 return {id:item.id,quantity};
}
export function simulate(chests,{rng=Math.random,potential=880,hardDiary=false,eliteCAs=false}={}){
 validateChests(chests);validatePotential(potential);
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]||0)+count;};
 let totalEquipment=0,clueCount=0;
 for(let chest=0;chest<chests;chest++){
  const awarded=new Set();
  let clueReceived=false;
  for(let roll=0;roll<ROLLS;roll++){
   if(unit(rng)<UNIQUE_RATE){
    const selected=UNIQUE[Math.floor(unit(rng)*UNIQUE.length)].id;
    // The roll is spent if this same named item was already awarded:
    // no duplicate, and no replacement item or ordinary-loot reroll.
    if(!awarded.has(selected)){
     awarded.add(selected);add(selected);totalEquipment++;
    }
   }else{
    const {id,quantity}=regularReward(potential,rng,hardDiary);
    add(id,quantity);
   }
   // One elite clue at most per chest. Chance per roll is 1/200,
   // or 1/190 with elite Combat Achievements.
   if(!clueReceived&&unit(rng)<1/(eliteCAs?190:200)){
    add("clue-scroll-elite");
    clueReceived=true;clueCount++;
   }
  }
 }
 return {chests,brothers:6,rolls:ROLLS,potential,drops,totalEquipment,clueCount};
}
