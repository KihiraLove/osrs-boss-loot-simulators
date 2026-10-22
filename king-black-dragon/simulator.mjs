// King Black Dragon: OSRS Wiki (Oct 2026) main 128-ticket table.
// The dragon pickaxe is a 1/1000 pre-roll (replaces the standard roll).
// Guaranteed bones/hides and heads, pet, visage, clue are additional rolls.
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([
 {id:"dragon-pickaxe",name:"Dragon pickaxe",rate:1/1000},
 {id:"kbd-heads",name:"Kbd heads",rate:1/128},
 {id:"draconic-visage",name:"Draconic visage",rate:1/5000},
 {id:"prince-black-dragon",name:"Prince Black Dragon",rate:1/3000}
]);
export const DRY_ITEMS=UNIQUE;
export const MAIN=[["rune-longsword",1,1,10],["adamant-platebody",1,1,9],["adamant-kiteshield",1,1,3],["dragon-med-helm",1,1,1],["fire-rune",300,300,5],["air-rune",300,300,10],["iron-arrow",690,690,10],["runite-bolts",10,20,10],["law-rune",30,30,5],["blood-rune",30,30,5],["yew-logs",150,150,10],["adamantite-bar",3,3,5],["runite-bar",1,1,3],["gold-ore",100,100,2],["amulet-of-power",1,1,7],["dragon-arrowtips",5,14,5],["dragon-dart-tip",5,14,5],["dragon-javelin-tips",15,15,5],["runite-limbs",1,1,4],["shark",4,4,4],["@rareDrop",0,0,8],["@gem",0,0,2]];
export const RARE=[["nature-rune",67,67,3],["adamant-javelin",20,20,2],["death-rune",45,45,2],["law-rune",45,45,2],["rune-arrow",42,42,2],["steel-arrow",150,150,2],["rune-2h-sword",1,1,3],["rune-battleaxe",1,1,3],["rune-sq-shield",1,1,2],["dragon-med-helm",1,1,1],["rune-kiteshield",1,1,1],["coins",3000,3000,21],["loop-half-of-key",1,1,20],["tooth-half-of-key",1,1,20],["runite-bar",1,1,5],["dragonstone",1,1,2],["silver-ore",100,100,2],["@gem",0,0,20],["@megaRare",0,0,15]];
export const GEM=[["@nothing",0,0,63],["uncut-sapphire",1,1,32],["uncut-emerald",1,1,16],["uncut-ruby",1,1,8],["@talisman",0,0,3],["uncut-diamond",1,1,2],["rune-javelin",5,5,1],["loop-half-of-key",1,1,1],["tooth-half-of-key",1,1,1],["@megaRare",0,0,1]];
export const MEGA=[["@nothing",0,0,113],["rune-spear",1,1,8],["shield-left-half",1,1,4],["dragon-spear",1,1,3]];
export const TALISMAN=[["air-talisman",1,1,10],["body-talisman",1,1,10],["earth-talisman",1,1,10],["fire-talisman",1,1,10],["mind-talisman",1,1,10],["water-talisman",1,1,10],["cosmic-talisman",1,1,4],["chaos-talisman",1,1,3],["nature-talisman",1,1,3]];
export const TABLES=Object.freeze({rareDrop:RARE,gem:GEM,megaRare:MEGA,talisman:TALISMAN});
const NAMES={"prince-black-dragon":"Prince Black Dragon","kbd-heads":"Kbd heads","dragon-pickaxe":"Dragon pickaxe","draconic-visage":"Draconic visage","clue-scroll-elite":"Clue scroll (elite)","rune-2h-sword":"Rune 2h sword","rune-sq-shield":"Rune sq shield","iron-arrow":"Iron arrow","runite-bolts":"Runite bolts","dragon-bones":"Dragon bones","black-dragonhide":"Black dragonhide","rune-longsword":"Rune longsword","adamant-platebody":"Adamant platebody","adamant-kiteshield":"Adamant kiteshield","dragon-med-helm":"Dragon med helm","fire-rune":"Fire rune","air-rune":"Air rune","law-rune":"Law rune","blood-rune":"Blood rune","yew-logs":"Yew logs","adamantite-bar":"Adamantite bar","runite-bar":"Runite bar","gold-ore":"Gold ore","amulet-of-power":"Amulet of power","dragon-arrowtips":"Dragon arrowtips","dragon-dart-tip":"Dragon dart tip","dragon-javelin-tips":"Dragon javelin tips","runite-limbs":"Runite limbs","shark":"Shark","key-elite":"Key (elite)","nature-rune":"Nature rune","adamant-javelin":"Adamant javelin","death-rune":"Death rune","rune-arrow":"Rune arrow","steel-arrow":"Steel arrow","rune-battleaxe":"Rune battleaxe","rune-kiteshield":"Rune kiteshield","coins":"Coins","loop-half-of-key":"Loop half of key","tooth-half-of-key":"Tooth half of key","dragonstone":"Dragonstone","silver-ore":"Silver ore","uncut-sapphire":"Uncut sapphire","uncut-emerald":"Uncut emerald","uncut-ruby":"Uncut ruby","uncut-diamond":"Uncut diamond","rune-javelin":"Rune javelin","rune-spear":"Rune spear","shield-left-half":"Shield left half","dragon-spear":"Dragon spear","grimy-guam-leaf":"Grimy guam leaf","grimy-marrentill":"Grimy marrentill","grimy-tarromin":"Grimy tarromin","grimy-harralander":"Grimy harralander","grimy-ranarr-weed":"Grimy ranarr weed","grimy-irit-leaf":"Grimy irit leaf","grimy-avantoe":"Grimy avantoe","grimy-kwuarm":"Grimy kwuarm","grimy-cadantine":"Grimy cadantine","grimy-lantadyme":"Grimy lantadyme","grimy-dwarf-weed":"Grimy dwarf weed","grimy-snapdragon":"Grimy snapdragon","grimy-torstol":"Grimy torstol","potato-seed":"Potato seed","onion-seed":"Onion seed","cabbage-seed":"Cabbage seed","tomato-seed":"Tomato seed","sweetcorn-seed":"Sweetcorn seed","strawberry-seed":"Strawberry seed","watermelon-seed":"Watermelon seed","snape-grass-seed":"Snape grass seed","barley-seed":"Barley seed","hammerstone-seed":"Hammerstone seed","asgarnian-seed":"Asgarnian seed","jute-seed":"Jute seed","yanillian-seed":"Yanillian seed","krandorian-seed":"Krandorian seed","wildblood-seed":"Wildblood seed","marigold-seed":"Marigold seed","nasturtium-seed":"Nasturtium seed","rosemary-seed":"Rosemary seed","woad-seed":"Woad seed","limpwurt-seed":"Limpwurt seed","redberry-seed":"Redberry seed","cadavaberry-seed":"Cadavaberry seed","dwellberry-seed":"Dwellberry seed","jangerberry-seed":"Jangerberry seed","whiteberry-seed":"Whiteberry seed","poison-ivy-seed":"Poison ivy seed","guam-seed":"Guam seed","marrentill-seed":"Marrentill seed","tarromin-seed":"Tarromin seed","harralander-seed":"Harralander seed","ranarr-seed":"Ranarr seed","toadflax-seed":"Toadflax seed","irit-seed":"Irit seed","avantoe-seed":"Avantoe seed","kwuarm-seed":"Kwuarm seed","snapdragon-seed":"Snapdragon seed","cadantine-seed":"Cadantine seed","lantadyme-seed":"Lantadyme seed","dwarf-weed-seed":"Dwarf weed seed","torstol-seed":"Torstol seed","mushroom-spore":"Mushroom spore","belladonna-seed":"Belladonna seed","cactus-seed":"Cactus seed","potato-cactus-seed":"Potato cactus seed","air-talisman":"Air talisman","body-talisman":"Body talisman","earth-talisman":"Earth talisman","fire-talisman":"Fire talisman","mind-talisman":"Mind talisman","water-talisman":"Water talisman","cosmic-talisman":"Cosmic talisman","chaos-talisman":"Chaos talisman","nature-talisman":"Nature talisman"};
const ids=[...new Set([...MAIN,...RARE,...GEM,...MEGA,...TALISMAN].map(row=>row[0])
 .concat(UNIQUE.map(item=>item.id),["dragon-bones","black-dragonhide","clue-scroll-elite","brimstone-key"]))].filter(id=>!id.startsWith("@"));
export const ITEMS=Object.freeze(Object.fromEntries(ids.map(id=>[id,
 {id,name:NAMES[id]??id.split("-").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ")}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter a whole number of King Black Dragon kills from 0 to 1,000,000.");
 return kills;
}
export function validateOptions({monkeyMadness2=true,eliteCAs=false,konarTask=false}={}){
 if([monkeyMadness2,eliteCAs,konarTask].some(x=>typeof x!=="boolean"))
  throw new TypeError("Quest, Combat Achievement and Slayer task options must be booleans.");
}
export const clueRate=eliteCAs=>eliteCAs?1/427:1/450;
export const rateOf=id=>UNIQUE.find(x=>x.id===id)?.rate??0;
function unit(rng){
 const value=rng();
 if(typeof value!=="number"||!Number.isFinite(value)||value<0||value>=1)
  throw new RangeError("RNG must return a finite number in [0,1).");
 return value;
}
function weighted(table,rng){
 let ticket=unit(rng)*table.reduce((a,row)=>a+row[3],0);
 for(const row of table){ticket-=row[3];if(ticket<0)return row;}
 return table[table.length-1];
}
function amount(lo,hi,rng){return lo===hi?lo:lo+Math.floor(unit(rng)*(hi-lo+1));}
function rollSubtable(which,rng,add){
 let table=TABLES[which];
 if(!table)throw new RangeError("Unknown drop subtable.");
 for(let depth=0;depth<4;depth++){
  const [id,lo,hi]=weighted(table,rng);
  if(id==="@nothing")return;
  if(id.startsWith("@")){table=TABLES[id.slice(1)];if(!table)throw new RangeError("Missing subtable.");continue;}
  add(id,amount(lo,hi,rng));return;
 }
 throw new Error("Drop subtable nesting too deep.");
}
export function simulate(kills,{rng=Math.random,monkeyMadness2=true,eliteCAs=false,konarTask=false}={}){
 validateKills(kills);validateOptions({monkeyMadness2,eliteCAs,konarTask});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 for(let k=0;k<kills;k++){
  add("dragon-bones");add("black-dragonhide",2);
  if(unit(rng)<1/1000)add("dragon-pickaxe");
  else{
   const [id,lo,hi]=weighted(MAIN,rng);
   if(id==="@rareDrop")rollSubtable("rareDrop",rng,add);
   else if(id==="@gem")rollSubtable("gem",rng,add);
   else if(id==="dragon-javelin-tips"&&!monkeyMadness2)add("fire-rune",300);
   else add(id,amount(lo,hi,rng));
  }
  if(unit(rng)<1/128)add("kbd-heads");
  if(unit(rng)<1/3000)add("prince-black-dragon");
  if(unit(rng)<1/5000)add("draconic-visage");
  if(unit(rng)<clueRate(eliteCAs))add("clue-scroll-elite");
  if(konarTask&&unit(rng)<1/65)add("brimstone-key");
 }
 return {kills,monkeyMadness2,eliteCAs,konarTask,drops};
}
