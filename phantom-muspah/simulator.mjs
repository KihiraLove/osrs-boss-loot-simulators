// Phantom Muspah, OSRS Wiki: a 100-ticket essence/unique roll, then two
// secondary loot rolls unless Venator shard was obtained.
// Sources: https://oldschool.runescape.wiki/w/Phantom_Muspah
import {RDT} from "../cerberus/simulator.mjs";
export const MAX_KILLS=1_000_000;
export const UNIQUE=[{"id":"ancient-essence","name":"Ancient essence","rate":0.93},{"id":"frozen-cache","name":"Frozen cache","rate":0.04},{"id":"ancient-icon","name":"Ancient icon","rate":0.02},{"id":"venator-shard","name":"Venator shard","rate":0.01},{"id":"muphin","name":"Muphin","rate":0.0004},{"id":"charged-ice","name":"Charged ice","rate":0}];
export const DRY_ITEMS=UNIQUE.filter(x=>!["ancient-essence","charged-ice"].includes(x.id));
export const MAIN=[["rune-kiteshield","Rune kiteshield",3,3,10],["dragon-plateskirt","Dragon plateskirt",1,1,5],["rune-platelegs","Rune platelegs",3,3,5],["black-dhide-body","Black d'hide body",1,1,5],["dragon-platelegs","Dragon platelegs",2,2,4],["rune-sword","Rune sword",1,1,1],["law-rune","Law rune",146,146,10],["soul-rune","Soul rune",380,380,10],["death-rune","Death rune",428,428,10],["smoke-rune","Smoke rune",314,314,15],["chaos-rune","Chaos rune",480,480,5],["fire-rune","Fire rune",1964,1964,5],["steel-cannonball","Steel cannonball",670,670,5],["grimy-toadflax","Grimy toadflax",40,40,3],["yew-seed","Yew seed",2,2,5],["torstol-seed","Torstol seed",2,2,5],["palm-tree-seed","Palm tree seed",2,2,5],["ranarr-seed","Ranarr seed",3,3,5],["snapdragon-seed","Snapdragon seed",5,5,4],["ranarr-seed","Ranarr seed",5,5,3],["spirit-seed","Spirit seed",1,1,2],["adamantite-ore","Adamantite ore",22,22,10],["gold-ore","Gold ore",180,180,10],["teak-plank","Teak plank",22,22,10],["molten-glass","Molten glass",89,89,15],["pure-essence","Pure essence",2314,2314,5],["coal","Coal",163,163,5],["runite-ore","Runite ore",18,18,3],["silver-ore","Silver ore",101,101,2],["water-orb","Water orb",21,21,15],["dragon-bolts-unf","Dragon bolts (unf)",89,89,10],["limpwurt-root","Limpwurt root",21,21,3],["raw-shark","Raw shark",28,28,3.75],["shark-lure","Shark lure",56,56,3.75],["manta-ray","Manta ray",28,28,2.5],["rare-drop-table","Rare drop table",0,0,5],["@herbs","Combat herbs",0,0,5],["@seeds","Rare seeds",0,0,5]];
export const HERBS=[["grimy-kwuarm","Grimy kwuarm",6,6,5],["grimy-dwarf-weed","Grimy dwarf weed",6,6,4],["grimy-cadantine","Grimy cadantine",6,6,4],["grimy-lantadyme","Grimy lantadyme",6,6,3]];
export const SEEDS=[["ranarr-seed","Ranarr seed",3,3,0.11998978810314016],["snapdragon-seed","Snapdragon seed",3,3,0.11201143946615824],["torstol-seed","Torstol seed",3,3,0.08799850215315484],["watermelon-seed","Watermelon seed",49,49,0.0840035746201966],["willow-seed","Willow seed",3,3,0.08],["mahogany-seed","Mahogany seed",3,3,0.07199754901960785],["maple-seed","Maple seed",3,3,0.07199754901960785],["teak-seed","Teak seed",3,3,0.07199754901960785],["yew-seed","Yew seed",3,3,0.07199754901960785],["papaya-tree-seed","Papaya tree seed",3,3,0.0559990468247349],["magic-seed","Magic seed",3,3,0.04399925107657742],["palm-tree-seed","Palm tree seed",3,3,0.04],["spirit-seed","Spirit seed",3,3,0.03199891067538126],["dragonfruit-tree-seed","Dragonfruit tree seed",3,3,0.02400040851759179],["celastrus-seed","Celastrus seed",3,3,0.016],["redwood-tree-seed","Redwood tree seed",3,3,0.016],["@nothing","No listed seed",0,0,0.000008882484633265797]];
export const SUPPLIES=[[["shark","Shark",4,6],["summer-pie","Summer pie",4,6]],[["ancient-brew-3","Ancient brew(3)",1,2],["ranging-potion-3","Ranging potion(3)",1,3]],[["super-restore-3","Super restore(3)",2,3],["prayer-potion-3","Prayer potion(3)",2,3]]];
export const TERTIARY=[{id:"clue-scroll-hard",name:"Clue scroll (hard)"},{id:"clue-scroll-elite",name:"Clue scroll (elite)"},{id:"brimstone-key",name:"Brimstone key"}];
export const ITEMS=Object.freeze(Object.fromEntries([
 ...UNIQUE.map(x=>[x.id,x.name]),...MAIN.map(x=>x.slice(0,2)),
 ...HERBS.map(x=>x.slice(0,2)),...SEEDS.map(x=>x.slice(0,2)),
 ...SUPPLIES.flatMap(g=>g.map(x=>x.slice(0,2))),...RDT.map(x=>x.slice(0,2)),
 ...TERTIARY.map(x=>[x.id,x.name])
].filter(([id])=>!id.startsWith("@")&&id!=="nothing"&&id!=="rare-drop-table").map(([id,name])=>[id,{id,name}])));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter 0 to 1,000,000 completed Phantom Muspah kills.");
 return kills;
}
export function rateOf(id){return UNIQUE.find(x=>x.id===id)?.rate??0;}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)throw new RangeError("RNG must return [0,1).");
 return v;
}
function weighted(table,rng){
 const sum=table.reduce((total,row)=>total+row[4],0);let x=unit(rng)*sum;
 for(const row of table){x-=row[4];if(x<0)return row;}
 return table.at(-1);
}
function amount(lo,hi,rng,step=1){
 return lo===hi?lo:lo+step*Math.floor(unit(rng)*(Math.floor((hi-lo)/step)+1));
}
export function uniqueRoll(rng=Math.random){
 const x=unit(rng)*100;
 if(x<60)return ["ancient-essence",amount(540,599,rng)];
 if(x<83)return ["ancient-essence",amount(885,995,rng,5)];
 if(x<93)return ["ancient-essence",amount(1970,2060,rng,10)];
 if(x<97)return ["frozen-cache",1];
 if(x<99)return ["ancient-icon",1];
 return ["venator-shard",1];
}
export function simulate(kills,{rng=Math.random,konarTask=false,hardCAs=false,eliteCAs=false,chargedIce=false}={}){
 validateKills(kills);if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 for(const [key,val] of Object.entries({konarTask,hardCAs,eliteCAs,chargedIce}))
  if(typeof val!=="boolean")throw new TypeError(key+" must be a boolean.");
 const drops=Object.create(null),add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 const common=()=>{
  let row=weighted(MAIN,rng);
  if(row[0]==="@herbs")row=weighted(HERBS,rng);
  else if(row[0]==="@seeds")row=weighted(SEEDS,rng);
  else if(row[0]==="rare-drop-table")row=weighted(RDT,rng);
  if(!row[0].startsWith("@")&&row[0]!=="nothing")add(row[0],amount(row[2],row[3],rng));
 };
 for(let i=0;i<kills;i++){
  const [id,qty]=uniqueRoll(rng);add(id,qty);
  if(id==="venator-shard")continue; // shard excludes all other loot this kill
  if(unit(rng)<2/9){
   for(const group of SUPPLIES){
    const row=group[Math.floor(unit(rng)*group.length)];
    add(row[0],amount(row[2],row[3],rng));
   }
   common();
  }else{common();common();}
  if(unit(rng)<1/2500)add("muphin");
  if(unit(rng)<(hardCAs?1/28:1/30))add("clue-scroll-hard");
  if(unit(rng)<(eliteCAs?1/42:1/45))add("clue-scroll-elite");
  if(konarTask&&unit(rng)<1/50)add("brimstone-key");
 }
 // Optional one-time guaranteed speed reward, if killed under 3 minutes
 // and the player has not owned/used Charged ice already.
 if(chargedIce&&kills>0)add("charged-ice");
 return {kills,drops};
}
