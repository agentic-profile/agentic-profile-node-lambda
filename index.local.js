import 'dotenv/config';
import express from "express";
import { handleAgentChatMessage } from "@agentic-profile/chat";
import { setAgentHooks } from "@agentic-profile/common";
import { app } from "@agentic-profile/express-common";
import {
    ensureCreditBalance,
    generateChatReply,
    InMemoryStorage,
    MySQLStorage,
    openRoutes,
} from "@agentic-profile/express";

import { routes } from "./dist/routes.js"

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
    status: { name: process.env.AP_SERVICE_NAME ?? "Agentic Profile Agent Service" }
}));

app.use("/", routes());

app.listen(port, () => {
    console.info(`Agentic Profile Node Service listening on http://localhost:${port}`);
});