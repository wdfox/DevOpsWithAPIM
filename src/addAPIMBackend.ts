import { BackendContract, ApiManagementClient } from "@azure/arm-apimanagement";

// https://docs.microsoft.com/en-us/javascript/api/@azure/arm-apimanagement/backend?view=azure-node-latest#@azure-arm-apimanagement-backend-createorupdate

// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';

export async function addAPIMBackend(APIM_Client: ApiManagementClient, apimRg: string, apimName: string, apiName: string, functionAppName: string, functionRg: string, functionAppUrl: string | undefined): Promise<number | undefined> {
    try {
        const backendContract: BackendContract = 
            {
                "description": functionAppName,
                "url": 'https://' + functionAppUrl + '/api',
                "protocol": "http",
                "resourceId": "https://management.azure.com/subscriptions/811ac24a-7a5f-41a7-acff-8dd138042333/resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName,
                "credentials": {
                    "header": {
                        "x-functions-key": ["{{" + apiName + "-key}}"]
                    }
                }
            }

//        await APIM_Client.namedValue.beginCreateOrUpdateAndWait(apimRg, apimName, apiName + "-key", namedValueContract)
        APIM_Client.backend.createOrUpdate(apimRg, apimName, apiName, backendContract)

        console.log(green, '   SUCCESS: Added the backend: ' + apimName);
        return 1;
    } catch (error) {
        console.log(red, '   FAILED to add the backend: ' + apimName + '. Error message: ' + error);
        return 0;
    }
}