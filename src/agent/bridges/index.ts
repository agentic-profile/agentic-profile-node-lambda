import { ServerError } from "../../util/net.js"
import {
    ChatBridge,
    ChatBridgeCompletionParams
} from "./models.js"

import {
    ChatMessage
} from "../models.js"

//import { VertexAIBridge } from "./VertexAIBridge.js"

export function selectBridge( aimodel?:string ): ChatBridge {
    if( aimodel ) {
        const ai = aimodel.trim().toLowerCase();
        //if( ai.startsWith( "vertex:" ) )
        //    return new VertexAIBridge( ai.substring(7) );
        if( ai.startsWith( "echo:" ) )
            return new EchoBridge( ai.substring(7) );
        else
            throw new ServerError([4],'Unsupported AI bridge: ' + ai );
    } else
        return new EchoBridge();
}

class EchoBridge implements ChatBridge {
    private model: string;

    constructor( model?: string ) {
        this.model = model || 'echo-1.0';
        console.log( 'Echo with', this.model );
    }

    get ai() {
        return 'echo:' + this.model;
    }

    get poweredBy() {
        const version = this.model.split('-').splice(1).join(' ');
        return 'Echo ' + version;
    }

    // prompt:  Last user message, telling AI what to do 
    // messages: [{ name:, role:, content: string }]
    //          order must always be user => model => user => model
    //          First must be user, last must be model
    // instruction:  system instruction, overall goals, etc.
    async completion( completionParams: ChatBridgeCompletionParams ) {
        const reply = { content: "Hello" } as ChatMessage;
        return { reply, cost: 0.01 }
    }
}