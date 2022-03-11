import { HostKeys, WebSiteManagementClient } from "@azure/arm-appservice";

// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';

export async function getFunctionAppURL(client: WebSiteManagementClient, functionRg: string, functionAppName: string): Promise<string | undefined> {
    try {

        // TODO: We should think about if we need to support slots
        // DOCS: https://docs.microsoft.com/en-us/rest/api/appservice/web-apps/list-host-name-bindings

        let functionAppURL = client.webApps.listHostNameBindings(functionRg, functionAppName);
        
        // i'm only getting the first result; can discuss if this is the right strategy
        let functionAppURLJSON:any = JSON.parse(JSON.stringify(await functionAppURL.next()));

        if (functionAppURLJSON["value"]["name"]){

            // remove the function name and '/' from the result; ex: in('functionName/functionName.azurewebsites.net') -> out('functionName.azurewebsites.net')
            let hostName:string = functionAppURLJSON["value"]["name"].slice(functionAppName.length + 1,);
            
            //return "https://" + hostName + "/api";
            console.log(green, "   SUCCESS: " + hostName);
            return hostName;

        } else {
            console.log(red, '   FAILED: could not parse the function app URL: ' + functionAppName + '. Response message: ' + JSON.stringify(functionAppURLJSON));
            return "error parsing response for site name: " + JSON.stringify(functionAppURLJSON);
        }
    } catch (error) {
        console.log(red, '   FAILED: could not get the function app URL: ' + functionAppName + '. Error message: ' + error);        
    }

}