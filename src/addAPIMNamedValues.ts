import { NamedValueCreateContract } from "@azure/arm-apimanagement";

// https://docs.microsoft.com/en-us/javascript/api/@azure/arm-apimanagement/namedvalue?view=azure-node-latest#@azure-arm-apimanagement-namedvalue-begincreateorupdateandwait

// Console Output
const green: string = '\x1b[32m%s\x1b[0m';
const red: string = '\x1b[31m%s\x1b[0m';

export async function addAPIMNamedValues(APIM_Client: any, apimRg: string, apimName: string, apiName: string, functionKey: string): Promise<number | undefined> {
    try {
        const namedValueContract: NamedValueCreateContract = 
            {
            "displayName" : apiName + "-key",
            "value" : functionKey,
            "tags" : ["key","function","auto"],
            "secret" : true
            }

        await APIM_Client.namedValue.beginCreateOrUpdateAndWait(apimRg, apimName, apiName + "-key", namedValueContract)
        console.log(green, '   SUCCESS: Added the named values: ' + apimName);
        return 1;
    } catch (error) {
        console.log(red, '   FAILED to add the named values: ' + apimName + '. Error message: ' + error);
        return 0;
    }
}