import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { updateFood } from '../../reducers/food/actions';
import { IFood, INewFood } from '../../server/interfaces';
import { Utility } from '../utility';
import DescribeFood from './DescribeFood';

interface IPassedProps {
    // the food item to modify
    item: IFood
}

class UpdateFood extends Component<IProps> {
    public render(): JSX.Element {
        return (
            <div>
                <h2>Update</h2>
                <DescribeFood action={'UPDATE'} apply={this.update} item={this.props.item}/>
            </div>
        );
    }

    /**
     * Determine the difference between the new food item and original item and
     * send the update to the server
     * @param item the new food item
     */
    private update = (item: INewFood) => {
        const update = Utility.subtract(item, this.props.item);
        return Object.getOwnPropertyNames(update).length > 0 ?
            this.props.updateFood(this.props.item.id, update) :
            Promise.resolve(undefined);
    };
}

type IProps = IPassedProps & {
    updateFood: (id: string, item: Partial<INewFood>) => Promise<undefined>;
}

export default connect(null, {updateFood})(UpdateFood);