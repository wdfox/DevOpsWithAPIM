import { PolicyContract, PolicyIdName, ApiManagementClient } from "@azure/arm-apimanagement";

//https://docs.microsoft.com/en-us/javascript/api/@azure/arm-apimanagement/apioperationpolicy?view=azure-node-latest#@azure-arm-apimanagement-apioperationpolicy-createorupdate


// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';

export async function addAPIMPolicy(APIM_Client: ApiManagementClient, apimRg: string, apimName: string, apiName: string, operationName: string) {
    try {
        const policyContract: PolicyContract = 
            {
                format: "xml",  
                value: `<policies>
                            <inbound>
                                <base />
                                <set-backend-service id="apim-generated-policy" backend-id="${apiName}" />
                            </inbound>
                            <backend>
                                <base />
                            </backend>
                            <outbound>
                                <base />
                            </outbound>
                            <on-error>
                                <base />
                            </on-error>
                        </policies>`
            }

        console.log(policyContract)
        const policyIdName: PolicyIdName = "policy";

        APIM_Client.apiOperationPolicy.createOrUpdate(apimRg, apimName, apiName, operationName, policyIdName, policyContract);

        console.log(green, '   SUCCESS: Added the policy contract to: ' + apimName);
        return 1;
    } catch (error) {
        console.log(red, '   FAILED to add the policy contract to: ' + apimName + '. Error message: ' + error);
        return 0;
    }
}

// Add policies
// function addPolicy(apimRg: string, apimName: string, apiName: string, operationName: string, backendName: string) {
//     let policyUrl:string = "/resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "/policies/policy?api-version=2021-01-01-preview"
//     let policyBody:any = {
//         "properties": {
//             "format": "rawxml",
//             "value": "<policies>\n    <inbound>\n        <base />\n        <set-backend-service id=\"apim-generated-policy\" backend-id=\"" + backendName + "\" />\n    </inbound>\n    <backend>\n        <base />\n    </backend>\n    <outbound>\n        <base />\n    </outbound>\n    <on-error>\n        <base />\n    </on-error>\n</policies>"
//         }
//     }
//     return axios.put(baseUrl + policyUrl, policyBody, auth)
//         .then(function (response: any) {
//             console.log(green, '   SUCCESS: policy added', );
//         })
//         .catch(function (error: any) {
//             console.log(red, '   FAILED to add policy. ' + error);
//         })
// }