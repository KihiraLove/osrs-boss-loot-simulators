import {ITEMS,ESSENCE,KEY,MAX_KILLS,simulate} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";
const $=id=>document.getElementById(id);
const form=$("simulator-form"),fmt=n=>new Intl.NumberFormat("en-US").format(n);
let mode="loot";
const setting=name=>form.querySelector('input[name="'+name+'"]:checked').value;
function count(id,label){
 const raw=$(id).value.trim(),n=Number(raw);
 if(!/^(0|[1-9]\d*)$/.test(raw)||!Number.isSafeInteger(n)||n>MAX_KILLS)
  throw new RangeError(label+" must be a whole number from 0 to "+fmt(MAX_KILLS)+".");
 return n;
}
function showError(message){$("validation-message").textContent=message;$("validation-message").hidden=!message;}
function clearResults(){
 $("empty-state").hidden=false;$("results-content").hidden=true;
 $("dry-empty").hidden=false;$("dry-results").hidden=true;
}
function selectMode(next){
 mode=next;const dry=mode==="dry";
 $("kills-input").hidden=dry;$("chests-input").hidden=!dry;
 $("key-mode").hidden=dry;$("world-mode").hidden=dry;
 $("slayer-option").hidden=dry;$("simulation-note").hidden=dry;$("dry-note").hidden=!dry;
 $("loot-panel").hidden=dry;$("dry-panel").hidden=!dry;
 for(const [id,selected] of [["loot",!dry],["dry",dry]]){
  $("mode-"+id).classList.toggle("is-active",selected);
  $("mode-"+id).setAttribute("aria-pressed",String(selected));
 }
 $("plan-heading").textContent=dry?"Chest openings":"Your kills";
 $("action-label").textContent=dry?"Calculate chances":"Simulate loot";
 showError("");clearResults();
}
function icon(item){
 const frame=document.createElement("span");frame.className="phosani-icon";
 const img=document.createElement("img");
 img.src="../assets/items/"+item.id+".png";img.alt="";img.loading="lazy";
 img.width=36;img.height=32;
 // Always use assets bundled with this website (never Wiki hotlinks).
 img.onerror=()=>{img.onerror=null;img.src="../assets/items/big-bones.png";};
 frame.append(img);return frame;
}
function lootCard(item,quantity){
 const card=document.createElement("div");card.className="loot-item";
 const picture=document.createElement("div");picture.className="loot-icon";
 picture.append(icon(item));
 const details=document.createElement("div");details.className="loot-info";
 const amount=document.createElement("strong");amount.textContent="× "+fmt(quantity);
 const name=document.createElement("span");name.textContent=item.name;
 details.append(amount,name);card.append(picture,details);return card;
}
function populate(id,drops){
 const dest=$(id);dest.replaceChildren();
 const sorted=Object.entries(drops).filter(([,n])=>n>0)
  .sort((a,b)=>b[1]-a[1]||(ITEMS[a[0]]?.name??a[0]).localeCompare(ITEMS[b[0]]?.name??b[0]));
 if(sorted.length===0){
  const p=document.createElement("p");p.className="bryophyta-empty";
  p.textContent=id==="chest-loot"?"No chests were opened.":"No drops were rolled.";
  dest.append(p);return;
 }
 for(const [item,n] of sorted)dest.append(lootCard(ITEMS[item]??{id:item,name:item},n));
}
function stat(label,value){
 const container=document.createElement("div");container.className="bryophyta-stat";
 const title=document.createElement("span");title.textContent=label;
 const amount=document.createElement("strong");amount.textContent=fmt(value);
 container.append(title,amount);return container;
}
function lootResults(data){
 const summary=$("key-summary");summary.replaceChildren(
  stat("Boss kills",data.kills),
  stat("Boss-dropped keys",data.keysFromBoss),
  stat("Chests opened",data.chestsOpened),
  stat("Keys found in chests",data.chestKeysFound)
 );
 populate("boss-loot",data.bossDrops);populate("chest-loot",data.chestDrops);
 $("empty-state").hidden=true;$("results-content").hidden=false;
}
function percentage(x){
 if(x<=0)return "0%";if(x>=1)return "100%";
 const v=x*100;if(v<.000001)return "<0.000001%";
 if(v>99.999999)return ">99.999999%";
 return v.toFixed(v<1?4:2)+"%";
}
function outcome(label,prob){
 const row=document.createElement("div");row.className="dry-outcome";
 const title=document.createElement("span");title.textContent=label;
 const num=document.createElement("strong");num.textContent=percentage(prob);
 row.append(title,num);return row;
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
 grid.append(dryCard(ESSENCE,data[ESSENCE.id]),dryCard(KEY,data[KEY.id]));
 $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
$("mode-loot").addEventListener("click",()=>selectMode("loot"));
$("mode-dry").addEventListener("click",()=>selectMode("dry"));
form.addEventListener("input",()=>{clearResults();showError("");});
$("clear-button").addEventListener("click",()=>{
 $("kill-count").value="100";$("chest-count").value="100";
 $("slayer-task").checked=false;
 form.querySelector('input[name="key-mode"][value="preobtained"]').checked=true;
 form.querySelector('input[name="world"][value="members"]').checked=true;
 clearResults();showError("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();showError("");
 try{
  if(mode==="dry")dryResults(calculateDry(count("chest-count","Chest openings")));
  else lootResults(simulate(count("kill-count","Boss kills"),{
   mode:setting("key-mode"),world:setting("world"),slayerTask:$("slayer-task").checked
  }));
 }catch(err){showError(err instanceof Error?err.message:"Could not calculate results.");}
});
