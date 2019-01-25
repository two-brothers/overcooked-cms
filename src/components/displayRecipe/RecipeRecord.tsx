import {
    Button, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Switch, TextField, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as React from 'react';
import { ChangeEvent, Component, FormEvent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { IGlobalState } from '../../reducers';
import { createRecipe, updateRecipe } from '../../reducers/recipe/actions';
import { IState as IRecipeState } from '../../reducers/recipe/reducer';
import { IIngredientSection, INewRecipe } from '../../server/interfaces';
import Ingredients, { IState as IIngsState } from './Ingredients';
import RecipeMethod, { IState as IMethodState } from './RecipeMethod';

/**
 * A class to create or update a Recipe Record
 */
class RecipeRecord extends Component<IProps> {
    public state: IState = this.initState();

    public render(): JSX.Element {
        const {cook_time, id, image_url, ingredient_sections, last_updated, method, prep_time, produces, reference_url, servesSelected, title} = this.state;
        const {recipes, authenticated} = this.props;
        const action = id ? 'update' : 'create';
        return (id && !recipes[id]) ?
            <h2>Record Not Found</h2> :
            (
                <Typography component={'div'}>
                    <h2>{title.toUpperCase()} {id ? `( ${id} )` : null}</h2>
                    <form onSubmit={this.onSubmit}>
                        <InputField label={'title'}
                                    value={title}
                                    onChange={this.onInputChange('title')}
                                    inputProps={{readOnly: !authenticated}}
                        />

                        <InputField label={servesSelected ? 'serves' : 'makes'}
                                    value={produces}
                                    onChange={this.onInputChange('produces')}
                                    type={'number'}
                                    inputProps={{readOnly: !authenticated, min: 1}}
                        />
                        <Switch checked={this.state.servesSelected}
                                onChange={this.toggleProduces}
                                disabled={!authenticated}
                        />

                        <InputField label={'preparation time (mins)'}
                                    value={prep_time}
                                    onChange={this.onInputChange('prep_time')}
                                    type={'number'}
                                    inputProps={{readOnly: !authenticated, min: 1}}
                        />

                        <InputField label={'cooking time (mins)'}
                                    value={cook_time}
                                    onChange={this.onInputChange('cook_time')}
                                    type={'number'}
                                    inputProps={{readOnly: !authenticated, min: 1}}
                        />

                        <Compress heading={'Ingredients'}>
                            <Ingredients state={{sections: ingredient_sections}}
                                         propagate={this.updateIngredients}
                                         authenticated={authenticated}
                            />
                        </Compress>

                        <Compress heading={'Method'}>
                            <RecipeMethod state={{steps: method}}
                                          propagate={this.updateMethod}
                                          authenticated={authenticated}
                            />
                        </Compress>

                        <InputField label={'reference url'}
                                    value={reference_url}
                                    onChange={this.onInputChange('reference_url')}
                                    inputProps={{readOnly: !authenticated}}
                        />

                        <InputField label={'image url'}
                                    value={image_url}
                                    onChange={this.onInputChange('image_url')}
                                    inputProps={{readOnly: !authenticated}}
                        />

                        {last_updated ?
                            <InputField label={'last updated'}
                                        value={(new Date(last_updated)).toLocaleString()}
                                        inputProps={{readOnly: true}}
                            /> :
                            null
                        }

                        {authenticated ?
                            <Button type={'submit'}
                                    disabled={!this.valid()}
                                    color={'primary'}>
                                {action.toUpperCase()}
                            </Button> :
                            <p>{`Please sign in to ${action} the record`}</p>
                        }
                    </form>
                </Typography>
            );
    }

    /**
     * Initialise the component state to match the recipe item if one exists,
     * or a blank record otherwise
     */
    private initState(): IState {
        const id = this.props.match.params.id;
        const recipe = id ? this.props.recipes[id] : null;

        if (recipe) {
            // this adds either 'makes' or 'serves' as an unused extraneous property
            const state = Object.assign({}, recipe) as IState;
            state.servesSelected = (recipe.serves !== undefined);
            state.produces = (state.servesSelected ? recipe.serves : recipe.makes) as number;
            // every heading should be defined (so it can be controlled by react)
            state.ingredient_sections.map(section => {
                section.heading = section.heading ? section.heading : '';
            });
            return state;
        } else {
            return {
                cook_time: 1,
                id,
                image_url: '',
                ingredient_sections: [],
                method: [],
                prep_time: 1,
                produces: 1,
                reference_url: '',
                servesSelected: true,
                title: ''
            };
        }
    }

    /**
     * Package the component state into a new recipe item (or partial recipe
     * item if we are updating an existing record) and send it to the
     * server for processing
     * @param e the form submission event
     */
    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        // TODO
    };

    /**
     * Update the specified property whenever the input box changes
     * @param property a first-level property on the component state
     */
    private onInputChange = (property: string) => (e: ChangeEvent<HTMLInputElement>) =>
        this.setState({[property]: e.target.value});

    /**
     * Toggle whether the 'produces' value correspond to the number of items the recipe makes,
     * or the number of servings the recipe produces
     */
    private toggleProduces = () => this.setState((state: IState) => ({servesSelected: !state.servesSelected}));

    /**
     * Whenever the Ingredients sub-component updates its internal state,
     * update this component's state accordingly
     * @param updateFn the update function that was used to update the Ingredients component's state
     */
    private updateIngredients = (updateFn: (ingState: IIngsState) => Partial<IIngsState>) =>
        this.setState((state: IState) => {
            const update = updateFn({sections: state.ingredient_sections});
            return update.sections ? {ingredient_sections: update.sections} : {};
        });

    /**
     * Whenever the RecipeMethod sub-component updates its internal state,
     * update this component's state accordingly
     * @param updateFn the update function that was used to update the RecipeMethod component's state
     */
    private updateMethod = (updateFn: (methodState: IMethodState) => Partial<IMethodState>) =>
        this.setState((state: IState) => {
            const update = updateFn({steps: state.method});
            return update.steps ? {method: update.steps} : {};
        });

    /**
     * Returns a boolean indicating whether the component describes a valid recipe
     */
    private valid = () => true; // TODO
}

/**
 * This component is a TextField with some default properties already set for simplicity
 * @param props any additional properties to add to the TextField
 */
const InputField = (props: any) => (
    <TextField required={true}
               fullWidth={true}
               margin={'normal'}
               {...props} />
);

/**
 * This component wraps its children in an expansion panel
 */
const Compress = (props: ICompressProps) => (
    <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{props.heading}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            {props.children}
        </ExpansionPanelDetails>
    </ExpansionPanel>
);

interface ICompressProps {
    heading: string;
    children: JSX.Element;
}

interface IState {
    cook_time: number;
    id: string | null;
    image_url: string;
    ingredient_sections: IIngredientSection[];
    last_updated?: number;
    method: string[];
    prep_time: number;
    produces: number;
    reference_url: string;
    servesSelected: boolean;
    title: string;
}

type IProps = RouteComponentProps<{ id: string }> & {
    authenticated: boolean;
    recipes: IRecipeState;
    createRecipe: (item: INewRecipe) => Promise<undefined>;
    updateRecipe: (id: string, item: Partial<INewRecipe>) => Promise<undefined>;
}

const mapStateToProps = (state: IGlobalState) => ({
    authenticated: state.user.profile !== null,
    recipes: state.recipes
});

export default connect(mapStateToProps, {createRecipe, updateRecipe})(RecipeRecord);