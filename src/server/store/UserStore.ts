import { AbstractLevel } from 'abstract-level'

export const FULL_WILDCARD = '@*@*'

export interface User{
    username : string,
    email: string,
    password: string
}

export class UserStore {
  db: AbstractLevel<any, string, any>

  constructor (db: AbstractLevel<any, string, any>) {
    this.db = db
  }

  
  async add (user: User) {
    // TODO: need to hash the password!!
    await this.db.put(user.email, user)
  } 

  async get (email : string):Promise<User|undefined>{
    //return the user from the email
    const user = await this.db.get(email)
    
    return user
  }

}
