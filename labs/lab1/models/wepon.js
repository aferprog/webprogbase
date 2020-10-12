class Wepon{
    constructor(id, name, author, damage, speed, createdAt){
        [this.id, this.name, this.author, this.damage, this.speed, this.createdAt] 
        = [id, name, author, damage, speed, createdAt];
    }
}
module.exports=Wepon;