import { ApiCreateOrUpdateParameter } from "@azure/arm-apimanagement";

// https://docs.microsoft.com/en-us/javascript/api/@azure/arm-apimanagement/apimanagementclient?view=azure-node-latest

// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';

export async function createAPI(APIM_Client: any, apimRg: string, apimName: string, apiName: string, displayName: string, credential: any, subscriptionId: string): Promise<number | undefined> {
    try {
        // TODO: move this to main.ts and pass in
        const APIMParams: ApiCreateOrUpdateParameter = 
            {
                "displayName" : displayName,
                "protocols" : ["https"],
                "description" : "Test",
                "path" : apiName
            }
        await APIM_Client.api.beginCreateOrUpdateAndWait(apimRg, apimName, apiName, APIMParams);
        console.log(green, '   SUCCESS: created the API: ' + apimName + '/' + apiName);
        return 1;
    } catch (error) {
        console.log(red, '   FAILED to create new API: ' + apimName + '/' + apiName + '. Error message: ' + error);
        return 0;
    }
}
