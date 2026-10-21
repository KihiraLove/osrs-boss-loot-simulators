// Abyssal Sire, OSRS Wiki drop table (July 2026 revision).
// Unsired is a 1/100 pre-roll replacing the ordinary 139-ticket table.
// An unsired is consumed at the Font, with a 128-ticket pet-eligible
// reward table or 123-ticket table after the orphan has been obtained.
import {RDT} from "../cerberus/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const UNSIRED_RATE=1/100;
export const REWARDS=[
 {id:"bludgeon-spine",name:"Bludgeon spine",group:"bludgeon"},
 {id:"bludgeon-claw",name:"Bludgeon claw",group:"bludgeon"},
 {id:"bludgeon-axon",name:"Bludgeon axon",group:"bludgeon"},
 {id:"abyssal-dagger",name:"Abyssal dagger",weight:26},
 {id:"jar-of-miasma",name:"Jar of miasma",weight:13},
 {id:"abyssal-whip",name:"Abyssal whip",weight:12},
 {id:"abyssal-head",name:"Abyssal head",weight:10},
 {id:"abyssal-orphan",name:"Abyssal orphan",weight:5}
];
export const BLUDGEON=REWARDS.filter(x=>x.group==="bludgeon");
export const REWARD_WEIGHTS=[
 ["bludgeon",62],["abyssal-dagger",26],["jar-of-miasma",13],
 ["abyssal-whip",12],["abyssal-head",10],["abyssal-orphan",5]
];
export const TERTIARY=[
 {id:"clue-scroll-elite",name:"Clue scroll (elite)",rate:1/180},
 {id:"brimstone-key",name:"Brimstone key",rate:1/40}
];
// [id, name, min quantity, max quantity, ticket weight].
// Special IDs address sub-tables (herbs, seeds, talismans, rare).
export const MAIN=[
 ["battlestaff","Battlestaff",10,10,6],
 ["rune-full-helm","Rune full helm",3,3,4],
 ["mystic-lava-staff","Mystic lava staff",2,2,4],
 ["rune-sword","Rune sword",3,3,4],
 ["rune-platebody","Rune platebody",2,2,4],
 ["rune-kiteshield","Rune kiteshield",2,2,3],
 ["mystic-air-staff","Mystic air staff",2,2,2],
 ["air-battlestaff","Air battlestaff",6,6,2],
 ["blood-rune","Blood rune",190,210,5],
 ["death-rune","Death rune",330,370,5],
 ["law-rune","Law rune",250,250,5],
 ["soul-rune","Soul rune",225,275,5],
 ["cosmic-rune","Cosmic rune",350,350,4],
 ["steel-cannonball","Cannonball",300,300,4],
 ["$herb","Herb subtable",0,0,5],
 ["$seed","Tree-herb seed subtable",0,0,5],
 ["earth-orb","Earth orb",47,53,5],
 ["pure-essence","Pure essence",600,600,5],
 ["magic-logs","Magic logs",50,70,5],
 ["uncut-diamond","Uncut diamond",15,15,5],
 ["coal","Coal",380,420,4],
 ["runite-ore","Runite ore",6,6,4],
 ["onyx-bolt-tips","Onyx bolt tips",10,10,3],
 ["runite-bar","Runite bar",5,5,2],
 ["aether-catalyst","Aether catalyst",220,270,2],
 ["$talisman","Talisman subtable",0,0,3],
 ["coins","Coins",48000,52000,11],
 ["chilli-potato","Chilli potato",10,10,7],
 ["super-restore-4","Super restore(4)",4,4,5],
 ["binding-necklace","Binding necklace",25,25,4],
 ["saradomin-brew-3","Saradomin brew(3)",6,6,2],
 ["jug-of-water","Jug of water",250,350,2],
 ["$rdt","Rare drop table",0,0,3]
];
export const HERBS=[
 ["grimy-kwuarm","Grimy kwuarm",25,25,5],
 ["grimy-dwarf-weed","Grimy dwarf weed",25,25,4],
 ["grimy-cadantine","Grimy cadantine",25,25,4],
 ["grimy-lantadyme","Grimy lantadyme",25,25,3]
];
// Published effective odds are rounded; normalized to preserve the 5/139 seed branch.
export const SEEDS=[
 ["ranarr-seed","Ranarr seed",2,2,1/231.7],
 ["snapdragon-seed","Snapdragon seed",2,2,1/248.2],
 ["torstol-seed","Torstol seed",2,2,1/315.9],
 ["watermelon-seed","Watermelon seed",30,30,1/331],
 ["willow-seed","Willow seed",2,2,1/347.5],
 ["mahogany-seed","Mahogany seed",2,2,1/386.1],
 ["maple-seed","Maple seed",2,2,1/386.1],
 ["teak-seed","Teak seed",2,2,1/386.1],
 ["yew-seed","Yew seed",2,2,1/386.1],
 ["papaya-tree-seed","Papaya tree seed",2,2,1/496.4],
 ["magic-seed","Magic seed",2,2,1/631.8],
 ["palm-tree-seed","Palm tree seed",2,2,1/695],
 ["spirit-seed","Spirit seed",2,2,1/868.8],
 ["dragonfruit-tree-seed","Dragonfruit tree seed",2,2,1/1158.3],
 ["celastrus-seed","Celastrus seed",2,2,1/1737.5],
 ["redwood-tree-seed","Redwood tree seed",2,2,1/1737.5]
];
export const TALISMANS=[
 ...["air","body","earth","fire","mind","water"].map(x=>[x+"-talisman",x[0].toUpperCase()+x.slice(1)+" talisman",1,1,10]),
 ["cosmic-talisman","Cosmic talisman",1,1,4],
 ["chaos-talisman","Chaos talisman",1,1,3],
 ["nature-talisman","Nature talisman",1,1,3]
];
export const ITEMS=Object.freeze(Object.fromEntries([
 ["abyssal-ashes","Abyssal ashes"],["unsired","Unsired"],
 ...REWARDS.map(x=>[x.id,x.name]),...TERTIARY.map(x=>[x.id,x.name]),
 ...[MAIN,HERBS,SEEDS,TALISMANS,RDT].flat()
   .filter(row=>!row[0].startsWith("$")&&row[0]!=="nothing")
   .map(row=>[row[0],row[1]])
].map(([id,name])=>[id,{id,name}])));

export function validateKills(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter between 0 and 1,000,000 completed kills.");
 return n;
}
export function validateUnsired(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Unsired count must be between 0 and 1,000,000.");
 return n;
}
function unit(rng){
 const r=rng();
 if(typeof r!=="number"||!Number.isFinite(r)||r<0||r>=1)
  throw new RangeError("Random generator must return a value in [0, 1).");
 return r;
}
function pick(rows,index,rng){
 const total=rows.reduce((s,row)=>s+row[index],0);
 let roll=unit(rng)*total;
 for(const row of rows){roll-=row[index];if(roll<0)return row;}
 return rows.at(-1);
}
function amount(row,rng){
 const lo=row[2],hi=row[3];
 return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));
}
function addTo(drops,id,qty=1){
 if(qty>0)drops[id]=(drops[id]||0)+qty;
}
// Bludgeon components are dealt as a fresh random permutation of all three.
// This prevents duplicates before each three-piece set is completed.
export function openUnsired(count,{rng=Math.random}={}){
 validateUnsired(count);
 const drops=Object.create(null);
 let orphanOwned=false;
 let missing=BLUDGEON.map(x=>x.id);
 for(let i=0;i<count;i++){
  const tickets=orphanOwned?123:128;
  let roll=unit(rng)*tickets;
  let selected;
  for(const [id,weight] of REWARD_WEIGHTS){
   if(id==="abyssal-orphan"&&orphanOwned)continue;
   roll-=weight;
   if(roll<0){selected=id;break;}
  }
  if(selected==="bludgeon"){
   if(missing.length===0)missing=BLUDGEON.map(x=>x.id);
   const index=Math.floor(unit(rng)*missing.length);
   addTo(drops,missing.splice(index,1)[0]);
  }else{
   addTo(drops,selected);
   if(selected==="abyssal-orphan")orphanOwned=true;
  }
 }
 return {count,drops};
}
function normalDrop(rng,add){
 let entry=pick(MAIN,4,rng);
 if(entry[0]==="$herb")entry=pick(HERBS,4,rng);
 else if(entry[0]==="$seed")entry=pick(SEEDS,4,rng);
 else if(entry[0]==="$talisman")entry=pick(TALISMANS,4,rng);
 else if(entry[0]==="$rdt"){
  entry=pick(RDT,4,rng);
  if(entry[0]!=="nothing")add(entry[0],amount(entry,rng)*2);
  return;
 }
 add(entry[0],amount(entry,rng));
}
export function simulate(kills,{rng=Math.random,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);
 const drops=Object.create(null);
 const add=(id,n=1)=>addTo(drops,id,n);
 for(let i=0;i<kills;i++){
  add("abyssal-ashes");
  if(unit(rng)<UNSIRED_RATE)add("unsired");
  else normalDrop(rng,add);
  if(unit(rng)<(eliteCAs?1/171:1/180))add("clue-scroll-elite");
  if(konarTask&&unit(rng)<1/40)add("brimstone-key");
 }
 const opened=openUnsired(drops.unsired||0,{rng});
 return {kills,drops,unsired:opened.count,rewards:opened.drops};
}
