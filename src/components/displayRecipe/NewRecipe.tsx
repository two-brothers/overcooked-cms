import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { createRecipe } from '../../reducers/recipe/actions';
import { INewRecipe } from '../../server/interfaces';
import DescribeRecipe from './DescribeRecipe';

class NewRecipe extends Component<IProps> {
    public render(): JSX.Element {
        return (
            <div>
                <h2>New Recipe</h2>
                <DescribeRecipe action={'CREATE'} apply={this.create}/>
            </div>
        );
    }

    /**
     * Pass the described recipe to the server for creation
     * @param recipe the recipe produces by the DescribeRecipe component
     */
    private create = (recipe: INewRecipe) => this.props.createRecipe(recipe);
}

interface IProps {
    createRecipe: (recipe: INewRecipe) => Promise<undefined>;
}

export default connect(null, {createRecipe})(NewRecipe);