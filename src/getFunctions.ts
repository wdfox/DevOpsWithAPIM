import { WebSiteManagementClient } from "@azure/arm-appservice";

export async function getFunctions(client: WebSiteManagementClient, functionRg: string, functionAppName: string) {

    let functions = client.webApps.listFunctions(functionRg, functionAppName);

    let out: string[] = [];

    for await (const f of functions) {
        const length: number = functionAppName.length + 1;
        if (f.name) {
            out.push(f.name.slice(length,))
        }
    }

    return out;
}