import {wealthTable} from "../../shared/rare-tables.mjs";
// Giant Mole: guaranteed parts, one 131-ticket main roll, independent tertiary.
// Drop data: https://oldschool.runescape.wiki/w/Giant_Mole
// Nested rare-drop, gem, mega-rare, and talisman tables follow wiki ratios.
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([{"id":"immaculate-mole-skin","name":"Immaculate mole skin","rate":0.02},{"id":"baby-mole","name":"Baby Mole","rate":0.0003333333333333333}]);
export const DRY_ITEMS=UNIQUE;
const rows=text=>text.trim().split(/\s+/).map(token=>{
 const [id,min,max,weight]=token.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
export const MAIN=rows("adamant-longsword:1:1:10 mithril-platebody:1:1:9 amulet-of-strength:1:1:7 mithril-axe:1:1:2 mithril-battleaxe:1:1:1 rune-med-helm:1:1:1 air-rune:105:105:20 blood-rune:15:15:19 fire-rune:105:105:11 iron-arrow:690:690:10 law-rune:15:15:5 death-rune:50:50:3 yew-logs:100:100:10 shark:4:4:4 mithril-bar:1:1:3 ranarr-seed:1:1:3 iron-ore:100:100:2 oyster-pearls:1:1:1 @rare:0:0:4 @gem:0:0:6");
export const RARE=rows("nature-rune:67:67:3 adamant-javelin:20:20:2 death-rune:45:45:2 law-rune:45:45:2 rune-arrow:42:42:2 steel-arrow:150:150:2 rune-2h-sword:1:1:3 rune-battleaxe:1:1:3 rune-sq-shield:1:1:2 dragon-med-helm:1:1:1 rune-kiteshield:1:1:1 coins:3000:3000:21 loop-half-of-key:1:1:20 tooth-half-of-key:1:1:20 runite-bar:1:1:5 dragonstone:1:1:2 silver-ore:100:100:2 @gem:0:0:20 @mega:0:0:15");
export const GEM=rows("@nothing:0:0:63 uncut-sapphire:1:1:32 uncut-emerald:1:1:16 uncut-ruby:1:1:8 @talisman:0:0:3 uncut-diamond:1:1:2 rune-javelin:5:5:1 loop-half-of-key:1:1:1 tooth-half-of-key:1:1:1 @mega:0:0:1");
export const MEGA=rows("@nothing:0:0:113 rune-spear:1:1:8 shield-left-half:1:1:4 dragon-spear:1:1:3");
export const TALISMAN=rows("air-talisman:1:1:10 body-talisman:1:1:10 earth-talisman:1:1:10 fire-talisman:1:1:10 mind-talisman:1:1:10 water-talisman:1:1:10 cosmic-talisman:1:1:4 chaos-talisman:1:1:3 nature-talisman:1:1:3");
export const SUBTABLES=Object.freeze({rare:RARE,gem:GEM,mega:MEGA,talisman:TALISMAN});
export const ITEMS=Object.freeze(Object.fromEntries([["adamant-longsword","Adamant longsword"],["mithril-platebody","Mithril platebody"],["amulet-of-strength","Amulet of strength"],["mithril-axe","Mithril axe"],["mithril-battleaxe","Mithril battleaxe"],["rune-med-helm","Rune med helm"],["air-rune","Air rune"],["blood-rune","Blood rune"],["fire-rune","Fire rune"],["iron-arrow","Iron arrow"],["law-rune","Law rune"],["death-rune","Death rune"],["yew-logs","Yew logs"],["shark","Shark"],["mithril-bar","Mithril bar"],["ranarr-seed","Ranarr seed"],["iron-ore","Iron ore"],["oyster-pearls","Oyster pearls"],["nature-rune","Nature rune"],["adamant-javelin","Adamant javelin"],["rune-arrow","Rune arrow"],["steel-arrow","Steel arrow"],["rune-2h-sword","Rune 2h sword"],["rune-battleaxe","Rune battleaxe"],["rune-sq-shield","Rune sq shield"],["dragon-med-helm","Dragon med helm"],["rune-kiteshield","Rune kiteshield"],["coins","Coins"],["loop-half-of-key","Loop half of key"],["tooth-half-of-key","Tooth half of key"],["runite-bar","Runite bar"],["dragonstone","Dragonstone"],["silver-ore","Silver ore"],["uncut-sapphire","Uncut sapphire"],["uncut-emerald","Uncut emerald"],["uncut-ruby","Uncut ruby"],["uncut-diamond","Uncut diamond"],["rune-javelin","Rune javelin"],["rune-spear","Rune spear"],["shield-left-half","Shield left half"],["dragon-spear","Dragon spear"],["air-talisman","Air talisman"],["body-talisman","Body talisman"],["earth-talisman","Earth talisman"],["fire-talisman","Fire talisman"],["mind-talisman","Mind talisman"],["water-talisman","Water talisman"],["cosmic-talisman","Cosmic talisman"],["chaos-talisman","Chaos talisman"],["nature-talisman","Nature talisman"],["big-bones","Big bones"],["mole-claw","Mole claw"],["mole-skin","Mole skin"],["immaculate-mole-skin","Immaculate mole skin"],["long-bone","Long bone"],["baby-mole","Baby Mole"],["curved-bone","Curved bone"],["clue-scroll-elite","Clue scroll (elite)"],["brimstone-key","Brimstone key"]].map(([id,name])=>[id,{id,name}])));
export const TERTIARY=Object.freeze([
 {id:"immaculate-mole-skin",rate:1/50},
 {id:"long-bone",rate:1/400},
 {id:"baby-mole",rate:1/3000},
 {id:"curved-bone",rate:1/5012.5},
 {id:"clue-scroll-elite",rate:1/500}
]);
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number from 0 to 1,000,000 Giant Mole kills.");
 return kills;
}
export function rateOf(id){
 return UNIQUE.find(x=>x.id===id)?.rate??0;
}
export function clueRate(eliteCAs=false){
 if(typeof eliteCAs!=="boolean")throw new TypeError("Elite Combat Achievements must be boolean.");
 return eliteCAs?1/475:1/500;
}
function unit(rng){
 const n=rng();
 if(typeof n!=="number"||!Number.isFinite(n)||n<0||n>=1)
  throw new RangeError("Random must return a finite value in [0, 1).");
 return n;
}
function pick(table,rng){
 let ticket=unit(rng)*table.reduce((s,r)=>s+r[3],0);
 for(const r of table){ticket-=r[3];if(ticket<0)return r;}
 return table.at(-1);
}
function quantity(min,max,rng){
 return min===max?min:min+Math.floor(unit(rng)*(max-min+1));
}
export function simulate(kills,{ringOfWealth=false,rng=Math.random,eliteCAs=false}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 validateKills(kills);clueRate(eliteCAs);

 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let i=0;i<kills;i++){
  // All three guaranteed rewards occur on each completed kill.
  add("big-bones");add("mole-claw");add("mole-skin",quantity(1,3,rng));
  let [id,min,max]=pick(MAIN,rng);
  // Main result is one outcome; nested tables resolve to one item or nothing.
  let depth=0;
  while(id.startsWith("@")&&id!=="@nothing"){
   if(++depth>5)throw new Error("Nested drop table exceeded depth.");
   [id,min,max]=pick(wealthTable(SUBTABLES[id.slice(1)],ringOfWealth,3,{nested:true}),rng);
  }
  if(id!=="@nothing")add(id,quantity(min,max,rng));
  // Independent tertiary rolls may overlap with the ordinary reward and each other.
  if(unit(rng)<1/50)add("immaculate-mole-skin");
  if(unit(rng)<1/400)add("long-bone");
  if(unit(rng)<1/3000)add("baby-mole");
  if(unit(rng)<1/5012.5)add("curved-bone");
  if(unit(rng)<clueRate(eliteCAs))add("clue-scroll-elite");

 }
 return {kills,eliteCAs,drops};
}
