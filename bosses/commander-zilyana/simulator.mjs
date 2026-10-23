import {wealthTable} from "../../shared/rare-tables.mjs";
// Commander Zilyana and bodyguards (Starlight, Growler and Bree).
// Each full-room clear gives one mutually exclusive 127-ticket roll per monster.
import {RARE,GEM,MEGA,ITEMS as COMMON_ITEMS} from "../king-black-dragon/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const SOURCES=Object.freeze([
 {id:"zilyana",name:"Commander Zilyana"},
 {id:"starlight",name:"Starlight"},
 {id:"growler",name:"Growler"},
 {id:"bree",name:"Bree"}
]);
export const UNIQUE=Object.freeze([
 {id:"saradomin-sword",name:"Saradomin sword",boss:1/127,minion:3/16129},
 {id:"saradomins-light",name:"Saradomin's light",boss:1/254,minion:0},
 {id:"armadyl-crossbow",name:"Armadyl crossbow",boss:1/508,minion:0},
 {id:"saradomin-hilt",name:"Saradomin hilt",boss:1/508,minion:0},
 {id:"godsword-shard-1",name:"Godsword shard 1",boss:1/762,minion:1/1524},
 {id:"godsword-shard-2",name:"Godsword shard 2",boss:1/762,minion:1/1524},
 {id:"godsword-shard-3",name:"Godsword shard 3",boss:1/762,minion:1/1524},
 {id:"pet-zilyana",name:"Pet Zilyana",boss:1/5000,minion:0}
]);
export const DRY_ITEMS=UNIQUE;
export const BOSS_MAIN=[
 ["@unique","Saradomin unique table",0,0,2],
 ["@shard","Godsword shard table",0,0,1],
 ["adamant-platebody","Adamant platebody",1,1,8],
 ["rune-dart","Rune dart",35,40,8],
 ["rune-kiteshield","Rune kiteshield",1,1,8],
 ["rune-plateskirt","Rune plateskirt",1,1,8],
 ["prayer-potion-4","Prayer potion(4)",3,3,8],
 ["@brews","Saradomin brew and super restore",0,0,6],
 ["@magic","Super defence and magic potion",0,0,8],
 ["diamond","Diamond",6,6,8],
 ["law-rune","Law rune",95,100,8],
 ["grimy-ranarr-weed","Grimy ranarr weed",5,5,8],
 ["ranarr-seed","Ranarr seed",2,2,8],
 ["magic-seed","Magic seed",1,1,1],
 ["@rare","God Wars rare drop table",0,0,8],
 ["@gem","God Wars gem drop table",0,0,2],
 ["coins","Coins",19500,20000,27]
];
export const MINION_MAIN=[
 ["@unique","Saradomin sword table",0,0,1],
 ["@shard","Godsword shard table",0,0,1],
 ["steel-arrow","Steel arrow",95,100,8],
 ["steel-dart","Steel dart",95,100,8],
 ["law-rune","Law rune",5,10,8],
 ["monkfish","Monkfish",3,3,8],
 ["summer-pie","Summer pie",1,1,8],
 ["coins","Coins",1300,1400,62],
 ["grimy-ranarr-weed","Grimy ranarr weed",1,1,8],
 ["snape-grass","Snape grass",5,5,7],
 ["unicorn-horn","Unicorn horn",6,6,8]
];
export const mainTickets=table=>table.reduce((total,row)=>total+row[4],0);
const extras=[
 ["bones","Bones"],["frozen-key-piece-saradomin","Frozen key piece (Saradomin)"],
 ["brimstone-key","Brimstone key"],["clue-scroll-hard","Clue scroll (hard)"],
 ["clue-scroll-elite","Clue scroll (elite)"],
 ["saradomin-brew-3","Saradomin brew(3)"],
 ["super-restore-4","Super restore(4)"],
 ["super-defence-3","Super defence(3)"],
 ["magic-potion-3","Magic potion(3)"],
 ["chaos-talisman","Chaos talisman"]
];
const names=Object.fromEntries([
 ...Object.entries(COMMON_ITEMS).map(([id,value])=>[id,value.name]),
 ...BOSS_MAIN.map(row=>row.slice(0,2)),
 ...MINION_MAIN.map(row=>row.slice(0,2)),
 ...extras,...UNIQUE.map(item=>[item.id,item.name])
]);
const ids=new Set([...BOSS_MAIN,...MINION_MAIN].map(row=>row[0])
 .concat([...RARE,...GEM,...MEGA].map(row=>row[0]))
 .concat(UNIQUE.map(item=>item.id),extras.map(row=>row[0])));
export const ITEMS=Object.freeze(Object.fromEntries([...ids]
 .filter(id=>!id.startsWith("@")&&id!=="nothing"&&id!=="runite-bar")
 .map(id=>[id,{id,name:names[id]??id.split("-").map(s=>s[0].toUpperCase()+s.slice(1)).join(" ")}])));

export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of full-room Zilyana kills from 0 to 1,000,000.");
 return kills;
}
export function rateOf(id,source="room"){
 const item=UNIQUE.find(x=>x.id===id);
 if(!item)return 0;
 if(source==="zilyana")return item.boss;
 if(["starlight","growler","bree"].includes(source))return item.minion;
 if(source==="room")
  return -Math.expm1(Math.log1p(-item.boss)+3*Math.log1p(-item.minion));
 throw new RangeError("Unknown loot source.");
}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("RNG must return a finite number in [0,1).");
 return v;
}
function weighted(rows,rng,index=4){
 let t=unit(rng)*mainTickets(rows);
 for(const row of rows){t-=row[4];if(t<0)return row;}
 return rows.at(-1);
}
function amount(low,high,rng){
 return low===high?low:low+Math.floor(unit(rng)*(high-low+1));
}
const SHARDS=["godsword-shard-1","godsword-shard-2","godsword-shard-3"];
function rollPrimary(rng,add,isBoss,ringOfWealth=false){
 const [id,,lo,hi]=weighted(isBoss?BOSS_MAIN:MINION_MAIN,rng);
 if(id==="@unique"){
  if(isBoss){
   // Two of 127 tickets; 4/8 sword, 2/8 light, 1/8 each crossbow and hilt.
   const n=Math.floor(unit(rng)*8);
   add(n<4?"saradomin-sword":n<6?"saradomins-light":
       n===6?"armadyl-crossbow":"saradomin-hilt");
  }else{
   // 1/127 * (3/127) sword chance, not a whole 1/127.
   if(unit(rng)<3/127)add("saradomin-sword");
   else add("coins",amount(1400,1500,rng));
  }
 }else if(id==="@shard"){
  const n=Math.floor(unit(rng)*(isBoss?6:12));
  if(n<3)add(SHARDS[n]);
  else add("coins",amount(isBoss?20100:1300,isBoss?20600:1400,rng));
 }else if(id==="@brews"){
  add("saradomin-brew-3",3);add("super-restore-4",3);
 }else if(id==="@magic"){
  add("super-defence-3",3);add("magic-potion-3",3);
 }else if(id==="@rare"||id==="@gem"){
  // Shared four-column rare and gem subtables: [id,lo,hi,weight].
  let current=id==="@rare"?RARE:GEM;
  for(let depth=0;depth<8;depth++){
   const [name,min,max]=weighted(wealthTable(current,ringOfWealth,3,{nested:true}),rng,3);
   if(name==="@gem"){current=GEM;continue;}
   if(name==="@megaRare"){current=MEGA;continue;}
   if(name==="@talisman"){add("chaos-talisman");return;}
   if(name==="@nothing"||name==="nothing"){
    add("coins",amount(19500,20000,rng));return;
   }
   const resolved=name==="runite-bar"?"rune-sword":name;
   add(resolved,resolved==="coins"?amount(19500,20000,rng):amount(min,max,rng));
   return;
  }
  throw new Error("Rare table recursion limit exceeded.");
 }else add(id,amount(lo,hi,rng));
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,hardCAs=false,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if([hardCAs,eliteCAs].some(v=>typeof v!=="boolean"))
  throw new TypeError("Combat Achievement options must be boolean.");
 const bySource=Object.fromEntries(SOURCES.map(x=>[x.id,Object.create(null)]));
 const add=(source,id,n=1)=>{if(n>0)bySource[source][id]=(bySource[source][id]??0)+n;};
 for(let k=0;k<kills;k++){
  add("zilyana","bones");
  rollPrimary(rng,(id,n)=>add("zilyana",id,n),true,ringOfWealth);
  if(unit(rng)<1/5000)add("zilyana","pet-zilyana");
  if(unit(rng)<(eliteCAs?1/237:1/250))add("zilyana","clue-scroll-elite");

  for(const source of ["starlight","growler","bree"]){
   add(source,"bones");
   rollPrimary(rng,(id,n)=>add(source,id,n),false,ringOfWealth);
   if(unit(rng)<(hardCAs?1/121:1/128))add(source,"clue-scroll-hard");
  }
 }
 const drops=Object.create(null);
 for(const source of SOURCES)
  for(const [id,n] of Object.entries(bySource[source.id]))
   drops[id]=(drops[id]??0)+n;
 return {kills,bySource,drops};
}
