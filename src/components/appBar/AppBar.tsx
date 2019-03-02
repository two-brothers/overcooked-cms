import { AppBar as MaterialAppBar, Toolbar, Typography, withStyles } from '@material-ui/core'
import * as React from 'react'
import { Component } from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

import User from './User'

class AppBar extends Component<IProps> {
    public render(): JSX.Element {
        const { classes } = this.props
        return (
            <MaterialAppBar position='static'>
                <Toolbar>
                    <Typography onClick={ this.navigateToHome } variant='h6' color='inherit'
                                className={ classes.appName }>
                        Overcooked
                    </Typography>
                    <User />
                </Toolbar>
            </MaterialAppBar>
        )
    }

    private navigateToHome = () => this.props.history.push(`${ process.env.PUBLIC_URL }/`)
}

const styles = () => ({
    appName: {
        cursor: 'pointer',
        flex: '1'
    }
})

type IProps = RouteComponentProps & {
    classes: any
}

export default withRouter(withStyles(styles)(AppBar))
