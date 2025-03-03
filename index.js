import {
    app,
    openRoutes,
    setStorage
} from "@agentic-profile/express";
import serverlessExpress from "@codegenie/serverless-express"

import { handleAgentChatMessage } from "./dist/chat/index.js";
import { MySQLStorage } from "./dist/storage/database.js";


setStorage( new MySQLStorage() );

app.use("/v1", openRoutes({
    status: { name: "Testing" },
    handleAgentChatMessage
}));

const seHandler = serverlessExpress({ app });
export function handler(event, context, callback ) {
    context.callbackWaitsForEmptyEventLoop = false;
    return seHandler( event, context, callback );
}