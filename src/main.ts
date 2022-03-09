import axios from 'axios'
import ExecutionContext from './executionContext';
import { getFunctions } from './getFunctions';
import { getFunctionKey } from './getFunctionKey';
import { getFunctionAppURL } from './getFunctionAppURL';
import { createAPI } from './createAPI';


import { WebSiteManagementClient } from "@azure/arm-appservice";

const executionContext = ExecutionContext.create();

// const functionRg: string = "apim-backend-functionapp";
// const functionAppName: string = "testFunction-";
// const displayName: string = "Test API 3";
// const apiName: string = "test3";
// let apiUrlSuffix: string = "";

// const apimRg: string = "apim-functionapp";
// const apimName: string = "apim-function-test";

let apiProduct: string = "";
const apiVersion = "2021-01-01-preview";

const functionRg: string = "lithographtestfunction";
const functionAppName: string = "lithograph-test-function";
const displayName: string = "Test API 4";
const apiName: string = "test4";
let apiUrlSuffix: string = "";
const apimRg: string = "lithographtestfunction";
const apimName: string = "lithograph-test";


let accessToken: string = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImpTMVhvMU9XRGpfNTJ2YndHTmd2UU8yVnpNYyIsImtpZCI6ImpTMVhvMU9XRGpfNTJ2YndHTmd2UU8yVnpNYyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNjQ2ODU2MzE5LCJuYmYiOjE2NDY4NTYzMTksImV4cCI6MTY0Njg2MDk1OSwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhUQUFBQVo1YncwVThBNHhMQTFOV2NhNVF5SnVmMkdoQmJrVDBrZ3NNWjVIeG8xeFZPcGJMSStIYzhiRmpULzVjVGpyYWdzQU5Zb2YwazhadWpldC9XVVppdUJKZ0thTUx0MlpTR0RXWXh2UDFQNWhrPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwaWQiOiIwNGIwNzc5NS04ZGRiLTQ2MWEtYmJlZS0wMmY5ZTFiZjdiNDYiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IkdhdGVzIiwiZ2l2ZW5fbmFtZSI6IktldmluIE0uIiwiZ3JvdXBzIjpbIjVjMjA0ZGUwLWUzMjktNDE5OC1hYzE4LThlMDU5ODFiMmMyMiIsIjBmNDc2YmM0LTVkNWUtNDNhZS04ZDVmLWRlMzc2YjRiNGY1NiIsIjI1MTFhMTgxLWU5YmYtNDkyNy1hYzQ3LTZiMTMyNGI4N2I0NSIsImEwYTU0M2U2LTkzZWEtNDhkMi05ZjA1LTNhMjA3ZDljODg1MyIsIjk2NDFjNTdmLWFiZDctNDI4NS1iZTFmLWQ1NjgwZjZmODVjMCIsIjFkNTE4NWE5LThmNzMtNDViMy04MjIxLTUxZDJjNjdjZTg0NSIsIjY3MTRmNzMzLTA2NWUtNDdmNy1iZmM3LTk5NmQ1ZDJiNjA4YyIsImE0NDE2NjMwLWFlZTktNDcwZC1hN2M4LTQxOWI4MTRlMTlmNCIsIjRjNTcxZGMzLTU1NjEtNDI3ZS05ZDE4LWEwNjJmZGQzZWRlNSIsIjEyMGE4ZDA2LWM5YjYtNDNmMi04YTVhLWQwNjJlMTc0OGZiYyIsImRiMzRjZDQ4LTVhNjYtNGNmYy1hNTdlLTI2NmM2N2RkN2VhYiIsIjAxMzcwYzI5LTQ5ZDYtNDFmMC04MjgzLTNkM2Q5NmNiOWExNSIsImZiZTA2OGMyLWQ4YTktNDUxYi04MGU0LTgxZmZkNmJkZWEwYSIsImYzODU0YTkxLWExNzYtNGY5MS04Njg5LWQxZWI1OTJkOWRhNiIsImZiMmRmNWU2LTllNGItNDZjNC1hNzcyLTgxMzM2NDEyOGRmMSIsIjliYWM4MGU2LTdkYWMtNGIyZC05MTNiLTJmNmRhODA5M2MwMSIsIjIyY2MyYTVlLTg3ZmEtNDI5NC1iN2I1LTA3YmJlNzUzZWNlMiIsIjQ5ODk4ODQ3LTliZmItNGJjYy1hMjA3LTJhZjYzYjk4ZTM0YSIsIjdhMjk2NjgwLWU3NGYtNGRjOC05Y2EzLWQ1ODE2ZGNmMDZlMCIsIjhiMzNhNjA4LTRmZWItNGQyZC05ZjJkLTMxMTE1NWY5MDgzYyIsIjBjNTBjMzliLWFhNDgtNGE4Yi1hMDU1LTMwYTQ2MzY1YzRiNSIsIjY3OTM5ZGU3LTNkMTctNDljNC05NmE3LTE1NjFlZmEyNTE0ZSIsImQ5M2Q4NGM2LTIxODctNDM0Mi05YjAyLTFlNzQ3NTU3MTBjOCIsImU2MTM4ZWUyLWI1NjctNDllYi05N2RmLThmMTc3NzY4MmFjZiIsIjJmOTNhMzExLWI0MjctNGQyNS05NGE0LTAwNzdhN2JhMWM5NSIsImM0MzEzZWJhLTQ5ZjUtNGQ2OS05N2Y0LWU2N2FlNzMzZGE5MiIsIjQwODBmYWY5LTMxNjQtNDdmZS04MzE3LTRkMjgxMTAxMzkzZCIsIjM3NjA2ZGJkLTg3ZWYtNDE5NC1hYjZmLTM0MmE2MDEzNWZjOCIsIjA5Yzc0MjMzLTI1YTgtNDhmNS1iMTUyLWE4ZjAxNmNiZDAyMCIsImQyYTI2YzkxLTYyY2EtNGFlZS04ZTczLTNmYzk1YmIwNTQ1NyIsIjZlMzlmY2VkLTE5YjgtNDRkZi1iMGJmLTQ4ZjYyNGI5MzhmZiIsIjZmNDMwOTRiLTUyMjEtNDI1Ni05MjQwLTcwMjI0ZWQ3MzFjMCIsIjlhMzJkMmRjLTQ5MzYtNDgzZi1iYTE2LTIzZWI4NTdhOWQ2YSIsIjk4NWU4MDRmLTNlNTctNDMxMS1hYmIwLTVmMzUzMjllYjM1ZiIsIjA0ZTc0ZGEzLTU5ZDctNDJiYS05MjExLTEzY2FlOGEwMjM4YiIsIjgwMjczZTM0LTA3NzEtNDk3MC05MDhkLWI1NDVhZjQwMDQ3MCIsIjk0YjQwNTAzLWRlODItNGE2MS05YmZhLTRiYTJmZjQ5OTgyMyIsIjk2OGFhZGU1LTNmOGUtNDY5OC1iNDY0LTVlY2QzNDQwNTQwMyIsIjVkZWQxMDljLTE2ZmEtNGNkYy1iY2VhLTQ5YmM5MzQ3ZGNhZCIsImU3ZmFmMDA0LTlhNDUtNDlmOS05M2ZmLTRhYzEzYzhmNWIzYSIsImUxMTViMTg0LTM2NzYtNGM0Zi1hNGNmLTVkMzVhOWY3ODgwZiIsIjg1OGIyZWE0LWQ3NDYtNGM2ZS1hNjBmLTM0Yzg0MWE3MGRmMCIsIjUwOWMzMDBkLTJhZDgtNDBkMy04NmZkLWJhMDVmZGJmYjM3OCIsIjZjOTc2NGMxLWZhZTEtNDI5Ni05MTQ0LWZmMzkwODU2MTk2NCIsImUzZThkNDVkLWFjYTMtNDUyZC05MmU3LTg4ODMyN2E1ZmI1YiIsImVlNWQ5NWY5LWY3ZjgtNDY2OS1hMThlLTI4MDJiMGVkM2EzNiIsIjIyNjZjOGRkLTIxMmYtNGEwMS04ODg2LWNlNTI1YTk0NjgwNCIsImIwMWMxNGE0LWU3NzQtNGQ3Yi1hZTM2LWQ1MjdjYTY1MGVmYyIsIjExYTc3MmY4LWU5MDctNDVjMy1hMzRiLTMxZGUyY2Y5YmFkZSIsIjZlNzk1YzkzLTZjNzgtNDAwOS1hYjI4LWVhMDI1ZmQwZjRhZiIsIjRhYmRiNjIwLWY3MTYtNDQ1ZS05NTAzLTBjMTVhM2NlYzFkMSIsIjA1ODdjYmI5LTE4ZWItNDdiNC1iYWU4LTUzN2EyMWViM2M2NiIsIjgwZDY1ODg1LWNmZGQtNDgyNS04MzNhLWIyOWJjODM5OGM2MyIsIjBkNmQwZGI1LTdkNDEtNGUyMy05OTRjLWJlMzVhM2YwNzYyOCIsIjkzMjlkMzhjLTUyOTYtNGVjYi1hZmE1LTNlNzRmOWFiZTA5ZiIsIjdlMTBjY2FiLTgzYTQtNDE4Ny05MzZlLWEwMzUxMjZiNjU4NSIsIjMwMDg3ZWEwLTcwNTYtNDM0OS04MDQzLTBjYWU5MzgzNDA0ZSIsImUzOTNlODYyLTFjYzMtNDI3Zi05ZjE5LWEyOWJlYWU2OTdhMyIsIjQ4YzgyOWViLWNkODctNGY1Yy1iYjQxLWM0MTEwYzBlNDJjYyIsImQ0OWFhMmNkLTY1MmItNDhiNy04OGJmLTVkZjE4MzllMDg5MSIsImEzZTEzZTlkLTUzY2ItNGExNy1iN2E2LWQ1YWI0NWFhMDg3YiIsImZjYmI0ZDNlLTQ2ZGUtNDZiNy1hNjNhLTg1NjMzMmUwNDJjZSIsIjIyYWU2YThhLTJlNzEtNDM2OS05MjU5LTczNjViNGI0YzBjNiIsImViNWZhYTNhLWY5N2ItNGRjZi04NGM0LTM1MGZlNmFjM2ZiOCIsIjk5ZGQyMmVmLWRmMzgtNGQ2Ni05OTkxLWQwMjZjNjUyNzY0ZiIsIjVjODFmMmQ4LWMwZWUtNDdlMy1iOGU1LTBmYTY5OTc1NWVlNiIsIjRiYzY2ODg0LWZhYTUtNDczZi05NGMzLTVhMmFkM2M2MzcwNSIsIjE5MThlMDkwLTgwOGEtNDQ1MS1iYjViLWZhNjRlN2EyMTY0OSIsIjZjYmU3ZTVmLWJjZjItNGViMC04NDMyLTk3ZWI5MjQxZDU1MSIsIjA0ZGVhYmQ2LTU1MmYtNDM2Ny05MmE1LWJkZmRkMzc1MGZhYiIsIjE4ZTU4M2QzLWQyZjEtNGUxMC1hMGViLTZjYzFmM2I3NDA1NCIsIjIwZjA1NWMxLTY5MmYtNGJiMy04NjU3LTk1MWUwYjkxZWNmMCIsIjE3NWQxZGZiLWZmMTctNGM4ZC1hMDRjLWEwYjVkNDVjODY5NyIsIjVhYTdkNjE3LWVhNjgtNDNkYS04N2Y4LTU5NWM5MWMwN2IyYyIsIjk4OGNkODBmLTRlYjQtNDlhNC1hODUyLWM0ZWYwYmJjMjdmZiIsIjYwMjUyMTc5LWI0YWItNDY0Mi1hZDM1LTZlZTVhYjE0OWE3NyIsIjQzNTMxZjg3LWJkYjUtNDZjZi05YmE3LTgwNWM1MDhhNmI5MSIsImFmMzVmZmMxLWY2ODYtNDA5Ni1hMmQ4LWI4Yjk4MjhlODM2NyIsIjdiNTNjNWI3LTgzZDEtNDFjMC05ZmFlLWY3NGJhYWNmMzcxOCIsIjE5MzBmODEzLTA3NGUtNDA3Ny1hMGJkLTdhYzdmYTJkYTJjZCIsImM1ZjM0MTc3LWEzZTAtNDcwZS1iMDgyLWE4ZThhYTM1NjgxMiIsImI2YmE3MDYzLWU3ZDAtNDE4Mi1hNzc5LTY5OTI3NzMxMzRlMiIsImQxNWJjN2UxLTc1ZmEtNDVlMi1hYjgxLTI0MDY0YmYyYzY5NiIsImZmYzc5YTUyLTEzYWUtNDllZC04ZTRkLTE4NWU5ZjcwZmViNSIsIjc3NzBmZDFmLTIzNmEtNDI2Ni1hYmYxLTA1YzdkODVhMzYzOSIsImRkNTdiZDNmLWU1YjYtNGRkNS1hZjk1LWE2ZmVkMWU5MDdiMCIsIjZkNTcxOTMyLTJmYTctNDBhNS1hNjlhLTU1MzJhNDhmNDc1MiIsIjBkNzRjY2Q0LTc1NDMtNDg2Yi05YWRhLWFlZmNhYzQ2MmExNSIsIjlmZjU4Y2VmLWQzNWEtNGJjMC04ODIzLTM5NzE0ZDNlMmI3NCIsIjYxMWI2ZTIyLWRmMDItNDc0NC1iYTI0LWFmODczYTcxODJkYyIsIjk5ZDJhMTk2LTkyNzEtNGI4Ni05MDkzLWU1ZjNjZTFmNzA4YyIsIjBmM2FkZmRmLWJhMzItNDE5MS04NDU5LTNkYTYwMzNmZjlhNyIsIjkwZTRhNDk1LWE5ZTMtNGI0ZC05MDFiLTM2OWJiNWZmM2NlYyIsImZkZmFkYTM0LTY0ZmYtNGYxYi04ZjAxLWI5YTlkZTg2MmU1YiIsIjg2YWU1ZjkyLTA4YzgtNGY2Ny05ODQ1LTg5OGExYWY1NGI4MSIsImIwYzU1NDg1LTUwODctNDBlYS05MmE5LWYwNjYxZjY4YTFiNiIsIjYxZDliYzZiLWJjOWQtNGU4ZC05ZGU0LWYyMThkNDEyOGJlNSIsImZmZDM0MDBjLTJlN2ItNDEzZi1hMWM1LWNmMzcwZDQ4ZWFiYSIsImY2YjBjMDE5LTI2OTMtNDhlOC05ODAxLTVlOWJmNjRlMzRiOCIsIjVmY2MxNTI1LTBkYzMtNGNlYS04NTY2LTE4MTgwOTgyYThmZiIsIjhhMzlhYzJhLWFjMmEtNDkzYi1hOWQ4LTQ2Nzg3NTczMmVlZiIsIjMxODBjZWZhLTkzODMtNGFlZi04MTllLTA4NzJjZDJhNzEzMCIsIjU5MzU2ZmMyLTVjYjAtNDk2My04ODhiLWY0NDE0YWIxMDgyYSIsIjIyYTIyOWJkLWM3YTItNDlkMC05ZWFhLWUxZmM4ODhkYWFjNiIsIjFjZGY4OTEyLTRiOGMtNDBhZC1iNDhmLWZmOTU3YWUwYjEzYiIsIjlkZWM2OTY4LWQ5YzYtNDJkYy1hMmU3LTk4YTAxZWU1YzM2MiIsImRmNGVkYTE1LTZiZjctNDNkYy04ZGZmLTdmODhlMDRjMTc0NSIsImQ1NWRhY2VjLWJjY2UtNGFlZi05NGEyLTY2YmI2NDUwMjI2YyIsImJjZDZlODExLTRhMWEtNDc4Yi05MzRlLTU3YTA0M2YxMGM0ZCIsIjFhMjUzYjBhLWYyZDMtNDkxZi1iMzViLTI2ZWY0MWNjMjhjOSIsIjQyODcwMGJkLWFjZWMtNGQ2NC1iYTU2LTcyMTRjOGJjYmU1ZSIsIjJhY2M3ZDFjLWZkMDctNGQyNC05YzMwLTY4ZGFmNzUyNDEyYSIsImI5YTQxNGY3LTQzM2UtNDZjMi1iZDgxLWNjMTIyNDgyOTcyOSIsImJkMjk1MDZkLTcxZmQtNDIyYy04ZTk2LWM1ZmQyYzhjMDllNiIsIjE2YjI4YzAwLTc1Y2UtNGZlNy05N2YxLTY3MzZhMGZjNmI2OSIsIjBmMDE3ZDA3LTFmNWItNDZjYS1iMjRhLWUyNGNiOTBkMjEwYiIsIjNlMDQ5ZmZiLTU5ZTEtNDk4MC1iY2NjLWMyN2NhMWJhOTdiMyIsIjU4ODAwZWI0LTM5NDAtNDkzNC1iM2ViLWRmZDJhYzY0YTg2MiIsImEwOWQ2NzM5LTZmZTYtNDU4Mi04Mjk4LTE2NzMwMzhmYTYzZSIsIjlkNTI5ZDVlLWI4ODItNGZmYi1hOGU2LWM0MTQ3YzY4MDczNSIsImY2YmE5YmZlLTVhYzQtNDg4Yy1iYjhkLTBiZjA0MWVkMzQwOCIsIjkxYmIwMzU4LTQwZDktNGM0ZC04OWVmLTZmNjZlZDA3ZTZjYyIsImJlOGNhMzc4LWJjNzQtNDZjMS1iOTIyLWU3ZjU1MjQ4NmVkZSIsIjFjMzgwYTM3LWMyNTAtNGE3My05NzczLTA1ZDliMDVhNDE2NyIsIjM3YTljN2UzLTY2MWMtNDhjNS04OGRiLTgxNjE3MjgxYTY2NSIsIjIxZjVjY2NhLTFhOTMtNDA2OS05MzUzLTE4YTczOGU2MWNmZiIsImEwZjYzYTIzLTEwNzktNDQwNC04YjE2LWY3MTg2MzZlY2EyYSIsIjQwOWFjYmZhLThiOWQtNDJhNi05MGNlLTM2NmYzMmQwYjNjOCIsImRhNmQ1MzYwLTllODgtNDgyMi1iYzllLWIzN2I4ZGZlZjEzZCIsImE5ZjYwZjdhLTkyODMtNGYyMy1iZjNkLTcyYjY4MzYyMzgwYyIsIjczMDQyMGRhLTcyOWQtNGFmZS1hZDZjLTk5ZGYwYzJjMzg0YyIsIjFhMWYxZmMxLWU2ZWYtNDhkNS05YWQyLTg0ZTM1OGRiMjM1OCIsIjM0ZmY3NDE4LWYzMmQtNGIxNS1iY2QwLWJiNGVjNzk3OTZjMSIsIjdmZWE4ZjM0LTRlNTMtNGJjNC04Y2U2LTg2MDQ0OTA2ZjRjMyIsImU3YzQzZDAwLTQyMDAtNDRmZS04YmRiLWQ0OGZjNDg0MWUyYSIsIjBlZjkxNTc3LTY2MzctNDg1MC1hNGM0LTg5MWExZGZiNGFhNCIsIjczYjc0YTFkLTVhZGYtNDM1NS1iNjFlLTljMTFlMTUzZDA1ZCIsIjYwM2ViZDZlLWQ2ZmQtNDkzNi05NjFjLTlmYjg1NDVjNTA0NCIsIjUyNmI5MzM0LWE1YTItNDgyYS1iZmMyLTU1NjRkNmNkNzA3ZSIsIjU1ZWZhOWM5LTkyNDYtNDhiZi05N2E0LTk5ODc5NzdjNGQ1ZCIsIjA4NmMyZTdlLThhMGItNDY4NS05OTI1LTBhNDA2ZGMyYjJlMiIsImRlODFmNDg5LTg5ZTUtNGViYS05YWJiLTQwYWUxN2ZiMzRmNSIsImFhYjc1YzliLTZjMWEtNDc4Yy05NmYxLTY1YzJhZmQyODYxYiIsIjA0YTI0Y2U5LTUzYTAtNDRjOS05ZGQwLWE3MDQ5ZTZkYzQ2YSIsImU0OWE3YjMxLTBmZWUtNDYwMi1hNTBjLWMxMDQxMDJlMGJiMiIsIjRlMWY3MmRiLWQ1ZjctNDAzNy04ZjQ4LTYwNDM5OTFjZTY3ZSIsIjQ1MjJkZDFjLTVjOTAtNDhhZC1hYThmLWQ1YTc5ZjU0NDlkMCIsImI2MTI3Mzg2LTEwOTQtNDdkMC05MTk3LTJiNzgzNmE5MDJiZSIsImE3Njc2YzE1LWY2YWQtNDZlNy1iYmViLTZmODIwMWE1ZmJjNCIsImEyYjZkMWYwLTNhMGUtNGM0OC05YmNiLTZhNGEyODVkYTI5NyIsIjY2NDIzMTk5LWQ5OTctNDI0My05MDAwLTVmNjQ1YjI3M2M3MiIsImQ2YThlZTA0LTE4ZjAtNGEzZC05MzYyLWNlMzMzZmI2MDRmZSIsIjkyNTFlNDJiLTkxMWMtNDVjNy1iMzdhLWIyNDc3YjIwYzUxMiIsIjExYTc3ZjAzLTM2ZTEtNDFmYS04ZjM3LWYxMjg5NmIyOTliZiIsImM0NjllNjg1LWQxNDUtNDIyNS04ZWFmLWNlZjkxMTY5NjIyMSIsIjc2MGUwOWM2LTc2MmItNDVhMC05MzY2LWU1NzFjZTQwODk0YyIsImJmMGQyMGZmLWM4M2QtNGNlNi04NWQ5LWIwYzUwN2Q5MTQ3NSIsImJlNGFmNWYwLTc3MGUtNGU5MC1iN2YwLTllMDRjODY0ZDdhOCIsIjQyYTNlZGYyLWM3ZjMtNDVjNC04NjY1LTMyZTU3Yjc1NjgxMiIsIjhmNDBhZjU1LTU2MTctNDNkMC04MDUyLTI0NDg4ZWRkOWQ2NiIsIjM2YzUyNmFkLWM0OGYtNDY0ZC1hNjg3LWI1MDhkMzIxYWRiNyIsIjRkNzFmNzYzLTQzOGQtNGVkNi05YjZiLTdhYjIzMjUwYmE4OCIsImMwOWFhMWQwLTNhYWItNDRkYy1iMDliLTQzNjFlNGQxZmMzNiIsImQwY2VkMzJiLTdkNTktNGZmYy05MjY4LTNhMjg0ODFjNjE5OSIsImRjMWQ5NzFkLTgyMzktNGNmNS1iMDlkLWFjYWU4YWVhZmJmZSIsImQzMmYwMGFmLTQwNWMtNDBkNC1iMTRmLTBjYzNiZTAyODkyOCIsIjZmNDM0ODJhLWZhYzUtNDI4Zi1iZWQ3LTU4NWU5OTA3OTEzYyIsImQyNmUwNjhhLTdlMTItNDQwMC1iNzk0LWM4Y2Y1NGE3ZmJhOSIsIjYyZWRiZDdiLThkNDYtNGQyYy1hNWExLWRhNWI3OGJhMWQzOCIsIjhiYzJjNWMzLTI0OWQtNGQ3ZS04MTIwLWMzMThmZmM5NjZmZiIsIjE5MGU3OWExLTVkZDMtNGE0YS04NmFlLTMyYWMzYjE2YThiMyIsImRhMGEwMWEyLWEzYzQtNDk2Yi1iYzRmLTFjNDkwZGM5NDc5NCIsIjEzNzA5ZGI1LTQ5YWQtNDg3NC04ZGQ0LTA3OTM0NDMxZmYwMiIsImQ3MjlmOGRmLWI2MzEtNDc1ZC1hY2I1LTFhMThhMDY4OTA1YiIsImNiZWVkMDRhLTIxYmItNGJiNS1iOGFmLTRjN2IyNWRmYzI1MCIsIjBmMzVhZDkyLWU1MTgtNDBjYy04ZDdiLWJkYTVkN2UwNjhiOCIsImVmNDZmNzQ3LWY5OTktNGZmMC1hNjVmLWE3ZmY1YjEyMjY2MiJdLCJpcGFkZHIiOiIxMy45MC4xNjkuMTIxIiwibmFtZSI6IktldmluIE0uIEdhdGVzIiwib2lkIjoiYjQ2Yjk1ZTAtMWY5Yi00ZDViLTlmODMtZWIwMzE1MDA5NTNhIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTEyNDUyNTA5NS03MDgyNTk2MzctMTU0MzExOTAyMS0yODA1NDciLCJwdWlkIjoiMTAwMzdGRkU4MDFBRTgxMCIsInJoIjoiMC5BUm9BdjRqNWN2R0dyMEdScXkxODBCSGJSMFpJZjNrQXV0ZFB1a1Bhd2ZqMk1CTWFBQTQuIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiZ3lVRzFUS3M3YU1kNXhGWGhrMloyM1NQbUxqc2lBR2k3M0RtLTdTTzk1ZyIsInRpZCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsInVuaXF1ZV9uYW1lIjoia2dhdGVzQG1pY3Jvc29mdC5jb20iLCJ1cG4iOiJrZ2F0ZXNAbWljcm9zb2Z0LmNvbSIsInV0aSI6Ik5NZjBhMU5lZzBPSHlRckRJckVHQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfdGNkdCI6MTI4OTI0MTU0N30.ciL4iXWM4sDvXfMa9uPll3PpG6vUJNn4p93pxx8YuwEjsmhKsve2rTAXjObI28pJH8OKpMxi7Y2dLD9WIqzPdENPXhXQePcXfSxjKNgZmv0nsiNwbeiKQzwp--3ugdt3WjLethWqySBWK7585Y0WKg50JnUXqmZ_-Jzpo_nBMbWEFypg0AmRLZ0TkvhJiuIbdSxcN-5sswB46XvpVCDKiThN2z9wvHvpT0yNNMgkyU_IVUqHLxWGOej754A9WuGrrAyHM1HsytTP6UwhHIZzy_O0fS4IMRnsucjIgHRJ-ksWHUjTTsnFhxWsNMHWi3XWAJ02wpBACNJPX0AgXA7dvQ";
let auth = {headers: {'Authorization': accessToken, 'Content-Type': 'application/json'}}

const baseUrl: string = `https://management.azure.com/subscriptions/${executionContext.getSubscriptionId()}/`;

// function createApi(apimRg: string, apimName: string, apiName: string, displayName: string) {

//     const createApiUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "?api-version=" + apiVersion;

//     const body = {
//         "id" : "/apis/" + apiName,
//         "name" : apiName,
//         "properties" : {
//             "displayName" : displayName,
//             "protocols" : ["https"],
//             "description" : "Test",
//             "path" : apiName
//         }
//     }
//     return axios.put(baseUrl + createApiUrl, body, auth)
//         .then(function (response: any) {
//             return 1
//         })
//         .catch(function(error: any) {
//             return 0
//         })
// }

// Get access key from function
// # https://docs.microsoft.com/en-us/azure/api-management/import-function-app-as-api#authorization -- Host key auto created inside function, TODO, using defualt for now

// Add function access key to APIM
function apimAddKeys(apimRg: string, apimName: string, apiName: string, functionKey: any) {
    const addKeysUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/namedValues/" + apiName + "-key?api-version=" + apiVersion
    const addKeysBody = {
        "id" : "/namedValues/" + apiName + "-key",
        "name" : apiName + "-key",
        "properties" : {
            "displayName" : apiName + "-key",
            "value" : functionKey,
            "tags" : ["key","function","auto"],
            "secret" : "true"
        }
    }

    return axios.put(baseUrl + addKeysUrl, addKeysBody, auth)
        .then(function (response: any) {
            return 1;
        })
        .catch(function (error: any) {
            return 0;
        })
}

// Add function as APIM Backend
function addApimBackend(apimRg: string, apimName: string, apiName: string, functionAppName: string, functionUrl: string) {
    const backendUrl = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/backends/" + apiName + "?api-version=" + apiVersion
    let backend_body:any;
    const backendBody = backend_body = {
        "id": apiName,
        "name": apiName,
        "properties": {
            "description": functionAppName,
            "url": 'https://' + functionUrl + '/api',
            "protocol": "http",
            "resourceId": "https://management.azure.com/subscriptions/811ac24a-7a5f-41a7-acff-8dd138042333/resourceGroups/Split/providers/Microsoft.Web/sites/SplitTestFunction",
            "credentials": {
                "header": {
                    "x-functions-key": ["{{" + apiName + "-key}}"]
                }
            }
        }
    }
    return axios.put(baseUrl + backendUrl, backendBody, auth)
        .then(function (response: any) {
            return 1;
        })
        .catch(function (error: any) {
            return 0;
        })
}

function parseOperation(item: { properties: { name: string; invoke_url_template: string; }; }, binding: { [x: string]: any; route: string | any[]; }, method: string) {
    let op:any = {}
    let letter:string;
    op['method'] = method
    op['templateParameters'] = [];
    op['operation_display_name'] = item.properties.name
    op['operation_name'] = method.toLowerCase() + '-' + item.properties.name.toLowerCase();
    if ('route' in binding) {
        op['urlTemplate'] = binding['route']
        let parameters = [];
        var ind = 0;
        var start = 0;
        for (letter of binding.route) {
            if (letter == '{') {
                start = ind + 1;
            }
            if (letter == '}') {
                parameters.push(binding.route.slice(start,ind))
            }
            ind += 1;
        }
        if (parameters.length > 0) {
            op.templateParameters = parameters
        }
    }
    else {
        op.urlTemplate = item.properties.invoke_url_template.split('.net/api').slice(-1)[0]
    }
    return op;
}

// Add operation
function addOperation(apimRg: string, apimName: string, apiName: string, operationName: string, operationDisplayName: any, urlTemplate: any, method: any, parameters: any) {
    let operationUrl:string = "resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "?api-version=" + apiVersion
    let parsedParams = []
    let p:any;
    for (p of parameters) {
        parsedParams.push({
            "name": p,
            "type": "",
            "values": [],
            "required": "true"
        })
    }

    const operationBody = {
        "id": "/apis/" + apiName + "/operations/" + operationName,
        "name": operationName,
        "properties": {
            "displayName": operationDisplayName,
            "description": "",
            "urlTemplate": urlTemplate,
            "method": method,
            "templateParameters": parsedParams,
            "responses": []
        }
    }

    return axios.put(baseUrl + operationUrl, operationBody, auth)
        .then(function (response: any) {
            // console.log('Success 4');
        })
        .catch(function (error: any) {
            // console.log('Fail 4');
            // console.log(error)
        })
}

// Add policies
function addPolicy(apimRg: string, apimName: string, apiName: string, operationName: string, backendName: string) {
    let policyUrl:string = "/resourceGroups/" + apimRg + "/providers/Microsoft.ApiManagement/service/" + apimName + "/apis/" + apiName + "/operations/" + operationName + "/policies/policy?api-version=2021-01-01-preview"
    let policyBody:any = {
        "properties": {
            "format": "rawxml",
            "value": "<policies>\n    <inbound>\n        <base />\n        <set-backend-service id=\"apim-generated-policy\" backend-id=\"" + backendName + "\" />\n    </inbound>\n    <backend>\n        <base />\n    </backend>\n    <outbound>\n        <base />\n    </outbound>\n    <on-error>\n        <base />\n    </on-error>\n</policies>"
        }
    }
    return axios.put(baseUrl + policyUrl, policyBody, auth)
        .then(function (response: any) {
            // console.log('Success 5');
        })
        .catch(function (error: any) {
            // console.log('Fail 5');
        })
}

async function main() {

    const credential = executionContext.getCredential();
    const client = new WebSiteManagementClient(credential, executionContext.getSubscriptionId());

    // TODO: use credential with SDK
    // Kevin H - Temporary to have the existing implementation successfully run
    accessToken = (await credential.getToken("https://management.azure.com"))?.token!;
    // accessToken = ""
    auth = {headers: {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json'}}

    // Get URL of Function App
    console.log('Getting Function App URL...')
    const functionAppUrl: string | undefined = await getFunctionAppURL(client, functionRg, functionAppName)
    console.log(functionAppUrl);

    // Get list of individual functions within function app
    console.log('Getting Functions...')
    const functions = await getFunctions(client, functionRg, functionAppName);
    //console.log(functions)
    // console.log(functions.map((x: { properties: { name: any; }; }) => x.properties.name));

    // Get key for functions
    console.log('Getting Function Key...')
    const defaultKey = await getFunctionKey(client, functionRg, functionAppName, apimName)
    //const defaultKey = await getFunctionKey(functionRg, functionAppName)

    console.log('Found Key: ' + defaultKey);

    // Create API within APIM
    console.log('Creating new API within API Management...')
    // const createApiResult = await createApi(apimRg, 'lithograph-test', apiName, displayName);
    const createApiResult = await createAPI(apimRg, apimName, apiName, displayName, credential, executionContext.getSubscriptionId())

    if (createApiResult == 1) {
        //console.log('Successfully created API');
        console.log('*****Successfully called the API');
    } else {
        console.log('#####FAILED to create new API');
    }

    // Add Azure Function Keys to APIM
    console.log('Adding Function Keys to API Management...');
    const apimKeyPromise = await apimAddKeys(apimRg, 'lithograph-test', apiName, defaultKey);
    if (apimKeyPromise == 1) {
        console.log('Success');
    } else {
        console.log('Failed to add keys');
    }
    
    // Add Function as Backend in APIM
    console.log('Adding Function App as an API Management Backend...');
    const apimBackendPromise = await addApimBackend(apimRg, 'lithograph-test', apiName, functionAppName, functionAppUrl as string);
    if (apimBackendPromise == 1) {
        console.log('Success');
    } else {
        console.log('Failed to add Backend');
    }

    let operationsInfo = [];
    let item:any;
    let binding:any;
    let method:any;
    for (item of functions) {
        for (binding of item.properties.config.bindings) {
            if (binding.type == 'httpTrigger') {
                for (method of binding.methods) {
                    const op = parseOperation(item, binding, method);
                    addOperation(apimRg, 'lithograph-test', apiName, op.operation_name, op.operation_display_name, op.urlTemplate, op.method, op.templateParameters);
                    addPolicy(apimRg, 'lithograph-test', apiName, op.operation_name, apiName);
                }
            }
        }
    }
    console.log('Successful Run')
}

main()
