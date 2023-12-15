import { APIConfig, FastifyTypebox } from '..'
import { Type } from '@sinclair/typebox'
import generateIdentity from '../../../keypair.js'

import Store from '../../store/index'
import ActivityPubSystem from '../../apsystem'
import { run } from 'node:test'

export const registerRoutes = (cfg: APIConfig, store: Store, apsystem: ActivityPubSystem) => async (server: FastifyTypebox): Promise<void> => {
  // Get global list of admins as newline delimited string
  server.post('/auth/register', {
    schema: {
      consumes: ['application/json'],
      body: Type.Object({
        "email": Type.String(),
        "password": Type.String(),
        "username": Type.String()
      }),
      response: {
        200: Type.String(),
        400: Type.String()
      },
      description: 'Register user',
      tags: ['Moderation']
    }
  }, async (request, reply) => {
    const {email, username, password} = request.body
    console.log('checking if user exists')

    const maybeuser = await store.users.get(email).catch(e => undefined)
    
    if (maybeuser){
        reply.code(400).send('user already exists')
        return
    } 
    console.log('user does not exist')
    
    const keypair = generateIdentity()
    const actorUrl = `${username}@${cfg.host}`
    const info = {
        actorUrl ,
        keypair: keypair,
        publicKeyId: `${cfg.host}/users/${username}#main-key`
    }
    
    await store.users.add(request.body)
    await store.forActor(actorUrl).setInfo(info)
    reply.send('user added')


  })

}
