# QLDB Access Control Demo

This repository allows you to test out the new fine grained access control permissions available in QLDB

## Pre-Requisites

In order to run the demo, the following is required:

* The AWS Commmand Line Interface `AWS CLI` is installed. For more details see [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* The `jq` library is installed. For more details see [here](https://stedolan.github.io/jq/download/)
* An AWS Profile is configured with a user with administrative permissions for initial setup.

## Setup

To setup the ledger and create the required roles, run the following command:

```shell
aws cloudformation deploy --template-file ./qldb-access-control.yaml --stack-name qldb-access-control --capabilities CAPABILITY_NAMED_IAM
```


| Role Name       | Description    |Create Table | Create Index | Create | Read | Update | Delete | History |  
| --------------- |:--------------:| :----------:| :-----------:| :-----:| :---:| :-----:| :-----:| :------:|
| qldb-iam-super  | Super user     | Yes         | Yes          | Yes    | Yes  | Yes    | Yes    | Yes     | 
| qldb-iam-admin  | Admin user     | No          | No           | Yes    | Yes  | Yes    | Yes    | Yes     |
| qldb-iam-audit  | Audit user     | No          | No           | No     | Yes  | No     | No     | Yes     |
| qldb-iam-ro     | Read only user | No          | No           | No     | Yes  | No     | No     | No      |




aws sts assume-role --role-arn arn:aws:iam::082136225280:role/qldb-access-control-admin --role-session-name qldb-admin



The binaries should just run, but on OS X and Linux you may need to make them executable first using chmod +x jq.
chmod u+r+x setup.sh


source setupAdmin.sh
sets it in your current shell

aws sts get-caller-identity

```json
{
    "UserId": "AROARGH5TKYAIG55KWIJ7:qldb-admin",
    "Account": "082136225280",
    "Arn": "arn:aws:sts::082136225280:assumed-role/qldb-access-control-admin/qldb-admin"
}
```

UserId -> (string)

The unique identifier of the calling entity. The exact value depends on the type of entity that is making the call. The values returned are those listed in the aws:userid column in the Principal table found on the Policy Variables reference page in the IAM User Guide .
Account -> (string)

The AWS account ID number of the account that owns or contains the calling entity.
Arn -> (string)

The AWS ARN associated with the calling entity.



```shell
unset AWS_ACCESS_KEY_ID;
unset AWS_SESSION_TOKEN;
unset AWS_SECRET_ACCESS_KEY;
```


npm install amazon-qldb-driver-nodejs --save
npm install aws-sdk --save
npm install ion-js --save
npm install jsbi --save



