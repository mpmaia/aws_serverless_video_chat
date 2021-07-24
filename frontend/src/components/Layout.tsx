import React, {useCallback, useEffect, useRef} from 'react';
import {styled} from '@material-ui/core';
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

const LayoutRoot = styled('div')(
    ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        overflow: 'hidden',
        width: '100%'
    })
);

const LayoutWrapper = styled('div')(
    ({ theme }) => ({
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 64,
        [theme.breakpoints.up('lg')]: {
            paddingLeft: 320
        }
    })
);

const LayoutContainer = styled('div')({
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden'
});

const LayoutContent = styled('div')({
    width: '100%',
    height: '100%',
    maxHeight: '100%'
});

const MainLayout = () => {
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [openAddContact, setOpenAddContact] = useState(false);
    const [selectedContact, setSelectedContact] = useState<string | null>(null);
    const contactsAPI = useRef<ContactsAPI | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        Auth.currentSession().then((session) => {
            if(session && session.isValid()) {
                setAuthenticated(true);
                const token = session.getIdToken().getJwtToken();

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

export default MainLayout;
