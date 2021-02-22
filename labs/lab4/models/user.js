/**
 * @typedef User
 * @property {string} _id.required
 * @property {string} login.required
 * @property {string} fullname.required
 * @property {integer} role.required - level of access
 * @property {string} registeredAt.required
 * @property {string} avaUrl.required - url adress if avatar
 * @property {boolean} isEnabled.required
 */

class User{
    constructor (id, login, fullname, role, registeredAt, avaUrl, isEnabled){
        this.id=id;
        this.login=login;
        this.fullname=fullname;
        this.role=role;
        this.registeredAt=registeredAt;
        this.avaUrl=avaUrl;
        this.isEnabled=isEnabled;
    }
}
module.exports=User;