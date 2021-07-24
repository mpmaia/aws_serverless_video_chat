
export type MessageType = "connected" | "disconnected" | "offer" | "answer" | "ice";

export type SDP = string;
export type OfferPayload = RTCSessionDescriptionInit;
export type AnswerPayload = RTCSessionDescriptionInit;
export type ICEPayload = RTCIceCandidateInit;


export interface ConnectionPayload {
    userId: string;
}

export interface WsBaseMessage {
    action: string;
    type: MessageType;
    from?: string;
    destination?: string;
}

export interface WsMessageConnection extends WsBaseMessage {
    type: "connected" | "disconnected";
    payload: ConnectionPayload;
}

export interface WsMessageOffer extends WsBaseMessage {
    type: "offer";
    payload: OfferPayload;
}

export interface WsMessageAnswer extends WsBaseMessage {
    type: "answer";
    payload: AnswerPayload;
}

export interface WsMessageICE extends WsBaseMessage {
    type: "ice";
    payload: ICEPayload;
}

export type WsMessage = WsMessageConnection | WsMessageOffer | WsMessageAnswer | WsMessageICE;
