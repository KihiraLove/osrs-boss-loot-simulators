// Wintertodt Reward Cart (since October 2024; old supply crates are discontinued).
// https://oldschool.runescape.wiki/w/Reward_Cart
export const MAX_PULLS=1_000_000;
export const SKILLS=["woodcutting","crafting","mining","herblore","farming","fishing"];
export const DEFAULT_LEVELS=Object.freeze(Object.fromEntries(SKILLS.map(key=>[key,99])));
export const PYRO_IDS=["pyromancer-garb","pyromancer-hood","pyromancer-robe","pyromancer-boots"];
// Sequential FIRST-SUCCESS reward rolls; later tables only roll on a miss.
export const RARE=[
 {id:"phoenix",name:"Phoenix",rawRate:1/5000},
 {id:"dragon-axe",name:"Dragon axe",rawRate:1/10000},
 {id:"tome-of-fire-empty",name:"Tome of fire (empty)",rawRate:1/1000},
 {id:"warm-gloves",name:"Warm gloves",rawRate:1/150},
 {id:"bruma-torch",name:"Bruma torch",rawRate:1/150},
 {id:"pyromancer-garb",name:"Pyromancer outfit",rawRate:1/150},
 {id:"burnt-page",name:"Burnt page",rawRate:1/45}
];
let miss=1;
export const EFFECTIVE_RATES=Object.freeze(Object.fromEntries(RARE.map(item=>{
 const p=miss*item.rawRate;miss*=1-item.rawRate;return[item.id,p];
})));
export const ORDINARY_RATE=miss;
export const UNIQUE=Object.freeze([
 ...RARE.slice(0,5).map(x=>({id:x.id,name:x.name})),
 ...PYRO_IDS.map(id=>({id,name:{"pyromancer-garb":"Pyromancer garb","pyromancer-hood":"Pyromancer hood","pyromancer-robe":"Pyromancer robe","pyromancer-boots":"Pyromancer boots"}[id]})),
 {id:"burnt-page",name:"Burnt page"}
]);
export const DRY_ITEMS=UNIQUE.filter(x=>x.id!=="burnt-page");
const parse=(data)=>data.trim().split(/\s+/).map(token=>{
 const [id,min,max,gate="1"]=token.split(":");
 return [id,Number(min),Number(max),Number(gate)];
});
// Six categories take three tickets each. A level affects WHICH item on
// the chosen subtable, not the subtable selection.
export const MATERIALS=Object.freeze({
 woodcutting:parse("oak-logs:10:20 willow-logs:10:20 teak-logs:10:20 maple-logs:10:20 mahogany-logs:10:20:25 yew-logs:10:20:36 magic-logs:10:20:50"),
 crafting:parse("uncut-sapphire:1:3 uncut-emerald:1:3 uncut-ruby:2:4 uncut-diamond:1:3"),
 mining:parse("pure-essence:20:70 limestone:3:7 silver-ore:10:12 iron-ore:5:15 coal:10:14 gold-ore:8:11 mithril-ore:3:5:14 adamantite-ore:2:3:39 runite-ore:1:2:60"),
 herblore:parse("grimy-guam-leaf:3:6 grimy-marrentill:3:6 grimy-tarromin:3:6 grimy-harralander:3:6 grimy-ranarr-weed:1:3 grimy-irit-leaf:3:5 grimy-avantoe:3:5 grimy-kwuarm:2:4 grimy-cadantine:2:4:14 grimy-lantadyme:2:4:34 grimy-dwarf-weed:2:4:50 grimy-torstol:1:3:64"),
 farming:parse("acorn:1:1 willow-seed:1:2 maple-seed:1:2 banana-tree-seed:1:2 teak-seed:1:2 mahogany-seed:1:2 yew-seed:1:2 ranarr-seed:1:3 tarromin-seed:1:3 harralander-seed:1:3 toadflax-seed:1:3 irit-seed:1:3 avantoe-seed:1:3 kwuarm-seed:1:3:12 snapdragon-seed:1:3:21 cadantine-seed:1:3:50 lantadyme-seed:1:3:67 dwarf-weed-seed:1:3:71 watermelon-seed:3:7:7 snape-grass-seed:3:7:11 spirit-seed:1:1:80"),
 fishing:parse("raw-anchovies:6:11 raw-trout:6:11 raw-salmon:6:11 raw-tuna:6:11 raw-lobster:6:11:15 raw-swordfish:6:11:34 raw-shark:6:11:43")
});
export const COMMON_WEIGHTS=Object.freeze([...SKILLS.map(skill=>[skill,3]),["coins",5],["saltpetre",1],["dynamite",1]]);
const CNAME={"tome-of-fire-empty":"Tome of fire (empty)","burnt-page":"Burnt page","pyromancer-garb":"Pyromancer garb",
 "pyromancer-hood":"Pyromancer hood","pyromancer-robe":"Pyromancer robe","pyromancer-boots":"Pyromancer boots",
 "bruma-torch":"Bruma torch","warm-gloves":"Warm gloves","dragon-axe":"Dragon axe",
 "raw-anchovies":"Raw anchovies","grimy-guam-leaf":"Grimy guam leaf"};
const label=id=>CNAME[id]??id.split("-").map(s=>s[0].toUpperCase()+s.slice(1)).join(" ");
export const ITEMS=Object.freeze(Object.fromEntries([...new Set([
 ...UNIQUE.map(x=>x.id),...Object.values(MATERIALS).flatMap(t=>t.map(x=>x[0])),
 "coins","saltpetre","dynamite","magic-seed","torstol-seed"
])].map(id=>[id,{id,name:UNIQUE.find(x=>x.id===id)?.name??label(id)}])));
export const rateOf=id=>PYRO_IDS.includes(id)?EFFECTIVE_RATES["pyromancer-garb"]:EFFECTIVE_RATES[id]??0;
export function validatePulls(n){
 if(!Number.isSafeInteger(n)||n<0||n>MAX_PULLS)
  throw new RangeError("Enter 0 to 1,000,000 Reward Cart pulls.");
 return n;
}
export function validateLevels(levels=DEFAULT_LEVELS){
 if(!levels||typeof levels!=="object"||Array.isArray(levels))throw new TypeError("Six skill levels are required.");
 for(const skill of SKILLS){
  const level=levels[skill];
  if(!Number.isInteger(level)||level<1||level>99)
   throw new RangeError(skill+" must be an integer from 1 to 99.");
 }
 return levels;
}
export function validateOwned(owned={}){
 if(!owned||typeof owned!=="object"||Array.isArray(owned))throw new TypeError("Ownership values are required.");
 for(const id of ["warm-gloves","bruma-torch",...PYRO_IDS]){
  const n=owned[id]??0;
  if(!Number.isInteger(n)||n<0||n>1_000_000||(id!=="warm-gloves"&&id!=="bruma-torch"&&n>1000))
   throw new RangeError("Invalid starting count for "+id+".");
 }
 if((owned["warm-gloves"]??0)>3||(owned["bruma-torch"]??0)>3)
  throw new RangeError("Enter between 0 and 3 owned gloves/torches.");
 return owned;
}
function unit(rng){
 const p=rng();if(typeof p!=="number"||!Number.isFinite(p)||p<0||p>=1)
  throw new RangeError("RNG must return a number in [0, 1).");
 return p;
}
function amount(min,max,rng){return min===max?min:min+Math.floor(unit(rng)*(max-min+1));}
export function category(rng){
 let n=unit(rng)*25;
 for(const [name,weight] of COMMON_WEIGHTS){n-=weight;if(n<0)return name;}
 return COMMON_WEIGHTS.at(-1)[0];
}
// Within-skill weights are estimated because Jagex has not released the
// exact item-specific weighting. Published level gates are honored.
export function materialChoice(skill,level,rng){
 if(!SKILLS.includes(skill))throw new RangeError("Invalid material category.");
 if(!Number.isInteger(level)||level<1||level>99)throw new RangeError("Skill level must be 1–99.");
 const rows=MATERIALS[skill].filter(row=>row[3]<=level);
 const target=(level-1)/98*(MATERIALS[skill].length-1);
 const weights=rows.map(row=>Math.exp(-Math.abs(MATERIALS[skill].indexOf(row)-target)*0.85));
 let roll=unit(rng)*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<rows.length;i++){roll-=weights[i];if(roll<0)return rows[i];}
 return rows.at(-1);
}
export function simulate(pulls,{rng=Math.random,levels=DEFAULT_LEVELS,owned={}}={}){
 validatePulls(pulls);validateLevels(levels);validateOwned(owned);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null),state=Object.create(null);
 for(const id of ["warm-gloves","bruma-torch",...PYRO_IDS])state[id]=owned[id]??0;
 const add=(id,n=1)=>{if(n>0)drops[id]=(drops[id]??0)+n;};
 for(let k=0;k<pulls;k++){
  let chosen=false;
  for(const rare of RARE){
   if(unit(rng)>=rare.rawRate)continue;
   chosen=true;
   if(rare.id==="pyromancer-garb"){
    const min=Math.min(...PYRO_IDS.map(id=>state[id]));
    const piece=PYRO_IDS.find(id=>state[id]===min);
    state[piece]++;add(piece);
   }else if(rare.id==="warm-gloves"&&state["warm-gloves"]>=3)add("magic-seed");
   else if(rare.id==="bruma-torch"&&state["bruma-torch"]>=3)add("torstol-seed",amount(2,3,rng));
   else if(rare.id==="warm-gloves"||rare.id==="bruma-torch"){
    state[rare.id]++;add(rare.id);
   }else if(rare.id==="burnt-page")add("burnt-page",amount(7,29,rng));
   else add(rare.id);
   break;
  }
  if(chosen)continue;
  const sub=category(rng);
  if(SKILLS.includes(sub)){
   const [id,min,max]=materialChoice(sub,levels[sub],rng);
   add(id,amount(min,max,rng));
  }else if(sub==="coins")add("coins",amount(2000,4999,rng));
  else add(sub,amount(3,5,rng));
 }
 return {pulls,levels:{...levels},drops,owned:state};
}
