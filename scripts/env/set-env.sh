#!/bin/bash

# $1 stage 
# $2 region 
# $3 is-jenkins boolean [optional]

export NODE_ENV=$1
export AWS_REGION=$2
export SERVERLESS_DEBUG=local

if [ "$3" = "true" ]
    then
    export AWS_PROFILE=your-jenkins-profile
else
    export AWS_PROFILE=your-aws-profile
fi