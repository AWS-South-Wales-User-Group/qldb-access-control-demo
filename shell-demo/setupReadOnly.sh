#! /bin/bash

# assume read-only role
aws sts assume-role --role-arn arn:aws:iam::082136225280:role/qldb-iam-ro --role-session-name qldb-ro > /tmp/ro_creds.txt

# export the keys
export AWS_SECRET_ACCESS_KEY=`jq -r '.Credentials.SecretAccessKey' /tmp/ro_creds.txt`
export AWS_ACCESS_KEY_ID=`jq -r '.Credentials.AccessKeyId' /tmp/ro_creds.txt`
export AWS_SESSION_TOKEN=`jq -r '.Credentials.SessionToken' /tmp/ro_creds.txt`

# check its set
echo AWS_SECRET_ACCESS_KEY
printenv AWS_SECRET_ACCESS_KEY
echo AWS_ACCESS_KEY_ID
printenv AWS_ACCESS_KEY_ID
echo AWS_SESSION_TOKEN
printenv AWS_SESSION_TOKEN

# print out the current identity
aws sts get-caller-identity