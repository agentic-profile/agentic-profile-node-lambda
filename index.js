import express from "express";
import {
    app,
    handleAgentChatMessage,
    MySQLStorage,
    openRoutes,
    setStorage,
    setAgentHooks
} from "@agentic-profile/express";
import serverlessExpress from "@codegenie/serverless-express";

import { routes } from "./dist/routes.js"

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/", express.static(
    join(__dirname, "www")
));

setStorage( new MySQLStorage() );
setAgentHooks({
    createAgentDid: ( uid ) => `did:${process.env.AP_HOSTNAME ?? "example"}:iam:${uid}`
});

app.use("/", openRoutes({
    status: { name: "Testing" },
    handleAgentChatMessage
}));

app.use("/", routes());

const seHandler = serverlessExpress({ app });
export function handler(event, context, callback ) {
    context.callbackWaitsForEmptyEventLoop = false;
    return seHandler( event, context, callback );
}