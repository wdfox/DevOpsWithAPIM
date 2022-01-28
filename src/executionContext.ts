import * as core from '@actions/core'
import { TokenCredential } from "@azure/identity";
import { CredentialProvider, CredentialProviderOptions } from './credentialProvider'


/**
 * @summary factory for authentication with default credentials (that includes CLI) or with an app registration’s client Id and secret.
 */
 export default class ExecutionContext {
     private credential?: TokenCredential;

     constructor(private credentialProvider: CredentialProvider, private subscriptionId: string) {
     }

     public getCredential(): TokenCredential {
         return this.credential ?? (this.credential = this.credentialProvider.get());
     }

     public getSubscriptionId(): string {
         return this.subscriptionId;
     }

     public static create(): ExecutionContext {
        const credentialProvider = new CredentialProvider({
            clientId: core.getInput('client-id', { required: false }),
            clientSecret: core.getInput('client-secret', { required: false }),
            tenantId: core.getInput('tenant-id', { required: false })
        })

        let subscriptionId = ExecutionContext.getSubscriptionId();

        return new ExecutionContext(credentialProvider, subscriptionId);
     }

     private static getSubscriptionId(): string {
        const inputSubscriptionId = core.getInput('');
         
        const subscriptionId = inputSubscriptionId.length === 0 ? process.env.SUBSCRIPTION_ID : inputSubscriptionId;

        if (!subscriptionId) {
            throw new Error("Azure Subscription ID not found.")
        }

        return subscriptionId;
     }
 }