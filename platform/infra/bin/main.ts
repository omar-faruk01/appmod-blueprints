import  HybridCluster from '../lib/blueprints/hybrid';
import PipelineStack from '../lib/blueprints/pipeline';
import CodeCommitStack from '../lib/codecommit/repository';
import * as cdk from 'aws-cdk-lib';

const app = new cdk.App();

const props: cdk.StackProps = {
    env:{
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-west-2'
    }
}


HybridCluster.build(app);
PipelineStack.build(app, props);

new CodeCommitStack(app, 'code-commit-repo', props);
