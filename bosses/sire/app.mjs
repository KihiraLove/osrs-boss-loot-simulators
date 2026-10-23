import {
  clearInputsOnClick,
  createItemImage as icon,
  parseNumber as parse,
  showError,
  createOutcome as outcome,
  byId as $,
  formatNumber as format
} from "../../shared/ui.mjs";
import {REWARDS,ITEMS,MAX_KILLS,simulate} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";

const form=$("simulator-form");
let mode="loot";

function resetPanels(){
 $("empty-state").hidden=false;$("results-content").hidden=true;$("opened-panel").hidden=true;
 $("dry-empty").hidden=false;$("dry-results").hidden=true;
}
function setMode(next){
 mode=next;const isDry=next==="dry";
 $("dry-fields").hidden=!isDry;$("dry-panel").hidden=!isDry;
 $("loot-panel").hidden=isDry;
 $("opened-panel").hidden=isDry||$("results-content").hidden;
 $("loot-options").hidden=isDry;
 for(const [name,active] of [["loot",!isDry],["dry",isDry]]){
  $("mode-"+name).classList.toggle("is-active",active);
  $("mode-"+name).setAttribute("aria-pressed",String(active));
 }
 $("action-label").textContent=isDry?"Calculate chances":"Simulate loot";
 showError("");
}
function rewardField(item){
 const label=document.createElement("label");label.className="dry-field";
 const name=document.createElement("span");name.textContent=item.name;
 const input=document.createElement("input");
 input.type="number";input.min="0";input.step="1";input.value="0";
 input.inputMode="numeric";input.dataset.id=item.id;
 input.setAttribute("aria-label",item.name+" received from Unsireds");
 label.append(icon(item),name,input);$("dry-inputs").append(label);
}
for(const item of REWARDS)rewardField(item);
function unique(item,count,rarity){
 const card=document.createElement("div");card.className="unique-card"+(count?" found":"");
 const name=document.createElement("strong");name.textContent=item.name;
 const amount=document.createElement("span");amount.className="count";amount.textContent="× "+format(count);
 card.append(icon(item),name,amount);
 if(rarity){const info=document.createElement("span");info.className="rarity";info.textContent=rarity;card.append(info);}
 return card;
}
function loot(item,count){
 const row=document.createElement("div");row.className="loot-item";
 const image=document.createElement("div");image.className="loot-icon";image.append(icon(item));
 const info=document.createElement("div");info.className="loot-info";
 const qty=document.createElement("strong");qty.textContent="× "+format(count);
 const label=document.createElement("span");label.textContent=item.name;
 info.append(qty,label);row.append(image,info);return row;
}
function renderLoot(result){
 $("unique-grid").replaceChildren(unique(ITEMS.unsired,result.unsired,"1/100 per kill"));
 const grid=$("loot-grid");grid.replaceChildren();
 const others=Object.entries(result.drops)
  .filter(([id,count])=>id!=="unsired"&&count>0)
  .sort((a,b)=>b[1]-a[1]||ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
 for(const [id,count] of others)grid.append(loot(ITEMS[id],count));
 $("opened-count").textContent="Unsireds offered to the Font: "+format(result.unsired);
 const rewards=$("rewards-grid");rewards.replaceChildren();
 for(const item of REWARDS)rewards.append(unique(item,result.rewards[item.id]||0));
 $("rewards-empty").hidden=result.unsired>0;
 $("empty-state").hidden=true;$("results-content").hidden=false;$("opened-panel").hidden=false;
}

function dryCard(item,stats){
 const card=document.createElement("section");card.className="dry-result-card";
 const heading=document.createElement("div");heading.className="dry-result-heading";
 const texts=document.createElement("div");
 const name=document.createElement("h3");name.textContent=item.name;
 const expected=document.createElement("p");expected.textContent="Expected: "+stats.expected.toLocaleString("en-US",{maximumFractionDigits:2});
 texts.append(name,expected);heading.append(icon(item),texts);card.append(heading);
 const values=document.createElement("div");values.className="dry-outcomes";
 values.append(outcome("Fewer than "+format(stats.count),stats.fewer),
  outcome("Exactly "+format(stats.count),stats.exact),
  outcome("More than "+format(stats.count),stats.more));
 card.append(values);return card;
}
function readRewards(unsireds){
 const rewards={};
 for(const input of $("dry-inputs").querySelectorAll("input")){
  const item=ITEMS[input.dataset.id];
  rewards[item.id]=parse(input,item.id==="abyssal-orphan"?1:unsireds,item.name);
 }
 return rewards;
}
function renderDry(result){
 $("unsired-dry").replaceChildren(dryCard(ITEMS.unsired,result.unsired));
 const grid=$("reward-dry");grid.replaceChildren();
 for(const item of REWARDS)grid.append(dryCard(item,result[item.id]));
 $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{resetPanels();showError("");});
$("clear-button").addEventListener("click",()=>{
 $("kill-count").value="0";$("unsired-count").value="0";
 $("elite-cas").checked=false;$("konar-task").checked=false;
 for(const input of $("dry-inputs").querySelectorAll("input"))input.value="0";
 resetPanels();showError("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();showError("");
 try{
  const kills=parse($("kill-count"),MAX_KILLS,"completed kills");
  if(mode==="dry"){
   const unsireds=parse($("unsired-count"),kills,"Unsired drops");
   renderDry(calculateDry(kills,unsireds,readRewards(unsireds)));
  }else renderLoot(simulate(kills,{eliteCAs:$("elite-cas").checked,konarTask:$("konar-task").checked}));
 }catch(err){showError(err instanceof Error?err.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
