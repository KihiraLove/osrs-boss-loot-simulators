// OSRS Wiki: Barbarian Assault/Gambles, checked 25 October 2026.
// Rows: [id, name, minimum quantity, maximum quantity].
export const MAIN = Object.freeze([
  ["ranarr-weed","Ranarr weed",20,30],
  ["snapdragon","Snapdragon",20,30],
  ["torstol","Torstol",20,30],
  ["ranarr-seed","Ranarr seed",3,4],
  ["snapdragon-seed","Snapdragon seed",3,4],
  ["torstol-seed","Torstol seed",3,4],
  ["watermelon-seed","Watermelon seed",50,50],
  ["palm-tree-seed","Palm tree seed",1,2],
  ["magic-seed","Magic seed",1,1],
  ["archer-helm","Archer helm",1,1],
  ["berserker-helm","Berserker helm",1,1],
  ["warrior-helm","Warrior helm",1,1],
  ["farseer-helm","Farseer helm",1,1],
  ["granite-shield","Granite shield",1,1],
  ["granite-helm","Granite helm",1,1],
  ["rune-kiteshield","Rune kiteshield",1,1],
  ["coal","Coal",750,750],
  ["runite-ore","Runite ore",20,20],
  ["runite-bar","Runite bar",15,15],
  ["dragon-bones","Dragon bones",50,75],
  ["black-dragonhide","Black dragonhide",30,50],
  ["uncut-diamond","Uncut diamond",25,30],
  ["magic-logs","Magic logs",50,100],
  ["mahogany-plank","Mahogany plank",60,80],
  ["rune-arrow","Rune arrow",400,500],
  ["raw-shark","Raw shark",250,300],
  ["shark","Shark",75,125],
  ["law-rune","Law rune",250,300],
  ["blood-rune","Blood rune",250,300],
  ["limpwurt-root","Limpwurt root",30,50],
  ["unicorn-horn","Unicorn horn",30,50],
  ["coins","Coins",50000,75000]
]);
export const DRAGON = Object.freeze([
  ["dragon-med-helm","Dragon med helm",1,1],
  ["dragon-chainbody","Dragon chainbody",1,1]
]);
export const PET = Object.freeze({ id: "pet-penance-queen", name: "Pet Penance Queen" });
export const CLUE = Object.freeze({ id: "clue-scroll-elite", name: "Clue scroll (elite)" });
export const UNIQUE = Object.freeze([PET, ...["granite-helm", "dragon-chainbody", "dragon-med-helm"]
  .map(id => [...MAIN, ...DRAGON].find(row => row[0] === id)).map(([id, name]) => ({ id, name }))]);
export const DRY_ITEMS = Object.freeze([...UNIQUE, CLUE]);
export const COLLECTION_IDS = Object.freeze([PET.id, "granite-helm", "dragon-chainbody"]);
export const ITEMS = Object.freeze(Object.fromEntries([
  ...[...MAIN, ...DRAGON].map(([id, name]) => [id, { id, name }]), [PET.id, PET], [CLUE.id, CLUE]
]));
