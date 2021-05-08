## QLDB Access Control Demo

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