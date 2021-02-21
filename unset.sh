#! /bin/bash

unset AWS_ACCESS_KEY_ID;
unset AWS_SESSION_TOKEN;
unset AWS_SECRET_ACCESS_KEY;

aws sts get-caller-identity