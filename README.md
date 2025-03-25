# Agentic Profile Node Lambda Demo

This is an example of a Node service that hosts Agentic Profile agents.

This service can run locally, on a Node server, or on AWS Lambda.  It supports a simple in-memory database for local testing, and MySQL when running in the cloud.

This simple demo is intended to be extended for more complex use cases.


## Quickstart

The easiest way to run this demo is locally.  This assumes you have git, yarn, and node installed.

1. Clone this repository: 

	$ git clone git@github.com:agentic-profile/agentic-profile-node-lambda.git

2. From the shell, switch to this project directory

	$ cd agentic-profile-node-lambda

3. Download dependencies

	$ yarn

4. Run the server

	$ yarn dev


## Deploying to AWS Lambda

These instructions are for a senior engineer with cloud experience on AWS.

1. Create a Lambda function (we used the name 'agentic-profile-node-service')
2. Instantiate a MySQL database and set the following Lambda environment variables:

	MYSQL_HOSTNAME=&lt;your mysql hostname&gt;
	MYSQL_DATABASE=&lt;your mysql database name&gt;
	MYSQL_USER=&lt;your mysql username&gt;
	MYSQL_PASSWORD=&lt;your mysql user password&gt;

	For example:

	MYSQL_HOSTNAME=mlops.cluster-xvq2iqcdleem.us-west-2.rds.amazonaws.com
	MYSQL_DATABASE=agentic_demo
	MYSQL_USER=lambda_worker
	MYSQL_PASSWORD="a very big secret!"

3. For local testing, you can use the values from step 3 in a .env file in this project directory
4. Update the deploy.sh file with your AWS authentication protocol (the value after "--profile")
5. Deploy your code to Lambda:

	$ ./deploy.sh

6. Make sure the Lambda function has access to the Internet to access to MySQL database.  This usually means being in a VPC and conncting to a NAT.

