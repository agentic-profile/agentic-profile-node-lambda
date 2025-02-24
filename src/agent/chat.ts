import {
    AgenticChallenge,
    AgenticProfile,
    AgentToken,
    ClientAgentSession,
    RemoteAgentSession
} from "@agentic-profile/auth";

import {
    AgentChat,
    ChatMessage,
    ChatMessageEnvelope,
    ChatMessageHistory,
    ChatMessageReplyEnvelope,
    StartAgentChat
} from "./models.js";
import {
    ChatBridgeCompletionResult,
} from "./bridges/models.js";
import {
    queryFirstRow,
    queryResult,
    queryRows,
} from "../util/sql.js";
import {
    ensureBalance,
    recordChatCost
} from "./billing.js";
import {
    selectBridge
} from "./bridges/index.js"
import {
    createCanonicalProfileUri
} from "./util.js";
import {
    User
} from "../users/models.js";
import { ServerError } from "../util/net.js";
import {
    ensureAgentChat,
    fetchChatHistory
} from "./query-chats.js";

const INSERT_MESSAGE = `UPDATE agent_chats
    SET history = JSON_SET(
        COALESCE(history, JSON_OBJECT('messages', JSON_ARRAY())), 
        '$.messages', JSON_ARRAY_APPEND(
            COALESCE(history->'$.messages', JSON_ARRAY()), 
            '$', CAST(? AS JSON)
        )
    )
    WHERE uid=? AND profile_uri=?`;


export async function handleAgentChatMessage( uid: string | number, envelope: ChatMessageEnvelope, agentSession: ClientAgentSession ) {
    const { profileUri } = agentSession;    // client agent URI, TODO ensure it's canonical
    const { message, rewind } = envelope;

    const canonicalUri = profileUri;
    console.log( "handleAgentChatMessage", uid, canonicalUri );

    // save incoming message locally
    if( rewind )
        await rewindChat( uid, canonicalUri, envelope );
    else if( message ) {
        message.from = canonicalUri;  // ensure 'from' is correct
        const messageJSON = JSON.stringify(message);
        await queryResult( INSERT_MESSAGE, [messageJSON,uid,canonicalUri] );
    } else
        return { reply: null };  // nothing to do

    // fetch all messages for AI
    let history = await fetchChatHistory( uid, canonicalUri );
    if( !history ) {
        console.log( "Failed to find history, creating new chat", uid, canonicalUri );
        const chat = await ensureAgentChat( uid, canonicalUri, [ message as ChatMessage ] );
        history = chat.history;
    }

    // generate reply and track cost
    const { reply, cost } = await generateChatReply( uid, history?.messages ?? []);
    await recordChatCost( { uid, canonicalUri }, cost );

    // save reply locally
    const replyJSON = JSON.stringify(reply);
    await queryResult( INSERT_MESSAGE, [replyJSON,uid,canonicalUri] );

    return { reply };
}

// profile URI must be canonical!
async function rewindChat( uid: string | number, canonicalUri: string, envelope: ChatMessageEnvelope ) {
    const { message, rewind } = envelope; 
    const chat = await queryFirstRow<AgentChat>(
        "SELECT history FROM agent_chats WHERE uid=? AND profile_uri=?",
        [uid,canonicalUri]
    );
    if( !chat )
        throw new ServerError([4],`Failed to rewind; could not find chat ${uid} ${canonicalUri} ${rewind}`);    

    let history = chat.history ?? {};
    if( !history.messages )
        history.messages = [];
    const rewindDate = new Date(rewind!);
    let p = history.messages.findIndex(e=>e.created && new Date(e.created) >= rewindDate);
    if( p === -1 ) {
        console.log( "Failed to find message to rewind to", rewindDate, history );
        p = 0;
    }

    const messages = history.messages.slice(0,p);
    if( message )
        messages.push( message );
    const historyUpdate = { ...history, messages };
    await queryResult(
        "UPDATE agent_chats SET history=? WHERE uid=? AND profile_uri=?",
        [ JSON.stringify(historyUpdate),uid,canonicalUri]
    ); 
}

export async function generateChatReply( uid: string | number, messages: ChatMessage[] ): Promise<ChatBridgeCompletionResult> {
    const canonicalUri = createCanonicalProfileUri( uid );
    //const personas = (await fetchPersonas( uid ))?.personas?.filter(e=>!e.hidden);  // except hidden
    const user = await queryFirstRow<User>("SELECT uid,name FROM users WHERE uid=?",[uid]);
    if( !user )
        throw new Error("Unable to generate chat reply, cannot find user with id " + uid );

    // if there are no messages from me, then introduce myself
    if( messages.some(e=>e.from === canonicalUri) !== true ) {
        console.log( 'intro', canonicalUri, messages );
        return introduceMyself( user ); //, personas, canonicalUri );
    }

    // Craft an instruction for AI with my role and goals
    //const userGoals = personas.filter(e=>e.meta?.goals).map(e=>e.meta.goals).join('\n\n');
    //const instruction = buildInstruction( user, userGoals );
    
    const bridge = selectBridge();
    return await bridge.completion({ canonicalUri, messages }); // , instruction })
}

function introduceMyself( user: User ): ChatBridgeCompletionResult {
    const reply = { content: "Nice to meet you!" } as ChatMessage;
    return { reply, cost: 0.01 };
}