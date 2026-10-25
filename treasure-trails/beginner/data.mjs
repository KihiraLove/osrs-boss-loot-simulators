// OSRS Wiki: Reward casket (beginner), checked 25 October 2026.
// Quantities and rates are per reward roll, not per casket.
export const COSMETICS=Object.freeze([
 {"id":"mole-slippers","name":"Mole slippers"},
 {"id":"frog-slippers","name":"Frog slippers"},
 {"id":"bear-feet","name":"Bear feet"},
 {"id":"demon-feet","name":"Demon feet"},
 {"id":"jester-cape","name":"Jester cape"},
 {"id":"shoulder-parrot","name":"Shoulder parrot"},
 {"id":"monks-robe-top-t","name":"Monk's robe top (t)"},
 {"id":"monks-robe-t","name":"Monk's robe (t)"},
 {"id":"amulet-of-defence-t","name":"Amulet of defence (t)"},
 {"id":"sandwich-lady-hat","name":"Sandwich lady hat"},
 {"id":"sandwich-lady-top","name":"Sandwich lady top"},
 {"id":"sandwich-lady-bottom","name":"Sandwich lady bottom"},
 {"id":"rune-scimitar-ornament-kit-guthix","name":"Rune scimitar ornament kit (Guthix)"},
 {"id":"rune-scimitar-ornament-kit-saradomin","name":"Rune scimitar ornament kit (Saradomin)"},
 {"id":"rune-scimitar-ornament-kit-zamorak","name":"Rune scimitar ornament kit (Zamorak)"}
]);
export const BLACK=Object.freeze([
 ["black-2h-sword","Black 2h sword",1,1],
 ["black-axe","Black axe",1,1],
 ["black-battleaxe","Black battleaxe",1,1],
 ["black-chainbody","Black chainbody",1,1],
 ["black-dagger","Black dagger",1,1],
 ["black-full-helm","Black full helm",1,1],
 ["black-kiteshield","Black kiteshield",1,1],
 ["black-longsword","Black longsword",1,1],
 ["black-mace","Black mace",1,1],
 ["black-med-helm","Black med helm",1,1],
 ["black-pickaxe","Black pickaxe",1,1],
 ["black-platebody","Black platebody",1,1],
 ["black-plateskirt","Black plateskirt",1,1],
 ["black-platelegs","Black platelegs",1,1],
 ["black-sq-shield","Black sq shield",1,1],
 ["black-scimitar","Black scimitar",1,1],
 ["black-sword","Black sword",1,1],
 ["black-warhammer","Black warhammer",1,1]
]);
// Forty ordinary outcomes and one equally weighted black-equipment subtable.
export const MAIN=Object.freeze([
 ["@black"],
 ["shortbow","Shortbow",1,1],
 ["longbow","Longbow",1,1],
 ["oak-shortbow","Oak shortbow",1,1],
 ["oak-longbow","Oak longbow",1,1],
 ["iron-pickaxe","Iron pickaxe",1,1],
 ["staff-of-air","Staff of air",1,1],
 ["staff-of-water","Staff of water",1,1],
 ["staff-of-earth","Staff of earth",1,1],
 ["staff-of-fire","Staff of fire",1,1],
 ["steel-full-helm","Steel full helm",1,1],
 ["steel-platebody","Steel platebody",1,1],
 ["steel-platelegs","Steel platelegs",1,1],
 ["steel-plateskirt","Steel plateskirt",1,1],
 ["steel-longsword","Steel longsword",1,1],
 ["steel-dagger","Steel dagger",1,1],
 ["steel-axe","Steel axe",1,1],
 ["steel-battleaxe","Steel battleaxe",1,1],
 ["leather-cowl","Leather cowl",1,1],
 ["leather-body","Leather body",1,1],
 ["leather-chaps","Leather chaps",1,1],
 ["leather-vambraces","Leather vambraces",1,1],
 ["hardleather-body","Hardleather body",1,1],
 ["blue-wizard-hat","Blue wizard hat",1,1],
 ["blue-wizard-robe","Blue wizard robe",1,1],
 ["wizard-hat","Wizard hat",1,1],
 ["black-robe","Black robe",1,1],
 ["air-rune","Air rune",15,35],
 ["mind-rune","Mind rune",15,35],
 ["water-rune","Water rune",15,35],
 ["earth-rune","Earth rune",15,35],
 ["fire-rune","Fire rune",15,35],
 ["body-rune","Body rune",15,35],
 ["chaos-rune","Chaos rune",2,7],
 ["nature-rune","Nature rune",2,7],
 ["law-rune","Law rune",2,7],
 ["bronze-arrow","Bronze arrow",15,30],
 ["iron-arrow","Iron arrow",7,15],
 ["shrimps","Shrimps",5,14],
 ["sardine","Sardine",5,12],
 ["herring","Herring",5,9]
]);
export const CABBAGE=Object.freeze(["cabbage","Cabbage",5,9]);
export const UNIQUE=Object.freeze([...COSMETICS,{id:"black-pickaxe",name:"Black pickaxe"}]);
export const ITEMS=Object.freeze(Object.fromEntries([
 ...COSMETICS.map(item=>[item.id,item]),
 ...[...BLACK,...MAIN.filter(row=>row[0]!=="@black"),CABBAGE].map(([id,name])=>[id,{id,name}])
]));
