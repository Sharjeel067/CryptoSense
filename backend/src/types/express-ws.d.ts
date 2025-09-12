declare module 'express-ws' {
    import * as express from 'express';
    import * as http from 'http';
    import * as ws from 'ws';
  
    function expressWs(
      app: express.Application,
      server?: http.Server,
      options?: object
    ): {
      app: Application;
      getWss: () => ws.Server;
      applyTo: (router: express.Router) => void;
    };
  
    namespace expressWs {
      interface Application extends express.Application {
        ws: (route: string, handler: (ws: ws.WebSocket, req: express.Request) => void) => void;
      }
  
      interface Router extends express.Router {
        ws: (route: string, handler: (ws: ws.WebSocket, req: express.Request) => void) => void;
      }
    }
  
    export = expressWs;
  }