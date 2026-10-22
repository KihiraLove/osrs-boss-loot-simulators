// The Gauntlet reward chest (completed regular and corrupted runs only).
// Wiki: https://oldschool.runescape.wiki/w/Reward_Chest_(The_Gauntlet)
export const MAX_KILLS=1_000_000;
export const MODES=Object.freeze({
 regular:{id:"regular",name:"The Gauntlet",rolls:2,shards:[5,9],clue:1/25,clueElite:1/23,seed:1/120,enhanced:1/2000,pet:1/2000},
 corrupted:{id:"corrupted",name:"The Corrupted Gauntlet",rolls:3,shards:[7,12],clue:1/20,clueElite:1/19,seed:1/50,enhanced:1/400,pet:1/800}
});
export const UNIQUE=Object.freeze([
 {id:"crystal-weapon-seed",name:"Crystal weapon seed"},
 {id:"crystal-armour-seed",name:"Crystal armour seed"},
 {id:"enhanced-crystal-weapon-seed",name:"Enhanced crystal weapon seed"},
 {id:"youngllef",name:"Youngllef"}
]);
export const DRY_ITEMS=UNIQUE;
// Item ID, lower and upper inclusive quantity, per-roll weight.
// Every table totals 24, including the 0.5 dragon halberd and 1.5 coins tickets.
const rows=text=>text.trim().split(/\s+/).map(item=>{
 const [id,low,high,weight]=item.split(":");
 return [id,Number(low),Number(high),Number(weight)];
});
export const REGULAR_TABLE=rows(
 "rune-full-helm:2:4:1 rune-chainbody:1:2:1 rune-platebody:1:2:1 "+
 "rune-platelegs:1:2:1 rune-plateskirt:1:2:1 rune-halberd:1:2:1 "+
 "rune-pickaxe:1:2:1 dragon-halberd:1:1:0.5 "+
 "cosmic-rune:160:240:1 nature-rune:100:140:1 law-rune:80:140:1 "+
 "chaos-rune:180:300:1 death-rune:100:160:1 blood-rune:80:140:1 "+
 "mithril-arrow:800:1200:1 adamant-arrow:400:600:1 rune-arrow:200:300:1 "+
 "dragon-arrow:30:85:1 uncut-sapphire:20:60:1 uncut-emerald:10:50:1 "+
 "uncut-ruby:5:30:1 uncut-diamond:3:7:1 battlestaff:4:8:1 coins:20000:80000:1.5"
);
export const CORRUPTED_TABLE=rows(
 "rune-full-helm:3:5:1 rune-chainbody:2:3:1 rune-platebody:2:2:1 "+
 "rune-platelegs:2:3:1 rune-plateskirt:2:3:1 rune-halberd:2:3:1 "+
 "rune-pickaxe:2:3:1 dragon-halberd:1:2:0.5 "+
 "cosmic-rune:175:250:1 nature-rune:125:150:1 law-rune:100:150:1 "+
 "chaos-rune:200:350:1 death-rune:125:175:1 blood-rune:100:150:1 "+
 "mithril-arrow:1000:1500:1 adamant-arrow:500:750:1 rune-arrow:250:450:1 "+
 "dragon-arrow:50:100:1 uncut-sapphire:25:65:1 uncut-emerald:15:60:1 "+
 "uncut-ruby:10:40:1 uncut-diamond:5:15:1 battlestaff:8:12:1 coins:75000:150000:1.5"
);
const names={
 "youngllef":"Youngllef","gauntlet-cape":"Gauntlet cape","crystal-shard":"Crystal shard",
 "clue-scroll-elite":"Clue scroll (elite)"
};
const ids=new Set([
 ...UNIQUE.map(x=>x.id),
 ...REGULAR_TABLE.map(x=>x[0]),...CORRUPTED_TABLE.map(x=>x[0]),
 "crystal-shard","gauntlet-cape","clue-scroll-elite"
]);
export const ITEMS=Object.freeze(Object.fromEntries([...ids].map(id=>[id,{
 id,name:UNIQUE.find(x=>x.id===id)?.name??names[id]??
 id.split("-").map(part=>part[0].toUpperCase()+part.slice(1)).join(" ")
}])));
export function validateKills(kills,label="Kill count"){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError(label+" must be a whole number between 0 and "+MAX_KILLS.toLocaleString("en-US")+".");
 return kills;
}
export function rateOf(mode,id){
 const config=MODES[mode];if(!config)throw new RangeError("Choose regular or corrupted Gauntlet.");
 if(id==="crystal-weapon-seed"||id==="crystal-armour-seed")return config.seed;
 if(id==="enhanced-crystal-weapon-seed")return config.enhanced;
 if(id==="youngllef")return config.pet;
 if(id==="clue-scroll-elite")return config.clue;
 return 0;
}
function unit(rng){
 const value=rng();
 if(typeof value!=="number"||!Number.isFinite(value)||value<0||value>=1)
  throw new RangeError("RNG must return a finite number from 0 (inclusive) to 1 (exclusive).");
 return value;
}
function quantity(a,b,rng){return a===b?a:a+Math.floor(unit(rng)*(b-a+1));}
function pick(table,rng){
 let ticket=unit(rng)*24;
 for(const row of table){ticket-=row[3];if(ticket<0)return row;}
 return table.at(-1);
}
// Every completed chest receives shards, 2/3 standard rolls and four
// mutually independent tertiary rolls. Each seed and the pet can coincide.
export function simulate(regularKills,corruptedKills,{rng=Math.random,eliteCAs=false,includeCape=true}={}){
 validateKills(regularKills,"Regular Gauntlet KC");
 validateKills(corruptedKills,"Corrupted Gauntlet KC");
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 if(typeof eliteCAs!=="boolean"||typeof includeCape!=="boolean")
  throw new TypeError("Options must be booleans.");
 const drops=Object.create(null),add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(const [id,kills,table] of [
  ["regular",regularKills,REGULAR_TABLE],["corrupted",corruptedKills,CORRUPTED_TABLE]
 ]){
  const config=MODES[id];
  for(let k=0;k<kills;k++){
   add("crystal-shard",quantity(...config.shards,rng));
   for(let i=0;i<config.rolls;i++){
    const [item,low,high]=pick(table,rng);
    add(item,quantity(low,high,rng));
   }
   for(const item of UNIQUE)if(unit(rng)<rateOf(id,item.id))add(item.id);
   if(unit(rng)<(eliteCAs?config.clueElite:config.clue))add("clue-scroll-elite");
  }
 }
 // Awarded on first corrupted completion only if the player lacks a cape.
 if(includeCape&&corruptedKills>0)add("gauntlet-cape");
 return {regularKills,corruptedKills,kills:regularKills+corruptedKills,drops};
}
