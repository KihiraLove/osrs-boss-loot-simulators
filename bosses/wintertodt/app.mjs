import { createDryField, createUniqueCard, clearInputsOnClick, parseNumber, showError, resetPanels, createLootCard as lootCard, createDryCard, byId as $, formatNumber as format } from "../../shared/ui.mjs";
import {
  UNIQUE, DRY_ITEMS, ITEMS as ITEM_BY_ID, MAX_PULLS, SKILLS, DEFAULT_LEVELS, simulate, rateOf
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
  for(const skill of SKILLS)$("level-"+skill).closest("label").hidden=isDry;

  for(const [name,selected] of [["loot",!isDry],["dry",isDry]]){
    $("mode-"+name).classList.toggle("is-active",selected);
    $("mode-"+name).setAttribute("aria-pressed",String(selected));
  }
  $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
  showError("");
}

for(const item of DRY_ITEMS)dryInputs.append(createDryField(item));

function uniqueCard(item,count) {
  return createUniqueCard(item, count, item.id.startsWith("pyromancer-")?"Least owned first":"1/"+format(Math.round(1/rateOf(item.id))));
}

function renderLoot(result) {
  const unique=$("unique-grid"),loot=$("loot-grid");
  unique.replaceChildren();loot.replaceChildren();
  for(const item of UNIQUE) unique.append(uniqueCard(item,result.drops[item.id]||0));
  $("reward-summary").textContent=format(result.pulls)+" Reward Cart pulls";

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
form.addEventListener("input",()=>{resetPanels();showError("");});
$("clear-button").addEventListener("click",()=>{
  $("pull-count").value="0";
  for(const skill of SKILLS)$("level-"+skill).value=String(DEFAULT_LEVELS[skill]);

  for(const input of dryInputs.querySelectorAll("input"))input.value="0";
  resetPanels();showError("");
});
form.addEventListener("submit",event=>{
  event.preventDefault();showError("");
  try{
    const pulls=parseNumber($("pull-count"),MAX_PULLS,"Reward Cart pulls");
    if(mode==="dry")renderDry(calculateDry(pulls,readReceived(pulls)));
    else renderLoot(simulate(pulls,{
      levels:Object.fromEntries(SKILLS.map(skill=>[skill,parseNumber($("level-"+skill),99,skill)]))
    }));
  }catch(err){showError(err instanceof Error?err.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
