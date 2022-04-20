import { HostKeys, WebSiteManagementClient } from "@azure/arm-appservice";

// # https://docs.microsoft.com/en-us/azure/api-management/import-function-app-as-api#authorization -- Host key auto created inside function, TODO, using defualt for now

// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';

export async function getFunctionKey(client: WebSiteManagementClient, functionRg: string, functionAppName: string, apimName: string) {
    try {

        // DOCS: https://docs.microsoft.com/en-us/rest/api/appservice/web-apps/list-host-keys
        let functionKey = client.webApps.listHostKeys(functionRg, functionAppName);
        
        //convert the object to a JSON object
        let functionKeyJSON:any = JSON.parse(JSON.stringify(await functionKey));

        if(functionKeyJSON.functionKeys["apim-" + apimName]){

            //return the APIM-created key
            console.log(green, '   SUCCESS: Found the APIM-created host key: ' + functionKeyJSON.functionKeys["apim-" + apimName].substring(0, 8) + "***************");
            return functionKeyJSON.functionKeys["apim-" + apimName];

        } else if(functionKeyJSON.functionKeys["default"]){

            //return the default key for now, in the future, create an APIM key
            console.log(green, '   SUCCESS: Found the default host key: ' + functionKeyJSON.functionKeys["default"].substring(0, 8) + "***************");   
            return functionKeyJSON.functionKeys["default"];
        }

    } catch (error) {

        console.log(red, '   FAILED: could not get the host key for: ' + functionAppName + '. Error message: ' + error);
        
    }

}