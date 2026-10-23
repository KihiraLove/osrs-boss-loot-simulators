import { setupEncounterCalculator } from "../../shared/encounter-app.mjs";
import { byId as $, formatNumber as format } from "../../shared/ui.mjs";
import { ENCOUNTERS, UNIQUE, DRY_ITEMS, ITEMS, MAX_KILLS, simulate, rateOf } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

const summary=result=>format(result.counts.trios)+" Trios + "+format(result.counts.mass)+" Mass · "+format(Math.floor(result.counts.trios/3))+" MVP kills";
setupEncounterCalculator({
 encounters:ENCOUNTERS,maxEach:MAX_KILLS,maxReceived:counts=>counts.trios+counts.mass,items:ITEMS,unique:UNIQUE,dryItems:DRY_ITEMS,simulate,calculateDry,
 rarity:item=>item.id==="smolcano"?"1/2,250":ENCOUNTERS.map(group=>group.label+": ≈ 1/"+format(Math.round(1/rateOf(item.id,group.id)))).join(" · "),
 summaryLabel:"Any collection-log reward",summaryKey:"anyUnique",
 onLoot:result=>{$("loot-summary").textContent=summary(result);},
 onDry:result=>{$("dry-summary").textContent=summary(result);}
});
