class User{
    constructor(login, telegramLogin=null,room=null,wsConnection=null, rpcConnection=null, telegramConnection=null){
        this.login=login;
        this.telegramLogin=telegramLogin;
        this.room=room;
        this.wsConnection=wsConnection;
        this.rpcConnection=rpcConnection;
        this.telegramConnection=telegramConnection;
    }
}
class AccountsController{
    constructor(){
        this.accounts = [];
    }
    notifyMany(msg, arr=null){
        const cond = arr ? (item)=>{
            console.log("Checked", item);
            if (arr.indexOf(item)!==-1) return true;
            else return false;
        } : ()=>true;
        this.accounts.forEach(element => {
            if (cond(element.login)) {
                this.notify(msg, element);
                console.log(`User ${element.login} is notified`);
            }
        });
    }
    notify(msg, _user){
        let user;
        if (!_user.login){
            x = this.accounts.findIndex(user => user.login === _user);
            user = this.accounts[x];
        } else {
            user = _user;
        }
        if (user.wsConnection) user.wsConnection.send(JSON.stringify(msg));
    }
    editAccount(obj){
        const x = this.accounts.findIndex(item=>{
            return item.login===obj.login;
        });
        let user = x>-1 ? this.accounts[x] : new User(obj.login);
        if (obj.telegramLogin) user.telegramLogin=obj.telegramLogin;
        if (obj.room) user.room=obj.room;
        if (obj.wsConnection) user.wsConnection=obj.wsConnection;
        if (obj.rpcConnection) user.rpcConnection=obj.rpcConnection;
        if (obj.telegramConnection && !user.telegramConnection) user.telegramConnection=obj.telegramConnection;
        if (x<0) this.accounts.push(user);
        // console.log(this.accounts.length);
        return user.room;
    }
    setRoom(name, room){
        const x = this.accounts.findIndex(user => user.login===name);
        this.accounts[x].room = room;
    }
    delRoom(id){
        this.accounts.forEach(user=>{
            if (user.room === id) user.room = null;
        });
    }
    getRoom(login){
        console.log("In get room:",login);
        const x = this.accounts.findIndex(user=>{
            return user.login===login;
        });
        // console.log(this.accounts[x]);
        return this.accounts[x].room;
    }
    delWsConnection(connection){
        const x = this.accounts.findIndex(user=>{
            return user.wsConnection===connection
        });
        this.accounts[x].wsConnection = null;
        if (this.accounts[x].room!=null && !this.accounts[x].rpcConnection && !this.accounts[x].telegramConnection) {
            // console.log("OKEY");
            return this.accounts[x].login;
        }
            else return null;
    }
}
let x = new AccountsController();
module.exports = x;