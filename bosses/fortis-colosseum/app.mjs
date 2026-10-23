import { setupEncounterCalculator } from "../../shared/encounter-app.mjs";
import { byId as $, formatNumber as format } from "../../shared/ui.mjs";
import { WAVES, UNIQUE, DRY_ITEMS, ITEMS, MAX_WAVE_CLEARS, simulate } from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

const encounters=WAVES.map(wave=>({...wave,inputId:"wave-"+wave.id}));
for(const wave of encounters) {
 const label=document.createElement("label");label.className="depth-field";
 const title=document.createElement("span");title.textContent=wave.label;
 const input=document.createElement("input");input.id=wave.inputId;input.type="number";input.min="0";input.max=String(MAX_WAVE_CLEARS);input.step="1";input.value="0";input.inputMode="numeric";
 input.setAttribute("aria-label","Completed "+wave.label);
 label.append(title,input);$("wave-inputs").append(label);
}
setupEncounterCalculator({
 encounters,maxEach:MAX_WAVE_CLEARS,maxReceived:MAX_WAVE_CLEARS*12,items:ITEMS,unique:UNIQUE,dryItems:DRY_ITEMS,simulate,calculateDry,
 readOptions:()=>({quiverTrade:document.querySelector('[name="quiver-trade"]:checked').value}),
 rarity:(item,result)=>item.id==="dizanas-quiver"?"Wave 12 reward":item.id==="smol-heredit"?(result.quiverTrade==="pet"?"Chest + quiver gambles":"1/200 per Wave 12"):item.id==="tonalztics-of-ralos-uncharged"?"Varies by wave (7–12)":"Varies by wave (4–12)",
 summaryLabel:"Any rare reward roll",summaryKey:"anyUnique",
 onMode:dry=>{$("quiver-trade").hidden=dry;$("dry-note").hidden=!dry;},
 onLoot:result=>{$("summary-waves").textContent=format(result.waveClears);$("summary-completions").textContent=format(result.completions);$("summary-echo").textContent=format(result.echoRolls);},
 onDry:result=>{$("dry-quivers").textContent=format(result.quivers)+" guaranteed Wave 12 quivers";}
});
