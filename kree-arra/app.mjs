import {SOURCES,UNIQUE,DRY_ITEMS,ITEMS,MAX_KILLS,simulate,rateOf} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("en-US").format(n);
const form=$("simulator-form"),dryInputs=$("dry-inputs");
let mode="loot";
function icon(item){
 const box=document.createElement("span");box.className="phosani-icon";
 const image=document.createElement("img");
 image.src="../assets/items/"+item.id+".png";image.alt="";
 image.loading="lazy";image.width=36;image.height=32;
 box.append(image);return box;
}
function readInt(input,max,name){
 const value=input.value.trim();
 if(!/^(0|[1-9]\d*)$/.test(value)||!Number.isSafeInteger(Number(value))||Number(value)>max)
  throw new RangeError("Enter a non-negative whole number up to "+fmt(max)+" for "+name+".");
 return Number(value);
}
function showError(message){
 $("validation-message").textContent=message;
 $("validation-message").hidden=!message;
}
function reset(){
 $("empty-state").hidden=false;$("source-panels").hidden=true;
 $("dry-empty").hidden=false;$("dry-results").hidden=true;
}
function setMode(next){
 mode=next;const isDry=next==="dry";
 $("loot-panel").hidden=isDry;$("dry-panel").hidden=!isDry;
 $("dry-fields").hidden=!isDry;
 for(const id of ["hard-cas","elite-cas","konar-task","frozen-door"])
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
function uniqueCard(item,count,source){
 const card=document.createElement("div");
 card.className="unique-card"+(count?" found":"");
 const name=document.createElement("strong");name.textContent=item.name;
 const amount=document.createElement("span");amount.className="count";amount.textContent="× "+fmt(count);
 const rarity=document.createElement("span");rarity.className="rarity";
 const p=rateOf(item.id,source);rarity.textContent=p?"1/"+fmt(Math.round(1/p)):"";
 card.append(icon(item),name,amount,rarity);return card;
}
function lootCard(item,count){
 const card=document.createElement("div");card.className="loot-item";
 const frame=document.createElement("div");frame.className="loot-icon";frame.append(icon(item));
 const details=document.createElement("div");details.className="loot-info";
 const countText=document.createElement("strong");countText.textContent="× "+fmt(count);
 const name=document.createElement("span");name.textContent=item.name;
 details.append(countText,name);card.append(frame,details);return card;
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
function pct(p){
 if(p<=0)return "0%";if(p>=1)return "100%";
 const v=p*100;if(v<.000001)return "<0.000001%";
 if(v>99.999999)return ">99.999999%";
 return v.toFixed(v<1?4:2)+"%";
}
function outcome(name,p){
 const row=document.createElement("div");row.className="dry-outcome";
 const label=document.createElement("span");label.textContent=name;
 const value=document.createElement("strong");value.textContent=pct(p);
 row.append(label,value);return row;
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
 for(const id of ["hard-cas","elite-cas","konar-task","frozen-door"])$(id).checked=false;
 for(const input of dryInputs.querySelectorAll("input"))input.value="0";
 reset();showError("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();showError("");
 try{
  const kills=readInt($("kill-count"),MAX_KILLS,"full-room Kree'arra kills");
  if(mode==="dry")renderDry(calculateDry(kills,received(kills)));
  else renderLoot(simulate(kills,{hardCAs:$("hard-cas").checked,
   eliteCAs:$("elite-cas").checked,konarTask:$("konar-task").checked,
   frozenDoor:$("frozen-door").checked}));
 }catch(err){showError(err instanceof Error?err.message:"Could not calculate the results.");}
});
