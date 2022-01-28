import { WebSiteManagementClient } from "@azure/arm-appservice";

export async function getFunctionKey(client: WebSiteManagementClient, functionRg: string, functionAppName: string) {
    
    //https://docs.microsoft.com/en-us/rest/api/appservice/web-apps/list-host-keys
    let functionKey = client.webApps.listHostKeys(functionRg, functionAppName);
    //use the default key for now
    //future - check for apim-instanceName and if not exists, create it

    try {
        console.log("functionKey: " + (await functionKey).masterKey)
        return (await functionKey).masterKey;
    } catch (error) {
        console.log(error);
    }

}