import {
  clearInputsOnClick,
  createItemIcon as icon,
  showError,
  resetPanels as reset,
  createLootCard as lootCard,
  probabilityText as percent,
  createOutcome as outcome,
  byId as $,
  formatNumber as fmt
} from "../../shared/ui.mjs";
import {UNIQUE,DRY_ITEMS,ITEMS,MAX_SHARDS,UNIQUE_RATE,simulate} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";

const formatEstimate=n=>n.toLocaleString("en-US",{maximumFractionDigits:1});
const form=$("simulator-form"),dryInputs=$("dry-inputs");
let mode="loot";

function parseNumber(input,limit,label){
 const raw=input.value.trim();
 if(!/^(0|[1-9]\d*)$/.test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)>limit)
  throw new RangeError("Enter a whole number between 0 and "+fmt(limit)+" for "+label+".");
 return Number(raw);
}

function setMode(next){
 mode=next;
 const isDry=mode==="dry";
 $("dry-fields").hidden=!isDry;
 $("dry-panel").hidden=!isDry;
 $("loot-panel").hidden=isDry;
 $("elite-cas").closest("label").hidden=isDry;
 for(const item of ["loot","dry"]){
  const selected=next===item;
  $("mode-"+item).classList.toggle("is-active",selected);
  $("mode-"+item).setAttribute("aria-pressed",String(selected));
 }
 $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
 showError("");
}
for(const item of DRY_ITEMS){
 const field=document.createElement("label");field.className="dry-field";
 const name=document.createElement("span");name.textContent=item.name;
 const input=document.createElement("input");
 input.type="number";input.min="0";input.max="1000000";input.step="1";input.value="0";
 input.inputMode="numeric";input.dataset.id=item.id;
 input.setAttribute("aria-label",item.name+" received");
 field.append(icon(item),name,input);dryInputs.append(field);
}
function rareCard(item,count){
 const card=document.createElement("div");card.className="unique-card"+(count?" found":"");
 const name=document.createElement("strong");name.textContent=item.name;
 const qty=document.createElement("span");qty.className="count";qty.textContent="× "+fmt(count);
 const rate=document.createElement("span");rate.className="rarity";
 rate.textContent="1/"+fmt(Math.round(1/item.rate))+" per full-team equivalent";
 card.append(icon(item),name,qty,rate);return card;
}

function fillDrops(grid,drops){
 grid.replaceChildren();
 const entries=Object.entries(drops).filter(([,qty])=>qty>0)
  .sort((a,b)=>b[1]-a[1]||ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
 for(const [id,count] of entries)grid.append(lootCard(ITEMS[id],count));
 if(!entries.length){
  const note=document.createElement("p");note.className="muted";note.textContent="No drops rolled.";
  grid.append(note);
 }
}
function renderLoot(result){
 const unique=$("unique-grid");unique.replaceChildren();
 for(const item of UNIQUE)unique.append(rareCard(item,result.rares[item.id]??0));
 $("summary-shards").textContent=fmt(result.shards);
 $("summary-exposure").textContent="≈ "+formatEstimate(result.exposure);
 $("summary-uniques").textContent="≈ "+formatEstimate(result.exposure*UNIQUE_RATE);
 fillDrops($("special-grid"),result.other);
 fillDrops($("loot-grid"),result.common);
 $("empty-state").hidden=true;$("results-content").hidden=false;
}

function dryCard(item,result,combined=false){
 const card=document.createElement("section");
 card.className="dry-result-card"+(combined?" dry-total-card":"");
 const head=document.createElement("div");head.className="dry-result-heading";
 const title=document.createElement("div");const h3=document.createElement("h3");
 h3.textContent=combined?"Any unique drop":item.name;
 const note=document.createElement("p");
 note.textContent="Estimated: "+result.expected.toLocaleString("en-US",{maximumFractionDigits:2});
 title.append(h3,note);head.append(icon(item),title);card.append(head);
 const atLeast=document.createElement("p");atLeast.className="any-drop-chance";
 const name=document.createElement("span");name.textContent="At least one";
 const value=document.createElement("strong");value.textContent=percent(result.atLeastOne);
 atLeast.append(name,value);card.append(atLeast);
 const odds=document.createElement("div");odds.className="dry-outcomes";
 odds.append(outcome("Fewer than "+fmt(result.count),result.fewer),
  outcome("Exactly "+fmt(result.count),result.exact),
  outcome("More than "+fmt(result.count),result.more));
 card.append(odds);return card;
}
function renderDry(result){
 const grid=$("dry-results-grid");grid.replaceChildren();
 grid.append(dryCard(UNIQUE[0],result.anyUnique,true));
 for(const item of DRY_ITEMS)grid.append(dryCard(item,result[item.id]));
 $("dry-exposure").textContent="≈ "+formatEstimate(result.exposure)+
 " contribution-equivalent kills inferred from "+fmt(result.shards)+
 " shards. All chances are approximate (Poisson model).";
 $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
function received(){
 const result={};
 for(const input of dryInputs.querySelectorAll("input")){
  result[input.dataset.id]=parseNumber(input,1_000_000,ITEMS[input.dataset.id].name);
 }
 return result;
}
$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{reset();showError("");});
$("clear-button").addEventListener("click",()=>{
 $("shard-count").value="0";$("elite-cas").checked=false;
 for(const input of dryInputs.querySelectorAll("input"))input.value="0";
 reset();showError("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();showError("");
 try{
  const shards=parseNumber($("shard-count"),MAX_SHARDS,"Nihil shards received");
  if(mode==="dry")renderDry(calculateDry(shards,received()));
  else renderLoot(simulate(shards,{eliteCAs:$("elite-cas").checked}));
 }catch(e){showError(e instanceof Error?e.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
