// Obor uses separate kill and giant-key chest loot (25 June 2025).
// Rates: OSRS Wiki Obor + Chest (Obor's lair), revision 2026-09-30.
// The first giant key permanently unlocks the lair and is not spent;
// the simulator assumes access is already unlocked.
export const MAX_KILLS=1_000_000;
export const UNIQUE={id:"hill-giant-club",name:"Hill giant club",rate:1/118};
export const KEY={id:"giant-key",name:"Giant key",rate:1/16};
export const DRY_ITEMS=[UNIQUE,KEY];
export function checkCount(n,label="kills"){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_KILLS)
  throw new RangeError("Enter 0–1,000,000 "+label+".");
 return n;
}
export function checkMode(mode){
 if(mode!=="preobtained"&&mode!=="boss")
  throw new RangeError("Choose Pre-obtained keys or Key obtained form boss.");
 return mode;
}
export function checkWorld(world){
 if(world!=="members"&&world!=="f2p")
  throw new RangeError("Choose Members or Free-to-play.");
 return world;
}
// id:min:max:weight. Weighted by the stated 135-ticket boss table
// and 118-ticket chest table. An 8-ticket residual in the published
// boss table has no listed reward and is modelled as an empty roll.
const unpack=source=>source.trim().split(/\s+/).map(entry=>{
 const [id,min,max,weight]=entry.split(":");
 return [id,Number(min),Number(max),Number(weight)];
});
const BOSS_SHARED=unpack("iron-full-helm:1:1:5 iron-dagger:1:1:4 iron-kiteshield:1:1:3 steel-longsword:1:1:2 iron-arrow:3:3:6 fire-rune:15:15:3 water-rune:7:7:3 law-rune:2:2:3 steel-arrow:10:10:2 mind-rune:3:3:2 cosmic-rune:2:2:2 nature-rune:6:6:2 chaos-rune:2:2:1 death-rune:2:2:1 coins:38:38:14 coins:52:52:10 coins:15:15:8 coins:8:8:6 coins:88:88:2 limpwurt-root:1:1:11 beer:1:1:6 body-talisman:1:1:2 nothing:0:0:1 $gem:0:0:3 nothing:0:0:8");
export const BOSS_MEMBERS=[...BOSS_SHARED,...unpack("$herb:0:0:7 $seed:0:0:18")];
export const BOSS_F2P=[...BOSS_SHARED,...unpack("coins:5:5:18 coins:10:10:7")];
// Obor's club is a single one-in-118 roll on the ordinary chest
// reward table; the key and guaranteed rewards roll independently.
export const CHEST_TABLE=unpack("rune-kiteshield:1:1:3 rune-full-helm:1:1:5 rune-med-helm:1:1:6 rune-chainbody:1:1:3 rune-platelegs:1:1:3 rune-plateskirt:1:1:3 rune-battleaxe:1:1:4 rune-longsword:1:1:5 rune-2h-sword:1:1:3 law-rune:50:99:12 cosmic-rune:60:119:12 chaos-rune:100:199:10 death-rune:40:79:10 nature-rune:40:79:7 coins:10000:15000:6 coins:12000:20000:4 limpwurt-root:20:20:8 big-bones:50:50:8 $gems:0:0:5 hill-giant-club:1:1:1");
// Conditional herb weights from the Wiki's published overall effective
// odds. The herb ratio is identical to the hill giant herb subtable.
const herbs="guam-leaf marrentill tarromin harralander ranarr-weed irit-leaf avantoe-leaf kwuarm cadantine lantadyme dwarf-weed".split(" ");
const herbDen=[77.1,102.9,137.1,176.3,224.4,308.6,411.4,493.7,617.1,822.9,822.9];
export const HERBS=herbs.map((id,i)=>["grimy-"+id,1,1,1/herbDen[i]]);
// General seed table; inverse published kill denominator defines
// each item's relative weight on the 18/135 seed branch.
const seedData=[
 ["potato-seed",4,44],["onion-seed",4,59],["cabbage-seed",4,89],
 ["tomato-seed",3,179],["sweetcorn-seed",3,359],["strawberry-seed",2,718],
 ["watermelon-seed",2,1502],["snape-grass-seed",2,2065],
 ["barley-seed",4,142],["hammerstone-seed",3,143],["asgarnian-seed",3,190],
 ["jute-seed",2,191],["yanillian-seed",2,286],["krandorian-seed",2,573],
 ["wildblood-seed",1,1128],["marigold-seed",1,173],["nasturtium-seed",1,261],
 ["rosemary-seed",1,404],["woad-seed",1,547],["limpwurt-seed",1,685],
 ["redberry-seed",1,204],["cadavaberry-seed",1,292],
 ["dwellberry-seed",1,409],["jangerberry-seed",1,1024],
 ["whiteberry-seed",1,2826],["poison-ivy-seed",1,7450],
 ["guam-seed",1,517],["marrentill-seed",1,759],
 ["tarromin-seed",1,1111],["harralander-seed",1,1639],
 ["ranarr-seed",1,2400],["toadflax-seed",1,3523],
 ["irit-seed",1,5175],["avantoe-seed",1,7528],
 ["kwuarm-seed",1,11041],["snapdragon-seed",1,16562],
 ["cadantine-seed",1,23660],["lantadyme-seed",1,33125],
 ["dwarf-weed-seed",1,55208],["torstol-seed",1,82812],
 ["mushroom-spore",1,269],["belladonna-seed",1,448],
 ["cactus-seed",1,672],["potato-cactus-seed",1,1345]
];
export const SEEDS=seedData.map(([id,qty,odds])=>[id,qty,qty,1/odds]);
const GEM_SHARED=unpack("nothing:0:0:128 uncut-sapphire:1:1:64 uncut-emerald:1:1:32 uncut-ruby:1:1:16 uncut-diamond:1:1:4");
export const GEMS_MEMBERS=[...GEM_SHARED,...unpack("nature-talisman:1:1:6 rune-javelin:5:5:2 loop-half-of-key:1:1:2 tooth-half-of-key:1:1:2")];
export const GEMS_F2P=GEM_SHARED;
// Name normalization for local sprite slugs.
const DISPLAY={
 "hill-giant-club":"Hill giant club","giant-key":"Giant key",
 "rune-2h-sword":"Rune 2h sword","clue-scroll-beginner":"Clue scroll (beginner)",
 "ensouled-giant-head":"Ensouled giant head",
 "giant-champion-scroll":"Giant champion scroll",
 "grimy-avantoe-leaf":"Grimy avantoe"
};
const label=id=>DISPLAY[id]??id.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries([
 ...[...BOSS_MEMBERS,...BOSS_F2P,...CHEST_TABLE,...HERBS,...SEEDS,...GEMS_MEMBERS]
  .filter(([id])=>!id.startsWith("$")&&id!=="nothing").map(([id])=>id),
 ...["giant-bones","big-bones","giant-key","ensouled-giant-head",
 "long-bone","curved-bone","giant-champion-scroll","clue-scroll-beginner"]
].map(id=>[id,{id,name:label(id)}])));
function random(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("RNG must yield finite values in [0, 1).");
 return v;
}
function choose(table,rng){
 const total=table.reduce((acc,row)=>acc+row[3],0);
 let r=random(rng)*total;
 for(const row of table){r-=row[3];if(r<0)return row;}
 return table.at(-1);
}
function draw(table,rng,add,world){
 let [id,min,max]=choose(table,rng);
 if(id==="$herb")([id,min,max]=choose(HERBS,rng));
 else if(id==="$seed")([id,min,max]=choose(SEEDS,rng));
 else if(id==="$gem")([id,min,max]=choose(world==="members"?GEMS_MEMBERS:GEMS_F2P,rng));
 else if(id==="$gems"){add("uncut-ruby",5);add("uncut-diamond",5);return;}
 if(id==="nothing")return;
 add(id,min===max?min:min+Math.floor(random(rng)*(max-min+1)));
}
export function simulate(kills,{
 rng=Math.random,mode="preobtained",world="members",
 maxChestOpenings=MAX_KILLS
}={}){
 checkCount(kills);checkMode(mode);checkWorld(world);
 checkCount(maxChestOpenings,"maximum chest openings");
 if(mode==="preobtained"&&maxChestOpenings<kills)
  throw new RangeError("Pre-obtained keys require one chest per kill.");
 const bossDrops=Object.create(null),chestDrops=Object.create(null);
 const collector=target=>(id,count=1)=>{
  if(count>0)target[id]=(target[id]??0)+count;
 };
 const boss=collector(bossDrops),chest=collector(chestDrops);
 const bossTable=world==="members"?BOSS_MEMBERS:BOSS_F2P;
 let keysFromBoss=0;
 for(let kill=0;kill<kills;kill++){
  boss(world==="members"?"giant-bones":"big-bones");
  draw(bossTable,rng,boss,world);
  if(world==="members"){
   if(random(rng)<1/25)boss("ensouled-giant-head");
   if(random(rng)<1/400)boss("long-bone");
   if(random(rng)<1/5000)boss("giant-champion-scroll");
   if(random(rng)<1/5012.5)boss("curved-bone");
  }
  if(random(rng)<1/50)boss("clue-scroll-beginner");
  if(random(rng)<1/16){keysFromBoss++;boss("giant-key");}
 }
 let available=mode==="preobtained"?kills:keysFromBoss;
 let chestsOpened=0,chestKeysFound=0;
 // Mirror Bryophyta's user-selected model: in boss mode, chest keys
 // pay for additional chest openings, without generating more boss kills.
 while(available>0&&chestsOpened<maxChestOpenings){
  available--;chestsOpened++;
  chest("clue-scroll-beginner");chest("ensouled-giant-head");
  draw(CHEST_TABLE,rng,chest,world);
  if(random(rng)<1/16){
   chestKeysFound++;chest("giant-key");
   if(mode==="boss")available++;
  }
 }
 return {
  kills,world,mode,bossDrops,chestDrops,
  keysFromBoss,chestsOpened,chestKeysFound,
  startingKeys:mode==="preobtained"?kills:0,keysSpent:chestsOpened,
  chestKeyOpenings:mode==="boss"?Math.max(0,chestsOpened-keysFromBoss):0,
  unspentKeys:mode==="boss"?available:keysFromBoss+chestKeysFound,
  chestLimitReached:mode==="boss"&&available>0
 };
}
