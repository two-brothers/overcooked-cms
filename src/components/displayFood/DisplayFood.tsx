import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../../reducers';
import { IState as IFoodState } from '../../reducers/food/reducer';
import FoodItem from '../foodItem/FoodItem';

/**
 * A class to display and interact with all food items
 */
class DisplayFood extends Component<IProps> {
    public render(): JSX.Element {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Singular</TableCell>
                        <TableCell>Plural</TableCell>
                        <TableCell>Standard Unit</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{
                    Object.getOwnPropertyNames(this.props.food).map(id => (
                        <FoodItem key={id} food={this.props.food[id]}/>
                    ))
                }</TableBody>
            </Table>
        );
    }
}

interface IProps {
    food: IFoodState;
}


const mapStateToProps = (state: IGlobalState) => ({
    food: state.food
});

export default connect(mapStateToProps)(DisplayFood);