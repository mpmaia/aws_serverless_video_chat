import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

type AddContactDialogProps = {
    onClose: () => void;
    onConfirm: (email: string) => void;
    open: boolean;
}

export default function AddContactDialog({open, onClose, onConfirm}: AddContactDialogProps) {

    const [email, setEmail] = useState<string>("");

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Add new contact</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter the email that your contact registered with us.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Email Address"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => onConfirm(email)} color="primary">
                    Add contact
                </Button>
            </DialogActions>
        </Dialog>
    );
}
