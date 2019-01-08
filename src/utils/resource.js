const noop = require("./noop"),
    isNode = require("./isNode"),
    merge = require("./merge"),
    XMLHttpRequest = isNode ? require("xmlhttprequest").XMLHttpRequest : XMLHttpRequest,
    setTimeout = require("./setTimeout");
/**
 * refrenece:
 * https://github.com/AnalyticalGraphicsInc/cesium/blob/ae98c6209eef0c92a029a6eca83e8bdd6c1aa089/Source/Core/Resource.js
 */
const xhrBlobSupported = (function () {
    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '#', true);
        xhr.responseType = 'blob';
        return xhr.responseType === 'blob';
    } catch (e) {
        return false;
    }
})();

const setXhrHeader = function(xhr,headers){
    for(var key in headers)
        if(headers.hasOwnProperty(key))
            xhr.setRequestHeader(key, headers[key]);
}

const makeRequest = function(options){
    const responseType = options.responseType,
        headers = merge(options.headers),
        overrideMimeType  = options.overrideMimeType,
        method = options.method,
        url = options.url,
        data = options.data;
    const promise = new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method,url,true);
        overrideMimeType?   xhr.overrideMimeType(overrideMimeType):null;
        setXhrHeader(xhr,headers);
        xhr.responseType = responseType;
        xhr.onload = function(){
            if ((xhr.status < 200 || xhr.status >= 300)&&xhr.status === 0) {
                reject("error");
                return;
            }
            const response = xhr.response,
                browserResponseType = xhr.responseType;
            if (method === 'HEAD' || method === 'OPTIONS') {
                var responseHeaderString = xhr.getAllResponseHeaders();
                var splitHeaders = responseHeaderString.trim().split(/[\r\n]+/);
                var responseHeaders = {};
                splitHeaders.forEach(function (line) {
                    var parts = line.split(': ');
                    var header = parts.shift();
                    responseHeaders[header] = parts.join(': ');
                });
                resolve(responseHeaders);
                return;
            }
            if(xhr.status === 204){
                //accpet no content
                resolve();
            }else if (response&&responseType){
                resolve(response);
            }else if (responseType  === 'json'&&response ==='string'){
                try {
                    resolve(JSON.parse(response));
                } catch (e) {
                    reject(e);
                }
            }else if( (browserResponseType ===""||browserResponseType ==="doucment") && xhr.responseXML){
                resolve(xhr.responseXML);
            }else if((browserResponseType === '' || browserResponseType === 'text') && xhr.responseText){
                resolve(xhr.responseText);
            }else{
                reject('Invalid XMLHttpRequest response type.');
            }
        }
        xhr.onerror = function(e){
            reject("Invalid request");
        }
        xhr.send(data);
    });
    //
    return promise;
}

const fetch = function(options){
    options = options || {};
    options.method = "GET";
    return makeRequest(options);
};

const fetchArrayBuffer = function(url, headers, token){
    headers.Accept = headers.Accept&&token? headers.Accept + ';'+ "access_token "+token:headers.Accept;
    return fetch({
        url:url,
        headers :headers,
        responseType : 'arraybuffer'
    });
};

module.exports = {
    fetchArrayBuffer
};