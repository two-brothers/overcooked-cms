import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import * as React from 'react';
import { ChangeEvent } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../../reducers';
import { IState as IUnitsState } from '../../reducers/units/reducer';
import NestedUtility from '../nestedUtility';
import SubComponent from '../SubComponent';
import { IUnitSelection } from './FoodRecord';

/**
 * A component to choose the relevant units and ratios for a food record
 */
class UnitsSelector extends SubComponent<IProps, IState> {
    public render(): JSX.Element {
        const { selections } = this.state.unit;
        const { readOnly } = this.props;

        return (
            <FormControl required={true}
                         fullWidth={true}
                         margin={'normal'}>
                <InputLabel>standard unit</InputLabel>
                <Select multiple={true}
                        value={selections}
                        renderValue={this.renderUnitSelections}>
                    {selections.map((unit, id) => (
                        <MenuItem key={id}>
                            <Checkbox checked={unit.selected}
                                      onChange={this.toggleSelected(id)}
                                      disabled={readOnly}
                            />
                            <TextField value={String(unit.quantity)}
                                       onChange={this.onQuantityChange(id)}
                                       required={unit.selected}
                                       type={'number'}
                                       inputProps={{min: 0, step: 0.1, readOnly}} />
                            <ListItemText primary={this.measurement(id)} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    /**
     * Display a semicolon-delimited list of selected quantities and units
     * @param selections the state.unit.selections array
     */
    private renderUnitSelections = (selections: IUnitSelection[]) => {
        const ids = selections.map((selection, id) => selection.selected ? id : -1).filter(v => v >= 0);
        return ids.map(id => `${selections[id].quantity} ${this.measurement(id)}`).join('; ');
    };

    /**
     * Update the state whenever the checkbox corresponding to the specified unit's 'selected' property is toggled
     * @param id the unit id
     */
    private toggleSelected = (id: number) => () => this.setState((state: IState) => ({
        unit: NestedUtility.toggleNested(state.unit, `selections[${id}].selected`)
    }));

    /**
     * Update the state whenever the input box corresponding to the specified unit's 'quantity' property is updated
     * @param id the unit id
     */
    private onQuantityChange = (id: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = String(e.target.value); // cache the result before React's Synthetic Handler clears it
        this.setState((state: IState) => ({unit: NestedUtility.replaceField<string>(state.unit, `selections[${id}].quantity`, value)}));
    };

    /**
     * A utility function to return the string '<measurement symbol> <item description>'
     * Specifically, use the singular forms if the quantity is 1 and the plural forms otherwise
     * If the item description is blank, use the literal strings '[item]' and '[items]' instead
     * @param id the unit id
     */
    private measurement = (id: number) => {
        return Number(this.state.unit.selections[id].quantity) === 1 ?
            `${this.props.units[id].singular} ${this.props.singular ? this.props.singular : '[item]'}` :
            `${this.props.units[id].plural} ${this.props.plural ? this.props.plural : '[items]'}`;
    };
}

interface IProps {
    singular: string;
    plural: string;
    readOnly: boolean;
    units: IUnitsState
}

export interface IState {
    unit: {
        selections: IUnitSelection[]
    };
}

const mapStateToProps = (state: IGlobalState) => ({
    units: state.units
});

export default connect(mapStateToProps)(UnitsSelector);