import {
    Response,
    Request
} from "express";
import {
	SignedChallenge,
    ClientAgentSession,
    AgentAuthStore,
    createChallenge,
    handleAuthorization,
    handleLogin
} from "@agentic-profile/auth";

import { queryResult, queryFirstRow } from "./util/sql.js"

const authStore = {
    saveClientSession: async ( sessionKey: string, profileUri: string, agentUrl?: string )=>{
        const params = [{
            session_key: sessionKey,
            profile_uri: profileUri,
            agent_url: agentUrl
        }];
        const { insertId: id } = await queryResult( "INSERT INTO client_agent_sessions SET ?", params );
        return id;
    },
    fetchClientSession: async (id:number)=>{
        const session = await queryFirstRow<any>( "SELECT * FROM client_agent_sessions WHERE id=?", [id] );
        return session ? { 
            id,
            created: session.created,
            sessionKey: session.session_key,
            profileUri: session.profile_uri,
            agentUrl: session.agent_url
        } as ClientAgentSession : null;
    },
    saveChallenge: async (challenge:string)=>{
        const { insertId: id } = await queryResult( 'INSERT INTO client_agent_challenges SET ?', [{challenge}] );
        return id;
    },
    deleteChallenge: async (id:number)=>{
        await queryResult( 'DELETE FROM client_agent_challenges WHERE id=?', [id] );
    }
} as AgentAuthStore;

// returns:
// - agent session
// - null if request handled by 401/challenge
// - or throws an Error
export async function resolveAgentSession( req: Request, res: Response ): Promise<ClientAgentSession | null> {
    const { authorization } = req.headers;
    if( !authorization ) {
        const challenge = await createChallenge( authStore );
        res.status(401).send( challenge );
        return null;
    } else
        return await handleAuthorization( authorization, authStore );
}

export async function agentLogin( signedChallenge: SignedChallenge ) {
    return await handleLogin( signedChallenge, authStore );
}