import {
    CanonicalURI,
    ChatMessage
} from "../models.js"

export interface TokenCounts {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number   
}

export interface MessageContext {
    tail: any[],    // TODO use ChatMessage?
    count: number
}

export interface ChatBridgeCompletionParams {
    prompt?: string,
    canonicalUri: CanonicalURI,
    messages: ChatMessage[],
    instruction?: string   
}

export interface ChatBridgeCompletionResult {
    reply: ChatMessage,
    json?: any,
    usage?: TokenCounts,
    cost?: number,
    messageContext?: MessageContext
}

export interface ChatBridge {
    completion: ( params: ChatBridgeCompletionParams ) => Promise<ChatBridgeCompletionResult>
}