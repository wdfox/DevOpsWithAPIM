

export async function parseOperation(item: { properties: { name: string; invoke_url_template: string; }; }, binding: { [x: string]: any; route: string | any[]; }, method: string): Promise<any | undefined> {
    let op:any = {}
    let letter:string;
    op['method'] = method
    op['templateParameters'] = [];
    op['operation_display_name'] = item.properties.name
    op['operation_name'] = method.toLowerCase() + '-' + item.properties.name.toLowerCase();
    if ('route' in binding) {
        op['urlTemplate'] = binding['route'].toString().replace("?", "")
        let parameters = [];
        var ind = 0;
        var start = 0;
        for (letter of binding.route) {
            if (letter == '{') {
                start = ind + 1;
            }
            if (letter == '}') {
                parameters.push(binding.route.slice(start,ind).toString().replace("?", ""))
            }
            ind += 1;
        }
        if (parameters.length > 0) {
            op.templateParameters = parameters
        }
    }
    else {
        op.urlTemplate = item.properties.invoke_url_template.split('.net/api').slice(-1)[0].toString().replace("?", "")
    }

    // temp log the operation for debugging the "?"
    // Will says it was there to support optional params
    // console.log(op);

    return op;
}