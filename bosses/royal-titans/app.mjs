import { setupEncounterCalculator } from "../../shared/encounter-app.mjs";
import { byId as $, formatNumber as format } from "../../shared/ui.mjs";
import { ENCOUNTERS, UNIQUE, DRY_ITEMS, ITEMS, MAX_KILLS, simulate } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

setupEncounterCalculator({
 encounters:ENCOUNTERS,maxEach:MAX_KILLS,maxReceived:counts=>Object.values(counts).reduce((sum,count)=>sum+count,0),items:ITEMS,unique:UNIQUE,dryItems:DRY_ITEMS,simulate,calculateDry,
 readOptions:()=>({action:document.querySelector('[name="reward-action"]:checked').value,hardCAs:$("hard-cas").checked,eliteCAs:$("elite-cas").checked}),
 rarity:(item,result)=>item.id==="bran"?(result.options.action==="sacrifice"?"1/1,500":"1/3,000"):result.options.action!=="loot"?"No primary loot":item.id==="giantsoul-amulet"?"Solo: 1/16 · Duo: 1/32":"Solo: 1/75 · Duo: 1/150",
 summaryLabel:"Any primary unique",summaryKey:"anyPrimary",
 onLoot:result=>{$("mode-summary").textContent=ENCOUNTERS.map(group=>format(result.counts[group.id])+" "+group.label).join(" + ");}
});
