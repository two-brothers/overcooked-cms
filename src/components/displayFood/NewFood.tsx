import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import { ChangeEvent, Component, FormEvent } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../../reducers';
import { createFood } from '../../reducers/food/actions';
import { IState as IUnits } from '../../reducers/units/reducer';
import { INewFood } from '../../server/interfaces';


/**
 * A class to create a new Food item and upload it to the server
 */
class NewFood extends Component<IProps> {

    public state: IState = {
        plural: '',
        singular: '',
        unitSelections: this.props.units.map(() => ({
            quantity: 1,
            selected: false
        }))
    };

    public render(): JSX.Element {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <h2>New Food</h2>
                    <FormControl>
                        <TextField label='singular' onChange={this.onSingularChange} required={true}/>
                    </FormControl>
                    <FormControl>
                        <TextField label='plural' onChange={this.onPluralChange} required={true}/>
                    </FormControl>
                    <FormControl>
                        <InputLabel>Units</InputLabel>
                        <Select multiple={true} value={[]}>{
                            this.state.unitSelections.map((unit, id) => (
                                <MenuItem key={id}>
                                    <Checkbox checked={unit.selected} onChange={this.toggleCheckbox(id)}/>
                                    <FormControl error={this.isInvalidUnit(unit)}>
                                        <Input value={unit.quantity} onChange={this.onQuantityChange(id)}
                                               required={unit.selected} type={'number'}
                                               inputProps={{min: '0', step: '0.1'}}/>
                                    </FormControl>
                                    <ListItemText primary={this.measurement(id)}/>
                                </MenuItem>
                            ))
                        }</Select>
                    </FormControl>
                    <Button type={'submit'} disabled={!this.valid()}>Create</Button>
                </form>
            </div>
        );
    }

    /**
     * Package the component state into a new food item and send it to the server for creation
     * @param e the form submission event
     */
    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.props.createFood({
            conversions: this.state.unitSelections.map((unit, id) => ({
                ratio: unit.quantity,
                unit_id: id
            }))
                .filter(conversion => this.state.unitSelections[conversion.unit_id].selected),
            name: {
                plural: this.state.plural,
                singular: this.state.singular
            }

        });
    };
    /**
     * Update the state whenever the 'singular' input box changes
     * @param e the input box change event
     */
    private onSingularChange = (e: ChangeEvent<HTMLInputElement>) => this.setState({singular: e.target.value});
    /**
     * Update the state whenever the 'plural' input box changes
     * @param e the input box change event
     */
    private onPluralChange = (e: ChangeEvent<HTMLInputElement>) => this.setState({plural: e.target.value});
    /**
     * Update the state whenever the checkbox corresponding to the selection of the specified unit is toggled
     * @param id the unit id
     */
    private toggleCheckbox = (id: number) => () => this.setState((state: IState) => {
        const newSelections = state.unitSelections.slice();
        newSelections[id] = Object.assign({}, newSelections[id], {selected: !newSelections[id].selected});
        return {unitSelections: newSelections};
    });
    /**
     * Update the state whenever the quantity corresponding the the specified unit is changed
     * @param id the unit id
     */
    private onQuantityChange = (id: number) => (e: ChangeEvent<HTMLInputElement>) => this.setState((state: IState) => {
        const newSelections = state.unitSelections.slice();
        newSelections[id] = Object.assign({}, newSelections[id], {quantity: Number(e.target.value)});
        this.setState({unitSelections: newSelections});
    });

    /**
     * A utility function to return the string '<measurement symbol> <item description>'
     * Specifically, use the singular forms if the quantity is 1 and the plural forms otherwise
     * If the item description is blank, use the literal strings '[singular]' and '[plural]' instead
     * @param id the unit id
     */
    private measurement = (id: number) => {
        return this.state.unitSelections[id].quantity === 1 ?
            `${this.props.units[id].singular} ${this.state.singular ? this.state.singular : '[singular]'}` :
            `${this.props.units[id].plural} ${this.state.plural ? this.state.plural : '[plural]'}`;
    };
    /**
     * A validation function to ensure all selected values have a positive quantity
     * @param unit
     */
    private isInvalidUnit = (unit: IUnitSelection) => unit.selected && unit.quantity === 0;
    /**
     * Confirm that at least one unit is selected, and all selections are valid
     */
    private isValidSelection = () =>
        this.state.unitSelections.filter(unit => unit.selected).length > 0 &&
        this.state.unitSelections.filter(unit => this.isInvalidUnit(unit)).length === 0;
    /**
     * Confirm that all form items are specified and valid. This is used to prevent submission of an invalid form.
     */
    private valid = () => this.state.singular && this.state.plural && this.isValidSelection();


}

interface IProps {
    units: IUnits;
    createFood: (item: INewFood) => Promise<undefined>;
}

interface IState {
    plural: string;
    unitSelections: IUnitSelection[];
    singular: string;
}

interface IUnitSelection {
    quantity: number;
    selected: boolean
}

const mapStateToProps = (state: IGlobalState) => ({
    units: state.units
});

export default connect(mapStateToProps, {createFood})(NewFood);