import {
    queryFirstRow,
    queryResult,
    queryRows,
} from "../util/sql.js"
import {
    AgentChat,
    CanonicalURI,
    ChatMessage,
    ChatMessageHistory,
    ProfileURI
} from "./models.js"
import {
    createCanonicalProfileUri,
    fetchAgenticProfile,
    resolveCanonicalProfileUri
} from "./util.js"

const AGENT_CHAT_COLUMNS = "cid,uid,profile_uri as canonicalUri,created,updated,aimodel,history";

// profileUri might canonical OR vanity => returned agent chat is only canonical
export async function ensureAgentChat( uid: number | string, profileUri: ProfileURI, messages?: ChatMessage[] ) {
    if( !messages )
        messages = [];

    const canonicalUri = await resolveCanonicalProfileUri( profileUri );
    const existingChat = await queryFirstRow<AgentChat>(
        `SELECT ${AGENT_CHAT_COLUMNS} FROM agent_chats WHERE uid=? AND profile_uri=?`,
        [uid,canonicalUri]
    );
    if( existingChat )
        return existingChat;

    const insert = {
        uid,
        profile_uri: canonicalUri,
        history: JSON.stringify({messages})
    };
    const { insertId: cid } = await queryResult( "INSERT INTO agent_chats SET ?", [insert] );
    return {
        cid,
        uid,
        canonicalUri,
        created: new Date(),
        history: { messages }
    } as AgentChat;
}

/*
export async function recentChats( uid: string | number, actor: User ) {
    if( uid != actor.uid )
        throw new ServerError([4,1],"You don't have access to this users chats" );

    const chats = await queryRows<AgentChat>(`SELECT ${AGENT_CHAT_COLUMNS} FROM agent_chats WHERE uid=?`,[uid]);
    return { chats };
}

export async function fetchChat( uid: string | number, canonicalUri: CanonicalURI, actor: User ) {
    if( uid != actor.uid )
        throw new ServerError([4,1],"You don't have access to this users chat" );

    const chat = await queryFirstRow<AgentChat>(`SELECT ${AGENT_CHAT_COLUMNS} FROM agent_chats WHERE uid=? AND profile_uri=?`,[uid,canonicalUri]);
    const clientProfileUri = createCanonicalProfileUri( uid );
    return { chat, clientProfileUri };
}
*/

interface AgentChatHistory {
    history: ChatMessageHistory
}

export async function fetchChatHistory( uid: number | string, profileUri: string ) {
    return (await queryFirstRow<AgentChatHistory>(
        "SELECT history FROM agent_chats WHERE uid=? AND profile_uri=?",
        [uid,profileUri]
    ))?.history;   
}