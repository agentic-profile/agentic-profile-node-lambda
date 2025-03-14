console.log( 'Running Node locally...' );

import 'dotenv/config';
import express from "express";
import {
    app,
    handleAgentChatMessage, // "full" version
    InMemoryStorage,
    MySQLStorage,
    openRoutes,
    setAgentHooks,
    setStorage
} from "@agentic-profile/express";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/", express.static( join(__dirname, "www") ));

const storage = process.env.AP_STORAGE === 'mysql' ? MySQLStorage : InMemoryStorage;
setStorage( new storage() );
setAgentHooks({
    createAgenticDid: ( uid ) => `did:${process.env.AP_HOSTNAME ?? "example"}:iam:${uid}`
});

app.use("/", openRoutes({
    status: { name: "Testing" },
    handleAgentChatMessage
}));

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.info(`Agentic Profile Node Service listening on http://localhost:${port}`);
});