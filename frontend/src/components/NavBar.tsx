import React from 'react';
import {
    AppBar,
    Box,
    Hidden,
    IconButton,
    Toolbar, Typography
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import {AppBarProps} from "@material-ui/core/AppBar/AppBar";
import {ExitToApp} from "@material-ui/icons";

type NavBarProps = {
   onNavOpen: () => void;
   logout: () => void;
   authenticated: boolean;
} & AppBarProps;

type NavBarLogoutProps = {
    logout: () => void;
    authenticated: boolean;
}

const NavBarLogout = (props: NavBarLogoutProps) => {
    const { logout, authenticated } = props;
    return (authenticated ?
            (<IconButton color="inherit" onClick={() => logout()}>
                 <ExitToApp />
             </IconButton>): null);
}

const Navbar = ({ onNavOpen, ...rest }: NavBarProps) => {

    return (
        <AppBar
            elevation={0}
            {...rest}
        >
            <Toolbar>
                <Hidden lgUp>
                    <IconButton
                        color="inherit"
                        onClick={onNavOpen}
                    >
                        <MenuIcon />
                    </IconButton>
                </Hidden>
                <Typography>Video Chat</Typography>
                <Box style={{ flexGrow: 1 }} />
                <NavBarLogout {...rest}/>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
