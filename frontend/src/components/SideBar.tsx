import React from 'react';
import { useEffect } from 'react';
import {
    Avatar,
    Box, Button, Divider,
    Drawer,
    Hidden, List, Typography
} from '@material-ui/core';
import ContactLabel from "./ContactLabel";
import {Contact} from "../model/Contact";

type SideBarProps = {
    onClose: ()=>void;
    open: boolean;
    contacts: Contact[];
    userName?: string | null;
    authenticated: boolean;
    onAddContactClick: () => void;
    onContactClicked: (contact: Contact) => void;
    onContactRemove: (contact: Contact) => void;
}

const Sidebar = ({ onClose, open, contacts, onAddContactClick, onContactClicked, onContactRemove, userName, authenticated }: SideBarProps) => {


    useEffect(() => {
        if (open && onClose) {
            onClose();
        }
    }, [window.location.pathname, open, onClose]);

    const authenticatedContent = (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Box
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Avatar
                    style={{
                        marginTop: 10,
                        cursor: 'pointer',
                        width: 64,
                        height: 64
                    }}
                />
                <Typography
                    color="textPrimary"
                    variant="h5"
                >
                    {userName}
                </Typography>
            </Box>
            <Divider />
            <Box>
                <List>
                    {contacts.map((contact) => (
                        <ContactLabel
                            selected={false}
                            contact={contact}
                            onClick={onContactClicked}
                            onContactRemove={onContactRemove}
                            key={contact.contactUserId}
                        />
                    ))}
                </List>
            </Box>
            <Box style={{ flexGrow: 1 }} />
            <Box
                style={{
                    backgroundColor: 'background.default',
                    margin: 2,
                    padding: 2
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: 2
                    }}
                >
                    <Button
                        color="primary"
                        component="a"
                        onClick={onAddContactClick}
                        variant="contained"
                    >
                        Add Contact
                    </Button>
                </Box>
            </Box>
        </Box>
    );

    const notAuthenticatedContent = (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: 10
            }}
        >
            <Box
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
            </Box>
        </Box>
    );

    return (
        <>
            <Hidden mdUp>
                <Drawer
                    anchor="left"
                    onClose={onClose}
                    open={open}
                    variant="temporary"
                    PaperProps={{
                        style: {
                            width: 320
                        }
                    }}
                >
                    {authenticated?authenticatedContent:notAuthenticatedContent}
                </Drawer>
            </Hidden>
            <Hidden mdDown>
                <Drawer
                    anchor="left"
                    open={true}
                    variant="persistent"
                    PaperProps={{
                        style: {
                            width: 320,
                            top: 64,
                            height: 'calc(100% - 64px)'
                        }
                    }}
                >
                    {authenticated?authenticatedContent:notAuthenticatedContent}
                </Drawer>
            </Hidden>
        </>
    );
};

export default Sidebar;
