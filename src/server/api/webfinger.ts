import { APIConfig, FastifyTypebox } from '.'
import { Type } from '@sinclair/typebox'

import Store, { ActorInfo } from '../store/index'
import ActivityPubSystem from '../apsystem'

import fetch from 'node-fetch'
import { ActorStore } from '../store/ActorStore'
import { hostname } from 'os'

interface WebfingerResponse {
    subject: string;
    links: {
        href: string;
        type?: string;
        rel?: string;
    }[];
}


export const webfingerRoutes = (cfg: APIConfig, store: Store, apsystem: ActivityPubSystem) => async (server: FastifyTypebox): Promise<void> => {
  // Get global list of admins as newline delimited string
  server.get('/.well-known/webfinger', {
    schema: {
        querystring: Type.Object({
            resource: Type.Optional(Type.String())
        })
        ,
      response: {
        200: Type.Object({
            subject: Type.String(),
            links: Type.Array(Type.Object({
                href: Type.String(),
                type: Type.Optional(Type.String()),
                rel: Type.Optional(Type.String())
            })
            )

        }),
        404: Type.String()
      },
      description: 'Retrieve user information via Webfinger',
      tags: ['Webfinger']
    }
  }, 
  
  async (request, reply) => {
    //Splits the query and retrieves the username and server
    const {resource} = request.query
    if (!resource){
      reply.code(404).send("No resource")
      return
    }
    console.log("local host is ", cfg.host)
    const actorUrl = resource.split(':')[1]
    const [username, hostname]= actorUrl.split('@')
    console.log("actorUrl is ", actorUrl)
    console.log("username is ", username)
    // Attempt to query Store

    const maybeactor = store.forActor(actorUrl)
    console.log("maybeactor is ", maybeactor)

    if (maybeactor){
      const actorInfo = await maybeactor.getInfo()
      
      console.log("actor info is ", actorInfo)

      reply.send(formatResponse(actorInfo, hostname, username))

    } else{
      reply.code(404).send("user not found")
    }
    
    

    

     
  })


}

function formatResponse( actorInfo: ActorInfo, hostName : string, username : string){
  
  return {
          "subject": `acct:${actorInfo.actorUrl}`,
        
          "links": [
            {
              "rel": "self",
              "type": "application/activity+json",
              "href": `https://${hostName}/users/${username}`
            }
          ]
        }
      
  
  }


