import { Injectable } from '@angular/core';
import { LoggingService, Logger } from '../../logging/logging.service';
import { Message, MessageCategory, Messages, ResponsePayload } from '../../messages';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

declare var window: any;

export enum ConnectionStatus {
    OPENING,
    OPEN,
    CLOSED
}

/**
 * Internally used type to keep track of reply subscription
 */
interface PendingRequest {
    request: Message;
    resolve(response: Message);
    reject(error: Error);
}

type RequestMap = { [key: string]: PendingRequest; };

@Injectable()
export class BackendConnectionService {

    private onOpenDelay: number = 500; // milliseconds to delay connection.

    private log: Logger;
    // used to auto-generate message ids.
    private nextId: number = 0;

    // the endpoint to which we have to connect
    private wsUrl: string;

    // the current websocket. If null it means that it has been closed and we're not connected.
    private socket: any = null;

    private socketOpenPromise: Promise<BackendConnectionService>;
    private pendingRequestsById: RequestMap = {};
    private connectionStatusSubject: Subject<ConnectionStatus>;
    private feedSubj: Subject<Message>;

    constructor(logFactory: LoggingService) {
        this.log = logFactory.getLogger('backend-connection-service');
        this.wsUrl = this.discoverBackendUrl();
        this.connectionStatusSubject = new ReplaySubject<ConnectionStatus>(1); // cache last value
        this.feedSubj = new Subject();
    }

    private discoverBackendUrl(): string {
        return 'ws://' + window.location.hostname + ':' + 8349 + '/chat';
    }

    /**
     * Returns a promise that will be resolved when the websocket will be open.
     * Called only when we have already retrieved the url where to connect to.
     */
    private connect(wsUrl: string): Promise<BackendConnectionService> {
        // if we already have a socket open, return
        if (this.socket) {
            return this.socketOpenPromise;
        }

        this.log.info('connecting to [' + wsUrl + ']');
        this.socket = new WebSocket(wsUrl);
        this.connectionStatusSubject.next(ConnectionStatus.OPENING);
        this.socketOpenPromise = new Promise((resolve, reject) => {

            let onOpen = (event) => {
                this.log.info('connected to [' + wsUrl + ']');
                resolve(this); //
                this.connectionStatusSubject.next(ConnectionStatus.OPEN);
            }

            // FIXME just wait some time after connection to send the first message.
            // the server implementation might lose a frame if sent immediately after login.
            let delayedOnOpen = (event) => {
                setTimeout(() => { onOpen(event); }, this.onOpenDelay);
            }

            this.socket.onopen = delayedOnOpen;

            this.socket.onclose = (event) => {
                this.log.info('ws [connection] closed [' + event + ']');
                this.socket = null;
                this.socketOpenPromise = null;

                reject(new Error('connection was closed: ' + event.code + '/' + event.reason)); // rejects the open connection promise
                this.connectionStatusSubject.next(ConnectionStatus.CLOSED); // notify status closed

                // reject all pending requests and their promises with
                this.log.trace('rejecting all pending request');
                this.rejectPendingRequests(this.pendingRequestsById, 'connection to [' + wsUrl + '] went down with event [' + JSON.stringify(event) + ']');
            }
        });

        this.socket.onerror = (event) => {
            this.log.info('ws [connection] error [' + event + ']')
        }

        this.socket.onmessage = (event) => {
            let msg = JSON.parse(event.data);
            this.handleInboundMsg(msg);
        }

        // finally returning the socket open promisse
        return this.socketOpenPromise;
    }

    /**
     * Client can use this subject to subcsribe to status updates.
     * I.e. to know asynchronously when connection goes down.
     */
    public getConnectionStatus(): Observable<ConnectionStatus> {
        return this.connectionStatusSubject;
    }

    public getFeed(): Observable<Message> {
        return this.feedSubj;
    }

    /**
     * Sends a request and returns a promise for the related response.
     * If the service is not connected, the connection will be attempted and the provided message will be sent 
     * only when connection will be succesfully established.
     */
    public send(msg: Message): Promise<Message> {
        return this.connect(this.wsUrl).then(() => {
            return this.doSendRequest(msg);
        });
    }

    /**
     * Sends a message and return a promise for its response.
     * This function is supposed to be called after the connection promise is resolved.
     * Technically the connection is assumed to be up when this is called.
     */
    private doSendRequest(message: Message): Promise<Message> {
        let msg: Message = Object.assign({}, message);

        // decorating the message with the next id.
        msg.id = (this.nextId++).toString();

        // the response promise will be resolved/rejected when 
        // dealing with the inbound message flow
        let responsePromise = new Promise((resolve, reject) => {
            this.pendingRequestsById[msg.id] = {
                request: msg,
                resolve: resolve,
                reject: reject
            };

            let serializedMsg: string = JSON.stringify(msg);

            this.socket.send(serializedMsg);

            this.log.info('ws [out] [' + serializedMsg + ']');
        });
    
        return responsePromise;
    }

    /**
     * Rejects all the pending requests with the given error description.
     */ 
    private rejectPendingRequests(requestsById: RequestMap, errorDescription: string) {
        for (let id in requestsById) {
            let request = requestsById[id];
            this.log.info('ws synthetically rejecting request [' + id + '] because connection went down');
            request.reject(new Error(errorDescription));

            delete requestsById[id]; // forget about this request. We will not receive a response anymore
        }
    }

    /**
     * Handle the inbound message flow. Matching resolving/rejecting pending promises
     * matching them with the requests
     */
    private handleInboundMsg(msg: Message) {
        this.log.info('ws [in] [' + JSON.stringify(msg) + ']');

        switch (Messages.category(msg)) {
            case 'response':
                this.handleResponse(msg);
                break;
            case 'feed':
                this.handleFeed(msg);
                break;
            default:
                this.log.info('Ignoring inbound msg: not a feed nor a response [' + JSON.stringify(msg) + ']');
                break;
        }
    }

    private handleResponse(msg: Message) {
        let request = this.pendingRequestsById[msg.id];
        if (request) {
            let payload: ResponsePayload = msg.payload as ResponsePayload;
            switch (payload.status) {
                case 'ok': 
                    request.resolve(msg);
                    break;
                case 'ko':
                    let why: string = (payload.why ? payload.why : "no details why request failed");
                    request.reject(new Error(why));
                    break;
                default:
                    request.reject(new Error('Unsupported response status: [' + payload.status + ']'));
            }

            delete this.pendingRequestsById[msg.id]; // it's not pending anymore.

        } else {
            this.log.info('Ignoring inbound response with id [' + msg.id + '] no matching originating request was found');
        }
    }

    private handleFeed(msg: Message) {
        this.feedSubj.next(msg);
    }
}

