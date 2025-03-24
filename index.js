import express from "express";
import serverlessExpress from "@codegenie/serverless-express";

import { handleAgentChatMessage } from "@agentic-profile/chat";
import { setAgentHooks } from "@agentic-profile/common";
import {
    app,
    ensureCreditBalance,
    generateChatReply,
    MySQLStorage,
    openRoutes,
} from "@agentic-profile/express";

import { routes } from "./dist/routes.js"

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/", express.static(
    join(__dirname, "www")
));

setAgentHooks({
    generateChatReply,
    storage: new MySQLStorage(),
    createUserAgentDid: (uid) => `did:${process.env.AP_DID_PATH}:${uid}`,
    ensureCreditBalance,
    handleAgentChatMessage
});

app.use("/", openRoutes({
    status: { name: "Testing" }
}));

app.use("/", routes());

const seHandler = serverlessExpress({ app });
export function handler(event, context, callback ) {
    context.callbackWaitsForEmptyEventLoop = false;
    return seHandler( event, context, callback );
}