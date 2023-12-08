import { APIConfig, FastifyTypebox } from '..'
import { Type } from '@sinclair/typebox'

import Store from '../../store/index'
import ActivityPubSystem from '../../apsystem'

export const loginRoutes = (cfg: APIConfig, store: Store, apsystem: ActivityPubSystem) => async (server: FastifyTypebox): Promise<void> => {
  // Get global list of admins as newline delimited string
  server.post('/auth/login', {
    schema: {
      consumes: ['application/json'],
      body: Type.Object({
        "email": Type.String(),
        "password": Type.String()
      }),
      response: {
        200: Type.String(),
        401: Type.String()
      },
      description: 'Login with a locally registered user',
      tags: ['Moderation']
    }
  }, async (request, reply) => {
    // TODO: need to hash passwords, also respond to the hurl test results
    const {email, password} = request.body
    const maybeuser = await store.users.get(email)
    if(maybeuser && maybeuser.password === password){
        reply.send("Fake auth token")
        console.log('user exists')
    }
    else {
        reply.code(401).send("Unauthorized")
    }
  })

}
