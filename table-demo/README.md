# Table Permission Demo

## Pre-Requisites

This demo is intended as a follow up to the main `shell-demo`. It requires the ledger and roles to already be deployed from the `shell-demo`.

The `CloudFormation` template exports the ledger name in its `Outputs` section, and this is imported in the `serverless.yml`

## Setup

To setup the demo, install the dependencies and then deploy the cloudformation stack using the following commands:

```shell
> npm ci
> sls deploy --stage dev
```

## Running the Demo

Start off by connecting to the ledger, and then insert a document into the Keeper and Vehicle tables.

```shell
> qldb --ledger qldb-access-control

> INSERT INTO Keeper `{"name": "matt", "email":"matt@test.com"}` 
> INSERT INTO Vehicle `{"make": "Ford", "model":"Focus"}` 
```

Now exit the shell, and assume the role created by the cloudformation stack:

```shell
> exit
> source setupReadOnlyPerson.sh
```

```s
"Message":"Access denied. Unable to run the statement due to insufficient permissions or an improper variable reference"
```

## Removing the Demo

To remove the stack, simply run the following command:

```shell
> sls remove --stage dev
```
