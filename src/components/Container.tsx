import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { initFood } from '../reducers/food/actions';

/**
 * A wrapper for the UI components.
 * The purpose of this component is:
 *   - to perform any initialisation logic when the app loads
 *   - to live for the duration of the app,
 *     so the initialisation logic is not repeated as components are destroyed and/or re-rendered.
 * Note that we cannot use the main App component for this purpose because the redux store
 * is only available in children of the App component
 */
class Container extends Component<IProps> {
    public componentDidMount(): void {
        this.props.initFood();
    }

    public render(): JSX.Element {
        return (
            <div/>
        );
    };
}

interface IProps {
    initFood: () => Promise<undefined>;
}

export default connect(null, {initFood})(Container);
