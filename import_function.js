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
            console.log('Success 2');
        })
        .catch(function (error) {
            console.log('Fail 2');
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
            console.log('Success 3');
        })
        .catch(function (error) {
            console.log('Fail 3');
        })
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

accessToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNjM4NTU1ODI2LCJuYmYiOjE2Mzg1NTU4MjYsImV4cCI6MTYzODU2MDM5OSwiYWNyIjoiMSIsImFpbyI6IkFVUUF1LzhUQUFBQWJsby9MNWwrS0k5KzhBZDNoVGgvNzFPTlJSa1hBMjFjVU9aR2IxOVFDclVsTDRuMjd6bTFsMVVDOEpzNnRUSjh1K2ViMTlyMGNjcjl5bHVKZkp4TXdnPT0iLCJhbXIiOlsicnNhIiwibWZhIl0sImFwcGlkIjoiMDRiMDc3OTUtOGRkYi00NjFhLWJiZWUtMDJmOWUxYmY3YjQ2IiwiYXBwaWRhY3IiOiIwIiwiZGV2aWNlaWQiOiJlOWJlZTRhZS1iYzhjLTQxNzYtYTJlZS01YmYzNmQyYzNkM2QiLCJmYW1pbHlfbmFtZSI6IkZveCIsImdpdmVuX25hbWUiOiJXaWxsIiwiZ3JvdXBzIjpbImEyYTg1NWRkLWJiYTAtNDI4Ny1iNjMxLTNiNWQwNTY3YTA3YyIsIjBmNDc2YmM0LTVkNWUtNDNhZS04ZDVmLWRlMzc2YjRiNGY1NiIsIjgwMGJlM2U0LTY1MTUtNDE2YS04NjQwLWMzOWJkMDY5ZTMwNyIsIjI1MTFhMTgxLWU5YmYtNDkyNy1hYzQ3LTZiMTMyNGI4N2I0NSIsImIyZDZiNTEyLWVkOWQtNGM1MC1hZTBlLTEwNzFhYjFkODQ3ZiIsImMxODZmZTIxLWMyOTItNDRiMC1iNmVmLWRiZWMzZWNlNmZiOCIsIjY3MTRmNzMzLTA2NWUtNDdmNy1iZmM3LTk5NmQ1ZDJiNjA4YyIsImE0NDE2NjMwLWFlZTktNDcwZC1hN2M4LTQxOWI4MTRlMTlmNCIsIjRjNTcxZGMzLTU1NjEtNDI3ZS05ZDE4LWEwNjJmZGQzZWRlNSIsIjEyMGE4ZDA2LWM5YjYtNDNmMi04YTVhLWQwNjJlMTc0OGZiYyIsIjAxMzcwYzI5LTQ5ZDYtNDFmMC04MjgzLTNkM2Q5NmNiOWExNSIsImYzODU0YTkxLWExNzYtNGY5MS04Njg5LWQxZWI1OTJkOWRhNiIsIjliYWM4MGU2LTdkYWMtNGIyZC05MTNiLTJmNmRhODA5M2MwMSIsImExYzBlZGRiLTQxMmItNDM0MS1hM2FkLTU4M2Q0ZDExZGEyYiIsIjIyY2MyYTVlLTg3ZmEtNDI5NC1iN2I1LTA3YmJlNzUzZWNlMiIsIjBkNGIxNGMwLWJhNzYtNGE5MC05YjJhLWJmZDMzZTgzYmIwYiIsIjUzMzdkYjQ1LTY3MzctNGUzZS1hMGI2LTM5ZDQ3MTUyY2Y3ZCIsImE4Zjc4N2M0LTU3ZmYtNDhkNS1hYTEwLWIwY2Y2MmFkYzYwNyIsIjUzNjI2ZmYwLTEzYjItNDdjMi1iMDhhLTM0N2E1ZmFjYTdkMyIsIjhiMzNhNjA4LTRmZWItNGQyZC05ZjJkLTMxMTE1NWY5MDgzYyIsIjBjNTBjMzliLWFhNDgtNGE4Yi1hMDU1LTMwYTQ2MzY1YzRiNSIsIjY3OTM5ZGU3LTNkMTctNDljNC05NmE3LTE1NjFlZmEyNTE0ZSIsImU2MTM4ZWUyLWI1NjctNDllYi05N2RmLThmMTc3NzY4MmFjZiIsIjYwYzYzODcyLTRkNzQtNGRiOS04MmQ3LTU2NjE1YWQzOThiNCIsIjQwODBmYWY5LTMxNjQtNDdmZS04MzE3LTRkMjgxMTAxMzkzZCIsIjA5Yzc0MjMzLTI1YTgtNDhmNS1iMTUyLWE4ZjAxNmNiZDAyMCIsImQyYTI2YzkxLTYyY2EtNGFlZS04ZTczLTNmYzk1YmIwNTQ1NyIsIjlhMzJkMmRjLTQ5MzYtNDgzZi1iYTE2LTIzZWI4NTdhOWQ2YSIsIjk4NWU4MDRmLTNlNTctNDMxMS1hYmIwLTVmMzUzMjllYjM1ZiIsIjA0ZTc0ZGEzLTU5ZDctNDJiYS05MjExLTEzY2FlOGEwMjM4YiIsIjgwMjczZTM0LTA3NzEtNDk3MC05MDhkLWI1NDVhZjQwMDQ3MCIsIjk0YjQwNTAzLWRlODItNGE2MS05YmZhLTRiYTJmZjQ5OTgyMyIsIjdhMzFjYTZhLTc4ZWEtNGQyYy1hOTA0LWY5YmI4M2IzYmY0MCIsIjVkZWQxMDljLTE2ZmEtNGNkYy1iY2VhLTQ5YmM5MzQ3ZGNhZCIsImUxMTViMTg0LTM2NzYtNGM0Zi1hNGNmLTVkMzVhOWY3ODgwZiIsImRlMmJmZDI2LTQ2YzktNDU0Ny05MmFjLWVjZWVjOTUxOWIyZCIsIjZjOTc2NGMxLWZhZTEtNDI5Ni05MTQ0LWZmMzkwODU2MTk2NCIsImUzZThkNDVkLWFjYTMtNDUyZC05MmU3LTg4ODMyN2E1ZmI1YiIsImVlNWQ5NWY5LWY3ZjgtNDY2OS1hMThlLTI4MDJiMGVkM2EzNiIsImMwOTMzOGZlLTcyMzMtNGNlNS1iYzVhLTdlZjI4NDg5NWQyNyIsIjIyNjZjOGRkLTIxMmYtNGEwMS04ODg2LWNlNTI1YTk0NjgwNCIsImIwMWMxNGE0LWU3NzQtNGQ3Yi1hZTM2LWQ1MjdjYTY1MGVmYyIsIjExYTc3MmY4LWU5MDctNDVjMy1hMzRiLTMxZGUyY2Y5YmFkZSIsImFiMWQ2MTMxLTI1MTgtNDQ1OC05MzM5LWRhNjUwMjg0NWE2NCIsIjZlNzk1YzkzLTZjNzgtNDAwOS1hYjI4LWVhMDI1ZmQwZjRhZiIsIjY0NDRmMWZhLTQwNTItNDVkMy1hNGMyLWZmZDQ2MmY2ODYxZSIsImNjMTJjYTg2LTk3ODEtNDY3NC05YjQ5LTRmYmI3NjEzYjc0NyIsIjRhYmRiNjIwLWY3MTYtNDQ1ZS05NTAzLTBjMTVhM2NlYzFkMSIsImM5ODM3YWE3LTQwYzUtNDdmOS1hMDVlLThjOGIzMDU1MWI5ZiIsIjA1ODdjYmI5LTE4ZWItNDdiNC1iYWU4LTUzN2EyMWViM2M2NiIsIjgwZDY1ODg1LWNmZGQtNDgyNS04MzNhLWIyOWJjODM5OGM2MyIsIjBkNmQwZGI1LTdkNDEtNGUyMy05OTRjLWJlMzVhM2YwNzYyOCIsIjg1NmFmOWQyLTU2MTQtNDFlMy1iYjkxLWM3ZTYzOTZlZGNkNSIsImEzZTEzZTlkLTUzY2ItNGExNy1iN2E2LWQ1YWI0NWFhMDg3YiIsImU0MDE3MDI3LTk5NDQtNGY3Yi05MDQ1LWQ3MTE0MDI0NGQyOCIsIjIyYWU2YThhLTJlNzEtNDM2OS05MjU5LTczNjViNGI0YzBjNiIsIjI1ZTQ3YjZkLWUwM2QtNGM0OS04NGZhLWM1ZjU0MmQzYWMxOSIsImViNWZhYTNhLWY5N2ItNGRjZi04NGM0LTM1MGZlNmFjM2ZiOCIsIjk5ZGQyMmVmLWRmMzgtNGQ2Ni05OTkxLWQwMjZjNjUyNzY0ZiIsIjRiYzY2ODg0LWZhYTUtNDczZi05NGMzLTVhMmFkM2M2MzcwNSIsIjE3MWQ1ZDY0LTlkMWYtNGNlMS05NDgwLThhZTBlMTJjNjYwNSIsIjZjYmU3ZTVmLWJjZjItNGViMC04NDMyLTk3ZWI5MjQxZDU1MSIsIjA0ZGVhYmQ2LTU1MmYtNDM2Ny05MmE1LWJkZmRkMzc1MGZhYiIsIjE4ZTU4M2QzLWQyZjEtNGUxMC1hMGViLTZjYzFmM2I3NDA1NCIsIjIwZjA1NWMxLTY5MmYtNGJiMy04NjU3LTk1MWUwYjkxZWNmMCIsIjVhYTdkNjE3LWVhNjgtNDNkYS04N2Y4LTU5NWM5MWMwN2IyYyIsIjk4OGNkODBmLTRlYjQtNDlhNC1hODUyLWM0ZWYwYmJjMjdmZiIsIjYwMjUyMTc5LWI0YWItNDY0Mi1hZDM1LTZlZTVhYjE0OWE3NyIsIjQzNTMxZjg3LWJkYjUtNDZjZi05YmE3LTgwNWM1MDhhNmI5MSIsIjdiNTNjNWI3LTgzZDEtNDFjMC05ZmFlLWY3NGJhYWNmMzcxOCIsImQxNWJjN2UxLTc1ZmEtNDVlMi1hYjgxLTI0MDY0YmYyYzY5NiIsIjc3NzBmZDFmLTIzNmEtNDI2Ni1hYmYxLTA1YzdkODVhMzYzOSIsIjZkNTcxOTMyLTJmYTctNDBhNS1hNjlhLTU1MzJhNDhmNDc1MiIsIjQwOWE2YjhmLTk0NmItNDdkOS1iOTQ0LTVhNzMzOGRjMmUxOSIsIjk5YzAwZWIzLWNiMzgtNDA4MS05MWFiLTg3MTUwMTgxMjc4YyIsIjYxMWI2ZTIyLWRmMDItNDc0NC1iYTI0LWFmODczYTcxODJkYyIsIjkzODgzNmUyLWI2MTEtNGU2Yi1hNDU0LTlhZTdjYzVmMTM4OCIsIjBmM2FkZmRmLWJhMzItNDE5MS04NDU5LTNkYTYwMzNmZjlhNyIsImZkZmFkYTM0LTY0ZmYtNGYxYi04ZjAxLWI5YTlkZTg2MmU1YiIsIjg2YWU1ZjkyLTA4YzgtNGY2Ny05ODQ1LTg5OGExYWY1NGI4MSIsIjRlZDU0NWFhLTFjMTMtNDMyYy05Mjg0LWY3MDQ2NzkyOTE5NCIsIjIxMDQ1NWQ5LTdhZWMtNDJmZi05MWE1LTJkOTg5NGFlMDllYyIsIjVmY2MxNTI1LTBkYzMtNGNlYS04NTY2LTE4MTgwOTgyYThmZiIsIjhhMzlhYzJhLWFjMmEtNDkzYi1hOWQ4LTQ2Nzg3NTczMmVlZiIsIjMxODBjZWZhLTkzODMtNGFlZi04MTllLTA4NzJjZDJhNzEzMCIsIjU5MzU2ZmMyLTVjYjAtNDk2My04ODhiLWY0NDE0YWIxMDgyYSIsIjIyYTIyOWJkLWM3YTItNDlkMC05ZWFhLWUxZmM4ODhkYWFjNiIsIjFjZGY4OTEyLTRiOGMtNDBhZC1iNDhmLWZmOTU3YWUwYjEzYiIsImJlMmVlNDI1LWEwMTItNGMwNi05MWQ4LTY4ZDY2MzFmNDI0NyIsImRmNGVkYTE1LTZiZjctNDNkYy04ZGZmLTdmODhlMDRjMTc0NSIsIjQ4NTQ3YTE1LWFjYmItNDA1MS05NDQ3LWFjMTJiNWM4YzRmNiIsImJjZDZlODExLTRhMWEtNDc4Yi05MzRlLTU3YTA0M2YxMGM0ZCIsIjQyODcwMGJkLWFjZWMtNGQ2NC1iYTU2LTcyMTRjOGJjYmU1ZSIsIjQ5YzIzYzhjLTIxMmEtNGQ0Mi05MDc5LTY0NmM0YmQ0NzZjNyIsIjNlMDQ5ZmZiLTU5ZTEtNDk4MC1iY2NjLWMyN2NhMWJhOTdiMyIsImEwOWQ2NzM5LTZmZTYtNDU4Mi04Mjk4LTE2NzMwMzhmYTYzZSIsIjQ2ZDA2MDYzLWY2ZDAtNGE1OC1hNWIzLWQzMTQ3ZDlkMzEwYiIsIjA5ZjkxMTAyLTcxZGItNDllYi05ZTBlLWFmMTY4NWZmYmIyZCIsIjlkNTI5ZDVlLWI4ODItNGZmYi1hOGU2LWM0MTQ3YzY4MDczNSIsImY2YmE5YmZlLTVhYzQtNDg4Yy1iYjhkLTBiZjA0MWVkMzQwOCIsImJlOGNhMzc4LWJjNzQtNDZjMS1iOTIyLWU3ZjU1MjQ4NmVkZSIsIjI3OGRlNjcwLTMzMGMtNDQ2YS04YmM1LTM5Y2NmMWRiMWU1ZSIsIjFjMzgwYTM3LWMyNTAtNGE3My05NzczLTA1ZDliMDVhNDE2NyIsIjIxZjVjY2NhLTFhOTMtNDA2OS05MzUzLTE4YTczOGU2MWNmZiIsImEwZjYzYTIzLTEwNzktNDQwNC04YjE2LWY3MTg2MzZlY2EyYSIsImE5ZjYwZjdhLTkyODMtNGYyMy1iZjNkLTcyYjY4MzYyMzgwYyIsIjRhYWE2Y2VjLTQzYWEtNGE5MS04NmY4LTA3M2QxN2I1NjkyYiIsIjFhMWYxZmMxLWU2ZWYtNDhkNS05YWQyLTg0ZTM1OGRiMjM1OCIsIjM0ZmY3NDE4LWYzMmQtNGIxNS1iY2QwLWJiNGVjNzk3OTZjMSIsImU3YzQzZDAwLTQyMDAtNDRmZS04YmRiLWQ0OGZjNDg0MWUyYSIsIjBlZjkxNTc3LTY2MzctNDg1MC1hNGM0LTg5MWExZGZiNGFhNCIsIjczYjc0YTFkLTVhZGYtNDM1NS1iNjFlLTljMTFlMTUzZDA1ZCIsIjYwM2ViZDZlLWQ2ZmQtNDkzNi05NjFjLTlmYjg1NDVjNTA0NCIsIjUyNmI5MzM0LWE1YTItNDgyYS1iZmMyLTU1NjRkNmNkNzA3ZSIsIjU1ZWZhOWM5LTkyNDYtNDhiZi05N2E0LTk5ODc5NzdjNGQ1ZCIsIjk3MjgzNDJmLWUxYTUtNGE4YS1hYzIwLWUzYTNkZTVlMTNkZSIsImFjOTI0NTJjLTYxZjItNDI1OS05ZWUzLTk5ZGUwMDhlMTY2ZiIsIjA4NmMyZTdlLThhMGItNDY4NS05OTI1LTBhNDA2ZGMyYjJlMiIsIjRlMWY3MmRiLWQ1ZjctNDAzNy04ZjQ4LTYwNDM5OTFjZTY3ZSIsImM1MzZiYjI5LTM5NjItNDZhOS1hM2ViLTgyYzllNjVhOGM2MiIsImE1NTc2OGY4LWQ2ZjYtNDcwYS1hODJiLWJhNzk1YjkxYjg0NyIsIjQ1MjJkZDFjLTVjOTAtNDhhZC1hYThmLWQ1YTc5ZjU0NDlkMCIsImI2MTI3Mzg2LTEwOTQtNDdkMC05MTk3LTJiNzgzNmE5MDJiZSIsIjUwZWM0NjExLWY4MzUtNGFhMS04YzI1LWNjMGEwZmY5MjQzMyIsImE3Njc2YzE1LWY2YWQtNDZlNy1iYmViLTZmODIwMWE1ZmJjNCIsImEyYjZkMWYwLTNhMGUtNGM0OC05YmNiLTZhNGEyODVkYTI5NyIsIjY2NDIzMTk5LWQ5OTctNDI0My05MDAwLTVmNjQ1YjI3M2M3MiIsIjkyNTFlNDJiLTkxMWMtNDVjNy1iMzdhLWIyNDc3YjIwYzUxMiIsIjc2MGUwOWM2LTc2MmItNDVhMC05MzY2LWU1NzFjZTQwODk0YyIsIjQyYTNlZGYyLWM3ZjMtNDVjNC04NjY1LTMyZTU3Yjc1NjgxMiIsIjhmNDBhZjU1LTU2MTctNDNkMC04MDUyLTI0NDg4ZWRkOWQ2NiIsIjM2YzUyNmFkLWM0OGYtNDY0ZC1hNjg3LWI1MDhkMzIxYWRiNyIsImMwOWFhMWQwLTNhYWItNDRkYy1iMDliLTQzNjFlNGQxZmMzNiIsIjcxODU1YWMxLWZmOGMtNDU5Ni05ZDc5LTQ0N2FmZjQ3MGFlYyIsImQwY2VkMzJiLTdkNTktNGZmYy05MjY4LTNhMjg0ODFjNjE5OSIsImJmNTMwNGNmLTc3MWMtNDJjYy05ZmY4LTU3N2U5OWQ2NjEwMSIsImRjMWQ5NzFkLTgyMzktNGNmNS1iMDlkLWFjYWU4YWVhZmJmZSIsImQzMmYwMGFmLTQwNWMtNDBkNC1iMTRmLTBjYzNiZTAyODkyOCIsIjZmNDM0ODJhLWZhYzUtNDI4Zi1iZWQ3LTU4NWU5OTA3OTEzYyIsIjZkYTk3NDhlLTBjNTYtNDVhNi05OTI4LTkwMWFkYWQ2NTFjZiIsImQyNmUwNjhhLTdlMTItNDQwMC1iNzk0LWM4Y2Y1NGE3ZmJhOSIsIjYyZWRiZDdiLThkNDYtNGQyYy1hNWExLWRhNWI3OGJhMWQzOCIsIjMwZGJmOGI3LTRhNjctNDk2NC04MmFhLWE0MTI2YTM1YWQ1MiIsIjhiYzJjNWMzLTI0OWQtNGQ3ZS04MTIwLWMzMThmZmM5NjZmZiIsIjE5MGU3OWExLTVkZDMtNGE0YS04NmFlLTMyYWMzYjE2YThiMyIsImRhMGEwMWEyLWEzYzQtNDk2Yi1iYzRmLTFjNDkwZGM5NDc5NCIsImQ5NTg0MWY3LTZiODMtNDUxMC04NzE5LWY3MmM0NTQ3YTM5YyIsIjlmZGFlMDc3LTJjMjAtNDkwMi04OGFhLWJjNzhhZjE1MTA5NCIsIjEzNzA5ZGI1LTQ5YWQtNDg3NC04ZGQ0LTA3OTM0NDMxZmYwMiIsImM3MmE1NjAyLWRhYTMtNGVjYi1iOWI4LWU0NDIxNTJlMmQwNSIsImQ3MjlmOGRmLWI2MzEtNDc1ZC1hY2I1LTFhMThhMDY4OTA1YiIsIjJkMTU1MTE0LTJhMGMtNDI4Mi05NWVhLWRhYjQ5NzZjMDgxMyIsIjU5YTRiOTNhLWI3OWMtNDRmYy1hYzgyLTM5Y2U3MzU2YzU5YyIsImNiZWVkMDRhLTIxYmItNGJiNS1iOGFmLTRjN2IyNWRmYzI1MCIsImVmNDZmNzQ3LWY5OTktNGZmMC1hNjVmLWE3ZmY1YjEyMjY2MiJdLCJpcGFkZHIiOiI2Ny4xNzYuMjAxLjExOCIsIm5hbWUiOiJXaWxsIEZveCIsIm9pZCI6IjI0ZjcwOTdlLWJkZWYtNDNjNC1iYTljLTEwYjljZjYzYjYxYyIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS0xMjQ1MjUwOTUtNzA4MjU5NjM3LTE1NDMxMTkwMjEtMTkyMTM5MiIsInB1aWQiOiIxMDAzMjAwMDUyNUZFMkQwIiwicmgiOiIwLkFSb0F2NGo1Y3ZHR3IwR1JxeTE4MEJIYlI1VjNzQVRialJwR3UtNEMtZUdfZTBZYUFDdy4iLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJ3THFlelIyd3VjX0tud240TzhobmhEUE80dWJFdTA3SkpZRS1sSXc0d09jIiwidGlkIjoiNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3IiwidW5pcXVlX25hbWUiOiJ3aWZveEBtaWNyb3NvZnQuY29tIiwidXBuIjoid2lmb3hAbWljcm9zb2Z0LmNvbSIsInV0aSI6ImVkMGhQX2gzZGttZV9LYVJBRUpGQWciLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfdGNkdCI6MTI4OTI0MTU0N30.n1-mrrmcIVwAD5cttE4o81E9iGSF3_sD96c5_I5tXTLfLZ9ijH-nIhLy5Tp5yoWK9Of2ynzENwjWqS5dNLRBq3Fd6b2jz886-jJZNv3uhmNy7ipoLqHm-jTfimZDvdGc8WbbAB8L9pWBLU6UIUcllPGbSPk__7k3Un2l4hdSsOqzMBP7UVXifFyaoyE36PayXgWSnqSi1TTVXWQd8Zs_tI1ArLMFZSe-XGXVmeIPZ-9VvNtPTGqAwE53ZYuqX2EWng_jNHS4HdFicNArnQU7soiKN-0KBXvVNzI-1ECNKp6s87bpHKBVh92OlK2ol9iO7_wt2IoHG8nZszXM9XF76A"
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
    const apimKeyPromise = await apimAddKeys('lithographtestfunction', 'lithograph-test', name, defaultKey);
    const apimBackendPromise = await addApimBackend('lithographtestfunction', 'lithograph-test', name, 'SplitTestFunction', functionAppUrl);

    let operationsInfo = [];
    for (item of functions) {
        // console.log(item.properties.config)
        for (binding of item.properties.config.bindings) {
            if (binding.type == 'httpTrigger') {
                for (method of binding.methods) {
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
