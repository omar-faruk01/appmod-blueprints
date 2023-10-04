import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { StackProps } from 'aws-cdk-lib';
import { VpcLookupByNameProvider } from './vpcprovider';

const GIT_URL = "https://git-codecommit.us-west-2.amazonaws.com/v1/repos/appmod-workshop";

export default class PipelineStack {
    static build(scope: Construct, props: StackProps) {

        const env = props.env!;
        
        const blueprint = blueprints.EksBlueprint.builder()
            .version("auto")
            .region(env.region)
            .account(env.account)
            .resourceProvider(blueprints.GlobalResources.Vpc, new VpcLookupByNameProvider("appmod-vpc"))
            .addOns(
                new blueprints.AwsLoadBalancerControllerAddOn,
                new blueprints.VpcCniAddOn, 
                new blueprints.MetricsServerAddOn,
                new blueprints.ClusterAutoScalerAddOn,
                new blueprints.SecretsStoreAddOn(),
                new blueprints.NginxAddOn()
            );

            const devBlueprint = blueprint.clone()
                .addOns(    
                    // Add dev AddOns
                );

            const prodBlueprint = blueprint.clone()
                .addOns(    
                    // Add prod AddOns
                );

            blueprints.CodePipelineStack.builder()
            .name("blueprints-pipeline")
            .codeBuildPolicies(blueprints.DEFAULT_BUILD_POLICIES)
            .repository({
                codeCommitRepoName: 'appmod-workshop',
                targetRevision: 'main'
            })
            .stage({
                id: 'dev-stage',
                stackBuilder: devBlueprint.clone()
            })
            .stage({
                id: 'prod-state',
                stackBuilder: prodBlueprint.clone(),
                stageProps: {
                    pre: [new blueprints.pipelines.cdkpipelines.ManualApprovalStep('manual-approval')]
                }
            })
            .build(scope, "pipeline", props);
    }
}