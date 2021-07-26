import requests
import json


class AzureClient():

    def __init__(self):
        pass

class AzureFunction():

    def __init__(self, function_rg, function_app_name):
        self.function_rg = function_rg
        self.function_app_name = function_app_name
        self.resource_id = ''
        self.function_url = ''
        self.functions = []
        self.default_key = ''

    def get_function_app(self):
        metadata_url = "resourceGroups/{}/providers/Microsoft.Web/sites/{}?api-version=2016-08-01".format(self.function_rg, self.function_app_name)
        res = requests.get(base_url + metadata_url, headers=auth)

        self.resource_id = 'https://management.azure.com' + res.json()['id']
        url = res.json()['properties']['defaultHostName']
        self.function_url = 'https://' + url + '/api'
        # return resource_id, full_url

    def get_functions(self):
        functions_url = "resourceGroups/{}/providers/Microsoft.Web/sites/{}/functions?api-version=2016-08-01".format(self.function_rg, self.function_app_name)
        res = requests.get(base_url+functions_url, headers=auth)
        # print(res.status_code)
        # print(res.json())
        self.functions = res.json()['value']
        # return functions

    def get_function_key(self):
        function_keys_url = "resourceGroups/{}/providers/Microsoft.Web/sites/{}/host/default/listkeys?api-version=2016-08-01".format(self.function_rg, self.function_app_name)
        res = requests.post(base_url + function_keys_url, headers=auth)

        self.default_key = res.json()["functionKeys"]["default"]
        
        # return default_key

def create_api(apim_rg, apim_name, api_name, display_name):

    # get_api_url = 'resourceGroups/{}/providers/Microsoft.ApiManagement/service/{}/apis/{}?api-version=2021-01-01-preview'.format(apim_rg, apim_name, name)
    # try:
    #     res = requests.get(base_url + get_api_url, headers=auth)
    #     print(res.text)
    # except:
    #     pass

    name = 'splittestfunction2'
    create_api_url = "resourceGroups/{}/providers/Microsoft.ApiManagement/service/{}/apis/{}?api-version=2021-01-01-preview".format(apim_rg, apim_name, api_name)
    body = {
        "id" : "/apis/" + api_name,
        "name" : api_name,
        "properties" : {
            "displayName" : display_name,
            "protocols" : ["https"],
            "description" : "Test",
            "path" : api_name
        }
    }

    res = requests.put(base_url + create_api_url, headers=auth, data=json.dumps(body))
    # print(res.text)
    print(res.status_code)

# Get access key from function
# https://docs.microsoft.com/en-us/azure/api-management/import-function-app-as-api#authorization -- Host key auto created inside function, TODO, using defualt for now

def get_function_key(function_rg, function_app_name):
    function_keys_url = "resourceGroups/{}/providers/Microsoft.Web/sites/{}/host/default/listkeys?api-version=2016-08-01".format(function_rg, function_app_name)
    res = requests.post(base_url + function_keys_url, headers=auth)

    default_key = res.json()["functionKeys"]["default"]
    
    return default_key

# Add function access key to APIM
def apim_add_keys(apim_rg, apim_name, api_name, function_key):
    add_keys_url = "resourceGroups/{}/providers/Microsoft.ApiManagement/service/{}/namedValues/{}-key?api-version=2021-01-01-preview".format(apim_rg, apim_name, api_name)
    add_keys_body = {
        "id" : "/namedValues/{}-key".format(api_name),
        "name" : api_name + "-key",
        "properties" : {
            "displayName" : api_name + "-key",
            "value" : function_key,
            "tags" : ["key","function","auto"],
            "secret" : "true"
        }
    }
    
    res = requests.put(base_url + add_keys_url, headers=auth, data=json.dumps(add_keys_body))
    print(res.status_code)
    # print(res.json())

# Add function as APIM Backend
def add_apim_backend(apim_rg, apim_name, api_name, function_app_name, function_url):
    backend_url = "resourceGroups/{}/providers/Microsoft.ApiManagement/service/{}/backends/{}?api-version=2021-01-01-preview".format(apim_rg, apim_name, api_name)
    backend_body = {
        "id": api_name,
        "name": api_name,
        "properties": {
            "description": function_app_name,
            "url": 'https://' + function_url + '/api',
            "protocol": "http",
            "resourceId": "https://management.azure.com/subscriptions/811ac24a-7a5f-41a7-acff-8dd138042333/resourceGroups/Split/providers/Microsoft.Web/sites/SplitTestFunction",
            "credentials": {
                "header": {
                    "x-functions-key": ["{{" + api_name + "-key}}"]
                }
            }
        }
    }

    res = requests.put(base_url + backend_url, headers=auth, data=json.dumps(backend_body))
    print('Apim backend', res.status_code)

# Add operation
def add_operation(apim_rg, apim_name, api_name, operation_name, operation_display_name, url_template, method, parameters):
    operation_url = "/resourceGroups/{}/providers/Microsoft.ApiManagement/service/{}/apis/{}/operations/{}?api-version=2021-01-01-preview".format(apim_rg, apim_name, api_name, operation_name)
    # print(operation_url)
    parsed_params = []
    for p in parameters:
        parsed_params.append({
              "name": p,
              "type": "",
              "values": [],
              "required": 'true'
        })
    
    operation_body = {
        "id": "/apis/{}/operations/{}".format(api_name, operation_name),
        "name": operation_name,
        "properties": {
            "displayName": operation_display_name,
            "description": "",
            "urlTemplate": url_template,
            "method": method,
            "templateParameters": parsed_params,
            "responses": []
        }
    }
    res = requests.put(base_url + operation_url, headers=auth, data=json.dumps(operation_body))
    print(res.status_code)
    # print(res.text)

# Add policies
def add_policy(apim_rg, apim_name, api_name, operation_name, backend_name):
    policy_url = "/resourceGroups/{}/providers/Microsoft.ApiManagement/service/{}/apis/{}/operations/{}/policies/policy?api-version=2021-01-01-preview".format(apim_rg, apim_name, api_name, operation_name)
    policy_body = {
        "properties": {
            "format": "rawxml",
            "value": "<policies>\n    <inbound>\n        <base />\n        <set-backend-service id=\"apim-generated-policy\" backend-id=\"{}\" />\n    </inbound>\n    <backend>\n        <base />\n    </backend>\n    <outbound>\n        <base />\n    </outbound>\n    <on-error>\n        <base />\n    </on-error>\n</policies>".format(backend_name)
        }
    }
    res = requests.put(base_url + policy_url, headers=auth, data=json.dumps(policy_body))
    print(res.status_code)
    # requests.put()





if __name__ == '__main__':

    function_app_name = ""
    display_name = "Test API 3"
    name = "test3"
    api_url_suffix = ""


    base_url = "https://management.azure.com/subscriptions/811ac24a-7a5f-41a7-acff-8dd138042333/"
    functions = "resourceGroups/Split/providers/Microsoft.Web/sites/SplitTestFunction?api-version=2016-08-01"

    access_token = "Bearer "
    auth = {'Authorization': access_token, 'Content-Type': 'application/json'}

    function_app = AzureFunction('Split', 'SplitTestFunction')
    function_app.get_function_app()
    function_app.get_functions()
    function_app.get_function_key()

    # resourceId, function_url = get_function_app('Split', 'SplitTestFunction')

    create_api('lithographtestfunction', 'lithograph-test', name, display_name)

    # function_info = get_functions('Split', 'SplitTestFunction')

    # function_key = get_function_key('Split', 'SplitTestFunction')

    apim_add_keys('lithographtestfunction', 'lithograph-test', name, function_app.default_key)

    add_apim_backend('lithographtestfunction', 'lithograph-test', name, 'SplitTestFunction', function_url)

    operations_info = []
    for item in function_app.functions:
        for binding in item['properties']['config']['bindings']:
            if binding['type'] == 'httpTrigger':
                # print(binding)
                # print(binding['methods'])
                # op['operation_names']
                for method in binding['methods']:
                    op = {}
                    op['method'] = method
                    op['templateParameters'] = []
                    op['operation_display_name'] = item['properties']['name']
                    op['operation_name'] = method.lower() + '-' + item['properties']['name'].lower()
                    if 'route' in binding:
                        op['urlTemplate'] = binding['route']
                        parameters = []
                        for ind, letter in enumerate(binding['route']):
                            if letter == '{':
                                start = ind + 1
                            if letter == '}':
                                parameters.append(binding['route'][start:ind])
                        if parameters:
                            op['templateParameters'] = parameters
                    else:
                        op['urlTemplate'] = item['properties']['invoke_url_template'].split('.net/api')[-1]
                    # print(op)
                    add_operation('lithographtestfunction', 'lithograph-test', name, op['operation_name'], op['operation_display_name'], op['urlTemplate'], op['method'], op['templateParameters'])
                    add_policy('lithographtestfunction', 'lithograph-test', name, op['operation_name'], name)
        print('---------')

    