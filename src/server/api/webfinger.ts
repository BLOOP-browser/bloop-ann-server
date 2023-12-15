import { APIConfig, FastifyTypebox } from '.'
import { Type } from '@sinclair/typebox'

import Store from '../store/index'
import ActivityPubSystem from '../apsystem'

import fetch from 'node-fetch'

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
            resource: Type.String()
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
        401: Type.String()
      },
      description: 'Retrieve user information via Webfinger',
      tags: ['Webfinger']
    }
  }, 
  
  async (request, reply) => {
    //Splits the query and retrieves the username and server
    const {resource} = request.query
    const account = resource.split(':')[1]
    const server = account.split('@')[1]

    if (account === "wormhole@mccd.space"){
      reply.send("Webfinger succeeded")
      console.log("wormhole@mccd.space")
    }
    else {
      reply.code(401).send("user does not exist")
    }
    
    // // Attempt to query server
    //  try {
    //     const data: WebfingerResponse= await queryWebfinger(resource, server);
    //     reply.send(data);
        
    //   } catch (error) {
    //     console.error('Error fetching Webfinger data:', error);
    //     reply.code(500).send('Internal Server Error');
    //   }
  })


}



async function queryWebfinger(resource : string, server : string) {
    const url = `http://${server}/.well-known/webfinger?resource=${resource}}`
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json() as Promise<WebfingerResponse>

    } catch (error) {
      console.error('Error fetching Webfinger data:', error);
      throw error;
    }
  }
