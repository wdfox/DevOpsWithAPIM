"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const axios = require('axios');
const functionRg = "Split";
const functionAppName = "SplitTestFunction";
const displayName = "Test API 3";
const apiName = "test3";
let apiUrlSuffix = "";
const apimRg = "lithographtestfunction";
const apimName = "lithograph-test";
let apiProduct = "";
let accessToken = "Bearer ";
let auth = { headers: { 'Authorization': accessToken, 'Content-Type': 'application/json' } };
function getFunctionApp(functionRg, functionAppName) {
    const metadataUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "?api-version=2016-08-01";
    const functionUrl = axios.get(baseUrl + metadataUrl, auth)
        .then(function (response) {
        const url = response.data.properties.defaultHostName;
        const functionUrl = 'https://' + url + '/api';
        return functionUrl;
    })
        .catch(function (error) {
        console.log(error);
    });
    return functionUrl;
}
function getFunctions(functionRg, functionAppName) {
    const functionsUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "/functions?api-version=2016-08-01";
    const functionsList = axios.get(baseUrl + functionsUrl, auth)
        .then(function (response) {
        return response.data.value;
    })
        .catch(function (error) {
        console.log(error);
    });
    return functionsList;
}
function getFunctionKey(functionRg, functionAppName) {
    const functionKeysUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "/host/default/listkeys?api-version=2016-08-01";
    const defaultKey = axios.post(baseUrl + functionKeysUrl, {}, auth)
        .then(function (response) {
        return response.data.functionKeys.default;
    })
        .catch(function (error) {
        console.log(error);
    });
    return defaultKey;
}
function createApi(apimRg, apimName, apiName, displayName) {
    const createApiUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "?api-version=2021-01-01-preview";
    const body = {
        "id": "/apis/" + apiName,
        "name": apiName,
        "properties": {
            "displayName": displayName,
            "protocols": ["https"],
            "description": "Test",
            "path": apiName
        }
    };
    return axios.put(baseUrl + createApiUrl, body, auth)
        .then(function (response) {
        return 1;
    })
        .catch(function (error) {
        return 0;
    });
}
// Get access key from function
// # https://docs.microsoft.com/en-us/azure/api-management/import-function-app-as-api#authorization -- Host key auto created inside function, TODO, using defualt for now
// Add function access key to APIM
function apimAddKeys(apimRg, apimName, apiName, functionKey) {
    const addKeysUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/namedValues/" + apiName + "-key?api-version=2021-01-01-preview";
    const addKeysBody = {
        "id": "/namedValues/" + apiName + "-key",
        "name": apiName + "-key",
        "properties": {
            "displayName": apiName + "-key",
            "value": functionKey,
            "tags": ["key", "function", "auto"],
            "secret": "true"
        }
    };
    return axios.put(baseUrl + addKeysUrl, addKeysBody, auth)
        .then(function (response) {
        return 1;
    })
        .catch(function (error) {
        return 0;
    });
}
// Add function as APIM Backend
function addApimBackend(apimRg, apimName, apiName, functionAppName, functionUrl) {
    const backendUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/backends/" + apiName + "?api-version=2021-01-01-preview";
    let backend_body;
    const backendBody = backend_body = {
        "id": apiName,
        "name": apiName,
        "properties": {
            "description": functionAppName,
            "url": 'https://' + functionUrl + '/api',
            "protocol": "http",
            "resourceId": "https://management.azure.com/subscriptions/811ac24a-7a5f-41a7-acff-8dd138042333/resourceGroups/Split/providers/Microsoft.Web/sites/SplitTestFunction",
            "credentials": {
                "header": {
                    "x-functions-key": ["{{" + apiName + "-key}}"]
                }
            }
        }
    };
    return axios.put(baseUrl + backendUrl, backendBody, auth)
        .then(function (response) {
        return 1;
    })
        .catch(function (error) {
        return 0;
    });
}
function parseOperation(item, binding, method) {
    let op = {};
    let letter;
    op['method'] = method;
    op['templateParameters'] = [];
    op['operation_display_name'] = item.properties.name;
    op['operation_name'] = method.toLowerCase() + '-' + item.properties.name.toLowerCase();
    if ('route' in binding) {
        op['urlTemplate'] = binding['route'];
        let parameters = [];
        var ind = 0;
        var start = 0;
        for (letter of binding.route) {
            if (letter == '{') {
                start = ind + 1;
            }
            if (letter == '}') {
                parameters.push(binding.route.slice(start, ind));
            }
            ind += 1;
        }
        if (parameters.length > 0) {
            op.templateParameters = parameters;
        }
    }
    else {
        op.urlTemplate = item.properties.invoke_url_template.split('.net/api').slice(-1)[0];
    }
    return op;
}
// Add operation
function addOperation(apimRg, apimName, apiName, operationName, operationDisplayName, urlTemplate, method, parameters) {
    let operationUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "?api-version=2021-01-01-preview";
    let parsedParams = [];
    let p;
    for (p of parameters) {
        parsedParams.push({
            "name": p,
            "type": "",
            "values": [],
            "required": "true"
        });
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
    };
    return axios.put(baseUrl + operationUrl, operationBody, auth)
        .then(function (response) {
        // console.log('Success 4');
    })
        .catch(function (error) {
        // console.log('Fail 4');
        // console.log(error)
    });
}
// Add policies
function addPolicy(apimRg, apimName, apiName, operationName, backendName) {
    let policyUrl = "/resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "/policies/policy?api-version=2021-01-01-preview";
    let policyBody = {
        "properties": {
            "format": "rawxml",
            "value": "<policies>\n    <inbound>\n        <base />\n        <set-backend-service id=\"apim-generated-policy\" backend-id=\"" + backendName + "\" />\n    </inbound>\n    <backend>\n        <base />\n    </backend>\n    <outbound>\n        <base />\n    </outbound>\n    <on-error>\n        <base />\n    </on-error>\n</policies>"
        }
    };
    return axios.put(baseUrl + policyUrl, policyBody, auth)
        .then(function (response) {
        // console.log('Success 5');
    })
        .catch(function (error) {
        // console.log('Fail 5');
    });
}
let baseUrl = "https://management.azure.com/subscriptions/811ac24a-7a5f-41a7-acff-8dd138042333/";
// functions = "resourceGroups/Split/providers/Microsoft.Web/sites/SplitTestFunction?api-version=2016-08-01";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get URL of Function App
        console.log('Getting Function App URL...');
        const functionAppUrl = yield getFunctionApp(functionRg, functionAppName);
        console.log(functionAppUrl);
        // Get list of individual functions within function app
        console.log('Getting Functions...');
        const functions = yield getFunctions(functionRg, functionAppName);
        console.log(functions.map((x) => x.properties.name));
        // Get key for functions
        console.log('Getting Function Key...');
        const defaultKey = yield getFunctionKey(functionRg, functionAppName);
        console.log('Found Key.');
        // Create API within APIM
        console.log('Creating new API within API Management...');
        const createApiResult = yield createApi(apimRg, 'lithograph-test', apiName, displayName);
        if (createApiResult == 1) {
            console.log('Successfully created API');
        }
        else {
            console.log('Failed to create new API');
        }
        // Add Azure Function Keys to APIM
        console.log('Adding Function Keys to API Management...');
        const apimKeyPromise = yield apimAddKeys(apimRg, 'lithograph-test', apiName, defaultKey);
        if (apimKeyPromise == 1) {
            console.log('Success');
        }
        else {
            console.log('Failed to add keys');
        }
        // Add Function as Backend in APIM
        console.log('Adding Function App as an API Management Backend...');
        const apimBackendPromise = yield addApimBackend(apimRg, 'lithograph-test', apiName, functionAppName, functionAppUrl);
        if (apimBackendPromise == 1) {
            console.log('Success');
        }
        else {
            console.log('Failed to add Backend');
        }
        let operationsInfo = [];
        let item;
        let binding;
        let method;
        for (item of functions) {
            for (binding of item.properties.config.bindings) {
                if (binding.type == 'httpTrigger') {
                    for (method of binding.methods) {
                        const op = parseOperation(item, binding, method);
                        addOperation(apimRg, 'lithograph-test', apiName, op.operation_name, op.operation_display_name, op.urlTemplate, op.method, op.templateParameters);
                        addPolicy(apimRg, 'lithograph-test', apiName, op.operation_name, apiName);
                    }
                }
            }
        }
        console.log('Successful Run');
    });
}
main();