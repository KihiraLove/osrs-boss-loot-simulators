import {
  setupRingOptions,
  createUniqueCard,
  clearInputsOnClick,
  createItemIcon as icon,
  parseNumber as readInt,
  showError,
  createLootCard as lootCard,
  probabilityText as pct,
  createOutcome as outcome,
  byId as $,
  formatNumber as fmt
} from "../../shared/ui.mjs";
import {SOURCES,UNIQUE,DRY_ITEMS,ITEMS,MAX_KILLS,simulate,rateOf} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";

const form=$("simulator-form"),dryInputs=$("dry-inputs");
const readRings=setupRingOptions(form);
let mode="loot";

function reset(){
 $("empty-state").hidden=false;$("source-panels").hidden=true;
 $("dry-empty").hidden=false;$("dry-results").hidden=true;
}
function setMode(next){
 mode=next;const isDry=next==="dry";
 $("loot-panel").hidden=isDry;$("dry-panel").hidden=!isDry;
 $("dry-fields").hidden=!isDry;
 for(const id of ["hard-cas","elite-cas"])
  $(id).closest("label").hidden=isDry;
 for(const option of ["loot","dry"]){
  const selected=option===next;
  $("mode-"+option).classList.toggle("is-active",selected);
  $("mode-"+option).setAttribute("aria-pressed",String(selected));
 }
 $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
 showError("");
}
for(const item of DRY_ITEMS){
 const field=document.createElement("label");field.className="dry-field";
 const text=document.createElement("span");text.textContent=item.name;
 const input=document.createElement("input");
 input.type="number";input.min="0";input.step="1";input.value="0";
 input.inputMode="numeric";input.dataset.id=item.id;
 input.setAttribute("aria-label",item.name+" received");
 field.append(icon(item),text,input);dryInputs.append(field);
}
function uniqueCard(item,count,source) {
  const p = rateOf(item.id,source);
  return createUniqueCard(item, count, p?"1/"+fmt(Math.round(1/p)):"");
}

function renderSource(section,source,drops){
 const uniqueGrid=section.querySelector(".source-uniques");
 const lootGrid=section.querySelector(".source-loot");
 uniqueGrid.replaceChildren();lootGrid.replaceChildren();
 const uniqueItems=UNIQUE.filter(item=>rateOf(item.id,source)>0);
 for(const item of uniqueItems)
  uniqueGrid.append(uniqueCard(item,drops[item.id]??0,source));
 const uniqueIds=new Set(UNIQUE.map(item=>item.id));
 const entries=Object.entries(drops)
  .filter(([id,count])=>count>0&&!uniqueIds.has(id))
  .sort((a,b)=>b[1]-a[1]||ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
 for(const [id,count] of entries)lootGrid.append(lootCard(ITEMS[id],count));
 if(entries.length===0){
  const empty=document.createElement("p");empty.className="muted";empty.textContent="No ordinary loot.";
  lootGrid.append(empty);
 }
}
function renderLoot(result){
 for(const source of SOURCES){
  const panel=$("source-panels").querySelector('[data-source="'+source.id+'"]');
  renderSource(panel,source.id,result.bySource[source.id]);
 }
 $("empty-state").hidden=true;$("source-panels").hidden=false;
}

function renderDry(results){
 const grid=$("dry-results-grid");grid.replaceChildren();
 for(const item of DRY_ITEMS){
  const result=results[item.id];
  const card=document.createElement("section");card.className="dry-result-card";
  const header=document.createElement("div");header.className="dry-result-heading";
  const title=document.createElement("div");
  const h3=document.createElement("h3");h3.textContent=item.name;
  const expected=document.createElement("p");
  expected.textContent="Expected: "+result.expected.toLocaleString("en-US",{maximumFractionDigits:2});
  title.append(h3,expected);header.append(icon(item),title);card.append(header);
  const atleast=document.createElement("p");atleast.className="any-drop-chance";
  const label=document.createElement("span");label.textContent="At least one";
  const chance=document.createElement("strong");chance.textContent=pct(result.atLeastOne);
  atleast.append(label,chance);card.append(atleast);
  const odds=document.createElement("div");odds.className="dry-outcomes";
  odds.append(outcome("Fewer than "+fmt(result.count),result.fewer),
   outcome("Exactly "+fmt(result.count),result.exact),
   outcome("More than "+fmt(result.count),result.more));
  card.append(odds);grid.append(card);
 }
 $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
function received(kills){
 const result={};
 for(const input of dryInputs.querySelectorAll("input")){
  const item=UNIQUE.find(x=>x.id===input.dataset.id);
  result[item.id]=readInt(input,kills*(item.minion?4:1),item.name);
 }
 return result;
}
$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{reset();showError("");});
$("clear-button").addEventListener("click",()=>{
 $("kill-count").value="0";
 for(const id of ["hard-cas","elite-cas"])$(id).checked=false;
 for(const input of dryInputs.querySelectorAll("input"))input.value="0";
 reset();showError("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();showError("");
 try{
  const kills=readInt($("kill-count"),MAX_KILLS,"full-room K'ril kills");
  if(mode==="dry")renderDry(calculateDry(kills,received(kills)));
  else renderLoot(simulate(kills,{...readRings(),hardCAs:$("hard-cas").checked,
   eliteCAs:$("elite-cas").checked}));
 }catch(err){showError(err instanceof Error?err.message:"Could not calculate the results.");}
});

clearInputsOnClick(form);
