# DevOps with API Management

### Problem
The current APIM experience is very UI-driven, requiring user interaction through the Azure Portal to import and update APIs, even when hosted in native Azure services such as Functions. If Functions are being used as part of a production solution, this manual process acts as a blocker, slowing developer momentum. 

### Context
In general, API implementations may take on all shapes and sizes depending on the language, framework, and hosting choices. Because of this variety, it is difficult to create a one-size-fits-all script for automatically reading, parsing, and importing APIs to APIM. However, with Azure Functions specifically, the HTTP Trigger takes on a predictable schema. There must be a better way...

### Solution
In the current portal-driven experience, the UI uses JavaScript to make a series of REST calls to the Azure API, covering all the steps for importing an HTTP-triggered Function as an API in API Management. This process can be automated and repeated as part of a deployment pipeline and packaged as an Action or Pipeline Task for users around the world. 

### ToDo
- Decide on language (stick with Python vs. switch to JS)
- Refactor code for readability
- Add error handling
- Add unit testing
- Decide on a primary DevOps platform (GH Actions vs. ADO Pipelines)
- Add handling for inputs
- Add output/logs
- Add assets for publishing

### Estimates
- 2-3 Developers
- 1-2 'Sprints' of 1 week each
- Work can be done largely asynchronously, if desired
