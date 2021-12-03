const axios = require('axios');


function getFunctionApp(functionRg, functionAppName) {
    const metadataUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "?api-version=2016-08-01";
    const functionUrl = axios.get(baseUrl + metadataUrl, auth)
        .then(function (response) {
            // const resourceId = 'https://management.azure.com' + response.data.id;
            const url = response.data.properties.defaultHostName;
            const functionUrl = 'https://' + url + '/api';
            return functionUrl;
        })
        .catch(function (error) {
            console.log(error)
        })
    return functionUrl;
    // try {
    //     const response = await axios.get(baseUrl + metadataUrl, auth);
    //     const url = response.data.properties.defaultHostName;
    //     const functionUrl = 'https://' + url + '/api';
    //     console.log(functionUrl);
    //     return functionUrl;
    // } catch (error) {
    //     console.error(error);
    // }
}

function getFunctions(functionRg, functionAppName) {
    
    const functionsUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "/functions?api-version=2016-08-01";
    const functionsList = axios.get(baseUrl + functionsUrl, auth)
        .then(function (response) {
            return response.data.value;
        })
        .catch(function (error) {
            console.log(error)
        })
    // console.log(functionsList);
    return functionsList;
}

function getFunctionKey(functionRg, functionAppName) {
    const functionKeysUrl = "resourceGroups/" + functionRg + "/providers/Microsoft.Web/sites/" + functionAppName + "/host/default/listkeys?api-version=2016-08-01";
    const defaultKey = axios.post(baseUrl + functionKeysUrl, {}, auth)
        .then(function (response) {
            return response.data.functionKeys.default
        })
        .catch(function (error) {
            console.log(error);
        })

    return defaultKey;
}

function createApi(apimRg, apimName, apiName, displayName) {

    createApiUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "?api-version=2021-01-01-preview";

    const body = {
        "id" : "/apis/" + apiName,
        "name" : apiName,
        "properties" : {
            "displayName" : displayName,
            "protocols" : ["https"],
            "description" : "Test",
            "path" : apiName
        }
    }
    return axios.put(baseUrl + createApiUrl, body, auth)
        .then(function (response) {
            return 1
        })
        .catch(function(error) {
            return 0
        })
}

// # Get access key from function
// # https://docs.microsoft.com/en-us/azure/api-management/import-function-app-as-api#authorization -- Host key auto created inside function, TODO, using defualt for now

// # Add function access key to APIM
function apimAddKeys(apimRg, apimName, apiName, functionKey) {
    const addKeysUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/namedValues/" + apiName + "-key?api-version=2021-01-01-preview"
    const addKeysBody = {
        "id" : "/namedValues/" + apiName + "-key",
        "name" : apiName + "-key",
        "properties" : {
            "displayName" : apiName + "-key",
            "value" : functionKey,
            "tags" : ["key","function","auto"],
            "secret" : "true"
        }
    }

    return axios.put(baseUrl + addKeysUrl, addKeysBody, auth)
        .then(function (response) {
            return 1;
        })
        .catch(function (error) {
            return 0;
        })
}

// # Add function as APIM Backend
function addApimBackend(apimRg, apimName, apiName, functionAppName, functionUrl) {
    const backendUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/backends/" + apiName + "?api-version=2021-01-01-preview"
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
    }
    return axios.put(baseUrl + backendUrl, backendBody, auth)
        .then(function (response) {
            return 1;
        })
        .catch(function (error) {
            return 0;
        })
}

function parseOperation(item, binding, method) {
    let op = {}
    op['method'] = method
    op['templateParameters'] = [];
    op['operation_display_name'] = item.properties.name
    op['operation_name'] = method.toLowerCase() + '-' + item.properties.name.toLowerCase();
    if ('route' in binding) {
        op['urlTemplate'] = binding['route']
        let parameters = [];
        var ind = 0;
        for (letter of binding.route) {
            var start = 0;
            if (letter == '{') {
                start = ind + 1;
            }
            if (letter == '}') {
                parameters.push(binding.route.slice(start,ind))
            }
            ind += 1;
        }
        if (parameters.length > 0) {
            op.templateParameters = parameters
        }
    }
    else {
        op.urlTemplate = item.properties.invoke_url_template.split('.net/api')[-1]
    }
    return op;
}

// # Add operation
function addOperation(apimRg, apimName, apiName, operationName, operationDisplayName, urlTemplate, method, parameters) {
    operationUrl = "/resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "?api-version=2021-01-01-preview"
    let parsedParams = []
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
        .then(function (response) {
            console.log('Success 4');
        })
        .catch(function (error) {
            console.log('Fail 4');
            console.log(error)
        })
}
// def add_operation(apim_rg, apim_name, api_name, operation_name, operation_display_name, url_template, method, parameters):
//     operation_url = "/resourceGroups/{}/providers/Microsoft.ApiManagement/service/{}/apis/{}/operations/{}?api-version=2021-01-01-preview".format(apim_rg, apim_name, api_name, operation_name)
//     # print(operation_url)
//     parsed_params = []
//     for p in parameters:
//         parsed_params.append({
//               "name": p,
//               "type": "",
//               "values": [],
//               "required": 'true'
//         })
    
    // operation_body = {
    //     "id": "/apis/{}/operations/{}".format(api_name, operation_name),
    //     "name": operation_name,
    //     "properties": {
    //         "displayName": operation_display_name,
    //         "description": "",
    //         "urlTemplate": url_template,
    //         "method": method,
    //         "templateParameters": parsed_params,
    //         "responses": []
    //     }
    // }
//     res = requests.put(base_url + operation_url, headers=auth, data=json.dumps(operation_body))
//     print(res.status_code)
//     # print(res.text)

// # Add policies
function addPolicy(apimRg, apimName, apiName, operationName, backendName) {
    policyUrl = "/resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "/policies/policy?api-version=2021-01-01-preview"
    policyBody = {
        "properties": {
            "format": "rawxml",
            "value": "<policies>\n    <inbound>\n        <base />\n        <set-backend-service id=\"apim-generated-policy\" backend-id=\"" + backendName + "\" />\n    </inbound>\n    <backend>\n        <base />\n    </backend>\n    <outbound>\n        <base />\n    </outbound>\n    <on-error>\n        <base />\n    </on-error>\n</policies>"
        }
    }
    return axios.put(baseUrl + policyUrl, policyBody, auth)
        .then(function (response) {
            console.log('Success 5');
        })
        .catch(function (error) {
            console.log('Fail 5');
        })
}



functionAppName = "";
displayName = "Test API 3";
name = "test3";
apiUrlSuffix = "";


baseUrl = "https://management.azure.com/subscriptions/811ac24a-7a5f-41a7-acff-8dd138042333/";
// functions = "resourceGroups/Split/providers/Microsoft.Web/sites/SplitTestFunction?api-version=2016-08-01";

accessToken = "Bearer "
auth = {headers: {'Authorization': accessToken, 'Content-Type': 'application/json'}}

async function main() {

    // Get URL of Function App
    console.log('Getting Function App URL...')
    const functionAppUrl = await getFunctionApp('Split', 'SplitTestFunction')
    console.log(functionAppUrl);

    // Get list of individual functions within function app
    console.log('Getting Functions...')
    const functions = await getFunctions('Split', 'SplitTestFunction');
    console.log(functions.map(x => x.properties.name));

    // Get key for functions
    console.log('Getting Function Key...')
    const defaultKey = await getFunctionKey('Split', 'SplitTestFunction')
    console.log('Found Key.');

    // Create API within APIM
    console.log('Creating new API within API Management...')
    const createApiResult = await createApi('lithographtestfunction', 'lithograph-test', name, displayName)
    if (createApiResult == 1) {
        console.log('Successfully created API');
    } else {
        console.log('Failed to create new API');
    }

    // axios.all([functionAppUrl, functions, defaultKey, createApiPromise])
    //     .then(axios.spread((...responses) => {

    //         const functionAppUrl = responses[0]
    //         const functions = responses[1]
    //         console.log(functions[0].properties.config)
    //         const defaultKey = responses[2]
    //         console.log(defaultKey)
            // createApi('lithographtestfunction', 'lithograph-test', name, displayName)

    // Add Azure Function Keys to APIM
    console.log('Adding Function Keys to API Management...');
    const apimKeyPromise = await apimAddKeys('lithographtestfunction', 'lithograph-test', name, defaultKey);
    if (apimKeyPromise == 1) {
        console.log('Success');
    } else {
        console.log('Failed to add keys');
    }
    
    // Add Function as Backend in APIM
    console.log('Adding Function App as an API Management Backend...');
    const apimBackendPromise = await addApimBackend('lithographtestfunction', 'lithograph-test', name, 'SplitTestFunction', functionAppUrl);
    if (apimBackendPromise == 1) {
        console.log('Success');
    } else {
        console.log('Failed to add Backend');
    }

    let operationsInfo = [];
    for (item of functions) {
        // console.log(item.properties.config)
        for (binding of item.properties.config.bindings) {
            if (binding.type == 'httpTrigger') {
                for (method of binding.methods) {
                    const op = parseOperation(item, binding, method);
                    // let op = {}
                    // op['method'] = method
                    // op['templateParameters'] = [];
                    // op['operation_display_name'] = item.properties.name
                    // op['operation_name'] = method.toLowerCase() + '-' + item.properties.name.toLowerCase();
                    // if ('route' in binding) {
                    //     op['urlTemplate'] = binding['route']
                    //     let parameters = [];
                    //     var ind = 0;
                    //     for (letter of binding.route) {
                    //         var start = 0;
                    //         if (letter == '{') {
                    //             start = ind + 1;
                    //         }
                    //         if (letter == '}') {
                    //             parameters.push(binding.route.slice(start,ind))
                    //         }
                    //         ind += 1;
                    //     }
                    //     if (parameters.length > 0) {
                    //         op.templateParameters = parameters
                    //     }
                    // }
                    // else {
                    //     op.urlTemplate = item.properties.invoke_url_template.split('.net/api')[-1]
                    // }
                    addOperation('lithographtestfunction', 'lithograph-test', name, op.operation_name, op.operation_display_name, op.urlTemplate, op.method, op.templateParameters);
                    addPolicy('lithographtestfunction', 'lithograph-test', name, op.operation_name, name);
                }
            }
        }
    }
        // }))

    console.log('Successful Run')
}

main()
//                     else:
//                         op['urlTemplate'] = item['properties']['invoke_url_template'].split('.net/api')[-1]
//                     # print(op)
//                     add_operation('lithographtestfunction', 'lithograph-test', name, op['operation_name'], op['operation_display_name'], op['urlTemplate'], op['method'], op['templateParameters'])
//                     add_policy('lithographtestfunction', 'lithograph-test', name, op['operation_name'], name)
//         print('---------')

//     operations_info = []
//     for item in function_app.functions:
//         for binding in item['properties']['config']['bindings']:
//             if binding['type'] == 'httpTrigger':
//                 # print(binding)
//                 # print(binding['methods'])
//                 # op['operation_names']
//                 for method in binding['methods']:
//                     op = {}
//                     op['method'] = method
//                     op['templateParameters'] = []
//                     op['operation_display_name'] = item['properties']['name']
//                     op['operation_name'] = method.lower() + '-' + item['properties']['name'].lower()
//                     if 'route' in binding:
//                         op['urlTemplate'] = binding['route']
//                         parameters = []
//                         for ind, letter in enumerate(binding['route']):
//                             if letter == '{':
//                                 start = ind + 1
//                             if letter == '}':
//                                 parameters.append(binding['route'][start:ind])
//                         if parameters:
//                             op['templateParameters'] = parameters
//                     else:
//                         op['urlTemplate'] = item['properties']['invoke_url_template'].split('.net/api')[-1]
//                     # print(op)
//                     add_operation('lithographtestfunction', 'lithograph-test', name, op['operation_name'], op['operation_display_name'], op['urlTemplate'], op['method'], op['templateParameters'])
//                     add_policy('lithographtestfunction', 'lithograph-test', name, op['operation_name'], name)
//         print('---------')
