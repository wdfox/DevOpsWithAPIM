import { ApiManagementClient, ApiCreateOrUpdateParameter } from "@azure/arm-apimanagement";

// https://docs.microsoft.com/en-us/javascript/api/@azure/arm-apimanagement/apimanagementclient?view=azure-node-latest

export async function createAPI(apimRg: string, apimName: string, apiName: string, displayName: string, credential: any, subscriptionId: string): Promise<number | undefined> {
    console.log("subscriptionId: " + subscriptionId);

    //export async function createAPI(client: WebSiteManagementClient, functionRg: string, functionAppName: string): Promise<string | undefined> {
    try {

        // TODO: move this to main.ts and pass in
        const client = new ApiManagementClient(credential, subscriptionId);
        //let APIMParams = {displayName: "NewNewAPI"};

        // "id" : "/apis/" + apiName,
        // "name" : apiName,

        const APIMParams: ApiCreateOrUpdateParameter = 

                    {
                        "displayName" : displayName,
                        "protocols" : ["https"],
                        "description" : "Test",
                        "path" : apiName
                    }
                
        let APIMCLient = await client.api.beginCreateOrUpdateAndWait(apimRg, apimName, apiName, APIMParams);
        //client.api.
        //console.log(APIMCLient);


        // * @param resourceGroupName The name of the resource group.
        // * @param serviceName The name of the API Management service.
        // * @param apiId API revision identifier. Must be unique in the current API Management service instance.
        // *              Non-current revision has ;rev=n as a suffix where n is the revision number.
        // * @param parameters Create or update parameters.
        // * @param options The options parameters.

        //console.log("apiManagementOperations: " + JSON.stringify(client.apiManagementOperations.list()));
        for await (const f of client.api.listByService(apimRg, apimName)) {
            console.log("APIs list : " + f.name)
        }
        return 1;
        
    } catch (error) {
        console.log(error);
        return 0;
        
    }

}