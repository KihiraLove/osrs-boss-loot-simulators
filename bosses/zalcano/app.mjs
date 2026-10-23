import { createDryField, createUniqueCard, clearInputsOnClick, parseNumber, showError, resetPanels, createLootCard as lootCard, probabilityText, createDryCard, byId as $, formatNumber as format } from "../../shared/ui.mjs";
import {UNIQUE,DRY_ITEMS,ITEMS as ITEM_BY_ID,MAX_KILLS,simulate,rateOf,parameters} from "./simulator.mjs";
import { calculateDry } from "./dry-calc.mjs";

function readOptions(){
 return {
  teamSize:parseNumber($("team-size"),100,"team size"),
  relativeContribution:parseNumber($("relative-contribution"),400,"contribution versus average (%)"),
  hpDamage:parseNumber($("hp-damage"),10000,"average HP damage"),
  shieldDamage:parseNumber($("shield-damage"),10000,"average shield damage"),
  mvp:$("mvp").checked,xpFocus:$("xp-focus").checked
 };
}
function summary(p){
 if(!p.eligible)return "Not eligible for loot: at least 5 shield damage is required.";
 const lines=[
  "Estimated share of team unique allocations: "+probabilityText(p.share)+
  " (other players assumed to have average contribution)",
  "Tertiary contribution points: "+format(p.cappedPoints)+" / 1,000",
  p.rareEligible?"Unique and pet eligible":"Below 31 total damage: no unique or pet eligibility",
  "Zalcano shard and team allocation rates are approximations"
 ];
 return lines.join(" · ");
}

const form = $("simulator-form");
const dryInputs = $("dry-inputs");
let mode = "loot";

function setMode(next) {
  mode=next;
  const isDry=mode==="dry";
  $("dry-fields").hidden=!isDry;
  $("dry-panel").hidden=!isDry;
  $("loot-panel").hidden=isDry;
  $("xp-focus").closest("label").hidden=isDry;
  $("mvp").closest("label").hidden=isDry;
  for(const [name,selected] of [["loot",!isDry],["dry",isDry]]){
    $("mode-"+name).classList.toggle("is-active",selected);
    $("mode-"+name).setAttribute("aria-pressed",String(selected));
  }
  $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
  showError("");
}

for(const item of DRY_ITEMS)dryInputs.append(createDryField(item));

function uniqueCard(item,count,opts) {
  const p = rateOf(item.id,opts);
  return createUniqueCard(item, count, p?"≈ 1/"+format(Math.round(1/p)):"Not eligible");
}

function renderLoot(result) {
  const unique=$("unique-grid"),loot=$("loot-grid");
  unique.replaceChildren();loot.replaceChildren();
  for(const item of UNIQUE)unique.append(uniqueCard(item,result.drops[item.id]||0,result.options));
  $("loot-summary").textContent=summary(result.parameters);

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
  grid.append(dryCard("Any collection-log reward",UNIQUE[0],result.anyUnique,true));
  $("dry-summary").textContent=summary(result.parameters);
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
  $("kill-count").value="0";$("team-size").value="4";
  $("relative-contribution").value="100";$("hp-damage").value="125";
  $("shield-damage").value="125";$("mvp").checked=false;$("xp-focus").checked=false;
  for(const input of dryInputs.querySelectorAll("input"))input.value="0";
  resetPanels();showError("");
});
form.addEventListener("submit",event=>{
  event.preventDefault();showError("");
  try{
    const kills=parseNumber($("kill-count"),MAX_KILLS,"completed kills");
    const settings=readOptions();
    if(mode==="dry")renderDry(calculateDry(kills,readReceived(kills),settings));
    else renderLoot(simulate(kills,settings));
  }catch(err){showError(err instanceof Error?err.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
