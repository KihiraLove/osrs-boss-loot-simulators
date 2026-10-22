import {UNIQUE,DRY_ITEMS,ITEMS,MAX_KILLS,simulate,rateOf} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";
const $=id=>document.getElementById(id);
const format=n=>new Intl.NumberFormat("en-US").format(n);
const form=$("simulator-form"),dryInputs=$("dry-inputs");
let mode="loot";
function icon(item){
 const wrap=document.createElement("span");wrap.className="phosani-icon";
 const img=document.createElement("img");img.src="../assets/items/"+item.id+".png";
 img.alt="";img.loading="lazy";img.width=36;img.height=32;wrap.append(img);
 return wrap;
}
function parse(field,limit,label){
 const value=field.value.trim();
 if(!/^(0|[1-9]\d*)$/.test(value)||!Number.isSafeInteger(Number(value))||Number(value)>limit)
  throw new RangeError("Enter a non-negative whole number up to "+format(limit)+" for "+label+".");
 return Number(value);
}
function kills(){
 return {regular:parse($("regular-kills"),MAX_KILLS,"regular Gauntlet KC"),
  corrupted:parse($("corrupted-kills"),MAX_KILLS,"Corrupted Gauntlet KC")};
}
function setError(message){
 $("validation-message").textContent=message;$("validation-message").hidden=!message;
}
function reset(){
 $("empty-state").hidden=false;$("results-content").hidden=true;
 $("dry-empty").hidden=false;$("dry-results").hidden=true;
}
function setMode(next){
 mode=next;const dry=next==="dry";
 $("dry-fields").hidden=!dry;$("dry-panel").hidden=!dry;$("loot-panel").hidden=dry;
 $("elite-cas").closest("label").hidden=dry;
 $("include-cape").closest("label").hidden=dry;
 for(const name of ["loot","dry"]){
  $("mode-"+name).classList.toggle("is-active",name===next);
  $("mode-"+name).setAttribute("aria-pressed",String(name===next));
 }
 $("action-label").textContent=dry?"Calculate chances":"Simulate loot";
 setError("");
}
function dryField(item){
 const label=document.createElement("label");label.className="dry-field";
 const title=document.createElement("span");title.textContent=item.name;
 const input=document.createElement("input");input.type="number";input.min="0";input.step="1";
 input.value="0";input.inputMode="numeric";input.dataset.id=item.id;
 input.setAttribute("aria-label",item.name+" received");
 label.append(icon(item),title,input);dryInputs.append(label);
}
for(const item of DRY_ITEMS)dryField(item);
function uniqueCard(item,count){
 const card=document.createElement("div");card.className="unique-card"+(count?" found":"");
 const title=document.createElement("strong");title.textContent=item.name;
 const amount=document.createElement("span");amount.className="count";amount.textContent="× "+format(count);
 const rarity=document.createElement("span");rarity.className="rarity";
 rarity.textContent="Regular 1/"+format(Math.round(1/rateOf("regular",item.id)))+
  " · Corrupted 1/"+format(Math.round(1/rateOf("corrupted",item.id)));
 card.append(icon(item),title,amount,rarity);return card;
}
function lootCard(item,count){
 const card=document.createElement("div");card.className="loot-item";
 const frame=document.createElement("div");frame.className="loot-icon";frame.append(icon(item));
 const details=document.createElement("div");details.className="loot-info";
 const amount=document.createElement("strong");amount.textContent="× "+format(count);
 const title=document.createElement("span");title.textContent=item.name;
 details.append(amount,title);card.append(frame,details);return card;
}
function renderLoot(result){
 const unique=$("unique-grid"),loot=$("loot-grid");
 unique.replaceChildren();loot.replaceChildren();
 for(const item of UNIQUE)unique.append(uniqueCard(item,result.drops[item.id]??0));
 $("total-summary").textContent="Regular "+format(result.regularKills)+
  " · Corrupted "+format(result.corruptedKills)+
  " · Total "+format(result.kills);
 const uniqueIds=new Set(UNIQUE.map(item=>item.id));
 const entries=Object.entries(result.drops).filter(([id,n])=>n>0&&!uniqueIds.has(id))
  .sort((a,b)=>b[1]-a[1]||ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
 for(const [id,count] of entries)loot.append(lootCard(ITEMS[id],count));
 $("empty-state").hidden=true;$("results-content").hidden=false;
}
function percent(p){
 if(p<=0)return "0%";if(p>=1)return "100%";
 const n=p*100;
 if(n<.000001)return "<0.000001%";if(n>99.999999)return ">99.999999%";
 return n.toFixed(n<1?4:2)+"%";
}
function outcome(label,p){
 const box=document.createElement("div");box.className="dry-outcome";
 const title=document.createElement("span");title.textContent=label;
 const value=document.createElement("strong");value.textContent=percent(p);
 box.append(title,value);return box;
}
function dryCard(item,result){
 const card=document.createElement("section");card.className="dry-result-card";
 const head=document.createElement("div");head.className="dry-result-heading";
 const info=document.createElement("div"),title=document.createElement("h3");
 title.textContent=item.name;
 const expected=document.createElement("p");
 expected.textContent="Expected: "+result.expected.toLocaleString("en-US",{maximumFractionDigits:2});
 info.append(title,expected);head.append(icon(item),info);card.append(head);
 const chance=document.createElement("p");chance.className="any-drop-chance";
 const chanceLabel=document.createElement("span");chanceLabel.textContent="At least one";
 const chanceValue=document.createElement("strong");chanceValue.textContent=percent(result.atLeastOne);
 chance.append(chanceLabel,chanceValue);card.append(chance);
 const outcomes=document.createElement("div");outcomes.className="dry-outcomes";
 outcomes.append(outcome("Fewer than "+format(result.count),result.fewer),
  outcome("Exactly "+format(result.count),result.exact),
  outcome("More than "+format(result.count),result.more));
 card.append(outcomes);return card;
}
function combinedChance(label,p){
 const line=document.createElement("div");line.className="combined-chance";
 const title=document.createElement("span");title.textContent=label;
 const value=document.createElement("strong");value.textContent=percent(p);
 line.append(title,value);return line;
}
function renderDry(result){
 const grid=$("dry-results-grid");grid.replaceChildren();
 const overall=document.createElement("section");overall.className="combined-chances";
 overall.append(
  combinedChance("At least one crystal seed (any type)",result.anySeed.atLeastOne),
  combinedChance("At least one seed or Youngllef",result.anyUnique.atLeastOne)
 );grid.append(overall);
 for(const item of DRY_ITEMS)grid.append(dryCard(item,result[item.id]));
 $("dry-empty").hidden=true;$("dry-results").hidden=false;
}
function readReceived(total){
 const received={};
 for(const input of dryInputs.querySelectorAll("input")){
  const item=ITEMS[input.dataset.id];
  received[item.id]=parse(input,total,item.name);
 }
 return received;
}
$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{reset();setError("");});
$("clear-button").addEventListener("click",()=>{
 $("regular-kills").value="0";$("corrupted-kills").value="0";
 $("elite-cas").checked=false;$("include-cape").checked=true;
 for(const input of dryInputs.querySelectorAll("input"))input.value="0";
 reset();setError("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();setError("");
 try{
  const n=kills();
  if(mode==="dry")renderDry(calculateDry(n.regular,n.corrupted,readReceived(n.regular+n.corrupted)));
  else renderLoot(simulate(n.regular,n.corrupted,{
   eliteCAs:$("elite-cas").checked,includeCape:$("include-cape").checked
  }));
 }catch(error){setError(error instanceof Error?error.message:"Unable to calculate results.");}
});
