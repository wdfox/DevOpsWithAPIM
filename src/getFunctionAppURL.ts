import { HostKeys, WebSiteManagementClient } from "@azure/arm-appservice";

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
            
            return "https://" + hostName + "/api";

        } else {

            return "error parsing response for site name: " + JSON.stringify(functionAppURLJSON);

        }
    } catch (error) {

        console.log(error);
        
    }

}