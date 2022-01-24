# DevOps with API Management

## Problem
The current APIM experience is very UI-driven, requiring user interaction through the Azure Portal to import and update APIs, even when hosted in native Azure services such as Functions. If Functions are being used as part of a production solution, this manual process acts as a blocker, slowing developer momentum. 

## Context
In general, API implementations may take on all shapes and sizes depending on the language, framework, and hosting choices. Because of this variety, it is difficult to create a one-size-fits-all script for automatically reading, parsing, and importing APIs to APIM. However, with Azure Functions specifically, the HTTP Trigger takes on a predictable schema. There must be a better way...

## Solution
In the current portal-driven experience, the UI uses JavaScript to make a series of REST calls to the Azure API, covering all the steps for importing an HTTP-triggered Function as an API in API Management. This process can be automated and repeated as part of a deployment pipeline and packaged as an Action or Pipeline Task for users around the world. 

## Setup and run

### Preqs
- Local machine OR Codespaces
  - If using your local machine:
    - Azure CLI
    - Node.js
    - Clone this repo locally
  - If using Codespaces:
    - All preqs are already installed
- Azure subscription with APIM and Azure Functions already provisioned (you must update the subscription ID, function names and resource groups in the import_functions.js file)

### Run

- Run `az login` using Azure CLI
- Run `az account get-access-token`
- Copy the VALUE of `accessToken` and paste in the import_function.js (line #253)
- Run `node import_function.js`

### ToDo
 - Refactor code for readability
- Add error handling
- Add unit testing
- Add handling for inputs
- Add output/logs
- Add assets for publishing

### Estimates
- 2-3 Developers
- 1-2 'Sprints' of 1 week each
- Work can be done largely asynchronously, if desired
