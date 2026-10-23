import {
  setupRingOptions,
  clearInputsOnClick,
  createItemIcon,
  showError as error,
  probabilityText as percent,
  createOutcome as line,
  byId as $,
  formatNumber as fmt
} from "../../shared/ui.mjs";
import {KINGS,UNIQUE,ITEMS,MAX_KILLS,simulate,rateOf} from "./simulator.mjs";
import {calculateDry} from "./dry-calc.mjs";

const form=$("simulator-form");let mode="loot";
const readRings=setupRingOptions(form);
function icon(item) {
  return createItemIcon(item, { textFallback: true });
}
function parse(field,max,label){
 const raw=field.value.trim();
 if(!/^(0|[1-9]\d*)$/.test(raw)||!Number.isSafeInteger(Number(raw))||+raw>max)
  throw new RangeError("Enter a whole number from 0 to "+fmt(max)+" for "+label+".");
 return +raw;
}
function counts(){return Object.fromEntries(KINGS.map(k=>[k.id,parse($("kills-"+k.id),MAX_KILLS,k.name)]));}

function reset(){
 $("empty-state").hidden=false;$("loot-result").hidden=true;
 $("dry-empty").hidden=false;$("dry-result").hidden=true;
}
function setMode(next){
 mode=next;const dry=next==="dry";
 $("loot-panel").hidden=dry;$("dry-panel").hidden=!dry;$("dry-fields").hidden=!dry;
 for(const key of ["loot","dry"]){
  $("mode-"+key).classList.toggle("is-active",key===next);
  $("mode-"+key).setAttribute("aria-pressed",String(key===next));
 }
 $("action-label").textContent=dry?"Calculate chances":"Simulate loot";error("");
}
function makeField(item,king){
 const label=document.createElement("label");label.className="dry-field";
 const title=document.createElement("span");title.textContent=item.name;
 const input=document.createElement("input");input.type="number";input.min="0";input.step="1";
 input.value="0";input.inputMode="numeric";input.dataset.king=king;input.dataset.item=item.id;
 input.setAttribute("aria-label",item.name+" obtained from "+king);
 label.append(icon(item),title,input);return label;
}
for(const king of KINGS){
 const group=document.createElement("section");group.className="king-dry-inputs";
 const h=document.createElement("h4");h.textContent=king.name;group.append(h);
 for(const item of UNIQUE[king.id])group.append(makeField(item,king.id));
 $("dry-inputs").append(group);
}
function received(n){
 const data=Object.fromEntries(KINGS.map(k=>[k.id,{}]));
 for(const el of $("dry-inputs").querySelectorAll("input")){
  const item=ITEMS[el.dataset.item];
  data[el.dataset.king][item.id]=parse(el,n[el.dataset.king],item.name);
 }
 return data;
}
function title(text,tag="h4"){const t=document.createElement(tag);t.textContent=text;return t;}
function uniqueCard(king,item,count){
 const card=document.createElement("div");card.className="unique-card"+(count?" found":"");
 const strong=document.createElement("strong");strong.textContent=item.name;
 const amount=document.createElement("span");amount.className="count";amount.textContent="× "+fmt(count);
 const rate=document.createElement("span");rate.className="rarity";rate.textContent="1/"+fmt(Math.round(1/rateOf(king,item.id)));
 card.append(icon(item),strong,amount,rate);return card;
}
function lootCard(item,n){
 const card=document.createElement("div");card.className="loot-item";
 const frame=document.createElement("div");frame.className="loot-icon";frame.append(icon(item));
 const detail=document.createElement("div");detail.className="loot-info";
 const strong=document.createElement("strong");strong.textContent="× "+fmt(n);
 const name=document.createElement("span");name.textContent=item.name;
 detail.append(strong,name);card.append(frame,detail);return card;
}
function section(king){
 const s=document.createElement("section");s.className="king-results";
 s.append(title(king.name,"h3"));return s;
}
function renderLoot(results){
 const root=$("loot-result");root.replaceChildren();
 for(const king of KINGS){
  const result=results.kings[king.id],panel=section(king);
  panel.append(title("Unique rewards"));
  const unique=document.createElement("div");unique.className="unique-grid";
  for(const item of UNIQUE[king.id])unique.append(uniqueCard(king.id,item,result.drops[item.id]??0));
  panel.append(unique,title("Collected loot"));
  const inv=document.createElement("div");inv.className="loot-grid";
  const special=new Set(UNIQUE[king.id].map(item=>item.id));
  const entries=Object.entries(result.drops).filter(([id,n])=>n>0&&!special.has(id))
   .sort((a,b)=>b[1]-a[1]||ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
  for(const [id,n] of entries)inv.append(lootCard(ITEMS[id],n));
  panel.append(inv);root.append(panel);
 }
 $("empty-state").hidden=true;root.hidden=false;
}

function dryCard(item,result,combined=false){
 const card=document.createElement("section");card.className="dry-result-card"+(combined?" dry-total-card":"");
 const header=document.createElement("div");header.className="dry-result-heading";
 const info=document.createElement("div");
 info.append(title(combined?"Any rare reward":item.name),document.createElement("p"));
 info.lastChild.textContent="Expected: "+result.expected.toLocaleString("en-US",{maximumFractionDigits:2});
 header.append(icon(item),info);card.append(header);
 if(combined){
  const p=document.createElement("p");p.className="any-drop-chance";
  const label=document.createElement("span");label.textContent="At least one";
  const value=document.createElement("strong");value.textContent=percent(result.atLeastOne);
  p.append(label,value);card.append(p);
 }
 const odds=document.createElement("div");odds.className="dry-outcomes";
 odds.append(line("Fewer than "+fmt(result.count),result.fewer),
  line("Exactly "+fmt(result.count),result.exact),
  line("More than "+fmt(result.count),result.more));
 card.append(odds);return card;
}
function renderDry(result){
 const root=$("dry-result");root.replaceChildren();
 for(const king of KINGS){
  const panel=section(king),grid=document.createElement("div");grid.className="king-dry-grid";
  grid.append(dryCard(UNIQUE[king.id][0],result[king.id].anyUnique,true));
  for(const item of UNIQUE[king.id])grid.append(dryCard(item,result[king.id][item.id]));
  panel.append(grid);root.append(panel);
 }
 $("dry-empty").hidden=true;root.hidden=false;
}
$("mode-loot").addEventListener("click",()=>setMode("loot"));
$("mode-dry").addEventListener("click",()=>setMode("dry"));
form.addEventListener("input",()=>{reset();error("");});
$("clear-button").addEventListener("click",()=>{
 for(const king of KINGS)$("kills-"+king.id).value="0";
 form.querySelectorAll('input[type="checkbox"]').forEach(x=>{x.checked=false;});
 $("dry-inputs").querySelectorAll("input").forEach(x=>{x.value="0";});
 reset();error("");
});
form.addEventListener("submit",event=>{
 event.preventDefault();error("");
 try{
  const n=counts();
  if(mode==="dry")renderDry(calculateDry(n,received(n)));
  else renderLoot(simulate(n,{...readRings(),
   hardCAs:$("hard-cas").checked,eliteCAs:$("elite-cas").checked}));
 }catch(e){error(e instanceof Error?e.message:"Could not calculate the result.");}
});

clearInputsOnClick(form);
