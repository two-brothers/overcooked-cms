import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../../reducers';
import { IRecipe } from '../../server/interfaces';
import InteractiveTable from '../InteractiveTable';

/**
 * A class to display and interact with all recipes
 */
class DisplayRecipes extends Component<IProps> {

    public render(): JSX.Element {
        const recipes = this.props.recipes;
        return (
            <InteractiveTable
                headings={['Title']}
                keyFn={this.key}
                valueFn={this.value}
                records={recipes}
                newRoute={'/cms/recipe/new'}
                selectRoute={this.select}/>
        );
    }

    /**
     * Use the record id as a unique key
     * @param recipe the recipe being displayed
     */
    private key = (recipe: IRecipe) => recipe.id;

    /**
     * Navigate to a route that includes the record id when the recipe is selected
     * @param recipe the selected recipe
     */
    private select = (recipe: IRecipe) => `/cms/recipe/${recipe.id}`;

    /**
     * Return the JSX Element that should be inserted in the table under the specified heading
     * There should be only one heading: 'Title'. Return a span with the title in it
     * @param recipe the recipe to display
     * @param heading the particular property to display
     */
    private value = (recipe: IRecipe, heading: string): JSX.Element => {
        switch (heading) {
            case 'Title':
                return (<span>{recipe.title}</span>);
            default:
                throw new Error(`Unrecognised heading: ${heading}`);
        }
    };
}

interface IProps {
    recipes: IRecipe[]
}

const mapStateToProps = (state: IGlobalState) => ({
    recipes: Object.getOwnPropertyNames(state.recipes).map(id => state.recipes[id])
});

export default connect(mapStateToProps)(DisplayRecipes);