/**
 * @summary factory for authentication with default credentials (that includes CLI) or with an app registration’s client Id and secret.
 */
import ClientSecretCredential from "@azure/identity";
import DefaultAzureCredential from "@azure/identity";

class CredentialProviderOptions {
    tenantId;
    clientSecret;
    clientId;
}

class CredentialProvider {
    constructor(options) {
        this.options = options;
    }

    #isClientSecretPresent() {
        return this.options.tenantId && this.options.clientSecret && this.options.clientId;
    }
    get() {
        if (this.#isClientSecretPresent()) {
            return new ClientSecretCredential(
                this.options.tenantId, // The tenant ID in Azure Active Directory
                this.options.clientId, // The app registration client Id in the AAD tenant
                this.options.clientSecret // The app registration secret for the registered application
              );
        }
        return new DefaultAzureCredential();
    }
}

export {
    CredentialProviderOptions,
    CredentialProvider
};
