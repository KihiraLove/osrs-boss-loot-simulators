// Download missing local OSRS item PNG sprites required by Dagannoth Kings.
// Run from the repository root: node dagannoth-kings/sync-sprites.mjs
// Uses the same RSPSApp/osrsreboxed-db item icons as existing boss simulators.
import {readFile,mkdir,writeFile,access} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
import {ITEMS} from "./simulator.mjs";
const dir=resolve(dirname(fileURLToPath(import.meta.url)),"../assets/items");
const source="https://raw.githubusercontent.com/RSPSApp/osrsreboxed-db/master/docs/";
const norm=name=>name.toLowerCase().replace(/[^a-z0-9]/g,"");
const get=async url=>{
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(url);
   if(!response.ok)throw new Error("HTTP "+response.status+" for "+url);
   return response;
  }catch(error){
   if(attempt===2)throw error;
   await new Promise(ok=>setTimeout(ok,500*(attempt+1)));
  }
 }
};
const signature=[137,80,78,71,13,10,26,10];
await mkdir(dir,{recursive:true});
const missing=[];
for(const item of Object.values(ITEMS)){
 const target=resolve(dir,item.id+".png");
 try{
  const data=await readFile(target);
  if(data.length>=8&&signature.every((n,i)=>data[i]===n))continue;
 }catch(error){if(error.code!=="ENOENT")throw error;}
 missing.push(item);
}
if(!missing.length){console.log("All Dagannoth Kings sprites are present.");process.exit(0);}
const names=Object.values(await (await get(source+"items-summary.json")).json());
const index=new Map();
for(const item of names){
 if(typeof item?.name==="string"&&Number.isInteger(item.id)){
  const name=norm(item.name);
  if(!index.has(name))index.set(name,item.id);
 }
}
let next=0;
const errors=[];
await Promise.all(Array.from({length:Math.min(6,missing.length)},async()=>{
 while(next<missing.length){
  const item=missing[next++],id=index.get(norm(item.name));
  if(id===undefined){errors.push("No source item for "+item.name);continue;}
  try{
   const bytes=Buffer.from(await (await get(source+"items-icons/"+id+".png")).arrayBuffer());
   if(bytes.length<8||!signature.every((n,i)=>bytes[i]===n))
    throw new Error("Not a PNG: "+item.name);
   await writeFile(resolve(dir,item.id+".png"),bytes);
  }catch(error){errors.push(item.name+": "+error.message);}
 }
}));
if(errors.length)throw new Error(errors.join("\n"));
console.log("Downloaded "+missing.length+" missing Dagannoth Kings PNG sprites.");
