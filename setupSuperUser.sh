#! /bin/bash

# assume admin-role
aws sts assume-role --role-arn arn:aws:iam::082136225280:role/qldb-iam-super --role-session-name qldb-super > /tmp/super_creds.txt

# export the keys
export AWS_SECRET_ACCESS_KEY=`jq -r '.Credentials.SecretAccessKey' /tmp/super_creds.txt`
export AWS_ACCESS_KEY_ID=`jq -r '.Credentials.AccessKeyId' /tmp/super_creds.txt`
export AWS_SESSION_TOKEN=`jq -r '.Credentials.SessionToken' /tmp/super_creds.txt`

# check its set
echo AWS_SECRET_ACCESS_KEY
printenv AWS_SECRET_ACCESS_KEY
echo AWS_ACCESS_KEY_ID
printenv AWS_ACCESS_KEY_ID
echo AWS_SESSION_TOKEN
printenv AWS_SESSION_TOKEN

# should see the previously created ledger
aws qldb list-ledgers