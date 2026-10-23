import {
  createUniqueCard,
  clearInputsOnClick,
  createItemIcon as icon,
  parseNumber,
  showError,
  resetPanels,
  createLootCard as lootCard,
  createDryCard as dryCard,
  byId as $,
  formatNumber as format
} from "../../shared/ui.mjs";
import {
  SIGNATURE as UNIQUE, DRY_ITEMS, ITEMS as ITEM_BY_ID, MAX_KILLS, simulate, rateOf
} from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

const form = $("simulator-form");
const dryInputs = $("dry-inputs");
let mode = "loot";
const corpseMode=()=>form.querySelector('input[name="corpse"]:checked').value;

function refreshChoices(){
 const destroy=corpseMode()==="destroy";
 const dry=mode==="dry";
 $("konar-task").closest("label").hidden=dry||destroy;
 $("coagulated-venom").closest("label").hidden=dry||destroy;
 for(const input of dryInputs.querySelectorAll("input"))
  input.closest("label").hidden=destroy&&input.dataset.id!=="nid";
}
function setMode(next) {
  mode=next;
  const isDry=mode==="dry";
  $("dry-fields").hidden=!isDry;
  $("dry-panel").hidden=!isDry;
  $("loot-panel").hidden=isDry;
  $("elite-cas").closest("label").hidden=isDry;
  refreshChoices();
  for(const [name,selected] of [["loot",!isDry],["dry",isDry]]){
    $("mode-"+name).classList.toggle("is-active",selected);
    $("mode-"+name).setAttribute("aria-pressed",String(selected));
  }
  $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
  showError("");
}
function dryField(item) {
  const label=document.createElement("label");
  label.className="dry-field";
  const name=document.createElement("span");
  name.textContent=item.name;
  const input=document.createElement("input");
  input.type="number";input.min="0";input.step="1";input.value="0";
  input.inputMode="numeric";input.dataset.id=item.id;
  input.setAttribute("aria-label",item.name+" received");
  label.append(icon(item),name,input);
  dryInputs.append(label);
}
for(const item of DRY_ITEMS)dryField(item);

function uniqueCard(item,count) {
  return createUniqueCard(item, count, "1/"+format(Math.round(1/rateOf(item.id,corpseMode()))));
}

function renderLoot(result) {
  const unique=$("unique-grid"),loot=$("loot-grid");
  unique.replaceChildren();loot.replaceChildren();
  for(const item of DRY_ITEMS){
  if(corpseMode()==="destroy"&&item.id!=="nid")continue;
  unique.append(uniqueCard(item,result.drops[item.id]||0));
 }
  const uniqueIds=new Set(DRY_ITEMS.map(item=>item.id));
  const entries=Object.entries(result.drops)
    .filter(([id,count])=>count>0&&!uniqueIds.has(id))
    .sort((a,b)=>b[1]-a[1]||ITEM_BY_ID[a[0]].name.localeCompare(ITEM_BY_ID[b[0]].name));
  for(const [id,count] of entries)loot.append(lootCard(ITEM_BY_ID[id],count));
  $("empty-state").hidden=true;$("results-content").hidden=false;
}

function renderDry(result) {
  const grid=$("dry-results-grid");grid.replaceChildren();
  if(result.anyUnique)grid.append(dryCard("Any signature unique",UNIQUE[0],result.anyUnique,true));
  for(const item of DRY_ITEMS)if(result[item.id])grid.append(dryCard(item.name,item,result[item.id]));
  $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
function readReceived(kills){
  const result={};
  for(const field of dryInputs.querySelectorAll("input")){
    const item=ITEM_BY_ID[field.dataset.id];
    if(corpseMode()==="destroy"&&item.id!=="nid")continue;
    result[item.id]=parseNumber(field,kills,item.name);
  }
  return result;
}

$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{resetPanels();showError("");refreshChoices();});
$("clear-button").addEventListener("click",()=>{
  $("kill-count").value="0";$("elite-cas").checked=false;$("konar-task").checked=false;
  $("coagulated-venom").checked=false;
  form.querySelector('input[name="corpse"][value="harvest"]').checked=true;
  for(const input of dryInputs.querySelectorAll("input"))input.value="0";
  resetPanels();showError("");refreshChoices();
});
form.addEventListener("submit",event=>{
  event.preventDefault();showError("");
  try{
    const kills=parseNumber($("kill-count"),MAX_KILLS,"completed kills");
    if(mode==="dry")renderDry(calculateDry(kills,readReceived(kills),corpseMode()));
    else renderLoot(simulate(kills,{
      mode:corpseMode(),eliteCAs:$("elite-cas").checked,
      konarTask:$("konar-task").checked,coagulatedVenom:$("coagulated-venom").checked
    }));
  }catch(err){showError(err instanceof Error?err.message:"Could not calculate the result.");}
});

refreshChoices();

clearInputsOnClick(form);
