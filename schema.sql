CREATE DATABASE agentic_service_demo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER 'demoworker'@'%' IDENTIFIED BY '<choose-a-password>';
GRANT SELECT,INSERT,UPDATE,DELETE,EXECUTE
    ON agentic_service_demo.*
    TO 'demoworker'@'%';
FLUSH Privileges;

USE agentic_service_demo;


CREATE TABLE agent_chats(
    cid INT PRIMARY KEY AUTO_INCREMENT,

    uid INT NOT NULL,               # user that agent is representing
    profile_uri TINYTEXT NOT NULL,  # Canonical uri of other person/actor/agent (may be on different/remote system) 

    # state JSON, # current subject, etc.
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message TIMESTAMP,
    message_count INT DEFAULT 0,
    cost NUMERIC(13,4) DEFAULT 0,
    aimodel TINYTEXT,     # e.g. openai:gpt-4-preview
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,

    history JSON # format of JSON is { messages:[ { from: "bob", contents: "Hello", created: <ISO8601 string> }, ... ] }
);

# challenge created on remote end, and returned to client agent
CREATE TABLE client_agent_challenges(
    id INT PRIMARY KEY AUTO_INCREMENT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    challenge VARCHAR(40) NOT NULL
);

# sessions created by agent server side, and session key given to client agent
CREATE TABLE client_agent_sessions(
    id INT PRIMARY KEY AUTO_INCREMENT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_uri TINYTEXT NOT NULL, -- person this is from, canonical client profileUri
    agent_url TINYTEXT, -- optional, client AgentUrl (when missing a generic request from profileUri)
    session_key TINYTEXT NOT NULL
);

CREATE TABLE agentic_profile_cache(
    profile_uri VARCHAR(255) NOT NULL, -- Might NOT be canonical
    agentic_profile JSON NOT NULL, -- cached profile
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_uri)
);

# on client side, session token for communicating with remote/server agentUrl
CREATE TABLE remote_agent_sessions(
    uid INT NOT NULL, -- implicit my profileUri
    remote_agent_url VARCHAR(255) NOT NULL, -- server agent we are communicating with
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agent_token TEXT NOT NULL,
    UNIQUE(uid,remote_agent_url)
);
