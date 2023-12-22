import { AbstractLevel } from 'abstract-level'

import { ActorStore } from './ActorStore.js'
import { AccountListStore } from './AccountListStore.js'
import { UserStore } from './UserStore.js'

export { ActorInfoSchema, ActorInfo } from '../../schemas.js'

export default class Store {
  db: AbstractLevel<any, string, any>
  actorCache: Map<string, ActorStore>
  actorsDb: AbstractLevel<any, string, any>
  blocklist: AccountListStore
  allowlist: AccountListStore
  admins: AccountListStore
  users: UserStore

  // TODO: Have store config which just needs the specific fields for the store
  constructor (db: AbstractLevel<any, string, any>) {
    this.db = db
    this.actorCache = new Map()
    this.actorsDb = this.db.sublevel('actorCache', { valueEncoding: 'json' })
    const blocklistDb = this.db.sublevel('blocklist', {
      valueEncoding: 'json'
    })

    
    const usersdb = this.db.sublevel('users', {
      valueEncoding: 'json'
    }
    )
    this.users = new UserStore(usersdb)

    

    this.blocklist = new AccountListStore(blocklistDb)
    const allowlistDb = this.db.sublevel('allowlist', {
      valueEncoding: 'json'
    })
    this.allowlist = new AccountListStore(allowlistDb)
    const adminsDb = this.db.sublevel('admins', {
      valueEncoding: 'json'
    })
    this.admins = new AccountListStore(adminsDb)
  }

  //TODO: update this!!
  getActor (domain: string): ActorStore {
    if (!this.actorCache.has(domain)) {
      const sub = this.db.sublevel(domain, { valueEncoding: 'json' })
      const store = new ActorStore(sub)
      this.actorCache.set(domain, store)
    }

    const store = this.actorCache.get(domain)
    if (store == null) {
      throw new Error('Actor does not exist')
    }
    return store
  }

  forActor (domain: string): ActorStore {
    if (!this.actorCache.has(domain)) {
      const sub = this.db.sublevel(domain, { valueEncoding: 'json' })
      const store = new ActorStore(sub)
      this.actorCache.set(domain, store)
    }

    const store = this.actorCache.get(domain)
    if (store == null) {
      throw new Error('Domain store not initialixed')
    }
    return store
  }
}
