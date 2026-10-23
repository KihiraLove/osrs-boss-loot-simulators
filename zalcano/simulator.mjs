// Zalcano: one contribution-eligible player's loot per completed encounter.
// Rates and common-table weights: OSRS Wiki, October 2026.
// The shared 1/200 seed/onyx roll is attributed to this player via a stated
// equal-other-contributions approximation; shard scaling is interpolated.
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([
 {id:"smolcano",name:"Smolcano"},
 {id:"crystal-tool-seed",name:"Crystal tool seed"},
 {id:"zalcano-shard",name:"Zalcano shard"},
 {id:"uncut-onyx",name:"Uncut onyx"}
]);
export const DRY_ITEMS=UNIQUE;
export const DEFAULT_OPTIONS=Object.freeze({
 teamSize:4,relativeContribution:100,hpDamage:125,shieldDamage:125,
 mvp:false,xpFocus:false
});
// Wiki observed, contribution-dependent quantity ranges; these bounds are
// sampled directly rather than asserting an unpublished quantity formula.
// [item-id, label, min, max, weight out of 36]
export const MAIN=Object.freeze([
 ["blood-rune","Blood rune",64,480,1],
 ["cosmic-rune","Cosmic rune",295,926,1],
 ["death-rune","Death rune",201,1046,1],
 ["law-rune","Law rune",166,790,1],
 ["soul-rune","Soul rune",47,392,1],
 ["nature-rune","Nature rune",1,937,1],
 ["silver-ore","Silver ore (noted)",86,800,3],
 ["coal","Coal (noted)",169,1052,1],
 ["mithril-ore","Mithril ore (noted)",56,469,2],
 ["adamantite-ore","Adamantite ore (noted)",51,343,2],
 ["runite-ore","Runite ore (noted)",3,31,2],
 ["gold-ore","Gold ore (noted)",86,756,3],
 ["steel-bar","Steel bar (noted)",16,699,3],
 ["mithril-bar","Mithril bar (noted)",53,501,3],
 ["adamantite-bar","Adamantite bar (noted)",13,111,2],
 ["runite-bar","Runite bar (noted)",3,27,2],
 ["uncut-diamond","Uncut diamond (noted)",2,21,2],
 ["uncut-dragonstone","Uncut dragonstone (noted)",1,12,2],
 ["onyx-bolt-tips","Onyx bolt tips",1,45,2],
 ["pure-essence","Pure essence (noted)",784,5500,1]
]);
export const mainTickets=MAIN.reduce((sum,row)=>sum+row[4],0);
export const ITEMS=Object.freeze(Object.fromEntries([
 ...MAIN.map(([id,name])=>[id,{id,name}]),
 ...UNIQUE.map(({id,name})=>[id,{id,name}]),
 ["crystal-shard",{id:"crystal-shard",name:"Crystal shard"}],
 ["infernal-ashes",{id:"infernal-ashes",name:"Infernal ashes"}]
]));
export function validateKills(kills){
 if(!Number.isSafeInteger(kills)||kills<0||kills>MAX_KILLS)
  throw new RangeError("Enter between 0 and 1,000,000 completed Zalcano kills.");
 return kills;
}
export function resolveOptions(raw={}){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))
  throw new TypeError("Zalcano settings must be an object.");
 const o={...DEFAULT_OPTIONS,...raw};
 const ints=[["teamSize",1,100],["relativeContribution",1,400],
  ["hpDamage",0,10000],["shieldDamage",0,10000]];
 for(const [key,min,max] of ints)
  if(!Number.isSafeInteger(o[key])||o[key]<min||o[key]>max)
   throw new RangeError(key+" must be a whole number between "+min+" and "+max+".");
 for(const key of ["mvp","xpFocus"])
  if(typeof o[key]!=="boolean")throw new TypeError(key+" must be true or false.");
 return o;
}
export function parameters(options={}){
 const o=resolveOptions(options);
 const points=o.hpDamage+2*o.shieldDamage;
 const cappedPoints=Math.min(400,o.hpDamage)+2*Math.min(300,o.shieldDamage);
 const eligible=o.shieldDamage>=5;
 const rareEligible=eligible&&o.hpDamage+o.shieldDamage>=31;
 // Share approximation: all OTHER teammates have 100% of average weight;
 // the selected player's estimated weight is relativeContribution / 100.
 const relative=o.relativeContribution/100;
 const share=relative/(o.teamSize-1+relative);
 // The Wiki publishes only the shard's endpoints (1/1500 to 1/750).
 // Interpolate probability linearly between the minimum eligible threshold
 // and the 1000-point tertiary cap; this is explicitly an approximation.
 const progress=Math.max(0,Math.min(1,(cappedPoints-31)/(1000-31)));
 const shardRate=rareEligible?(1+progress)/1500:0;
 const teamUnique=rareEligible?share/200:0;
 const seedRate=teamUnique*39/40;
 const onyxRate=teamUnique/40;
 const petRate=rareEligible?1/2250:0;
 return {options:o,points,cappedPoints,share,eligible,rareEligible,
  shardRate,teamUnique,seedRate,onyxRate,petRate};
}
export function rateOf(id,options={}){
 const p=parameters(options);
 const odds={
  "crystal-tool-seed":p.seedRate,"uncut-onyx":p.onyxRate,
  "zalcano-shard":p.shardRate,"smolcano":p.petRate
 };
 return odds[id]??0;
}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("RNG must return a finite number in [0,1).");
 return v;
}
function range(min,max,rng){
 return min===max?min:min+Math.floor(unit(rng)*(max-min+1));
}
function rollCommon(rng){
 let ticket=unit(rng)*mainTickets;
 for(const row of MAIN){ticket-=row[4];if(ticket<0)return row;}
 return MAIN.at(-1);
}
export function simulate(kills,{rng=Math.random,...opts}={}){
 validateKills(kills);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const params=parameters(opts);
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 const {eligible,rareEligible,seedRate,onyxRate,shardRate,petRate,teamUnique,options}=params;
 for(let i=0;i<kills;i++){
  if(!eligible)continue;
  add("crystal-shard",rareEligible?(options.mvp?3:2):1);
  if(options.mvp)add("infernal-ashes");
  if(!options.xpFocus){
   const [id,,min,max]=rollCommon(rng);
   let quantity=range(min,max,rng);
   if(options.mvp)quantity+=Math.ceil(quantity/10);
   add(id,quantity);
  }
  if(!rareEligible)continue;
  // One shared 1/200 roll; select the recipient by estimated contribution.
  // Do not roll seed and onyx as independent events.
  if(unit(rng)<teamUnique){
   if(unit(rng)<1/40)add("uncut-onyx");
   else add("crystal-tool-seed");
  }
  if(unit(rng)<shardRate)add("zalcano-shard");
  if(unit(rng)<petRate)add("smolcano");
 }
 return {kills,options,parameters:params,drops};
}
