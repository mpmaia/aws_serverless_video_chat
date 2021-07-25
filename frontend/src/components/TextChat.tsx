import {Button, Grid, List, ListItem, ListItemText, Paper, TextField} from "@material-ui/core";
import {useState} from "react";

export interface ChatMessage {
    user: string;
    message: string;
}

interface TextChatProps {
    messages: ChatMessage[];
    sendChatMessage: (message: string) => void;
}

export function TextChat({messages, sendChatMessage}: TextChatProps) {
    const [chatMessage, setChatMessage] = useState<string>('');

    return (<Paper style={{height: '100%', padding: '5px'}}>
        <Grid container spacing={2}>
            <Grid item xs={10} md={11}>
                <TextField label="Message" style={{width: '100%'}} value={chatMessage} onChange={(v) => setChatMessage(v.target.value)}/>
            </Grid>
            <Grid item xs={2} md={1}>
                <Button variant="contained" color="primary" onClick={() => sendChatMessage(chatMessage)}>Send</Button>
            </Grid>
        </Grid>
        <List dense={true} style={{height: '100%', overflow: 'scroll'}}>
            {messages.map((message, i) => {
                return (<ListItem key={i}>
                    <ListItemText>{message.user} - {message.message}</ListItemText>
                </ListItem>);
            })}
        </List>
    </Paper>)
}
