import { IconButton, withStyles } from '@material-ui/core'
import Person from '@material-ui/icons/Person';
import PersonOutlined from '@material-ui/icons/PersonOutlined';
import * as React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'

import { IGlobalState } from '../../reducers'
import { logOut } from '../../reducers/user/actions'

/**
 * A component that displays the active user and provides links to log in or out
 */
class User extends Component<IProps> {
    public render(): JSX.Element {
        const { profile, classes } = this.props
        const version = '/v1'
        return (
            profile ?
                <div>
                    <span>{ profile }</span>
                    <IconButton onClick={ this.logOut } className={ classes.inheritColor }>
                        <Person/>
                    </IconButton>
                </div>
                :
                <a href={ `${ version }/auth/github` } className={ classes.unstyledLink }>
                    <IconButton className={ classes.inheritColor }>
                        <PersonOutlined/>
                    </IconButton>
                </a>
        )
    }

    /**
     * Log the user out and suppress any errors
     */
    private logOut = () => this.props.logOut().catch(() => null)
}

const styles = () => ({
    inheritColor: {
        'color': 'inherit'
    },
    unstyledLink: {
        'color': 'unset',
        'text-decoration': 'none'
    }
})

interface IProps {
    classes: any
    logOut: () => Promise<undefined>
    profile: string
}

const mapStateToProps = (state: IGlobalState) => ({
    profile: state.user.profile
})

export default connect(mapStateToProps, { logOut })(withStyles(styles)(User))
