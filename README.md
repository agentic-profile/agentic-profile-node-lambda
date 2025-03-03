# Agentic Profile Node Service Demo

This is an example of a Node service that hosts Agentic Profile agents.

This service can run locally, on a Node server, or on AWS Lambda.  It supports a simple in-memory database for local testing, and MySQL when running in the cloud.

This simple demo is intended to be extended for more complex use cases.

## Quickstart

The easiest way to run this demo is locally.

1. Clone this repository: 

	$ git clone git@github.com:agentic-profile/agentic-profile-node-lambda.git

2. From the shell, switch to this project directory

	$ cd agentic-profile-node-lambda

3. Download dependencies

	$ yarn

4. Run the server

	$ yarn dev