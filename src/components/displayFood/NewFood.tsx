import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { createFood } from '../../reducers/food/actions';
import { INewFood } from '../../server/interfaces';
import DescribeFood from './DescribeFood';


/**
 * A class to create a new Food item and upload it to the server
 */
class NewFood extends Component<IProps> {
    public render(): JSX.Element {
        return (
            <div>
                <h2>New Food</h2>
                <DescribeFood action={'CREATE'} apply={this.create}/>
            </div>
        );
    }

    private create = (item: INewFood) => this.props.createFood(item);
}

interface IProps {
    createFood: (item: INewFood) => Promise<undefined>;
}

export default connect(null, {createFood})(NewFood);