import {DRY_ITEMS,checkCount} from "./simulator.mjs";
// Chest-only dry calculator. Neither boss kills nor key-acquisition
// assumptions enter these probabilities.
export function calculateDry(chests){
 checkCount(chests,"chest openings");
 const result={chests};
 for(const item of DRY_ITEMS){
  const p=item.rate;
  const none=Math.exp(chests*Math.log1p(-p));
  const atLeastOne=-Math.expm1(chests*Math.log1p(-p));
  const exactlyOne=chests===0?0:chests*p*Math.exp((chests-1)*Math.log1p(-p));
  result[item.id]={count:0,expected:chests*p,none,atLeastOne,exactlyOne,rate:p};
 }
 return result;
}
