console.log( 'Running Node locally...' );

import 'dotenv/config';
import express from "express";
import { handleAgentChatMessage } from "@agentic-profile/chat";
import { setAgentHooks } from "@agentic-profile/common";
import {
    app,
    ensureCreditBalance,
    generateChatReply,
    InMemoryStorage,
    MySQLStorage,
    openRoutes,
} from "@agentic-profile/express";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/", express.static( join(__dirname, "www") ));

const Storage = process.env.AP_STORAGE === 'mysql' ? MySQLStorage : InMemoryStorage;
const port = process.env.PORT || 3003;
const TESTING_DID_PATH = `web:localhost%3A${port}:iam`;
setAgentHooks({
    generateChatReply,
    storage: new Storage(),
    createUserAgentDid: (uid) => `did:${process.env.AP_DID_PATH ?? TESTING_DID_PATH}:${uid}`,
    ensureCreditBalance,
    handleAgentChatMessage
});

app.use("/", openRoutes({
    status: { name: "Testing" }
}));

app.listen(port, () => {
    console.info(`Agentic Profile Node Service listening on http://localhost:${port}`);
});