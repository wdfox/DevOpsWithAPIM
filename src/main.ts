import axios from 'axios'
import { WebSiteManagementClient } from "@azure/arm-appservice";
import { ApiManagementClient } from "@azure/arm-apimanagement";

import ExecutionContext from './executionContext';
// import { getFunctions } from './getFunctions'; // disabled for now until updated to return full JSON payload like the REST API did
import { getFunctionKey } from './getFunctionKey';
import { getFunctionAppURL } from './getFunctionAppURL';
import { createAPI } from './createAPI';
import { addAPIMNamedValues } from './addAPIMNamedValues';
import { addAPIMBackend } from './addAPIMBackend';
import { addAPIMPolicy } from './addAPIMPolicy';
import { addAPIMOperation } from './addAPIMOperation';

// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';
const blue: string = '\x1b[34m%s\x1b[0m';
const yellow: string = '\x1b[33m%s\x1b[0m';

// Resource groups
const apimRg: string = "lithographtestfunction";
const functionRg: string = "lithographtestfunction";

// Function app
const functionAppName: string = "lithograph-test-function";

// APIM
const apimName: string = "lithograph-test";
const apiName: string = "test19";
const displayName: string = "Test API 19";
let apiProduct: string = "";
let apiUrlSuffix: string = "";

// REST API & Identity
const apiVersion = "2021-01-01-preview";
const executionContext = ExecutionContext.create();
const baseUrl: string = `https://management.azure.com/subscriptions/${executionContext.getSubscriptionId()}/`;
let accessToken: string = "Bearer "
let auth = {headers: {'Authorization': accessToken, 'Content-Type': 'application/json'}}

function getFunctions(functionRg: string, functionAppName : string) {
    
    const functionsUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "/functions?api-version=2016-08-01";
    const functionsList = axios.get(baseUrl + functionsUrl, auth)
        .then(function (response) {
            //console.log("response.data.value: ", response.data.value)
            let item: any;
            for (item of response.data.value) {
                console.log(green, "    SUCCESS: " + item.properties.name)
            }
            return response.data.value;
        })
        .catch(function (error) {
            console.log(red, "    FAILED to get functions from: " + functionAppName + ". " + error)
        })
        
    return functionsList;
}

function parseOperation(item: { properties: { name: string; invoke_url_template: string; }; }, binding: { [x: string]: any; route: string | any[]; }, method: string) {
    let op:any = {}
    let letter:string;
    op['method'] = method
    op['templateParameters'] = [];
    op['operation_display_name'] = item.properties.name
    op['operation_name'] = method.toLowerCase() + '-' + item.properties.name.toLowerCase();
    if ('route' in binding) {
        op['urlTemplate'] = binding['route'].toString().replace("?", "")
        let parameters = [];
        var ind = 0;
        var start = 0;
        for (letter of binding.route) {
            if (letter == '{') {
                start = ind + 1;
            }
            if (letter == '}') {
                parameters.push(binding.route.slice(start,ind).toString().replace("?", ""))
            }
            ind += 1;
        }
        if (parameters.length > 0) {
            op.templateParameters = parameters
        }
    }
    else {
        op.urlTemplate = item.properties.invoke_url_template.split('.net/api').slice(-1)[0].toString().replace("?", "")
    }

    // temp log the operation for debugging the "?"
    console.log(op);

    return op;
}

// Add operation
function addOperation(apimRg: string, apimName: string, apiName: string, operationName: string, operationDisplayName: any, urlTemplate: any, method: any, parameters: any) {
    let operationUrl:string = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "?api-version=" + apiVersion
    let parsedParams = []
    let p:any;
    for (p of parameters) {
        parsedParams.push({
            "name": p,
            "type": "",
            "values": [],
            "required": "true"
        })
    }

    const operationBody = {
        "id": "/apis/" + apiName + "/operations/" + operationName,
        "name": operationName,
        "properties": {
            "displayName": operationDisplayName,
            "description": "",
            "urlTemplate": urlTemplate,
            "method": method,
            "templateParameters": parsedParams,
            "responses": []
        }
    }

    return axios.put(baseUrl + operationUrl, operationBody, auth)
        .then(function (response: any) {
            console.log(green, '   SUCCESS: operation added');
        })
        .catch(function (error: any) {
            console.log(red, '   FAILED to add operation. ' + error);
        })
}

// Add policies
function addPolicy(apimRg: string, apimName: string, apiName: string, operationName: string, backendName: string) {
    let policyUrl:string = "/resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "/policies/policy?api-version=2021-01-01-preview"
    let policyBody:any = {
        "properties": {
            "format": "rawxml",
            "value": "<policies>\n    <inbound>\n        <base />\n        <set-backend-service id=\"apim-generated-policy\" backend-id=\"" + backendName + "\" />\n    </inbound>\n    <backend>\n        <base />\n    </backend>\n    <outbound>\n        <base />\n    </outbound>\n    <on-error>\n        <base />\n    </on-error>\n</policies>"
        }
    }
    return axios.put(baseUrl + policyUrl, policyBody, auth)
        .then(function (response: any) {
            console.log(green, '   SUCCESS: policy added', );
        })
        .catch(function (error: any) {
            console.log(red, '   FAILED to add policy. ' + error);
        })
}

async function main() {
    console.log(yellow, '\nRun started @ ' + Date().toLocaleString() + '\n');

    const credential = executionContext.getCredential();
    const webSiteClient = new WebSiteManagementClient(credential, executionContext.getSubscriptionId());
    const APIM_Client = new ApiManagementClient(credential, executionContext.getSubscriptionId())

    // TODO: use credential with SDK
    // Kevin H - Temporary to have the existing implementation successfully run
    accessToken = (await credential.getToken("https://management.azure.com"))?.token!;
    // accessToken = ""
    auth = {headers: {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json'}}

    // Get URL of Function App
    console.log(blue, `> Getting URL for function app (${functionAppName})...`)
    //const functionAppUrl: string | undefined = await getFunctionAppURL(webSiteClient, functionRg, functionAppName)
    const functionAppUrl: string | undefined = await getFunctionAppURL(webSiteClient, functionRg, functionAppName)

    // Get list of individual functions within function app
    console.log(blue, `\n> Getting individual functions within function app (${functionAppName})...`)
    const functions = await getFunctions(functionRg, functionAppName)
    // const functions = await getFunctions(client, functionRg, functionAppName);

    // Get key for functions
    console.log(blue, `\n> Getting function app (${functionAppName}) host key...`)
    const defaultKey = await getFunctionKey(webSiteClient, functionRg, functionAppName, apimName)

    // Create API in APIM
    console.log(blue, `\n> Creating new API (${apiName}) in APIM (${apimName})`)
    const createApiResult = await createAPI(APIM_Client, apimRg, apimName, apiName, displayName);

    // Add Azure Function Keys to APIM
    console.log(blue, `\n> Adding function key to APIM as named values (${apimName})...`);
    //const apimKeyPromise = await apimAddKeys(apimRg, apimName, apiName, defaultKey);
    const apimKeyPromise = await addAPIMNamedValues(APIM_Client, apimRg, apimName, apiName, defaultKey);

    // if (apimKeyPromise == 1) {
    //     console.log(green, `   SUCCESS: added to APIM (${apimName}/${apiName})`);
    // } else {
    //     console.log(red, `   FAILED to add function host key from (${functionAppName}) to APIM (${apimName})`);
    // }
    
    // Add Function as Backend in APIM
    console.log(blue, `\n> Adding function app (${functionAppName}) as an APIM backend...`);
    //const apimBackendPromise = await addApimBackend(apimRg, apimName, apiName, functionAppName, functionAppUrl as string);
    const apimBackendPromise = addAPIMBackend(APIM_Client, apimRg, apimName, apiName, functionAppName, functionRg, functionAppUrl)
    // if (apimBackendPromise == 1) {
    //     console.log(green, '   SUCCESS: ' + functionAppUrl + '/api');
    // } else {
    //     console.log(red, `   FAILED to add function app (${functionAppName}) to APIM backend (${apimName})`);
    // }

    let operationsInfo = [];
    let item:any;
    let binding:any;
    let method:any;
    for (item of functions) {
        console.log(blue, "\n> Configuring APIM for function: " + item.properties.name)
        for (binding of item.properties.config.bindings) {
            if (binding.type == 'httpTrigger') {
                for (method of binding.methods) {
                    const op = parseOperation(item, binding, method);
                    //await addOperation(apimRg, apimName, apiName, op.operation_name, op.operation_display_name, op.urlTemplate, op.method, op.templateParameters);
                    await addAPIMOperation(APIM_Client, apimRg, apimName, apiName, op.operation_name, op.operation_display_name, op.urlTemplate, op.method, op.templateParameters);
                    //await addPolicy(apimRg, apimName, apiName, op.operation_name, apiName);
                    await addAPIMPolicy(APIM_Client, apimRg, apimName, apiName, op.operation_name);
                }
            }
        }
    }
    console.log(yellow, '\nRun complete @ ' + Date().toLocaleString() + '\n');
}

main();
