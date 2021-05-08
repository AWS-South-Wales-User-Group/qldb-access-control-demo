# QLDB Access Control Demo

This repository allows you to test out the new fine grained access control permissions available in QLDB by using the QLDB shell

## Pre-Requisites

In order to run the demo, the following is required:

* The AWS Commmand Line Interface `AWS CLI` is installed. For more details see [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* The `jq` library is installed. For more details see [here](https://stedolan.github.io/jq/download/)
* An AWS Profile is configured with a user with administrative permissions for initial setup.
* QLDB Shell is installed - For more details see [here](https://docs.aws.amazon.com/qldb/latest/developerguide/data-shell.html)

## QLDB Shell

I raised a feature request for multi-line support on the QLDB shell. A huge thank you to [Mark Bowes](https://twitter.com/marcbowes) and [Ian Davies](https://twitter.com/this_alpian) who rapidly turned around my feature request for this. Customer obsession is real at AWS. This is a new version written in Rust that is available on the AWS tap, so can be installed via Homebrew.

```script
> brew tap aws/tap
> brew install qldbshell
> qldb --ledger your-ledger
```

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
> aws cloudformation deploy --template-file ./qldb-access-control.yaml --stack-name qldb-access-control --capabilities CAPABILITY_NAMED_IAM
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
> source setupSuperUser.sh
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
> source unset.sh
```

This will unset the current saved session attributes, and allow you to run the relevant script to assume the same or different role.

The binaries should just run, but on OS X and Linux you may need to make them executable first:

```shell
> chmod u+r+x *.sh
```

## Task 1: Create Table and Index

The first task is to create a table and associated index in the ledger.

### Assume the super user role

```shell
> source setupSuperUser.sh
```

### Login to the QLDB shell

```shell
> qldb --ledger qldb-access-control
```

### Create a table called `Person`

```shell
> CREATE TABLE Person
```

This will return the unique id of the table created

### Create an index called `email` on this table

```shell
> CREATE INDEX on Person (email)
```

### Create another index called `id` on this table

```shell
> CREATE INDEX on Person (id)
```

### Switch role to another user and see what happens when you try and create a new table or index

```shell
> exit #This will exit the QLDB shell
> source unset.sh
> source setupAdmin.sh
> qldb --ledger qldb-access-control
> CREATE TABLE testTable
```

You should see the following error message displayed:

```s
WARNING: Error while executing query: An error occurred (AccessDeniedException) when calling the SendCommand operation: Access denied. Unable to run the statement due to insufficient permissions or an improper variable reference
```

## Task 2: Add Document to Table

The second task is to add a new document to the table that has been created.

### Assume the admin user role

```shell
> source setupAdmin.sh
```

### Login to the QLDB shell and create a document in the `Person` table specifying a memorable email address

```shell
> qldb --ledger qldb-access-control

> INSERT INTO Person `{"colour": "Blue", "email":"matt@test.com"}` 
```

This will return the unique id of this document. Make a note of this value as you will need it later

### Switch role to another user and see what happens when you try and create a new record

```shell
> exit # Exit the QLDB shell
> source unset.sh
> source setupReadOnly.sh
> qldb --ledger qldb-access-control

> INSERT INTO Person `{"colour": "Green", "email":"chris@test.com"}`
```

This should return an error message due to insufficient permissions.

## Task 3: Update Document in Table

The third task is to update the document that has been already been created.

### Assume admin user role

```shell
> source setupAdmin.sh
```

### Update the document in the `Person` table specifying the memorable email address

```shell
> qldb --ledger qldb-access-control

> UPDATE Person SET colour='Red' where email='matt@test.com'
```

### Switch role to another user and see what happens when you try and update the record

```shell
> exit # Exit the QLDB shell
> source unset.sh
> source setupReadOnly.sh

> qldb --ledger qldb-access-control

> UPDATE Person SET colour='Brown' where email='matt@test.com'
```

## Task 4: View Current Revision from Table

The fourth task is to view the current state of a document in the table.

### Assume the Read Only user role

```shell
> source setupReadOnly.sh
```

### Retrieve the current version of the document in the `Person` table

```shell
> qldb --ledger qldb-access-control

> SELECT * FROM Person where email='matt@test.com'
```

## Task 5: View History of Document

The fifth task is to view the full revision history of a document in the table.

### Assume the audit user role and access the shell

```shell
> source setupAudit.sh
> qldb --ledger qldb-access-control
```

### Get the whole document revision history

This uses the PartiQL history function, and you will need the unique id of the document. If you did not make a note in Task 2 above, then you can retrieve the id from the committed history using the following command:

```shell
> SELECT metadata.id FROM _ql_committed_Person where data.email='matt@test.com'
```

Retrieve the revision history using the id as follows:

```shell
> SELECT * FROM history(Person) WHERE metadata.id = '<id>'
```

### Switch role to another user and see what happens when you try and retrieve the history

```shell
> exit # Exit the QLDB shell
> source unset.sh
> source setupReadOnly.sh
> qldb --ledger qldb-access-control

> SELECT * FROM history(Person) WHERE metadata.id = '<id>'
```

## Bonus Task

As a bonus task, look to lock down permission to a specific table in a ledger. To do this, you need to include the table ID in the policy. For more information on how to do this, go to the [readme](../table-demo) in the table-demo folder.

## Tidying up resources

To remove all resources, you will need to assume the role of a user with relevant permissions to interact with QLDB and CloudFormation. After that, you can remove the deletion protection for the given ledger and remove the stack.

```shell
> source unset.sh
> aws cloudformation delete-stack --stack-name qldb-access-control
```
