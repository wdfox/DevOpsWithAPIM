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
    options: CredentialProviderOptions | undefined;

    constructor(options?: CredentialProviderOptions) {
        this.options = options;
    }

    public get(): TokenCredential {
        if (this.isClientCredential()) {
            const o = this.options as CredentialProviderOptions;
            return new ClientSecretCredential(
                o.tenantId as string, // The tenant ID in Azure Active Directory
                o.clientId as string, // The app registration client Id in the AAD tenant
                o.clientSecret as string // The app registration secret for the registered application
              );
        }
        return new DefaultAzureCredential();
    }

    private isClientCredential(): boolean {
        if (this.options) {
            return !this.isEmpty(this.options.tenantId) 
                && !this.isEmpty(this.options.clientSecret)
                && !this.isEmpty(this.options.clientId);
        }
        return false;
    }
    
    private isEmpty(value: string | undefined): boolean {
        return (!value || value.length === 0 );
    }
}