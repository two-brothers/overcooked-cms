import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { updateRecipe } from '../../reducers/recipe/actions';
import { INewRecipe, IRecipe } from '../../server/interfaces';
import { Utility } from '../utility';
import DescribeRecipe from './DescribeRecipe';

interface IPassedProps {
    // the recipe to modify
    recipe: IRecipe;
}

class UpdateRecipe extends Component<IProps> {
    public render(): JSX.Element {
        return (
            <div>
                <h2>Update</h2>
                <DescribeRecipe action={'UPDATE'} apply={this.update} recipe={this.props.recipe}/>
            </div>
        );
    }

    /**
     * Determine the difference between the new recipe and the original and
     * send the update to the server
     * @param recipe the new recipe
     */
    private update = (recipe: INewRecipe) => {
        const update = Utility.subtract(recipe, this.props.recipe);
        return Object.getOwnPropertyNames(update).length > 0 ?
            this.props.updateRecipe(this.props.recipe.id, update) :
            Promise.resolve(undefined);
    };
}

type IProps = IPassedProps & {
    updateRecipe: (id: string, item: Partial<INewRecipe>) => Promise<undefined>;
}

export default connect(null, {updateRecipe})(UpdateRecipe);
