import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../../reducers';
import { IState as IUnit } from '../../reducers/units/reducer';
import { IFood, IUnitConversion } from '../../server/interfaces';

/**
 * A class to display and interact with a specific food item
 * Note that this class is embedded in a table (which is why it renders a TableRow element)
 */
class FoodItem extends Component<IProps> {
    public render(): JSX.Element {
        return (
            <TableRow>
                <TableCell>{this.props.food.name.singular}</TableCell>
                <TableCell>{this.props.food.name.plural}</TableCell>
                <TableCell>{
                    this.props.food.conversions
                        .map(conversion => this.displayConversion(conversion))
                }</TableCell>
                <TableCell/>
            </TableRow>
        );
    }

    /**
     * Creates a JSX element containing the conversion and a line break element (to separate it from other conversions)
     * @param conversion the item to display
     */
    private displayConversion = (conversion: IUnitConversion): JSX.Element => {
        const unit = this.props.units[conversion.unit_id];
        const singular = `${unit.singular} ${this.props.food.name.singular}`;
        const plural = `${unit.plural} ${this.props.food.name.plural}`;
        return (
            <span key={conversion.unit_id}>{conversion.ratio} {conversion.ratio === 1 ? singular : plural}<br/></span>
        );
    };
}

interface IProps {
    food: IFood;
    units: IUnit
}

const mapStateToProps = (state: IGlobalState) => ({
    units: state.units
});

export default connect(mapStateToProps)(FoodItem);