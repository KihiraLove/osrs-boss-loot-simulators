import {
  createUniqueCard,
  clearInputsOnClick,
  createItemIcon as icon,
  parseNumber,
  showError,
  resetPanels,
  createLootCard as lootCard,
  createDryCard as dryCard,
  byId as $
} from "../../shared/ui.mjs";
import {
  UNIQUE, BROTHERS, ITEMS as ITEM_BY_ID, MAX_CHESTS, simulate
} from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

const form = $("simulator-form");
const dryInputs = $("dry-inputs");
const totalChests=()=>parseNumber($("chest-count"),MAX_CHESTS,"completed chests");
let mode = "loot";

function setMode(next) {
  mode=next;
  const isDry=mode==="dry";
  document.body.classList.toggle("is-dry-mode",isDry);
  $("dry-fields").hidden=!isDry;
  $("dry-panel").hidden=!isDry;
  $("loot-panel").hidden=isDry;
  $("elite-cas").closest("label").hidden=isDry;
  $("hard-diary").closest("label").hidden=isDry;
  for(const [name,selected] of [["loot",!isDry],["dry",isDry]]){
    $("mode-"+name).classList.toggle("is-active",selected);
    $("mode-"+name).setAttribute("aria-pressed",String(selected));
  }
  $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
  showError("");
}
for(const brother of BROTHERS){
 const group=document.createElement("fieldset");group.className="barrows-dry-group";
 const heading=document.createElement("legend");heading.textContent=brother.name;
 const fields=document.createElement("div");fields.className="dry-inputs";
 group.append(heading,fields);dryInputs.append(group);
 for(const [id] of brother.items){
  // Build one field with the same markup as the other boss calculators.
  const item=ITEM_BY_ID[id];
  const label=document.createElement("label");label.className="dry-field";
  const name=document.createElement("span");name.textContent=item.name;
  const input=document.createElement("input");
  input.type="number";input.min="0";input.step="1";input.value="0";
  input.inputMode="numeric";input.dataset.id=id;
  input.setAttribute("aria-label",item.name+" received");
  label.append(icon(item),name,input);fields.append(label);
 }
}

function uniqueCard(item,count) {
  return createUniqueCard(item, count, "≈ 1/350.14 per chest");
}

function renderLoot(result) {
  const unique=$("unique-grid"),loot=$("loot-grid");
  unique.replaceChildren();loot.replaceChildren();
  for(const brother of BROTHERS){
    const heading=document.createElement("h3");heading.className="barrows-unique-heading";
    heading.textContent=brother.name;unique.append(heading);
    const group=document.createElement("div");group.className="barrows-uniques";
    for(const [id] of brother.items)group.append(uniqueCard(ITEM_BY_ID[id],result.drops[id]||0));
    unique.append(group);
  }
  const uniqueIds=new Set(UNIQUE.map(item=>item.id));
  const entries=Object.entries(result.drops)
    .filter(([id,count])=>count>0&&!uniqueIds.has(id))
    .sort((a,b)=>b[1]-a[1]||ITEM_BY_ID[a[0]].name.localeCompare(ITEM_BY_ID[b[0]].name));
  for(const [id,count] of entries)loot.append(lootCard(ITEM_BY_ID[id],count));
  $("empty-state").hidden=true;$("results-content").hidden=false;
}

function renderDry(result) {
  const grid=$("dry-results-grid");grid.replaceChildren();
  grid.append(dryCard("Any Barrows equipment",UNIQUE[0],result.anyUnique,true));
  for(const brother of BROTHERS){
    const heading=document.createElement("h3");heading.className="barrows-unique-heading";
    heading.textContent=brother.name;grid.append(heading);
    for(const [id] of brother.items)grid.append(dryCard(ITEM_BY_ID[id].name,ITEM_BY_ID[id],result[id]));
  }
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
form.addEventListener("input",()=>{resetPanels();showError("");});
$("clear-button").addEventListener("click",()=>{
  $("chest-count").value="0";$("elite-cas").checked=false;$("hard-diary").checked=false;
  for(const input of dryInputs.querySelectorAll("input"))input.value="0";
  resetPanels();showError("");
});
form.addEventListener("submit",event=>{
  event.preventDefault();showError("");
  try{
    const chests=totalChests();
    if(mode==="dry")renderDry(calculateDry(chests,readReceived(chests)));
    else renderLoot(simulate(chests,{hardDiary:$("hard-diary").checked,eliteCAs:$("elite-cas").checked}));
  }catch(err){showError(err instanceof Error?err.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
