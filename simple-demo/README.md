# QLDB Access Control Demo

This repository allows you to test out the new fine grained access control permissions available in QLDB

## Pre-Requisites

In order to run the demo, the following is required:

* The AWS Commmand Line Interface `AWS CLI` is installed. For more details see [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* The `jq` library is installed. For more details see [here](https://stedolan.github.io/jq/download/)
* An AWS Profile is configured with a user with administrative permissions for initial setup.

## Setup

To setup the ledger and create the required roles, edit the `qldb-access-control.yaml` CloudFormation template and replace the `{USER_NAME}` value with your current user, that will have the ability to assume the various roles. 

```yaml
    Statement: 
        - 
        Effect: "Allow"
        Principal:
            AWS:  !Sub "arn:aws:iam::${AWS::AccountId}:user/{USER_NAME}"
        Action: 
            - "sts:AssumeRole"
```

Once you have done this, run the following command:

```shell
aws cloudformation deploy --template-file ./qldb-access-control.yaml --stack-name qldb-access-control --capabilities CAPABILITY_NAMED_IAM
```

As well as creating a QLDB Ledger with the name `qldb-access-control` it sets up the following roles:

| Role Name       | Description    |Create Table | Create Index | Create | Read | Update | Delete | History |  
| --------------- |:--------------:| :----------:| :-----------:| :-----:| :---:| :-----:| :-----:| :------:|
| qldb-iam-super  | Super user     | Yes         | Yes          | Yes    | Yes  | Yes    | Yes    | Yes     |
| qldb-iam-admin  | Admin user     | No          | No           | Yes    | Yes  | Yes    | Yes    | Yes     |
| qldb-iam-audit  | Audit user     | No          | No           | No     | Yes  | No     | No     | Yes     |
| qldb-iam-ro     | Read only user | No          | No           | No     | Yes  | No     | No     | No      |

## Assuming a role

A number of scripts have been provided to help assume the various roles.

To assume the super user role run the following command:

```shell
source setupSuperUser.sh
```

This scripts prints out the current caller identity at the end, where you should see the following:

```json
{
    "UserId": "{UNIQUE_ID}:qldb-super",
    "Account": "{ACCOUNT_ID}",
    "Arn": "arn:aws:sts::{ACCOUNT_ID}:assumed-role/qldb-iam-super/qldb-super"
}
```

Before assuming another role, or if your security token expires, you can run the following command:

```shell
source unset.sh
```

This will unset the current saved session attributes, and allow you to run the relevant script to assume the same or different role.

The binaries should just run, but on OS X and Linux you may need to make them executable first:

```shell
chmod u+r+x *.sh
```

## Task 1: Create Table and Index

The first task is to create a table and associated index in the ledger.

1. Assume the super user role

```shell
source setupSuperUser.sh
```

2. Create a table called `Person` by using the following command in the project root:

```shell
node functions/create-table Person
```

3. Create an index called `email` on this table using the following command in the project root:

```shell
node functions/create-index Person email
```

4. Create another index called `id` on this table

```shell
node functions/create-index Person id
```

5. Switch role to another user and see what happens when you try and create a new table or index

```shell
source unset.sh
source setupAdmin.sh
node functions/create-table Test
```

## Task 2: Add Document to Table

The second task is to add a new document to the table that has been created.

1. Assume the admin user role

```shell
source setupAdmin.sh
```

2. Create a document in the `Person` table specifying a memorable email address by using the following command:

```shell
node functions/create-person matt@email.com
```

3. Switch role to another user and see what happens when you try and create a new record

```shell
source unset.sh
source setupReadOnly.sh
node functions/create-person matt1@email.com
```

## Task 3: Update Document in Table

The third task is to update the document that has been already been created.

1. Assume the admin user role

```shell
source setupAdmin.sh
```

2. Update the document in the `Person` table specifying the memorable email address by using the following command:

```shell
node functions/update-person matt@email.com
```

3. Switch role to another user and see what happens when you try and update the record

```shell
source unset.sh
source setupReadOnly.sh
node functions/update-person matt@email.com
```

## Task 4: View Current Revision from Table

The fourth task is to view the current state of a document in the table.

1. Assume the Read Only user role

```shell
source setupReadOnly.sh
```

2. Retrieve the current version of the document in the `Person` table by using the following command:

```shell
node functions/get-person matt@email.com
```

## Task 5: View History of Document

The fifth task is to view the full revision history of a document in the table.

1. Assume the audit user role

```shell
source setupAudit.sh
```

2. Get the whole document revision history by using the following command:

```shell
node functions/get-person-history-email matt@email.com
```

3. Switch role to another user and see what happens when you try and retrieve the history

```shell
source unset.sh
source setupReadOnly.sh
node functions/get-person-history-email matt@email.com
```

## Bonus Tasks

There are additional functions to delete a document and to view history using the unique id of the document, which has been included in the document that gets returned. Try deleting a document, and then getting the current version, and then the full revision history of the document in question.

## Tidying up resources

To remove all resources, you will need to assume the role of a user with relevant permissions to interact with QLDB and CloudFormation. After that, you can remove the deletion protection for the given ledger and remove the stack.

```shell
source unset.sh
aws qldb update-ledger --name qldb-access-control --no-deletion-protection
aws cloudformation delete-stack --stack-name qldb-access-control
```