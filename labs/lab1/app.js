const readline = require('readline-sync');
const UserRepository = require('./repositories/userRepository');
const WeponRepository = require('./repositories/weponRepository');
const userStorage = new UserRepository('./data/users.json');
const weponStorage = new WeponRepository('./data/wepons.json');

function printUser(user){
    const id = "  id: "+user.id;
    const login = "  login: '"+user.login+"'";
    const fullname = "  fullname: '"+user.fullname+"'";
    const role = "  role: "+user.role;
    const reg = "  geristeregAt: "+user.registeredAt;
    const ava = "  avaUrl: '"+user.avaUrl+"'";
    let isE;
    if (user.isEnabled)
        isE = "  isEnabled: "+"enabled";
    else
        isE = "  isEnabled: "+"disabled";
    console.log(id+'\n'+login+'\n'+fullname+'\n'+role+'\n'+reg+'\n'+ava+'\n'+isE);
}
function printWepon(wepon){
    const id = "  id: "+wepon.id;
    const name = "  name: '"+wepon.name+"'";
    const author = "  author: '"+wepon.author+"'";
    const damage = "  damage: "+wepon.damage;
    const speed = "  speed: "+wepon.speed;
    const createdAt = "  Created at: "+wepon.createdAt;
    console.log(id+'\n'+name+'\n'+author+'\n'+damage+'\n'+speed+'\n'+createdAt);
}

while (true) {
    const input = readline.question("Enter command: ");
    if (input === "stop") break; 

    if (input === "get/users") {
        const items = userStorage.getUsers();
        for (const item of items)
            console.log("  "+item.id+". "+item.login);
    } else
    if (input.startsWith("get/users/")){
        const str_id=input.slice(10);
        const id = Number(str_id);
        const user = userStorage.getUserById(id);
        if (user===null) {
            console.log("Incorrect ID");
            continue;
        }
        printUser(user);
    } else
    if (input.startsWith("get/wepons/")){
        const str_id=input.slice(11);
        if (str_id.length<=0) continue;
        const id = Number(str_id);
        const wepon = weponStorage.getWeponById(id);
        printWepon(wepon);
    } else
    if (input.startsWith("delete/wepons/")){
        const str_id=input.slice(14);
        const id = Number(str_id);
        if (isNaN(id)) {
            console.log("Incorrect ID");
            continue;
        }
        const f = weponStorage.deleteWepon(id);
        if (!f) {
            console.log("Incorrect ID");
        }else
            console.log("  Deleted");
    } else
    if (input.startsWith("update/wepons/")){
        const str_id=input.slice(14);
        const id = Number(str_id);
        if (isNaN(id)) {
            console.log("Incorrect ID");
            continue;
        }
        let wepon = weponStorage.getWeponById(id);
        if (wepon===null) {
            console.log("Incorrect ID");
            continue;
        }
        const name = readline.question("  name: ");
        const author = readline.question("  author: ");
        const str_damage = readline.question("  damage: ");
        const str_speed = readline.question("  speed: ");
        if (name!=="") wepon.name=name;
        if (author!=="") wepon.author=author;
        const damage = Number(str_damage);
        const speed = Number(str_speed);
        if (!isNaN(damage) && str_damage!=="") wepon.damage=Number(damage);
        if (!isNaN(speed) && str_speed!=="") wepon.speed=Number(speed);

        weponStorage.updateWepon(wepon);
        console.log("  Updated");
    } else
    if (input === "get/wepons") {
        const items = weponStorage.getWepons();
        for (const item of items)
            console.log("  "+item.id+". "+item.name);
    } else
    if (input === "post/wepons") {
        const name = readline.question("  name: ");
        const author = readline.question("  author: ");
        const damage = Number(readline.question("  damage: "));
        const speed = Number(readline.question("  speed: "));
        const date = new Date();
        let id;
        if (name.length>0 && author.length>0 && 
            !isNaN(damage) && damage>=0 && !isNaN(speed) && speed>0){
            id = weponStorage.addWepon(name, author, damage, speed, date);
            console.log("Added with id "+id);
        }
        else console.log("  Incorrect Data");
    } 
    
}