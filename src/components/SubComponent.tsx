import { Component } from 'react'

/**
 * A an abstract class to interact with a fraction of the state in the parent component.
 *
 * Child components maintain and manage their own state. When it is a subset of the parent state,
 * any changes made in the child need to be propagated to the parent. This can be achieved by
 * passing an update function to be called whenever the child updates the state.
 *
 * The purpose of this component is to encapsulate this process to make it more transparent to the child.
 * Specifically, the child does not need to explicitly call the parent's update function on every change.
 *
 * The setLocalState function can be used for changes that do not affect the parent
 */
class SubComponent<IPassedProps, IState> extends Component<IPassedProps & IProps<IState>> {
    public state = this.props.state

    public setLocalState = super.setState

    public setState(updateFn: (state: IState) => Partial<IState>) {
        super.setState(updateFn)
        this.props.propagate(updateFn)
    }
}

interface IProps<IState> {
    state: IState
    propagate: (updateFn: (state: IState) => Partial<IState>) => void
}

export default SubComponent