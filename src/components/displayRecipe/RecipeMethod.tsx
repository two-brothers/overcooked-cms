import { Button, InputAdornment, TextField } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import * as React from 'react';
import { ChangeEvent } from 'react';
import FlexView from 'react-flexview';

import NestedUtility from '../nestedUtility';
import SubComponent from '../SubComponent';

interface IProps {
    authenticated: boolean
}

class RecipeMethod extends SubComponent<IProps, IState> {
    /**
     * Before rendering the component, create a unique key for each step
     * and define newStep
     */
    public componentWillMount(): void {
        this.setLocalState((state: IState) => ({
            keys: state.steps.map(() => random()),
            newStep: ''
        }));
    }

    public render(): JSX.Element {
        const {authenticated} = this.props;
        const {steps, newStep} = this.state;
        // ensure typescript knows the keys are defined
        const keys = Object.assign({}, this.state.keys);

        return (
            <FlexView column={true} grow={true}>
                {steps.map((step, idx) => (
                    <FlexView key={keys[idx]}>
                        <TextField value={step}
                                   onChange={this.onStepChange(idx)}
                                   required={true}
                                   disabled={!authenticated}
                                   fullWidth={true}
                                   margin={'normal'}
                                   InputProps={{
                                       startAdornment: <InputAdornment
                                           position='start'>{idx + 1}.</InputAdornment>
                                   }}
                        />
                        <Button onClick={this.deleteStep(idx)}
                                disabled={!authenticated}>
                            <DeleteIcon />
                        </Button>
                    </FlexView>
                ))}
                {!authenticated ? null :
                    (
                        <TextField onChange={this.onNewStepChange}
                                   onKeyPress={this.onKeyPress}
                                   value={newStep}
                                   placeholder={'Enter next step'}
                                   fullWidth={true}
                                   margin={'normal'}
                        />
                    )}
            </FlexView>
        );
    }

    /**
     * When an input value changes, update the corresponding step
     * @param idx the index of the step to change
     */
    private onStepChange = (idx: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value; // cache the result before React's Synthetic Handler clears it
        this.setState((state: IState) => ({
            steps: NestedUtility.replaceField(state, `steps[${idx}]`, value).steps
        }));
    };

    /**
     * Update the newStep value whenever the corresponding input box updates
     * @param e
     */
    private onNewStepChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value; // cache the result before React's Synthetic Handler clears it
        this.setState(() => ({newStep: value}));
    };

    /**
     * Create a new step in the recipe whenever the user presses Enter on the newStep input box
     * (note that the called function filters out empty values)
     */
    private onKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            // use a saved version of newStep when updating the parent component
            // (which doesn't know about newStep)
            const {newStep} = this.state;
            this.setLocalState((state: IState) =>
                state.newStep && state.keys ? {keys: [...state.keys, random()]} : {}
            );
            this.setState((state: IState) =>
                newStep ? {steps: [...state.steps, newStep]} : {}
            );
            this.setLocalState((state: IState) =>
                state.newStep ? {newStep: ''} : {}
            );
        }
    };

    /**
     * Remove the specified step
     * @param idx the index of the step
     */
    private deleteStep = (idx: number) => () => {
        this.setState((state: IState) => ({
            steps: NestedUtility.removeFromNestedArray(state, 'steps', idx).steps
        }));
        this.setLocalState((state: IState) => ({
            keys: NestedUtility.removeFromNestedArray(state, `keys`, idx).keys
        }));
    };
}

export interface IState {
    steps: string[]
    keys?: number[]
    newStep?: string;
}

const random = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

export default RecipeMethod;


