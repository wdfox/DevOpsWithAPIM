import { OperationContract, ApiManagementClient, ParameterContract } from "@azure/arm-apimanagement";

//https://docs.microsoft.com/en-us/javascript/api/@azure/arm-apimanagement/apioperation?view=azure-node-latest#@azure-arm-apimanagement-apioperation-createorupdate


// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';

export async function addAPIMOperation(APIM_Client: ApiManagementClient, apimRg: string, apimName: string, apiName: string, operationName: string, operationDisplayName: any, urlTemplate: any, method: any, parameters: any) {
    try {

        let parsedParams: ParameterContract[] = []
        let p:any;
        for (p of parameters) {
            parsedParams.push({
                "name": p,
                "type": "",
                "values": [],
                "required": true
            })
        }

        const operationContract: OperationContract = 
            {
                "displayName": operationDisplayName,
                "description": "",
                "urlTemplate": urlTemplate,
                "method": method,
                "templateParameters": parsedParams,
                "responses": []
            }

        //console.log("Here is the operation contract" + operationContract)

        await APIM_Client.apiOperation.createOrUpdate(apimRg, apimName, apiName, operationName, operationContract);

        console.log(green, '   SUCCESS: operation added');
        return 1;
    } catch (error) {
        console.log(red, '   FAILED to add operation. ' + error);
        return 0;
    }
}


// Add operation
// function addOperation(apimRg: string, apimName: string, apiName: string, operationName: string, operationDisplayName: any, urlTemplate: any, method: any, parameters: any) {
//     let operationUrl:string = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "?api-version=" + apiVersion
//     let parsedParams = []
//     let p:any;
//     for (p of parameters) {
//         parsedParams.push({
//             "name": p,
//             "type": "",
//             "values": [],
//             "required": "true"
//         })
//     }

//     const operationBody = {
//         "id": "/apis/" + apiName + "/operations/" + operationName,
//         "name": operationName,
//         "properties": {
//             "displayName": operationDisplayName,
//             "description": "",
//             "urlTemplate": urlTemplate,
//             "method": method,
//             "templateParameters": parsedParams,
//             "responses": []
//         }
//     }

//     return axios.put(baseUrl + operationUrl, operationBody, auth)
//         .then(function (response: any) {
//             console.log(green, '   SUCCESS: operation added');
//         })
//         .catch(function (error: any) {
//             console.log(red, '   FAILED to add operation. ' + error);
//         })
// }