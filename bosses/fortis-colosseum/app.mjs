import { createDryField, createUniqueCard, clearInputsOnClick, parseNumber, showError, resetPanels, createLootCard as lootCard, createDryCard, byId as $, formatNumber as format } from "../../shared/ui.mjs";
import {UNIQUE,DRY_ITEMS,ITEMS as ITEM_BY_ID,MAX_RUNS,simulate,rateOf} from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

const form = $("simulator-form");
const dryInputs = $("dry-inputs");
let mode = "loot";

function setMode(next) {
  mode=next;
  const isDry=mode==="dry";
  $("dry-fields").hidden=!isDry;
  $("dry-panel").hidden=!isDry;
  $("loot-panel").hidden=isDry;
  $("quiver-trade").closest("label").hidden=isDry;
  $("dry-note").hidden=!isDry;
  for(const [name,selected] of [["loot",!isDry],["dry",isDry]]){
    $("mode-"+name).classList.toggle("is-active",selected);
    $("mode-"+name).setAttribute("aria-pressed",String(selected));
  }
  $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
  showError("");
}

for(const item of DRY_ITEMS)dryInputs.append(createDryField(item));

function uniqueCard(item,count) {
  const p = rateOf(item.id,Number($("wave-reached").value));
  return createUniqueCard(item, count, p>=1?"Guaranteed at wave 12":p>0?"≈ 1/"+format(Math.round(1/p))+" per run":"Unavailable at this wave");
}

function renderLoot(result) {
  const unique=$("unique-grid"),loot=$("loot-grid");
  unique.replaceChildren();loot.replaceChildren();
  for(const item of UNIQUE) unique.append(uniqueCard(item,result.drops[item.id]||0));
  $("summary-runs").textContent=format(result.runs);
  $("summary-wave").textContent=format(result.wave);
  $("summary-echo").textContent=format(result.echoRolls);

  const uniqueIds=new Set(UNIQUE.map(item=>item.id));
  const entries=Object.entries(result.drops)
    .filter(([id,count])=>count>0&&!uniqueIds.has(id))
    .sort((a,b)=>b[1]-a[1]||ITEM_BY_ID[a[0]].name.localeCompare(ITEM_BY_ID[b[0]].name));
  for(const [id,count] of entries)loot.append(lootCard(ITEM_BY_ID[id],count));
  $("empty-state").hidden=true;$("results-content").hidden=false;
}

function dryCard(name, item, result, combined = false) {
  return createDryCard(name, item, result, combined, result.atLeastOne !== undefined);
}
function renderDry(result) {
  const grid=$("dry-results-grid");grid.replaceChildren();
  grid.append(dryCard("Any rare reward roll",UNIQUE[0],result.anyUnique,true));
  for(const item of DRY_ITEMS)
   grid.append(dryCard(item.dryName??item.name,item,result[item.id]));
  $("dry-quivers").textContent=result.quivers?format(result.quivers)+" guaranteed quivers":"No quivers before wave 12";
  $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
function readReceived(kills){
  const result={};
  for(const field of dryInputs.querySelectorAll("input")){
    const item=ITEM_BY_ID[field.dataset.id];
    result[item.id]=parseNumber(field,Math.max(1,MAX_RUNS*10),item.dryName??item.name);
  }
  return result;
}

$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{resetPanels();showError("");});
$("clear-button").addEventListener("click",()=>{
  $("run-count").value="0";$("wave-reached").value="12";$("quiver-trade").value="keep";
  for(const input of dryInputs.querySelectorAll("input"))input.value="0";
  resetPanels();showError("");
});
form.addEventListener("submit",event=>{
  event.preventDefault();showError("");
  try{
    const runs=parseNumber($("run-count"),MAX_RUNS,"completed runs");
    const wave=Number($("wave-reached").value);
    if(mode==="dry")renderDry(calculateDry(runs,wave,readReceived(runs)));
    else renderLoot(simulate(runs,wave,{quiverTrade:$("quiver-trade").value}));
  }catch(err){showError(err instanceof Error?err.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
