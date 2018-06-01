/* eslint-disable */

const ServerlessPluginSplitStacks = require('serverless-plugin-split-stacks');

ServerlessPluginSplitStacks.resolveMigration = function (resource, logicalId, serverless) {

    if(resource.Type === "AWS::Lambda::Permission") return null;
    if(resource.Type === "AWS::Lambda::Version") return null;
    if(resource.Type === "AWS::CloudWatch::Alarm") return null;
    if(resource.Type === "AWS::Logs::MetricFilter") return null;
    if(resource.Type === "AWS::Logs::SubscriptionFilter") return null;
    if(resource.Type === "AWS::SNS::Subscription") return null;
    if(resource.Type === "AWS::SNS::TopicPolicy") return null;
    if(resource.Type === "AWS::S3::BucketPolicy") return null;
    if(resource.Type === "AWS::SQS::QueuePolicy") return null;

    if (resource.Type == 'AWS::ApiGateway::Method') return {destination: 'Methods'};
    if (resource.Type == 'AWS::ApiGateway::Model') return {destination: 'Models'};

    // Fallback to default:
    return this.stacksMap[resource.Type];
};