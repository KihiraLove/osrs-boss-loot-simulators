// The Hueycoatl. Unique and pet odds scale with damage contribution.
// Drop data: https://oldschool.runescape.wiki/w/The_Hueycoatl
export const MAX_KILLS=1_000_000;
export const MODES=Object.freeze([
 {id:"solo",name:"Solo (100%)",share:1},
 {id:"duo",name:"Duo (50%)",share:0.5},
 {id:"trio",name:"Trio (33%)",share:0.33}
]);
export const PRIMARY=Object.freeze([
 {id:"dragon-hunter-wand",name:"Dragon hunter wand",quantity:1,weight:6},
 {id:"hueycoatl-hide",name:"Hueycoatl hide",quantity:3,weight:22},
 {id:"tome-of-earth-empty",name:"Tome of Earth (empty)",quantity:1,weight:7}
]);
export const PET={id:"huberte",name:"Huberte",quantity:1};
export const UNIQUE=[...PRIMARY,PET];
export const DRY_ITEMS=UNIQUE;
export const UNIQUE_CHANCE=1/18;
export const KEY_CHANCE=1/75;
export const PET_CHANCE=1/400;
// One primary ordinary roll with 68 weighted tickets, independent of a unique roll.
// [id, minimum (solo), maximum (solo), weight]
const parseRows=s=>s.trim().split(/\s+/).map(word=>{
 const [id,a,b,w]=word.split(":");return [id,+a,+b,+w];
});
export const COMMON=parseRows(
 "rune-mace:1:26:3 rune-scimitar:1:20:3 rune-plateskirt:1:20:2 adamant-platebody:1:30:3 "+
 "death-rune:22:450:3 earth-rune:150:3000:2 cosmic-rune:20:400:2 nature-rune:20:400:2 "+
 "lantadyme-seed:3:60:2 huasca-seed:1:20:2 toadflax-seed:2:40:2 torstol-seed:1:20:2 "+
 "ranarr-seed:1:20:2 avantoe-seed:1:20:3 kwuarm-seed:1:20:3 "+
 "soiled-page:4:80:5 adamant-bolts-unf:15:300:3 air-orb:4:80:3 raw-shark:9:180:3 "+
 "sunfire-splinters:17:350:3 sun-kissed-bones:5:100:3 dragon-bones:2:40:3 "+
 "adamantite-ore:6:120:2 steel-cannonball:60:1200:3 rune-dart-tip:6:120:2 "+
 "limpwurt-root:10:200:2"
);
const NAMES={
 "tome-of-earth-empty":"Tome of Earth (empty)",
 "tooth-half-of-key-moon-key":"Tooth half of key (moon key)",
 "clue-scroll-hard":"Clue scroll (hard)",
 "adamant-bolts-unf":"Adamant bolts(unf)"
};
const label=id=>NAMES[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
const ids=[...new Set([...UNIQUE.map(x=>x.id),...COMMON.map(x=>x[0]),
 "big-bones","tooth-half-of-key-moon-key","clue-scroll-hard"])];
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[id,{
 id,name:UNIQUE.find(i=>i.id===id)?.name??label(id)
}])));
export function validateKills(n,name="Kills"){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError(name+" must be a whole number from 0 to 1,000,000.");
 return n;
}
export function validateCounts(soloKills,duoKills,trioKills){
 validateKills(soloKills,"Solo KC");validateKills(duoKills,"Duo KC");validateKills(trioKills,"Trio KC");
}
export function validateOptions({hardCAs=false}={}){
 if(typeof hardCAs!=="boolean")throw new TypeError("Hard Combat Achievements must be boolean.");
}
export function rateOf(id,mode="solo",hardCAs=false){
 const entry=MODES.find(m=>m.id===mode);
 if(!entry)throw new RangeError("Unknown Hueycoatl team size.");
 validateOptions({hardCAs});
 if(id==="huberte")return entry.share*PET_CHANCE;
 if(id==="tooth-half-of-key-moon-key")return KEY_CHANCE;
 if(id==="clue-scroll-hard")return 1/(hardCAs?47:50);
 const unique=PRIMARY.find(i=>i.id===id);
 return unique?entry.share*UNIQUE_CHANCE*unique.weight/35:0;
}
function unit(rng){
 const x=rng();
 if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)
  throw new RangeError("RNG must return a finite number in [0, 1).");
 return x;
}
function amount(low,high,rng){
 return low===high?low:low+Math.floor(unit(rng)*(high-low+1));
}
function ordinary(rng){
 let t=Math.floor(unit(rng)*68);
 for(const row of COMMON){t-=row[3];if(t<0)return row;}
 return COMMON.at(-1);
}
function chooseUnique(rng){
 let t=Math.floor(unit(rng)*35);
 for(const item of PRIMARY){t-=item.weight;if(t<0)return item;}
 return PRIMARY.at(-1);
}
// Contribution scales normal loot QUANTITIES, not the ordinary item weights.
// The game's exact distribution within a quantity range is not published;
// uniformly choose the solo quantity, then apply the share.
export function scaledQuantity(min,max,share,rng=Math.random){
 if(typeof share!=="number"||share<=0||share>1||!Number.isFinite(share))
  throw new RangeError("Contribution must be in (0, 1].");
 return Math.max(1,Math.round(amount(min,max,rng)*share));
}
export function simulate(soloKills,duoKills,trioKills,{rng=Math.random,hardCAs=false}={}){
 validateCounts(soloKills,duoKills,trioKills);validateOptions({hardCAs});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null),add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 const byMode={solo:soloKills,duo:duoKills,trio:trioKills};
 for(const mode of MODES){
  for(let k=0;k<byMode[mode.id];k++){
   const [id,min,max]=ordinary(rng);
   add(id,scaledQuantity(min,max,mode.share,rng));
   if(unit(rng)<mode.share*UNIQUE_CHANCE){
    const choice=chooseUnique(rng);add(choice.id,choice.quantity);
   }
   if(unit(rng)<mode.share*PET_CHANCE)add(PET.id);
   if(unit(rng)<KEY_CHANCE)add("tooth-half-of-key-moon-key");
   if(unit(rng)<1/(hardCAs?47:50))add("clue-scroll-hard");
   // Solo automatically has MVP for the guaranteed big bones.
   // For equal-share group kills, MVP cannot be determined from team size.
   if(mode.id==="solo")add("big-bones");
  }
 }
 return {soloKills,duoKills,trioKills,kills:soloKills+duoKills+trioKills,drops};
}
