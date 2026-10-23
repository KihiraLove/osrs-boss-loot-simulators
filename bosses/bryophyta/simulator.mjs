import {wealthTable} from "../../shared/rare-tables.mjs";
// Bryophyta boss and key chest are separate since the 25 June 2025 update.
export const MAX_KILLS=1000000;
export const ESSENCE={id:"bryophytas-essence",name:"Bryophyta's essence",rate:1/118};
export const KEY={id:"mossy-key",name:"Mossy key",rate:1/16};
export const DRY_ITEMS=[ESSENCE,KEY];
export function checkCount(n,label="kills"){if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)throw new RangeError("Enter 0–1,000,000 "+label+".");return n;}
export function checkWorld(w){if(!["members","f2p"].includes(w))throw new RangeError("Choose Members or F2P.");return w;}
export function checkMode(m){if(!["preobtained","boss"].includes(m))throw new RangeError("Choose Pre-obtained keys or Key obtained form boss.");return m;}
// id:amount:ticket-weight. Boss main table is 128 tickets; chest is 118.
const unpack=s=>s.trim().split(/\s+/).map(entry=>{
 const [id,quantity,weight]=entry.split(":");return [id,Number(quantity),Number(weight)];
});
const BOSS_SHARED=unpack("black-sq-shield:1:5 magic-staff:1:2 steel-med-helm:1:2 mithril-sword:1:2 steel-kiteshield:1:1 law-rune:3:4 air-rune:18:3 earth-rune:27:3 chaos-rune:7:3 nature-rune:6:3 cosmic-rune:3:2 iron-arrow:15:2 steel-arrow:30:1 death-rune:3:1 coins:37:19 coins:119:10 coins:300:2 steel-bar:1:6 coal:1:1 spinach-roll:1:1 $gem:0:4");
export const BOSS_MEMBERS=[...BOSS_SHARED,...unpack("mithril-spear:1:2 blood-rune:1:1 coins:2:8 $herb:0:5 $seed:0:35")];
export const BOSS_F2P=[...BOSS_SHARED,...unpack("coins:10:5 coins:5:35 coins:2:11")];
const CHEST_SHARED=unpack("rune-longsword:1:6 rune-chainbody:1:6 rune-plateskirt:1:6 rune-sq-shield:1:6 rune-sword:2:5 adamant-platebody:5:3 adamant-kiteshield:3:1 nature-rune:100:8 cosmic-rune:100:6 law-rune:100:6 chaos-rune:200:6 chaos-rune:100:5 adamant-arrow:100:1 runite-bar:2:6 $gems:0:4 steel-bar:25:3 coins:10000:5 coins:8000:2 bryophytas-essence:1:1");
export const CHEST_MEMBERS=[...CHEST_SHARED,...unpack("rune-med-helm:2:6 rune-platelegs:1:6 battlestaff:3:3 death-rune:100:5 blood-rune:100:1 $herb:0:5 $chestseed:0:6")];
export const CHEST_F2P=[...CHEST_SHARED,...unpack("rune-med-helm:2:6 rune-med-helm:1:3 rune-platelegs:1:12 death-rune:100:6 strength-potion-4:15:5")];
// Herb and seed subtables, weighted by the OSRS Wiki's published relative frequencies.
const herbNames="guam-leaf marrentill tarromin harralander ranarr-weed irit-leaf avantoe-leaf kwuarm cadantine lantadyme dwarf-weed".split(" ");
const herbDen=[102.4,136.5,182,234.1,297.9,409.6,546.1,655.4,819.2,1092.3,1092.3];
export const HERBS=herbNames.map((n,i)=>["grimy-"+n,1,1/herbDen[i]]);
const seedNames="limpwurt strawberry marrentill jangerberry tarromin wildblood watermelon harralander snape-grass ranarr whiteberry mushroom toadflax belladonna irit poison-ivy avantoe cactus kwuarm potato-cactus snapdragon cadantine lantadyme dwarf-weed torstol".split(" ");
const seedDen=[28,29.3,30.8,41.8,45.3,46.4,61.1,68.7,96.2,98.7,113.2,132.8,142.6,213.8,213.8,295.8,320.6,320.6,427.5,481,770,963,1284,1925,3850];
export const SEEDS=seedNames.map((n,i)=>[n==="mushroom"?"mushroom-spore":n+"-seed",1,1/seedDen[i]]);
export const GEMS=unpack("nothing:0:128 uncut-sapphire:1:64 uncut-emerald:1:32 uncut-ruby:1:16 nature-talisman:1:6 uncut-diamond:1:4 rune-javelin:5:2 loop-half-of-key:1:2 tooth-half-of-key:1:2");
const DISPLAY={"bryophytas-essence":"Bryophyta's essence","mossy-key":"Mossy key","giant-bones":"Giant bones","big-bones":"Big bones","ensouled-giant-head":"Ensouled giant head","giant-champion-scroll":"Giant champion scroll","clue-scroll-beginner":"Clue scroll (beginner)","strength-potion-4":"Strength potion(4)"};
const title=id=>DISPLAY[id]??id.split("-").map(s=>s[0]?.toUpperCase()+s.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries([
 ...[...BOSS_MEMBERS,...BOSS_F2P,...CHEST_MEMBERS,...CHEST_F2P,...HERBS,...SEEDS,...GEMS].filter(r=>!r[0].startsWith("$")&&r[0]!=="nothing").map(([id])=>id),
 ...["giant-bones","big-bones","mossy-key","ensouled-giant-head","long-bone","giant-champion-scroll","curved-bone","clue-scroll-beginner"]
].map(id=>[id,{id,name:title(id)}])));
function random(rng){const x=rng();if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)throw new RangeError("Random values must be in [0, 1).");return x;}
function choose(rows,rng){const total=rows.reduce((s,r)=>s+r[2],0);let roll=random(rng)*total;for(const row of rows){roll-=row[2];if(roll<0)return row;}return rows.at(-1);}
function ordinary(rows,rng,add,ringOfWealth=false){
 let [id,count]=choose(rows,rng);
 if(id==="$herb")([id,count]=choose(HERBS,rng));
 else if(id==="$seed"||id==="$chestseed")([id,count]=choose(SEEDS,rng));
 else if(id==="$gem")([id,count]=choose(wealthTable(GEMS,ringOfWealth,2,{nested:true}),rng));
 else if(id==="$gems"){add("uncut-ruby",5);add("uncut-diamond",5);return;}
 if(id!=="nothing")add(id,count);
}
export function simulate(kills,{ringOfWealth=false,
 rng=Math.random,mode="preobtained",world="members",slayerKills=0,
 maxChestOpenings=MAX_KILLS
}={}){
 if(typeof ringOfWealth!=="boolean")throw new TypeError("Ring of wealth must be a boolean.");
 checkCount(kills);checkMode(mode);checkWorld(world);
 checkCount(slayerKills,"kills on Slayer task");
 if(slayerKills>kills)throw new RangeError("Kills on Slayer task cannot exceed total boss kills.");
 checkCount(maxChestOpenings,"maximum chest openings");
 if(mode==="preobtained"&&maxChestOpenings<kills)
  throw new RangeError("Pre-obtained keys require one chest per boss kill.");
 const bossDrops=Object.create(null),chestDrops=Object.create(null);
 const collector=target=>(id,n=1)=>{if(n>0)target[id]=(target[id]??0)+n;};
 const boss=collector(bossDrops),chest=collector(chestDrops);
 const btable=world==="members"?BOSS_MEMBERS:BOSS_F2P;
 const ctable=world==="members"?CHEST_MEMBERS:CHEST_F2P;
 let keysFromBoss=0;
 for(let kill=0;kill<kills;kill++){
  boss(world==="members"?"giant-bones":"big-bones");ordinary(btable,rng,boss,ringOfWealth&&world==="members");
  if(world==="members"){
   if(random(rng)<1/24)boss("ensouled-giant-head");
   if(random(rng)<1/400)boss("long-bone");
   if(random(rng)<1/5000)boss("giant-champion-scroll");
   if(random(rng)<1/5012.5)boss("curved-bone");
  }
  if(random(rng)<1/45)boss("clue-scroll-beginner");
  if(random(rng)<(kill<slayerKills?1/8:1/16)){keysFromBoss++;boss("mossy-key");}
 }
 // Pre-obtained keys means exactly one chest per kill, even when
 // either source drops keys. In boss-key mode, every opened chest can
 // yield another key, which is immediately available for an extra chest.
 // The explicit cap prevents infinite loops with pathological RNGs.
 const startingKeys=mode==="preobtained"?kills:0;
 let keysAvailable=mode==="preobtained"?kills:keysFromBoss;
 let chestsOpened=0,chestKeysFound=0;
 while(keysAvailable>0&&chestsOpened<maxChestOpenings){
  keysAvailable--;
  chestsOpened++;
  chest("clue-scroll-beginner");ordinary(ctable,rng,chest,ringOfWealth&&world==="members");
  if(random(rng)<1/16){
   chestKeysFound++;
   chest("mossy-key");
   if(mode==="boss")keysAvailable++;
  }
 }
 const chestLimitReached=mode==="boss"&&keysAvailable>0;
 return {
  kills,mode,world,slayerKills,bossDrops,chestDrops,keysFromBoss,
  chestsOpened,chestKeysFound,startingKeys,keysSpent:chestsOpened,
  chestKeyOpenings:mode==="boss"?Math.max(0,chestsOpened-keysFromBoss):0,
  unspentKeys:mode==="boss"?keysAvailable:keysFromBoss+chestKeysFound,
  chestLimitReached
 };
}
