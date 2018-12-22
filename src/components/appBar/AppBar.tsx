import { AppBar as MaterialAppBar, Toolbar, Typography, withStyles } from '@material-ui/core';
import * as React from 'react';
import User from './User';

const AppBar = (props:IProps) => {
    const { classes } = props;
    return (
        <MaterialAppBar position="static">
            <Toolbar>
                <Typography variant="h6" color="inherit" className={classes.appName}>Overcooked</Typography>
                <User />
            </Toolbar>
        </MaterialAppBar>
    )
};

const styles = () => ({
    appName: {
        flex: '1'
    }
});

interface IProps {
    classes:any
}

export default withStyles(styles)(AppBar);