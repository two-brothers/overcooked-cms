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
import { IState as IUnits } from '../../reducers/units/reducer';
import { IFood, INewFood } from '../../server/interfaces';
import NestedUtility from '../nestedUtility';

interface IPassedProps {
    // the (optional) food item to modify
    item?: IFood
    // the value written on the submit button
    action: string;
    // the function to call on submit
    apply: (item: INewFood) => Promise<undefined>
}

/**
 * A class to describe and modify a Food Item, while allowing the parent
 * component to decide how to process the result.
 * For example, it could be embedded in a component to create a new food item,
 * or alternatively, to modify an existing one.
 */
class DescribeFood extends Component<IProps> {
    public state: IState = this.props.item ? this.initState(this.props.item) : {
        plural: '',
        singular: '',
        unit: {
            selections: this.props.units.map(() => ({
                quantity: 1,
                selected: false
            }))
        }
    };

    public render(): JSX.Element {
        return (
            <form onSubmit={this.onSubmit}>
                <div>{this.renderInput('singular', 'singular')}</div>
                <div>{this.renderInput('plural', 'plural')}</div>
                <div>
                    <FormControl>
                        <InputLabel>standard unit</InputLabel>
                        <Select multiple={true} value={this.state.unit.selections}
                                renderValue={this.renderUnitSelections}>{
                            this.state.unit.selections.map((unit, id) => (
                                <MenuItem key={id}>
                                    <Checkbox checked={unit.selected} onChange={this.toggleCheckbox(id)}/>
                                    <FormControl>
                                        <Input value={unit.quantity} onChange={this.onQuantityChange(id)}
                                               required={unit.selected} type={'number'}
                                               inputProps={{min: 0, steps: 0.1}}/>
                                    </FormControl>
                                    <ListItemText primary={this.measurement(id)}/>
                                </MenuItem>
                            ))
                        }</Select>
                    </FormControl>
                    <div><Button type={'submit'} disabled={!this.valid()}>{this.props.action}</Button></div>
                </div>
            </form>
        );
    }

    /**
     * Initialise the component state to match the passed in food item
     * @param item the item to emulate
     */
    private initState(item: IFood): IState {
        const selections = this.props.units.map(() => ({
            quantity: 1,
            selected: false
        }));
        item.conversions.map(conversion => {
            selections[conversion.unit_id].selected = true;
            selections[conversion.unit_id].quantity = conversion.ratio;
        });
        return {
            plural: item.name.plural,
            singular: item.name.singular,
            unit: {selections}
        };
    }

    /**
     * Package the component state into a new food item, and pass it to the
     * 'apply' function, supplied by the parent component.
     * @param e the form submission event
     */
    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.props.apply({
            conversions: this.state.unit.selections.map((_, id) => id)
                .filter(id => this.state.unit.selections[id].selected)
                .map(id => ({
                    ratio: this.state.unit.selections[id].quantity,
                    unit_id: id
                })),
            name: {
                plural: this.state.plural,
                singular: this.state.singular
            }
        });
    };

    /**
     * A utility function to abstract the boilerplate associated with creating in InputBox bound to an element in the state
     * @param label the label to display on the input box
     * @param property the property on the state to track
     */
    private renderInput = (label: string, property: string) => (
        <FormControl>
            <TextField label={label} value={this.state[property]} required={true}
                       onChange={this.onInputChange(property)}/>
        </FormControl>
    );

    /**
     * Display a semicolon-delimited list of selected quantities and units
     * @param selections the state.unit.selections array
     */
    private renderUnitSelections = (selections: IUnitSelection[]) => {
        const ids = selections.map((selection, id) => selection.selected ? id : -1).filter(v => v >= 0);
        return ids.map(id => `${selections[id].quantity} ${this.measurement(id)}`).join('; ');
    };

    /**
     * Update the specified property whenever the input box changes
     * @param property a first-level property on the component state
     */
    private onInputChange = (property: string) => (e: ChangeEvent<HTMLInputElement>) => this.setState({[property]: e.target.value});

    /**
     * Update the state whenever the checkbox corresponding to the specified unit's 'selected' property is toggled
     * @param id the unit id
     */
    private toggleCheckbox = (id: number) => () => this.setState((state: IState) => ({
        unit: NestedUtility.toggleNested(state.unit, `selections[${id}].selected`)
    }));

    /**
     * Update the state whenever the input box corresponding to the specified unit's 'quantity' property is updated
     * @param id the unit id
     */
    private onQuantityChange = (id: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const value: number = Number(e.target.value); // cache the result before React's Synthetic Handler clears it
        this.setState((state: IState) => ({unit: NestedUtility.replaceField<number>(state.unit, `selections[${id}].quantity`, value)}));
    };

    /**
     * A utility function to return the string '<measurement symbol> <item description>'
     * Specifically, use the singular forms if the quantity is 1 and the plural forms otherwise
     * If the item description is blank, use the literal strings '[item]' and '[items]' instead
     * @param id the unit id
     */
    private measurement = (id: number) => {
        return this.state.unit.selections[id].quantity === 1 ?
            `${this.props.units[id].singular} ${this.state.singular ? this.state.singular : '[item]'}` :
            `${this.props.units[id].plural} ${this.state.plural ? this.state.plural : '[items]'}`;
    };

    /**
     * Returns a boolean indicating whether the component describes a valid food item
     */
    private valid = () => this.state.singular.length > 0 &&
        this.state.plural.length > 0 &&
        this.state.unit.selections.filter(unit => unit.selected).length > 0 &&
        this.state.unit.selections.filter(unit => unit.selected && unit.quantity <= 0).length === 0;

}

type IProps = IPassedProps & {
    units: IUnits;
}

interface IState {
    plural: string;
    singular: string;
    unit: {
        selections: IUnitSelection[];
    }
}

interface IUnitSelection {
    quantity: number;
    selected: boolean;
}

const mapStateToProps = (state: IGlobalState) => ({
    units: state.units
});

export default connect(mapStateToProps)(DescribeFood);