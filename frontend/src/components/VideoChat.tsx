import React, {useCallback, useEffect} from 'react';
import {useRef} from "react";
import './video-chat.css';
import adapter from 'webrtc-adapter';

const mediaConstraints = {
    offerToReceiveAudio:true,
    offerToReceiveVideo:true
};

export interface RtcOffer {
    descriptor: RTCSessionDescriptionInit;
    from: string;
}

export interface RtcAnswer {
    descriptor: RTCSessionDescriptionInit;
    from: string;
}

export interface PeerConnectionAdapter {
    addIceCandidate: (candidate: RTCIceCandidateInit | RTCIceCandidate) => Promise<void>;
    setOffer: (offer: RtcOffer) => Promise<void>;
    setAnswer: (answer: RtcAnswer) => Promise<void>;
    sendMessage: (from: string, message: string) => Promise<void>;
    call: (remoteContact: string) => Promise<void>;
}

interface VideoChatProps {
    onError: (msg: string) => void;
    onCandidate: (remoteContact: string, candidate: RTCIceCandidate) => void;
    onOffer: (remoteContact: string, offer: RTCSessionDescription) => void;
    onAnswer: (remoteContact: string, answer: RTCSessionDescriptionInit) => void;
    onMessage: (remoteContact: string, message: string) => void;
    onChangeConnectionState: (connectionState: RTCIceConnectionState) => void;
    getPeerConnectionAdapter: (peerConnection: PeerConnectionAdapter) => void;
    enabled: boolean;
}

interface ChatMessage {
    from: string;
    message: string;
}

export const VideoChat = ({onError, enabled, onCandidate, onOffer, onAnswer, getPeerConnectionAdapter, onMessage, onChangeConnectionState}: VideoChatProps) => {

    const remoteVideo = useRef<HTMLVideoElement | null>();
    const localVideo = useRef<HTMLVideoElement | null>();
    const localStream = useRef<MediaStream | null>();
    const remoteStream = useRef<MediaStream | null>();
    const peerConnection = useRef<RTCPeerConnection | null>();
    const dataChannel = useRef<RTCDataChannel | null>();
    const pcAdapter = useRef<PeerConnectionAdapter>({
        addIceCandidate: async (candidate: RTCIceCandidateInit | RTCIceCandidate): Promise<void> =>  {
            if(peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(candidate);
                } catch(e) {
                    console.log('addIceCandidate', e);
                }
            }
        },
        setOffer: async (offer: RtcOffer): Promise<void> =>  {
            await acceptOffer(offer);
        },
        setAnswer: async (answer: RtcAnswer): Promise<void> => {
            await acceptAnswer(answer);
        },
        call: async (remoteContact: string): Promise<void> => {
            await call(remoteContact);
        },
        sendMessage: async (from: string, message: string): Promise<void> => {
            await send(from, message);
        }
    });

    const setDataChannelCallbacks = useCallback((remoteContact: string)=> {
        if(dataChannel.current) {
            dataChannel.current.onopen = e => {
                console.log("data channel onopen", e);
            };
            dataChannel.current.onmessage = e => {
                const msg: ChatMessage = JSON.parse(e.data);
                console.log('data channel onmessage:', msg);
                onMessage(msg.from, msg.message);
            };
            dataChannel.current.onclose = () => {
                console.log('datachannel onclose');
                if(remoteStream.current) {
                    remoteStream.current.getVideoTracks()[0].stop();
                }
            };
        }
    }, [onMessage, dataChannel, remoteStream]);

    const remoteContact = useRef<string | null>(null);
    const call = useCallback(async (contact: string): Promise<void> => {
        console.log('connect: ', contact, adapter.browserDetails);
        if(peerConnection.current) {
            remoteContact.current = contact;
            dataChannel.current = peerConnection.current.createDataChannel('chat');
            setDataChannelCallbacks(contact);
            const offer = await peerConnection.current.createOffer(mediaConstraints);
            console.log("Creating offer: ", offer);
            if(peerConnection.current) {
                await peerConnection.current.setLocalDescription(offer);
                onOffer(contact, new RTCSessionDescription(offer));
            }
        }
    }, [peerConnection, dataChannel]);

    const acceptOffer = useCallback(async (offer: RtcOffer) => {
        if(peerConnection.current) {
            console.log("Accepting offer, setting remote descriptor: ", offer);
            remoteContact.current = offer.from;
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer.descriptor));
            const answer = await peerConnection.current.createAnswer(mediaConstraints);
            await peerConnection.current.setLocalDescription(new RTCSessionDescription(answer));
            onAnswer(offer.from, answer);
        }
    }, [peerConnection]);

    const acceptAnswer = useCallback(async (answer: RtcAnswer) => {
        if(peerConnection.current) {
            console.log("Accepting answer, setting remote descriptor: ", answer);
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer.descriptor));
        }
    }, [peerConnection]);

    const send = useCallback(async (from: string, message: string) => {
        if(peerConnection.current && dataChannel.current) {
            console.log("Sending message from: " + from, message);
            dataChannel.current.send(JSON.stringify({from, message}));
        }
    }, [peerConnection, dataChannel]);

    useEffect(() => {
        if(enabled) {
            console.log("Init Media...");
            // @ts-ignore
            navigator.mediaDevices.getUserMedia({audio: true, video: true})
                .catch(e => onError('Failed to open video stream: ' + e.name))
                .then(stream => {

                    if(localVideo.current && stream) {
                        localVideo.current.srcObject = localStream.current = stream;
                        localVideo.current.play();
                    }

                    peerConnection.current = new RTCPeerConnection({iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, {'urls': 'stun:stun.services.mozilla.com'}]});
                    peerConnection.current.onicecandidate = e => {
                        console.log('onicecandidate', e);
                        if (e.candidate) {
                            if(remoteContact.current) {
                                onCandidate(remoteContact.current, e.candidate);
                            } else {
                                onError("Remote endpoint not set");
                            }
                        } else {
                            console.log("Invalid candidate", e);
                        }
                    };

                    peerConnection.current.ontrack = e => {
                        console.log('ontrack', e)
                        if(e.track && remoteVideo.current) {
                            remoteStream.current = e.streams[0];
                            remoteVideo.current.srcObject = remoteStream.current;
                        }
                    };

                    peerConnection.current.ondatachannel = e => {
                        console.log('ondatachannel', e)
                        dataChannel.current = e.channel;
                        if(remoteContact.current) {
                            setDataChannelCallbacks(remoteContact.current);
                        }
                    };

                    peerConnection.current.oniceconnectionstatechange = (event: any) => {
                        if (peerConnection.current) {
                            console.log(`ICE state: ${peerConnection.current.iceConnectionState}`);
                            console.log('ICE state change event: ', event);
                            onChangeConnectionState(peerConnection.current.iceConnectionState);
                            switch(peerConnection.current.iceConnectionState) {
                                case "disconnected":
                                case "closed":
                                    remoteContact.current = null;
                            }
                        }
                    }

                    if(localStream.current) {
                        console.log("Adding tracks...")
                        for(let track of localStream.current.getTracks()) {
                            console.log("Adding track: ", track.id)
                            peerConnection.current.addTrack(track, localStream.current)
                        }
                    }
                    console.log("Init ok.");
                });
        }
        return () => {
            if (localStream.current) {
                localStream.current.getVideoTracks()[0].stop();
            }
        }
    }, [enabled]);

    useEffect(()=> {
         if(getPeerConnectionAdapter) {
             getPeerConnectionAdapter(pcAdapter.current);
         }
    }, [getPeerConnectionAdapter]);

    return (
        <div className={`video-chat`}>
            <video className="local-stream" ref={(ref) => localVideo.current = ref} autoPlay muted ></video>
            <video className="remote-stream" ref={(ref) => remoteVideo.current = ref} autoPlay></video>
        </div>
    );
}
