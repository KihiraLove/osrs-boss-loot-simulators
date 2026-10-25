import { createDryField, createUniqueCard, createLootCard, createDryCard, parseNumber, resetPanels, showError, clearInputsOnClick, setCalculatorMode, byId as $ } from "./ui.mjs";

export function setupEncounterCalculator({encounters,maxEach,maxReceived,items,unique,dryItems,readOptions=()=>({}),simulate,calculateDry,rarity,createUnique=createUniqueCard,onLoot=()=>{},onDry=()=>{},onMode=()=>{},summaryLabel,summaryKey}) {
 const form=$("simulator-form"),dryInputs=$("dry-inputs");
 let mode="loot";
 for(const item of dryItems)dryInputs.append(createDryField(item));
 const readCounts=()=>Object.fromEntries(encounters.map(group=>[group.id,parseNumber($(group.inputId??group.id),maxEach,group.label)]));
 for(const name of ["loot","dry"])$("mode-"+name).addEventListener("click",()=>{mode=name;onMode(setCalculatorMode(name));});
 form.addEventListener("input",()=>{resetPanels();showError("");});
 $("clear-button").addEventListener("click",()=>{
  form.reset();
  for(const group of encounters)$(group.inputId??group.id).value="0";
  for(const input of dryInputs.querySelectorAll("input"))input.value="0";
  resetPanels();showError("");
 });
 form.addEventListener("submit",event=>{
  event.preventDefault();showError("");
  try {
   const counts=readCounts(),options=readOptions();
   if(mode==="dry") {
    const received={};
    const limit=typeof maxReceived==="function"?maxReceived(counts):maxReceived;
    for(const input of dryInputs.querySelectorAll("input"))received[input.dataset.id]=parseNumber(input,limit,items[input.dataset.id].name);
    const result=calculateDry(counts,received,options),grid=$("dry-results-grid");
    grid.replaceChildren(createDryCard(summaryLabel,unique[0],result[summaryKey],true,true));
    for(const item of dryItems)grid.append(createDryCard(item.dryName??item.name,item,result[item.id],false,true));
    onDry(result);$("dry-empty").hidden=true;$("dry-results").hidden=false;
   }else {
    const result=simulate(counts,options),uniqueGrid=$("unique-grid"),loot=$("loot-grid");
    uniqueGrid.replaceChildren();loot.replaceChildren();
    for(const item of unique)uniqueGrid.append(createUnique(item,result.drops[item.id]??0,rarity?.(item,result)));
    const excluded=new Set(unique.map(item=>item.id));
    const entries=Object.entries(result.drops).filter(([id])=>!excluded.has(id)).sort((a,b)=>b[1]-a[1]||items[a[0]].name.localeCompare(items[b[0]].name));
    for(const [id,count] of entries)loot.append(createLootCard(items[id],count));
    onLoot(result);$("empty-state").hidden=true;$("results-content").hidden=false;
   }
  }catch(error){resetPanels();showError(error instanceof Error?error.message:"Could not calculate the result.");}
 });
 clearInputsOnClick(form);
}
