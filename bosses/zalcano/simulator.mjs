import { validateEncounterCounts } from "../../shared/encounters.mjs";
// Zalcano: one contribution-eligible player's loot per completed encounter.
// Rates and common-table weights: OSRS Wiki, October 2026.
// Shared rare allocation and contribution scaling use the presets below.
export const MAX_KILLS=1_000_000;
export const UNIQUE=Object.freeze([
 {id:"smolcano",name:"Smolcano"},
 {id:"crystal-tool-seed",name:"Crystal tool seed"},
 {id:"zalcano-shard",name:"Zalcano shard"},
 {id:"uncut-onyx",name:"Uncut onyx"}
]);
export const DRY_ITEMS=UNIQUE;
// Presets use a 1,000-point team baseline (400 HP + 300 shield damage).
// The exact common-loot and team-allocation formulas are unpublished;
// point-based interpolation and proportional allocation remain estimates.
export const ENCOUNTERS=Object.freeze([
 {id:"trios",label:"Trios",share:1/3,hpDamage:400/3,shieldDamage:100},
 {id:"mass",label:"Mass",share:36/1000,hpDamage:26,shieldDamage:5}
]);
export function validatePlan(counts){return validateEncounterCounts(counts,ENCOUNTERS,MAX_KILLS);}
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
export function parameters(mode="trios") {
 const preset=ENCOUNTERS.find(encounter=>encounter.id===mode);
 if(!preset)throw new RangeError("Choose Trios or Mass.");
 const points=preset.hpDamage+2*preset.shieldDamage;
 const progress=Math.max(0,Math.min(1,(points-36)/(1000-36)));
 const teamUnique=preset.share/200;
 return {...preset,points,progress,teamUnique,seedRate:teamUnique*39/40,
  onyxRate:teamUnique/40,shardRate:(1+progress)/1500,petRate:1/2250};
}
export function rateOf(id,mode="trios") {
 const p=parameters(mode);
 return {"crystal-tool-seed":p.seedRate,"uncut-onyx":p.onyxRate,
  "zalcano-shard":p.shardRate,"smolcano":p.petRate}[id]??0;
}
function unit(rng){
 const v=rng();
 if(typeof v!=="number"||!Number.isFinite(v)||v<0||v>=1)
  throw new RangeError("RNG must return a finite number in [0,1).");
 return v;
}
function rollCommon(rng){
 let ticket=unit(rng)*mainTickets;
 for(const row of MAIN){ticket-=row[4];if(ticket<0)return row;}
 return MAIN.at(-1);
}
export function simulate(counts,{rng=Math.random}={}) {
 const plan=validatePlan(counts);
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const add=(id,count=1)=>{if(count>0)drops[id]=(drops[id]??0)+count;};
 const mvpKills=Math.floor(plan.counts.trios/3);
 for(const group of plan.groups) {
  const params=parameters(group.id);
  for(let i=0;i<group.count;i++) {
   const mvp=group.id==="trios"&&(i+1)%3===0;
   add("crystal-shard",mvp?3:2);
   if(mvp)add("infernal-ashes");
   const [id,,min,max]=rollCommon(rng);
   let quantity=Math.floor(min+(max-min)*params.progress);
   if(mvp)quantity+=Math.ceil(quantity/10);
   add(id,quantity);
   if(unit(rng)<1/200&&unit(rng)<params.share) {
    if(unit(rng)<1/40)add("uncut-onyx");
    else add("crystal-tool-seed");
   }
   if(unit(rng)<params.shardRate)add("zalcano-shard");
   if(unit(rng)<params.petRate)add("smolcano");
  }
 }
 return {counts:plan.counts,kills:plan.total,mvpKills,drops};
}
