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
                        <AlertDialog open={message!==null} message={message!} onClose={() => setMessage(null)}/>
                    </LayoutContent>
                </LayoutContainer>
            </LayoutWrapper>
        </LayoutRoot>
    );
};

export default Main;
