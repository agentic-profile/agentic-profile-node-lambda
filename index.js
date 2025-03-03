import express from "express";
import {
    app,
    handleAgentChatMessage,
    InMemoryStorage,
    //MySQLStorage,
    openRoutes,
    setStorage
} from "@agentic-profile/express";
import serverlessExpress from "@codegenie/serverless-express";

import { routes } from "./dist/routes.js"

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/", express.static(
    join(__dirname, "www"),
    //{ index: 'index.json' }
));

//setStorage( new MySQLStorage() );
setStorage( new InMemoryStorage() );

app.use("/v1", openRoutes({
    status: { name: "Testing" },
    handleAgentChatMessage
}));

app.use("/v1", routes());

const seHandler = serverlessExpress({ app });
export function handler(event, context, callback ) {
    context.callbackWaitsForEmptyEventLoop = false;
    return seHandler( event, context, callback );
}