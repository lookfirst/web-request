// Project: https://github.com/davetemplin/web-request/
// Written by: Dave Templin <https://github.com/davetemplin/>

import * as http from 'http';
import * as stream from 'stream';
import * as url from 'url';
//import * as FormData from 'form-data';
var request = require('request');

export var throwResponseError = false;

export async function get(uri: string, options?: RequestOptions): Promise<Response<string>> { return await create<string>(uri, Object.assign({}, options, {method: 'GET'})).response; }
export async function post(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return await create<string>(uri, Object.assign({}, options, {method: 'POST'}), content).response; }
export async function put(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return await create<string>(uri, Object.assign({}, options, {method: 'PUT'}), content).response; }
export async function patch(uri: string, options?: RequestOptions, content?: any): Promise<Response<string>> { return await create<string>(uri, Object.assign({}, options, {method: 'PATCH'}), content).response; }
export async function head(uri: string, options?: RequestOptions): Promise<Response<void>> { return await create<void>(uri, Object.assign({}, options, {method: 'HEAD'})).response; }
export async function del(uri: string, options?: RequestOptions): Promise<Response<string>> { return await create<string>(uri, Object.assign({}, options, {method: 'DELETE'})).response; }
export async function json<T>(uri: string, options?: RequestOptions): Promise<T> { return (await create<T>(uri, Object.assign({}, options, {json: true})).response).content; }


export function create<T>(uri: string, options?: RequestOptions, content?: any): Request<T> {
    options = Object.assign({}, options, {url: uri});
    
    if (options.jar === true)
        options.jar = request.jar();
    
    if (content !== undefined)
        options.body = content;
       
    var instance: Request<T>; 
    var promise = new Promise<Response<T>>((resolve, reject) => {
        instance = request(options, (err: Error, message: http.IncomingMessage, body: T) => {
            if (!err) {
                var response = new Response<T>(instance, message, body);
                if (message.statusCode < 400 || !throwResponseError)
                    resolve(response);
                else
                    reject(new ResponseError(response));
            }
            else {
                reject(new RequestError(err, instance));
            }
        });        
    });
    
    instance.options = options;
    instance.response = promise;
    
    return instance;
}

export function defaults(options: RequestOptions): void {
    request.defaults(options);
}

export interface AuthOptions {
    user?: string;
    username?: string;
    pass?: string;
    password?: string;
    sendImmediately?: boolean;
    bearer?: string;
}

export interface AWSOptions {
    secret: string;
    bucket?: string;
}

export interface Cookie extends Array<CookieValue> {
    //constructor(name: string, req: Request): void;
    str: string;
    expires: Date;
    path: string;
    toString(): string;
}

export interface CookieJar {
    setCookie(cookie: Cookie, uri: string | url.Url, options?: any): void
    getCookieString(uri: string | url.Url): string
    getCookies(uri: string | url.Url): Cookie[]
}

export interface CookieValue {
    name: string;
    value: any;
    httpOnly: boolean;
}

export interface Headers {
    [key: string]: any;
}

export interface HttpArchiveRequest {
    url?: string;
    method?: string;
    headers?: NameValuePair[];
    postData?: {
        mimeType?: string;
        params?: NameValuePair[];
    }
}

export interface Multipart {
    chunked?: boolean;
    data?: {
        'content-type'?: string,
        body: string
    }[];
}

export interface NameValuePair {
    name: string;
    value: string;
}

export interface RequestPart {
    headers?: Headers;
    body: any;
}

export interface OAuthOptions {
    callback?: string;
    consumer_key?: string;
    consumer_secret?: string;
    token?: string;
    token_secret?: string;
    verifier?: string;
}

export interface Request<T> extends stream.Stream {
    readable: boolean;
    writable: boolean;

    getAgent(): http.Agent;
    pipeDest(dest: any): void;
    setHeader(name: string, value: string, clobber?: boolean): Request<T>;
    setHeaders(headers: Headers): Request<T>;
    qs(q: Object, clobber?: boolean): Request<T>;
    form(): any; //FormData.FormData;
    form(form: any): Request<T>;
    multipart(multipart: RequestPart[]): Request<T>;
    json(val: any): Request<T>;
    aws(opts: AWSOptions, now?: boolean): Request<T>;
    auth(username: string, password: string, sendInmediately?: boolean, bearer?: string): Request<T>;
    oauth(oauth: OAuthOptions): Request<T>;
    jar(jar: CookieJar): Request<T>;

    on(event: string, listener: Function): Request<T>;
    on(event: 'request', listener: (req: http.ClientRequest) => void): Request<T>;
    on(event: 'response', listener: (resp: http.IncomingMessage) => void): Request<T>;
    on(event: 'data', listener: (data: Buffer | string) => void): Request<T>;
    on(event: 'error', listener: (e: Error) => void): Request<T>;
    on(event: 'complete', listener: (resp: http.IncomingMessage, body?: string | Buffer) => void): Request<T>;

    write(buffer: Buffer, cb?: Function): boolean;
    write(str: string, cb?: Function): boolean;
    write(str: string, encoding: string, cb?: Function): boolean;
    write(str: string, encoding?: string, fd?: string): boolean;
    end(): void;
    end(chunk: Buffer, cb?: Function): void;
    end(chunk: string, cb?: Function): void;
    end(chunk: string, encoding: string, cb?: Function): void;
    pause(): void;
    resume(): void;
    abort(): void;
    destroy(): void;
    toJSON(): Object;
    
    options: RequestOptions; // extension
    response: Promise<Response<T>>; // extension
}

export interface RequestOptions {
    baseUrl?: string;
    jar?: CookieJar|boolean;
    formData?: Object;
    form?: Object|string;
    auth?: AuthOptions;
    oauth?: OAuthOptions;
    aws?: {secret: string; bucket?: string;};
    hawk?: {credentials: any;};
    qs?: any;
    json?: any;
    multipart?: RequestPart[]|Multipart;
    agentOptions?: any;
    agentClass?: any;
    forever?: any;
    host?: string;
    port?: number;
    method?: string;
    headers?: Headers;
    body?: any;
    followRedirect?: boolean|((response: http.IncomingMessage) => boolean);
    followAllRedirects?: boolean;
    maxRedirects?: number;
    encoding?: string;
    pool?: any;
    timeout?: number;
    proxy?: any;
    strictSSL?: boolean;
    gzip?: boolean;
    preambleCRLF?: boolean;
    postambleCRLF?: boolean;
    key?: Buffer;
    cert?: Buffer;
    passphrase?: string;
    ca?: Buffer;
    har?: HttpArchiveRequest;
    useQuerystring?: boolean;
    url?: string; // extension
}

export class RequestError<T> extends Error {
    constructor(err: Error, public request: Request<T>) {
        super(err.message);
        this.request = request;
    }
}

export class Response<T> {
    request: Request<T>;
    message: http.IncomingMessage;
    private body: T
    
    constructor(request: Request<T>, message: http.IncomingMessage, body: T) {
        this.request = request;
        this.message = message;
        this.body = body;
    }
    
    get charset(): string { return parseContentType(this.message.headers['content-type']).charset; }
    get content(): T { 
        return <T>this.body; }  
    get contentLength(): number { 
        if ('content-length' in this.message.headers)
            return parseInt(this.message.headers['content-length']);
        else if (typeof this.body === 'string')
            return (<any>this.body).length;
     }
    get contentType(): string { return parseContentType(this.message.headers['content-type']).contentType; }
    get cookies(): Cookie[] {
        if (typeof this.request.options.jar === 'object') {
            var jar = <CookieJar>this.request.options.jar;
            return jar.getCookies(this.request.options.url); 
        }
    }
    get headers(): Headers { return this.message.headers; }
    get httpVersion(): string { return this.message.httpVersion; }
    get lastModified(): Date { return new Date(this.message.headers['last-modified']); }    
    get method(): string { return this.message.method || (<any>this.message).request.method; }
    get server(): string { return this.message.headers['server']; }
    get statusCode(): number { return this.message.statusCode; }
    get statusMessage(): string { return this.message.statusMessage; }        
    get uri(): Uri { return (<any>this.message).request.uri; }
}

export class ResponseError<T> extends Error {
    constructor(public response: Response<T>) {
        super(response.statusMessage);
        this.response = response;
    }
}

export interface Uri {
    auth: string;
    hash: string;
    host: string;
    hostname: string;
    href: string;
    path: string;
    pathname: string;
    port: number;
    protocol: string;
    query: string;
    search: string;
}

function parseKeyValue(text: string): {key: string; value: string} {
    var i = text.indexOf('=');
    return {
        key: i > 0 ? text.substring(0, i) : text,
        value: i > 0 ? text.substring(i + 1) : null
    };
}

function parseContentType(text: string): {contentType: string; charset: string;} {
    var list = text ? text.split('; ') : [];
    var tuple1 = list.length > 0 ? parseKeyValue(list[0]) : null;
    var tuple2 = list.length > 1 ? parseKeyValue(list[1]) : null;    
    return {
        contentType: tuple1 ? tuple1.key : null,
        charset: tuple2 && tuple2.key.toLowerCase() === 'charset' ? tuple2.value : null
    };
}