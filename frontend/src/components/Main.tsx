import React, {useCallback, useEffect, useRef} from 'react';
import {useState} from "react";
import Navbar from "./NavBar";
import Sidebar from "./SideBar";
import ContactsAPI from "../api/ContactsAPI";
import AddContactDialog from "./AddContactDialog";
import UsersAPI from "../api/UsersAPI";
import {AlertDialog} from "./AlertDialog";
import {Contact} from "../model/Contact";
import {Auth} from "aws-amplify";
import {User} from "../model/User";
import {WsMessage} from "../model/Messages";
import {WSS_URL} from "../env";
import {useWebSocket} from "react-use-websocket/dist/lib/use-websocket";
import {LayoutContainer, LayoutContent, LayoutRoot, LayoutWrapper} from "./Layout";
import {PeerConnectionAdapter, VideoChat} from "./VideoChat";
import {ChatMessage, TextChat} from "./TextChat";

const Main = () => {
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [openAddContact, setOpenAddContact] = useState(false);
    const [selectedContact, setSelectedContact] = useState<string | null>(null);
    const contactsAPI = useRef<ContactsAPI | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const peerConnection = useRef<PeerConnectionAdapter | null>(null);
    const [rtcConnectionState, setRtcConnectionState] = useState<RTCIceConnectionState>("closed");
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const {
        sendMessage,
        readyState,
    } = useWebSocket(WSS_URL, {
        queryParams: {
            Auth: token?token:''
        },
        onMessage: async event => {
            try {
                const message: WsMessage = JSON.parse(event.data);
                console.log("WS: ", message);
                switch (message.type) {
                    case "connected":
                    case "disconnected":
                        setContacts(contacts => {
                            return contacts.map(contact => contact.contactUserId === message.payload.userId?{...contact, online: message.type==="connected"}:contact);
                        });
                        break;
                    case "offer":
                        console.log("Received offer from " + message.from, message.payload);
                        if(peerConnection.current!=null && message.from) {
                            await peerConnection.current.setOffer({descriptor: message.payload, from: message.from});
                        } else {
                            setMessage("Invalid connection state");
                        }
                        break;
                    case "answer":
                        console.log("Received answer from " + message.from, message.payload);
                        if(peerConnection.current!=null && message.from) {
                            await peerConnection.current.setAnswer({descriptor: message.payload, from: message.from});
                        } else {
                            setMessage("Invalid connection state");
                        }
                        break;
                    case "ice":
                        console.log("Received ice: ", message.payload);
                        if(peerConnection.current!=null) {
                            await peerConnection.current.addIceCandidate(message.payload);
                        } else {
                            setMessage("Invalid connection state");
                        }
                        break;
                }
            } catch (e) {
                console.log(e);
                setMessage(e.message);
            }
        }
    },authenticated && !!token);

    useEffect(() => {
        Auth.currentSession().then((session) => {
            if(session && session.isValid()) {
                setAuthenticated(true);
                const token = session.getIdToken().getJwtToken();
                setToken(token);
                const usersAPI = new UsersAPI(token);
                usersAPI.getUser().then(user => {
                    console.log("Current User: ", user);
                    setCurrentUser(user);
                });

                contactsAPI.current = new ContactsAPI(token);
                contactsAPI.current.getContacts().then((contacts) => {
                    setContacts(contacts);
                });
            } else {
                setAuthenticated(false);
            }
        });
    }, []);

    const logout = useCallback(() => {
        try {
            Auth.signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }, []);

    const onShowAddContact = useCallback(()=> {
        setOpenAddContact(true);
    }, []);

    const onCloseAddContact = useCallback(()=> {
        setOpenAddContact(false);
    }, []);

    const onAddContact = useCallback(async (email: string) => {
        if(authenticated && contactsAPI.current) {
            setOpenAddContact(false);
            try {
                const newContacts = await contactsAPI.current.addContact({email});
                setContacts(newContacts);
            } catch(e) {
                if(e.isAxiosError) {
                    console.log(e.response);
                    setMessage(e.response.data);
                } else {
                    setMessage("Failed to make the request.");
                }
            }
        }
    }, [authenticated]);

    const onContactClicked = useCallback((contact: Contact) => {
        console.log("Selected contact: ", contact);
        setSelectedContact(contact.contactUserId);
    }, []);

    const onContactRemove = useCallback(async (contact: Contact) => {
        console.log("Remove contact", contact);
        if(contactsAPI.current) {
            const contacts = await contactsAPI.current.removeContact(contact);
            setContacts(contacts);
        }
    }, []);

    const onContactChange = useEffect(() => {
        if(selectedContact && peerConnection.current) {
            peerConnection.current.call(selectedContact).catch(e => {
                console.log(e);
                setMessage(e.message);
            });
        }
    }, [selectedContact, peerConnection]);

    const onCandidate = useCallback((remoteContact: string, candidate: RTCIceCandidate) => {
        console.log("onCandidate to " + remoteContact, candidate);
        const wsMessage = {
            action: 'rtc',
            destination: remoteContact,
            type: 'ice',
            payload: candidate.toJSON()
        };
        sendMessage(JSON.stringify(wsMessage));
    }, []);

    const onMessage = useCallback((user: string, message: string) => {
        setMessages((chatMessages) => [JSON.parse(message), ...chatMessages]);
    }, []);

    const sendChatMessage = useCallback((text: string) => {
        const user: string = currentUser && currentUser.email ? currentUser.email : "unknown user";
        if(peerConnection.current) {
            var message: ChatMessage = {message: text, user};
            peerConnection.current.sendMessage(user, JSON.stringify(message));
            setMessages((chatMessages) => [message, ...chatMessages]);
        }
    }, [peerConnection, currentUser]);

    const onOffer = useCallback((userId: string, offer: RTCSessionDescriptionInit) => {
        console.log("onOffer: ", userId, offer);
        const wsMessage: WsMessage = {
            action: 'rtc',
            destination: userId,
            type: 'offer',
            payload: offer
        };
        sendMessage(JSON.stringify(wsMessage));
    }, []);

    const onAnswer = useCallback((userId: string, answer: RTCSessionDescriptionInit) => {
        console.log("onAnswer: ", userId, answer);
        const wsMessage = {
            action: 'rtc',
            destination: userId,
            type: 'answer',
            payload: answer
        };
        sendMessage(JSON.stringify(wsMessage));
    }, []);

    const onChangeConnectionState = useCallback((connectionState: RTCIceConnectionState) => {
        setRtcConnectionState(connectionState);
        switch(connectionState) {
            case "disconnected":
            case "closed":
                setSelectedContact(null);
        }
    }, []);

    return (
        <LayoutRoot>
            <Navbar onNavOpen={() => setMobileNavOpen(true)} authenticated={authenticated} logout={logout} />
            <Sidebar
                onClose={() => setMobileNavOpen(false)}
                open={isMobileNavOpen}
                contacts={contacts}
                onAddContactClick={onShowAddContact}
                onContactClicked={onContactClicked}
                onContactRemove={onContactRemove}
                authenticated={authenticated}
                userName={currentUser?.email}
            />
            <AddContactDialog open={openAddContact} onClose={onCloseAddContact} onConfirm={onAddContact}/>
            <LayoutWrapper>
                <LayoutContainer>
                    <LayoutContent>
                        <VideoChat enabled={authenticated}
                                   onError={(m) => setMessage(m)} onCandidate={onCandidate}
                                   onOffer={onOffer} onAnswer={onAnswer} onMessage={onMessage}
                                   onChangeConnectionState={onChangeConnectionState}
                                   getPeerConnectionAdapter={(pc) => peerConnection.current = pc}/>
                        {rtcConnectionState=="connected"?(
                             <TextChat messages={messages} sendChatMessage={sendChatMessage}/>
                        ): null}
                        <AlertDialog open={message!==null} message={message!} onClose={() => setMessage(null)}/>
                    </LayoutContent>
                </LayoutContainer>
            </LayoutWrapper>
        </LayoutRoot>
    );
};

export default Main;
