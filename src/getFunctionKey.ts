import { HostKeys, WebSiteManagementClient } from "@azure/arm-appservice";

export async function getFunctionKey(client: WebSiteManagementClient, functionRg: string, functionAppName: string, apimName: string) {
    try {

        //https://docs.microsoft.com/en-us/rest/api/appservice/web-apps/list-host-keys
        let functionKey = client.webApps.listHostKeys(functionRg, functionAppName);
        
        //convert the object to a JSON object
        let functionKeyJSON:any = JSON.parse(JSON.stringify(await functionKey));

        if(functionKeyJSON.functionKeys["apim-" + apimName]){

            //return the APIM-created key
            return functionKeyJSON.functionKeys["apim-" + apimName];

        } else if(functionKeyJSON.functionKeys["default"]){

            //return the default key for now, in the future, create an APIM key     
            return functionKeyJSON.functionKeys["default"];
        }

    } catch (error) {

        console.log(error);
        
    }

}