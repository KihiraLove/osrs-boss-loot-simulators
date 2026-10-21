// Brutus (repeatable post-quest fight; NOT Demonic Brutus).
// Wiki: 150-ticket exclusive unique pre-roll, 81-ticket main table, and
// independent tertiary rewards. Members and F2P have different loot.
// Reference: https://danielpgleason.com/osrs/reference/brutus-ad606f08/
export const MAX_KILLS=1000000;
export const PREROLL=[
 {id:"mooleta",name:"Mooleta",weight:5,membersOnly:false},
 {id:"bottomless-milk-bucket-empty",name:"Bottomless milk bucket (empty)",weight:4,membersOnly:true},
 {id:"cow-slippers",name:"Cow slippers",weight:1,membersOnly:true}
];
export const PET={id:"beef",name:"Beef",rate:1/1000,membersOnly:true};
export const UNIQUE=[...PREROLL,PET];
export const DRY_ITEMS=UNIQUE;
export const GUARANTEED=[
 {id:"bull-bones",name:"Bull bones",quantity:1},
 {id:"raw-t-bone-steak",name:"Raw t-bone steak",quantity:1}
];
// One of the two mutually exclusive 81-ticket ordinary drop tables.
// Row: [id, name, quantity minimum, quantity maximum, weight].
const BASE=[
 ["iron-full-helm","Iron full helm",1,1,2],
 ["iron-platebody","Iron platebody",1,1,2],
 ["iron-platelegs","Iron platelegs",1,1,1],
 ["iron-plateskirt","Iron plateskirt",1,1,1],
 ["iron-arrow","Iron arrow",14,14,10],
 ["air-rune","Air rune",29,29,10],
 ["mind-rune","Mind rune",18,18,8],
 ["chaos-rune","Chaos rune",12,12,2],
 ["cowhide","Cowhide",1,1,10],
 ["oak-logs","Oak logs",2,2,5],
 ["logs","Logs",2,2,5]
];
const MEMBERS_EXTRA=[
 ["potato-seed","Potato seed",3,3,10],
 ["acorn","Acorn",2,2,5],
 ["raw-t-bone-steak","Raw t-bone steak (noted)",3,3,10]
];
const F2P_EXTRA=[
 ["coins","Coins",60,80,15],
 ["coins","Coins",80,100,5],
 ["coins","Coins",100,120,5]
];
export const MEMBERS_MAIN=[...BASE,...MEMBERS_EXTRA];
export const F2P_MAIN=[...BASE,...F2P_EXTRA];
export const COMMON=[...BASE,...MEMBERS_EXTRA,...F2P_EXTRA];
export const TERTIARY=[
 {id:"clue-scroll-beginner",name:"Clue scroll (beginner)",rate:1/15,membersOnly:false},
 {id:"clue-scroll-easy",name:"Clue scroll (easy)",rate:1/40,membersOnly:true},
 PET
];
export const ITEMS=Object.freeze(Object.fromEntries([
 ...UNIQUE,...GUARANTEED,
 ...COMMON.map(([id,name])=>({id,name:name.replace(" (noted)","")})),
 ...TERTIARY
].map(item=>[item.id,{id:item.id,name:item.name}])));

export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter between 0 and 1,000,000 completed Brutus kills.");
 return kills;
}
export function validateWorld(world){
 if(world!=="members"&&world!=="f2p")throw new RangeError("Choose Members or Free-to-play.");
 return world;
}
export function mainTable(world="members"){
 validateWorld(world);return world==="members"?MEMBERS_MAIN:F2P_MAIN;
}
export function rateOf(id,world="members"){
 validateWorld(world);
 const pre=PREROLL.find(item=>item.id===id);
 if(pre)return (pre.membersOnly&&world==="f2p")?0:pre.weight/150;
 if(id==="beef")return world==="members"?1/1000:0;
 if(id==="clue-scroll-easy")return world==="members"?1/40:0;
 if(id==="clue-scroll-beginner")return 1/15;
 return 0;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("RNG must return a finite value in [0, 1).");
 return n;
}
function weighted(rows,rng){
 const total=rows.reduce((sum,row)=>sum+row[4],0);
 let ticket=Math.floor(unit(rng)*total);
 for(const row of rows){ticket-=row[4];if(ticket<0)return row;}
 throw new Error("Invalid main-table weights.");
}
function quantity(min,max,rng){
 return min===max?min:min+Math.floor(unit(rng)*(max-min+1));
}
export function simulate(kills,{rng=Math.random,world="members",easyCAs=false}={}){
 validateKills(kills);validateWorld(world);
 const drops=Object.create(null),table=mainTable(world);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 for(let i=0;i<kills;i++){
  add("bull-bones");add("raw-t-bone-steak");
  // Published 5/150 + 4/150 + 1/150 mutually exclusive pre-roll,
  // with the two members rewards disabled on F2P worlds.
  const ticket=Math.floor(unit(rng)*150);
  let selected=null,weight=0;
  for(const item of PREROLL){
   if(item.membersOnly&&world==="f2p")continue;
   weight+=item.weight;
   if(ticket<weight){selected=item;break;}
  }
  if(selected)add(selected.id);
  else {
   const [id,,min,max]=weighted(table,rng);
   add(id,quantity(min,max,rng));
  }
  if(unit(rng)<1/15)add("clue-scroll-beginner");
  if(world==="members"){
   if(unit(rng)<(easyCAs?1/38:1/40))add("clue-scroll-easy");
   if(unit(rng)<1/1000)add("beef");
  }
 }
 return {kills,world,drops};
}
