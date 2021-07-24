import React from 'react';
import {Avatar, Button, IconButton, ListItem} from '@material-ui/core';
import {Contact} from "../model/Contact";
import {Brightness1, Delete} from "@material-ui/icons";

type ContactLabelProps = {
    contact: Contact;
    selected: boolean;
    onClick: (contact: Contact) => void;
    onContactRemove: (contact: Contact) => void;
}

const ContactLabel = ({
                     contact,
                     selected,
                     onClick,
                     onContactRemove,
                     ...rest
                 }: ContactLabelProps) => {

    return (
        <ListItem
            disableGutters
            style={{
                display: 'flex',
            }}
            {...rest}
        >
            <Button
                style={{
                    color: 'text.secondary',
                    fontWeight: 'normal',
                    justifyContent: 'flex-start',
                    letterSpacing: 0,
                    textTransform: 'none',
                    width: '100%',
                    ...(selected && {
                        color: 'primary.main'
                    })
                }}
                onClick={() => onClick(contact)}
                disabled={!contact.online}
            >
                <Avatar
                    style={{
                        marginRight: 5
                    }}
                />
                <span>
                    {contact.contactEmail}
                </span>
                <span title={contact.online?"Online":"Offline"} style={{ marginLeft: 5, marginTop: 5}}>
                    <Brightness1 htmlColor={contact.online?"#00FF00":"#FF0000"} fontSize={"small"}/>
                </span>
            </Button>
            <IconButton onClick={() => onContactRemove(contact)} title={"Remove Contact"}><Delete/></IconButton>
        </ListItem>
    );
};

export default ContactLabel;
