import { Button } from '@material-ui/core';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../reducers';
import { logOut } from '../reducers/user/actions';

/**
 * A component that displays the active user and provides links to log in or out
 */
class User extends Component<IProps> {
    public render(): JSX.Element {
        const profile = this.props.profile;
        return profile ?
            (
                <div>
                    <p>{profile}</p>
                    <Button onClick={this.props.logOut}>Sign Out</Button>
                </div>
            ) :
            <a href={'/auth/github'}>Sign In</a>;
    }
}

interface IProps {
    profile: string;
    logOut: () => Promise<undefined>;
}

const mapStateToProps = (state: IGlobalState) => ({
    profile: state.user.profile
});

export default connect(mapStateToProps, {logOut})(User);