/**
 * @typedef Wepon
 * @property {integer} id.required
 * @property {string} name.required
 * @property {string} author.required
 * @property {integer} damage.required
 * @property {integer} speed.required - speed of using
 * @property {integer} createdAt.required
 */

class Wepon{
    constructor(id, name, author, damage, speed, createdAt){
        [this.id, this.name, this.author, this.damage, this.speed, this.createdAt] 
        = [id, name, author, damage, speed, createdAt];
    }
}
module.exports=Wepon;