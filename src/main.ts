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
import { parseOperation } from './parseOperation';

// Console output colors for logging
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
const apiName: string = "test20";
const displayName: string = "Test API 20";
let apiProduct: string = "";
let apiUrlSuffix: string = "";

// REST API
const apiVersion = "2021-01-01-preview";
const executionContext = ExecutionContext.create();
const baseUrl: string = `https://management.azure.com/subscriptions/${executionContext.getSubscriptionId()}/`;

// Authorization
let accessToken: string = "Bearer ";
let auth = {headers: {'Authorization': accessToken, 'Content-Type': 'application/json'}}

function getFunctions(functionRg: string, functionAppName : string) {
    
    const functionsUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "/functions?api-version=2016-08-01";
    const functionsList = axios.get(baseUrl + functionsUrl, auth)
        .then(function (response) {
            //console.log("response.data.value: ", response.data.value)
            let item: any;
            for (item of response.data.value) {
                console.log(green, "   SUCCESS: " + item.properties.name)
            }
            return response.data.value;
        })
        .catch(function (error) {
            console.log(red, "   FAILED to get functions from: " + functionAppName + ". " + error)
        })
        
    return functionsList;
}

async function main() {

    // log the start time
    console.log(yellow, '\nRun started @ ' + Date().toLocaleString() + '\n');

    const credential = executionContext.getCredential();
    const webSiteClient = new WebSiteManagementClient(credential, executionContext.getSubscriptionId());
    const APIM_Client = new ApiManagementClient(credential, executionContext.getSubscriptionId())

    // TODO: use credential with SDK
    // Kevin H - Temporary to have the existing implementation successfully run
    accessToken = (await credential.getToken("https://management.azure.com"))?.token!;
    auth = {headers: {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json'}}

    // Get URL of Function App
    console.log(blue, `> Getting URL for function app (${functionAppName})...`)
    const functionAppUrl: string | undefined = await getFunctionAppURL(webSiteClient, functionRg, functionAppName)

    // Get list of individual functions within function app
    console.log(blue, `\n> Getting individual functions within function app (${functionAppName})...`)
    const functions = await getFunctions(functionRg, functionAppName)

    // Get key for functions
    console.log(blue, `\n> Getting function app (${functionAppName}) host key...`)
    const defaultKey = await getFunctionKey(webSiteClient, functionRg, functionAppName, apimName)

    // Create API in APIM
    console.log(blue, `\n> Creating new API (${apiName}) in APIM (${apimName})`)
    const createApiResult = await createAPI(APIM_Client, apimRg, apimName, apiName, displayName);

    // Add Azure Function Keys to APIM
    console.log(blue, `\n> Adding function key to APIM as named values (${apimName})...`);
    const apimKeyPromise = await addAPIMNamedValues(APIM_Client, apimRg, apimName, apiName, defaultKey);
    
    // Add Function as Backend in APIM
    console.log(blue, `\n> Adding function app (${functionAppName}) as an APIM backend...`);
    const apimBackendPromise = addAPIMBackend(APIM_Client, apimRg, apimName, apiName, functionAppName, functionRg, functionAppUrl);

    let operationsInfo = [];
    let item:any;
    let binding:any;
    let method:any;
    for (item of functions) {
        console.log(blue, `\n> Configuring APIM (${apimName}) for function: ${item.properties.name}`)
        for (binding of item.properties.config.bindings) {
            if (binding.type == 'httpTrigger') {
                for (method of binding.methods) {
                    const op = await parseOperation(item, binding, method);
                    await addAPIMOperation(APIM_Client, apimRg, apimName, apiName, op.operation_name, op.operation_display_name, op.urlTemplate, op.method, op.templateParameters);
                    await addAPIMPolicy(APIM_Client, apimRg, apimName, apiName, op.operation_name);
                }
            }
        }
    }

    // log the completion time
    console.log(yellow, '\nRun complete @ ' + Date().toLocaleString() + '\n');
}

main();
