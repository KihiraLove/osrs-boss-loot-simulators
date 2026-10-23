import { createDryField, createUniqueCard, clearInputsOnClick, parseNumber, showError, resetPanels, createLootCard as lootCard, createDryCard, byId as $, formatNumber as format } from "../../shared/ui.mjs";
import {
  UNIQUE, DRY_ITEMS, ITEMS as ITEM_BY_ID, MAX_KILLS, simulate, rateOf
} from "./simulator.mjs";
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
  $("perfect").closest("label").hidden=isDry;

  for(const [name,selected] of [["loot",!isDry],["dry",isDry]]){
    $("mode-"+name).classList.toggle("is-active",selected);
    $("mode-"+name).setAttribute("aria-pressed",String(selected));
  }
  $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
  showError("");
}

for(const item of DRY_ITEMS)dryInputs.append(createDryField(item));

function uniqueCard(item,count) {
  return createUniqueCard(item, count, item.id==="ultor-vestige"?(("3 hits at ")+"3/1088"):(item.id==="strangled-tablet"?"First only":item.id==="blood-quartz"?"Variable rate":"1/"+format(Math.round(1/rateOf(item.id,false)))));
}

function renderLoot(result) {
  const unique=$("unique-grid"),loot=$("loot-grid");
  unique.replaceChildren();loot.replaceChildren();
  for(const item of UNIQUE) unique.append(uniqueCard(item,result.drops[item.id]||0));
  $("vestige-progress").textContent="Hidden vestige progress: "+result.vestigeProgress+" of 3 rolls";
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
  for(const item of DRY_ITEMS)grid.append(dryCard(item.name,item,result[item.id]));
  $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
function readReceived(kills){
  const result={};
  for(const field of dryInputs.querySelectorAll("input")){
    const item=ITEM_BY_ID[field.dataset.id];
    result[item.id]=parseNumber(field,kills,item.name);
  }
  return result;
}

$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{
  resetPanels();showError("");
});
$("clear-button").addEventListener("click",()=>{
  $("kill-count").value="0";$("perfect").checked=false;
  for(const input of dryInputs.querySelectorAll("input"))input.value="0";
  resetPanels();showError("");
});
form.addEventListener("submit",event=>{
  event.preventDefault();showError("");
  try{
    const kills=parseNumber($("kill-count"),MAX_KILLS,"completed kills");
    if(mode==="dry")renderDry(calculateDry(kills,readReceived(kills),false));
    else renderLoot(simulate(kills,{
      perfect:$("perfect").checked}));
  }catch(err){showError(err instanceof Error?err.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
