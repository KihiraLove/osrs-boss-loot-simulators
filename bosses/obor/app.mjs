import {
  clearInputsOnClick,
  showError,
  createItemIcon as icon,
  createLootCard as lootCard,
  createOutcome as outcome,
  byId as $,
  formatNumber as fmt
} from "../../shared/ui.mjs";
import {ITEMS,UNIQUE,KEY,MAX_KILLS,simulate} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";

const form=$("simulator-form");
let mode="loot";
const setting=name=>form.querySelector('input[name="'+name+'"]:checked').value;
function count(id,label){
 const raw=$(id).value.trim(),n=Number(raw);
 if(!/^(0|[1-9]\d*)$/.test(raw)||!Number.isSafeInteger(n)||n>MAX_KILLS)
  throw new RangeError(label+" must be a whole number from 0 to "+fmt(MAX_KILLS)+".");
 return n;
}

function clearResults(){
 $("empty-state").hidden=false;$("results-content").hidden=true;
 $("dry-empty").hidden=false;$("dry-results").hidden=true;
}
function selectMode(next){
 mode=next;const dry=mode==="dry";
 $("kills-input").hidden=dry;$("chests-input").hidden=!dry;
 $("key-mode").hidden=dry;$("world-mode").hidden=dry;

 $("loot-panel").hidden=dry;$("dry-panel").hidden=!dry;
 for(const [id,selected] of [["loot",!dry],["dry",dry]]){
  $("mode-"+id).classList.toggle("is-active",selected);
  $("mode-"+id).setAttribute("aria-pressed",String(selected));
 }
 $("plan-heading").textContent=dry?"Chest openings":"Your kills";
 $("action-label").textContent=dry?"Calculate chances":"Simulate loot";
 showError("");clearResults();
}

function renderUnique(drops){
 const item=UNIQUE,count=drops[item.id]??0;
 const card=document.createElement("div");
 card.className="unique-card"+(count?" found":"");
 const name=document.createElement("strong");name.textContent=item.name;
 const amount=document.createElement("span");amount.className="count";
 amount.textContent="× "+fmt(count);
 const rate=document.createElement("span");rate.className="rarity";
 rate.textContent="1/118 per chest";
 card.append(icon(item),name,amount,rate);
 $("unique-grid").replaceChildren(card);
}
function populate(id,drops){
 const dest=$(id);dest.replaceChildren();
 const sorted=Object.entries(drops).filter(([,n])=>n>0)
  .sort((a,b)=>b[1]-a[1]||(ITEMS[a[0]]?.name??a[0]).localeCompare(ITEMS[b[0]]?.name??b[0]));
 if(sorted.length===0){
  const p=document.createElement("p");p.className="obor-empty";
  p.textContent=id==="chest-loot"?"No chests were opened.":"No drops were rolled.";
  dest.append(p);return;
 }
 for(const [item,n] of sorted)dest.append(lootCard(ITEMS[item]??{id:item,name:item},n));
}
function stat(label,value){
 const container=document.createElement("div");container.className="obor-stat";
 const title=document.createElement("span");title.textContent=label;
 const amount=document.createElement("strong");amount.textContent=fmt(value);
 container.append(title,amount);return container;
}
function lootResults(data){
 const summary=$("key-summary");summary.replaceChildren(
  stat("Keys from boss",data.keysFromBoss),
  stat("Keys found in chests",data.chestKeysFound)
 );
 if(data.chestLimitReached){
  const notice=document.createElement("p");
  notice.className="obor-limit";
  notice.textContent="Simulation stopped at the maximum chest openings; "+
   fmt(data.unspentKeys)+" key(s) remain unused.";
  summary.append(notice);
 }
 renderUnique(data.chestDrops);
 populate("boss-loot",data.bossDrops);
 const chestLoot={...data.chestDrops};
 delete chestLoot[UNIQUE.id];
 populate("chest-loot",chestLoot);
 $("empty-state").hidden=true;$("results-content").hidden=false;
}

function dryCard(item,data){
 const card=document.createElement("section");card.className="dry-result-card";
 const heading=document.createElement("div");heading.className="dry-result-heading";
 const text=document.createElement("div");
 const h=document.createElement("h3");h.textContent=item.name;
 const expected=document.createElement("p");expected.textContent="Expected: "+fmt(Number(data.expected.toFixed(2)));
 text.append(h,expected);heading.append(icon(item),text);card.append(heading);
 const odds=document.createElement("div");odds.className="dry-outcomes";
 odds.append(outcome("At least one",data.atLeastOne),
  outcome("No drops",data.none),outcome("Exactly one",data.exactlyOne));
 card.append(odds);return card;
}
function dryResults(data){
 const grid=$("dry-results-grid");grid.replaceChildren();
 grid.append(dryCard(UNIQUE,data[UNIQUE.id]),dryCard(KEY,data[KEY.id]));
 $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
$("mode-loot").addEventListener("click",()=>selectMode("loot"));
$("mode-dry").addEventListener("click",()=>selectMode("dry"));
form.addEventListener("input",()=>{clearResults();showError("");});
$("clear-button").addEventListener("click",()=>{
 $("kill-count").value="100";$("chest-count").value="100";
 form.querySelector('input[name="key-mode"][value="preobtained"]').checked=true;
 form.querySelector('input[name="world"][value="members"]').checked=true;
 clearResults();showError("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();showError("");
 try{
  if(mode==="dry")dryResults(calculateDry(count("chest-count","Chest openings")));
  else {
   const kills=count("kill-count","Boss kills");
   lootResults(simulate(kills,{
    mode:setting("key-mode"),world:setting("world")

   }));
  }
 }catch(err){showError(err instanceof Error?err.message:"Could not calculate results.");}
});

clearInputsOnClick(form);
