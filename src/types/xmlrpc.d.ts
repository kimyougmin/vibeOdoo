declare module 'xmlrpc' {
  interface XmlRpcClient {
    methodCall(method: string, params: any[], callback: (error: any, value: any) => void): void;
  }

  interface XmlRpcClientOptions {
    url: string;
  }

  function createClient(options: XmlRpcClientOptions): XmlRpcClient;
  
  export = { createClient };
} 