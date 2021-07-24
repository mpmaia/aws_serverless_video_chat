import {styled} from "@material-ui/core";

export const LayoutRoot = styled('div')(
    ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        overflow: 'hidden',
        width: '100%'
    })
);

export const LayoutWrapper = styled('div')(
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

export const LayoutContainer = styled('div')({
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden'
});

export const LayoutContent = styled('div')({
    width: '100%',
    height: '100%',
    maxHeight: '100%'
});
