import { validateEncounterCounts } from "../../shared/encounters.mjs";
// Fortis Colosseum reward chest, 2026 OSRS Wiki rates.
// Each completed wave supplies one reward; unique replaces that wave's common.
// Each input counts that wave alone; all entered rewards are combined.
export const MAX_WAVE_CLEARS=100_000;
export const WAVES=Object.freeze(Array.from({length:12},(_,index)=>({id:String(index+1),wave:index+1,label:"Wave "+(index+1)})));
export const MIN_WAVE=1,MAX_WAVE=12;
export const UNIQUE_DENOMS=Object.freeze({4:124,5:110,6:96,7:82,8:68,9:54,10:40,11:26,12:12});
const ARMOUR_IDS=Object.freeze(["sunfire-fanatic-helm","sunfire-fanatic-cuirass","sunfire-fanatic-chausses"]);
export const UNIQUE=Object.freeze([
 {id:"echo-crystal",name:"Echo crystal"},
 ...ARMOUR_IDS.map(id=>({id,name:({"sunfire-fanatic-helm":"Sunfire fanatic helm",
 "sunfire-fanatic-cuirass":"Sunfire fanatic cuirass",
 "sunfire-fanatic-chausses":"Sunfire fanatic chausses"})[id]})),
 {id:"tonalztics-of-ralos-uncharged",name:"Tonalztics of Ralos (uncharged)"},
 {id:"smol-heredit",name:"Smol Heredit"},
 {id:"dizanas-quiver",name:"Dizana's quiver"}
]);
export const DRY_ITEMS=Object.freeze(UNIQUE.filter(x=>x.id!=="dizanas-quiver")
 .map(x=>x.id==="echo-crystal"?{...x,dryName:"Echo crystal reward rolls"}:x));
// Ordinary reward tables: [sprite id, display name, quantity].
// Within each wave, row weights are conditional on NOT hitting the unique table.
const A=Object.freeze([
 ["rune-platebody","Rune platebody",1],["death-rune","Death rune",150],
 ["chaos-rune","Chaos rune",150],["sunfire-splinters","Sunfire splinters",150],
 ["steel-cannonball","Steel cannonball",80],["rune-kiteshield","Rune kiteshield",4],
 ["rune-chainbody","Rune chainbody",1]
]);
const B=Object.freeze([
 ["onyx-bolts","Onyx bolts",30],["snapdragon-seed","Snapdragon seed",1],
 ["dragon-platelegs","Dragon platelegs",1],["sunfire-splinters","Sunfire splinters",500],
 ["earth-orb","Earth orb",80],["rune-2h-sword","Rune 2h sword",2],
 ["gold-ore","Gold ore",150]
]);
const C=Object.freeze([
 ["dragon-bolts-unf","Dragon bolts (unf)",200],["ranarr-seed","Ranarr seed",4],
 ["sunfire-splinters","Sunfire splinters",1100],["dragon-arrowtips","Dragon arrowtips",150],
 ["adamantite-ore","Adamantite ore",100],["death-rune","Death rune",250]
]);
const D=Object.freeze([
 ["onyx-bolts","Onyx bolts",75],["sunfire-splinters","Sunfire splinters",2500],
 ["dragon-platelegs","Dragon platelegs",3],["death-rune","Death rune",300],
 ["rune-warhammer","Rune warhammer",5]
]);
const E=Object.freeze([
 ["steel-cannonball","Steel cannonball",2000],["dragon-plateskirt","Dragon plateskirt",5],
 ["dragon-arrowtips","Dragon arrowtips",350],["onyx-bolts","Onyx bolts",150]
]);
const F=Object.freeze([
 ["onyx-bolts","Onyx bolts",50],["dragon-platelegs","Dragon platelegs",2],
 ["sunfire-splinters","Sunfire splinters",1750],["rune-kiteshield","Rune kiteshield",5],
 ["runite-ore","Runite ore",12],["death-rune","Death rune",300]
]);
const G=Object.freeze([
 ["onyx-bolts","Onyx bolts",100],["rune-warhammer","Rune warhammer",8],
 ["dragon-platelegs","Dragon platelegs",3],["sunfire-splinters","Sunfire splinters",3500],
 ["dragon-arrowtips","Dragon arrowtips",250]
]);
const H=Object.freeze([
 ["uncut-onyx","Uncut onyx",1],["dragon-plateskirt","Dragon plateskirt",5],
 ["rune-2h-sword","Rune 2h sword",9],["runite-ore","Runite ore",35]
]);
// Wiki proportions for conditional ordinary drops (each row has group weight):
// 3-4: group A 9, B 1; 7-8: B 54, C 7;
// 9-10: C 15, F/G 2; 11-12: D/G 36, E/H 5.
// Higher-wave groups differ slightly and keep their own item quantities.
export const COMMON=Object.freeze({
 2:[...A.map(row=>[...row,1])],
 3:[...A.map(row=>[...row,9]),...B.map(row=>[...row,1])],
 4:[...A.map(row=>[...row,9]),...B.map(row=>[...row,1])],
 5:[...B.map(row=>[...row,1])],
 6:[...B.map(row=>[...row,1])],
 7:[...B.map(row=>[...row,54]),...C.map(row=>[...row,7])],
 8:[...B.map(row=>[...row,54]),...F.map(row=>[...row,7])],
 9:[...C.map(row=>[...row,15]),...D.map(row=>[...row,2])],
 10:[...F.map(row=>[...row,15]),...G.map(row=>[...row,2])],
 11:[...D.map(row=>[...row,36]),...E.map(row=>[...row,5])],
 12:[...G.map(row=>[...row,36]),...H.map(row=>[...row,5])]
});
export const ITEMS=Object.freeze(Object.fromEntries([
 ...Object.values(COMMON).flat().map(([id,name])=>[id,{id,name}]),
 ...UNIQUE.map(x=>[x.id,{id:x.id,name:x.name}]),
 ["sunfire-splinters",{id:"sunfire-splinters",name:"Sunfire splinters"}]
]));
export function validatePlan(counts) {
 return validateEncounterCounts(counts,WAVES,MAX_WAVE_CLEARS,MAX_WAVE_CLEARS*12);
}
export function uniqueRate(wave){
 return wave>=4&&wave<=12?1/UNIQUE_DENOMS[wave]:0;
}
export function waveRates(wave){
 const unique=uniqueRate(wave);
 return {
  unique,echo:unique*(wave<7?.4:6/16),
  armour:unique*(wave<7?.6:9/16),
  tonalztics:wave>=7?unique/16:0
 };
}
export function validateOptions({quiverTrade="keep"}={}){
 if(!["keep","splinters","pet"].includes(quiverTrade))
  throw new RangeError("Quiver option must be keep, splinters, or pet.");
 return {quiverTrade};
}
function unit(rng){
 const x=rng();
 if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>=1)
  throw new RangeError("RNG must return a finite number in [0, 1).");
 return x;
}
function weighted(rows,rng){
 const sum=rows.reduce((a,r)=>a+r[3],0);
 let t=unit(rng)*sum;
 for(const row of rows){t-=row[3];if(t<0)return row;}
 return rows.at(-1);
}
export function simulate(counts,{rng=Math.random,quiverTrade="keep"}={}){
 const plan=validatePlan(counts);validateOptions({quiverTrade});
 if(typeof rng!=="function")throw new TypeError("RNG must be a function.");
 const drops=Object.create(null);
 const perWave=WAVES.map(({wave})=>({wave,count:plan.counts[wave],drops:Object.create(null)}));
 const echoRolls={count:0};
 const armourUncollected=new Set(ARMOUR_IDS);
 let petOwned=false;
 function add(id,count=1,waveRow){
  if(count>0){
   drops[id]=(drops[id]??0)+count;
   if(waveRow)waveRow.drops[id]=(waveRow.drops[id]??0)+count;
  }
 }
 for(const {wave:w,count} of plan.groups){
  for(let clear=0;clear<count;clear++){
   const row=perWave[w-1];
   if(w===1){add("sunfire-splinters",80,row);continue;}
   const rate=waveRates(w);
   if(rate.unique>0&&unit(rng)<rate.unique){
    const tier=unit(rng);
    if(tier<(w<7?.4:6/16)){
     echoRolls.count++;
     // 90% single; 10% two or three crystals, equally likely.
     const bonus=unit(rng);
     add("echo-crystal",bonus<.9?1:bonus<.95?2:3,row);
    }else if(tier<(w<7?1:15/16)){
     if(!armourUncollected.size)for(const id of ARMOUR_IDS)armourUncollected.add(id);
     const options=[...armourUncollected];
     const chosen=options[Math.floor(unit(rng)*options.length)];
     armourUncollected.delete(chosen);
     add(chosen,1,row);
    }else add("tonalztics-of-ralos-uncharged",1,row);
   }else{
    const [id,,quantity]=weighted(COMMON[w],rng);
    add(id,quantity,row);
   }
   if(w===12){
    // Completing the Colosseum always grants a quiver, independent of the
    // wave-12 common/unique roll; the boss pet has its own 1/200 roll.
    if(unit(rng)<1/200){add("smol-heredit",1,row);petOwned=true;}
    if(quiverTrade==="splinters")add("sunfire-splinters",4000,row);
    else if(quiverTrade==="pet"&&!petOwned){
     if(unit(rng)<1/200){add("smol-heredit",1,row);petOwned=true;}
     // In this option an unowned-pet gamble consumes the quiver.
    }else add("dizanas-quiver",1,row);
   }
  }
 }
 return {counts:plan.counts,waveClears:plan.total,completions:plan.counts[12],quiverTrade,drops,perWave,echoRolls:echoRolls.count};
}
