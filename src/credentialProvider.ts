/**
 * @summary factory for authentication with default credentials (that includes CLI) or with an app registration’s client Id and secret.
 */
import { ClientSecretCredential, DefaultAzureCredential, TokenCredential } from "@azure/identity";

export class CredentialProviderOptions {
    tenantId: string | undefined;
    clientSecret: string | undefined;
    clientId: string | undefined;
}

export class CredentialProvider {
    options: CredentialProviderOptions;

    constructor(options: CredentialProviderOptions) {
        this.options = options;
    }

    private isClientSecretPresent(): boolean {
        return !this.options.tenantId 
            && !this.options.clientSecret 
            && !this.options.clientId;
    }
    
    public get(): TokenCredential {
        if (this.isClientSecretPresent()) {
            return new ClientSecretCredential(
                this.options.tenantId as string, // The tenant ID in Azure Active Directory
                this.options.clientId as string, // The app registration client Id in the AAD tenant
                this.options.clientSecret as string // The app registration secret for the registered application
              );
        }
        return new DefaultAzureCredential();
    }
}