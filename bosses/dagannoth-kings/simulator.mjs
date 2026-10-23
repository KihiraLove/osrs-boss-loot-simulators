// Sources: https://oldschool.runescape.wiki/w/Dagannoth_Rex
// https://oldschool.runescape.wiki/w/Dagannoth_Prime
// https://oldschool.runescape.wiki/w/Dagannoth_Supreme
export const KINGS=[{id:"rex",name:"Dagannoth Rex"},{id:"prime",name:"Dagannoth Prime"},{id:"supreme",name:"Dagannoth Supreme"}];
export const MAX_KILLS=1_000_000, MAIN_RATE=1/128,ANY_MAIN_UNIQUE_RATE=3/128,PET_RATE=1/5000;
const drops=(a,b,c,pet)=>[a,b,c].map(id=>({id,name:name(id),rate:MAIN_RATE})).concat([{id:pet,name:name(pet),rate:PET_RATE}]);
const OVERRIDES={"red-dhide-vambraces":"Red d'hide vambraces","antifire-potion-2":"Antifire potion(2)","prayer-potion-2":"Prayer potion(2)","restore-potion-2":"Restore potion(2)","super-attack-2":"Super attack(2)","super-strength-2":"Super strength(2)","super-defence-2":"Super defence(2)","zamorak-brew-2":"Zamorak brew(2)","clue-scroll-hard":"Clue scroll (hard)","clue-scroll-elite":"Clue scroll (elite)"};
function name(id){return OVERRIDES[id]??id.split("-").map((x,i)=>i===0?x[0].toUpperCase()+x.slice(1):x).join(" ");}
export const UNIQUE={
 rex:drops("berserker-ring","warrior-ring","dragon-axe","pet-dagannoth-rex"),
 prime:drops("seers-ring","mud-battlestaff","dragon-axe","pet-dagannoth-prime"),
 supreme:drops("archers-ring","seercull","dragon-axe","pet-dagannoth-supreme")
};
export const DRY_ITEMS=UNIQUE;
const parse=s=>s.trim().split(/\s+/).map(t=>{const [id,a,b,w]=t.split(":");return {id,min:+a,max:+b,weight:+w};});
export const MAIN={rex:parse("steel-kiteshield:1:1:17 mithril-warhammer:1:1:11 adamant-axe:1:1:7 steel-platebody:1:1:4 mithril-pickaxe:1:1:3 adamant-platebody:1:1:2 fremennik-blade:1:1:2 dragon-axe:1:1:1 rune-axe:1:1:1 fremennik-shield:1:1:1 fremennik-helm:1:1:1 mithril-2h-sword:1:1:1 ring-of-life:1:1:1 rock-shell-plate:1:1:1 rock-shell-legs:1:1:1 berserker-ring:1:1:1 warrior-ring:1:1:1 antifire-potion-2:1:1:1 prayer-potion-2:1:1:1 restore-potion-2:1:1:1 super-attack-2:1:1:1 super-strength-2:1:1:1 super-defence-2:1:1:1 zamorak-brew-2:1:1:1 mithril-ore:25:25:10 adamantite-bar:1:1:3 coal:100:100:2 iron-ore:150:150:1 steel-bar:15:30:1 @talisman:0:0:1 coins:100:1209:10 grimy-ranarr-weed:1:1:7 bass:5:5:7 swordfish:5:5:4 shark:5:5:1 @rare:0:0:8 @gem:0:0:10"),prime:parse("earth-battlestaff:1:1:10 water-battlestaff:1:1:5 air-battlestaff:1:1:4 battlestaff:1:10:1 fremennik-blade:1:1:1 fremennik-shield:1:1:1 fremennik-helm:1:1:1 mud-battlestaff:1:1:1 dragon-axe:1:1:1 farseer-helm:1:1:1 skeletal-top:1:1:1 skeletal-bottoms:1:1:1 seers-ring:1:1:1 air-rune:100:200:6 earth-rune:50:100:5 blood-rune:25:75:2 law-rune:10:75:2 nature-rune:25:75:2 mud-rune:25:75:2 death-rune:25:85:2 @seed:0:0:7 @talisman:0:0:1 earth-talisman:25:75:10 air-talisman:25:75:7 water-talisman:1:76:7 shark:5:5:10 coins:500:1109:3 oyster-pearls:1:1:5 pure-essence:150:150:5 grimy-ranarr-weed:1:1:5 @rare:0:0:8 @gem:0:0:10"),supreme:parse("mithril-knife:25:50:10 red-dhide-vambraces:1:1:7 rune-thrownaxe:5:10:5 adamant-dart:10:25:5 iron-knife:200:500:5 steel-knife:50:150:5 fremennik-blade:1:1:1 fremennik-shield:1:1:1 fremennik-helm:1:1:1 seercull:1:1:1 dragon-axe:1:1:1 archer-helm:1:1:1 spined-body:1:1:1 spined-chaps:1:1:1 archers-ring:1:1:1 steel-arrow:50:250:5 runite-bolts:2:12:5 iron-arrow:200:700:4 @seed:0:0:7 @talisman:0:0:1 coins:500:1110:10 oyster-pearls:1:1:6 opal-bolt-tips:10:30:5 shark:5:5:5 yew-logs:50:150:5 grimy-ranarr-weed:1:1:5 maple-logs:15:65:3 runite-limbs:1:1:2 feather:250:500:1 @rare:0:0:8 @gem:0:0:10")};
// Wiki-published overall unboosted drop rates; decimal denominators are rounded.
export const SEEDS=[
 ["toadflax-seed",1,92.3],["irit-seed",1,134.7],["belladonna-seed",1,139.4],
 ["poison-ivy-seed",1,193.5],["avantoe-seed",1,197.3],["cactus-seed",1,207.6],
 ["potato-cactus-seed",1,284.7],["kwuarm-seed",1,288.9],["snapdragon-seed",1,433.3],
 ["cadantine-seed",1,622.9],["lantadyme-seed",1,866.6],["snape-grass-seed",3,996.6],
 ["dwarf-weed-seed",1,1423.7],["torstol-seed",1,2214.6]
];
export const TALISMANS=[
 ["air-talisman",1,896],["body-talisman",1,896],["earth-talisman",1,896],
 ["fire-talisman",1,896],["mind-talisman",1,896],["water-talisman",1,896],
 ["cosmic-talisman",1,2240],["chaos-talisman",1,2986.7],["nature-talisman",1,2986.7]
];
export const RARE=[
 ["@nothing",0,19.87],["coins",3000,97.52],["uncut-sapphire",1,45.51],
 ["loop-half-of-key",1,95.67],["tooth-half-of-key",1,95.67],["uncut-emerald",1,91.02],
 ["uncut-ruby",1,182.04],["runite-bar",1,409.6],["nature-rune",67,682.67],
 ["rune-2h-sword",1,682.67],["rune-battleaxe",1,682.67],["law-rune",45,1024],
 ["death-rune",45,1024],["steel-arrow",150,1024],["rune-arrow",42,1024],
 ["adamant-javelin",20,1024],["rune-sq-shield",1,1024],["dragonstone",1,1024],
 ["silver-ore",100,1024],["nature-talisman",1,485.45],["uncut-diamond",1,728.18],
 ["rune-kiteshield",1,2048],["dragon-med-helm",1,2048],["rune-spear",1,1997.29],
 ["rune-javelin",5,1456.36],["shield-left-half",1,3994.58],["dragon-spear",1,5326.1]
];
const ids=new Set(["dagannoth-bones","dagannoth-hide","ensouled-dagannoth-head","clue-scroll-hard","clue-scroll-elite","brimstone-key","dagannoth-ribs"]);
for(const king of KINGS){
 MAIN[king.id].filter(x=>!x.id.startsWith("@")).forEach(x=>ids.add(x.id));
 UNIQUE[king.id].forEach(x=>ids.add(x.id));
}
for(const [id] of [...SEEDS,...TALISMANS,...RARE])if(!id.startsWith("@"))ids.add(id);
export const ITEMS=Object.fromEntries([...ids].map(id=>[id,{id,name:UNIQUE.rex.concat(UNIQUE.prime,UNIQUE.supreme).find(x=>x.id===id)?.name??name(id)}]));
export const rateOf=(king,id)=>UNIQUE[king]?.find(x=>x.id===id)?.rate??0;
export function validateKills(counts){
 if(!counts||typeof counts!=="object"||Array.isArray(counts))throw new TypeError("Enter kills for all three kings.");
 const valid={};
 for(const king of KINGS){
  const n=counts[king.id];
  if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)throw new RangeError("Enter 0 to 1,000,000 whole kills for "+king.name+".");
  valid[king.id]=n;
 }
 return valid;
}
export function clueRates({hardCAs=false,eliteCAs=false}={}){
 if(typeof hardCAs!=="boolean"||typeof eliteCAs!=="boolean")throw new TypeError("Combat Achievement options must be booleans.");
 return {hard:hardCAs?1/39:1/42,elite:eliteCAs?1/712:1/750};
}
function unit(rng){const n=rng();if(!Number.isFinite(n)||n<0||n>=1)throw new RangeError("RNG must return a finite value in [0, 1).");return n;}
function setup(rows,weight){let sum=0;return {total:rows.reduce((a,x)=>a+weight(x),0),rows:rows.map(x=>({x,end:(sum+=weight(x))}))};}
function pick(table,rng){
 const r=unit(rng)*table.total;let l=0,h=table.rows.length-1;
 while(l<h){const m=(l+h)>>1;if(r<table.rows[m].end)h=m;else l=m+1;}
 return table.rows[l].x;
}
const mainTables=Object.fromEntries(KINGS.map(k=>[k.id,setup(MAIN[k.id],r=>r.weight)]));
const rareTable=setup(RARE,r=>1/r[2]),seedTable=setup(SEEDS,r=>1/r[2]),talismanTable=setup(TALISMANS,r=>1/r[2]);
const qty=(a,b,rng)=>a===b?a:a+Math.floor(unit(rng)*(b-a+1));
export function simulate(counts,{rng=Math.random,hardCAs=false,eliteCAs=false,konarTask=false,questRibs=false}={}){
 const kills=validateKills(counts),clues=clueRates({hardCAs,eliteCAs});
 if(typeof konarTask!=="boolean"||typeof questRibs!=="boolean")throw new TypeError("Task and quest options must be booleans.");
 const kings={};
 for(const king of KINGS){
  const d=Object.create(null),add=(id,n=1)=>{if(n>0)d[id]=(d[id]??0)+n;};
  for(let i=0;i<kills[king.id];i++){
   add("dagannoth-bones");add("dagannoth-hide");
   const row=pick(mainTables[king.id],rng);
   if(row.id.startsWith("@")){
    const table=row.id==="@seed"?seedTable:row.id==="@talisman"?talismanTable:rareTable;
    const [id,n]=pick(table,rng);if(id!=="@nothing")add(id,n);
   }else add(row.id,qty(row.min,row.max,rng));
   if(unit(rng)<1/20)add("ensouled-dagannoth-head");
   if(unit(rng)<clues.hard)add("clue-scroll-hard");
   if(unit(rng)<clues.elite)add("clue-scroll-elite");
   if(unit(rng)<PET_RATE)add("pet-dagannoth-"+king.id);
   if(konarTask&&unit(rng)<1/60)add("brimstone-key");
   if(questRibs&&unit(rng)<1/4)add("dagannoth-ribs");
  }
  kings[king.id]={kills:kills[king.id],drops:d};
 }
 return {counts:kills,kings,hardCAs,eliteCAs,konarTask,questRibs};
}
