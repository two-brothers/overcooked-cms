import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import * as React from 'react';
import { Component, FormEvent } from 'react';
import { ChangeEvent } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../../reducers';
import { createRecipe } from '../../reducers/recipe/actions';
import { IState as IUnits } from '../../reducers/units/reducer';
import { IFood, IIngredient, INewRecipe } from '../../server/interfaces';
import Utility from '../utility';

class NewRecipe extends Component<IProps> {
    public state: IState = {
        cook_time: 0,
        ingredient: {
            sections: []
        },
        method: {
            steps: []
        },
        prep_time: 0,
        produces: 0,
        reference: '',
        servesSelected: true,
        title: ''
    };

    public render(): JSX.Element {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <h2>New Recipe</h2>
                    <div>{this.renderInput('title', this.onInputChange('title', String))}</div>
                    <div>
                        {this.renderInput(this.state.servesSelected ? 'serves' : 'makes', this.onInputChange('produces', Number), 'number', true, 1)}
                        <Switch checked={this.state.servesSelected} onChange={this.toggleProduces}/>
                    </div>
                    <div>{this.renderInput('preparation time (mins)', this.onInputChange('prep_time', Number), 'number', true, 1)}</div>
                    <div>{this.renderInput('cook time (mins)', this.onInputChange('cook_time', Number), 'number', true, 1)}</div>
                    <div>
                        <h4>Ingredients</h4>
                        <Fab size={'small'} onClick={this.newIngredientSection}><AddIcon/></Fab>
                        <FormControl> {
                            this.state.ingredient.sections.map(
                                (section, sectionIdx) => this.renderIngredientSection(sectionIdx)
                            )
                        } </FormControl>
                    </div>
                    <div>
                        <h4>Method</h4>
                        <Fab size={'small'} onClick={this.newStep}><AddIcon/></Fab>
                        {this.state.method.steps.map((step, idx) => (
                            <div key={step.key}>
                                {this.renderInput(`Step ${idx}`, this.onInputChange('method', String, `steps[${idx}].instruction`))}
                                <Fab size={'small'} onClick={this.removeStep(idx)}><DeleteIcon/></Fab>
                            </div>
                        ))}
                    </div>
                    <div>{this.renderInput('reference url', this.onInputChange('reference', String))}</div>
                    <Button type={'submit'}>Create</Button>
                </form>
            </div>
        );
    }

    /**
     * A utility function to abstract the boilerplate associated with creating in InputBox bound to an element in the state
     * @param label the label to display on the input box
     * @param onChange the function to call when the value changes
     * @param type the content type (defaults to string)
     * @param required whether the input field is required (defaults to true)
     * @param min the (optional) minimum value when the 'number' type is used
     * @param step the (optional) step size when the 'number' type is used
     */
    private renderInput = (label: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void,
                           type: string = 'string', required = true, min?: number, step?: number) => (
        <FormControl>
            <TextField label={label} onChange={onChange} required={required} type={type}
                       inputProps={min === undefined ? undefined : {min, step}}/>
        </FormControl>
    );

    /**
     * Render the specified ingredient section
     * @param sectionIdx the index of the ingredient section to render
     */
    private renderIngredientSection = (sectionIdx: number) => {
        const section: IKeyedIngredientSection = this.state.ingredient.sections[sectionIdx];
        return (
            <div key={section.key}>
                <Fab size={'small'} onClick={this.removeIngredientSection(sectionIdx)}><DeleteIcon/></Fab>
                {this.renderInput('heading (optional)', this.onInputChange('ingredient', String, `sections[${sectionIdx}].heading`), 'string', false)}
                <Fab size={'small'} onClick={this.newIngredient(sectionIdx)}><AddIcon/></Fab>
                {section.ingredients.map((ingredient, ingIdx) => this.renderIngredient(sectionIdx, ingIdx))}
            </div>
        );
    };

    /**
     * Render the specified ingredient
     * @param sectionIdx the index of the ingredient section that contains the ingredient to render
     * @param ingIdx the index of the ingredient to render
     */
    private renderIngredient = (sectionIdx: number, ingIdx: number) => {
        const ing: IKeyedIngredient = this.state.ingredient.sections[sectionIdx].ingredients[ingIdx];
        return (
            <div key={ing.key}>
                {this.renderInput('quantity', this.onInputChange('ingredient', Number, `sections[${sectionIdx}].ingredients[${ingIdx}].amount`), 'number', true, 0, 0.1)}
                <FormControl>
                    <Select value={ing} renderValue={this.renderIngredientOption}
                            onChange={this.handleIngredientSelection}>{
                        // create a menu item for every unit used by every food item
                        this.props.food.map(item => item.conversions.map((_, idx) => ({item, idx})))
                            .reduce((a, b) => a.concat(b))
                            .map(({item, idx}) => (
                                // the value contains all the context needed to update the state, including
                                // the section idx, ingredient idx, food id and unit_id
                                // the values must all be converted to strings to match the MenuItem interface
                                <MenuItem key={item.id + idx}
                                          value={[String(sectionIdx), String(ingIdx), item.id, String(item.conversions[idx].unit_id)]}>{
                                    this.measurement(ing.amount, item, item.conversions[idx].unit_id)
                                }</MenuItem>
                            ))
                    }</Select>
                    <Fab size={'small'} onClick={this.removeIngredient(sectionIdx, ingIdx)}><DeleteIcon/></Fab>
                </FormControl>
            </div>
        );
    };

    /**
     * Render a human-readable description of the chosen ingredient option
     * @param ing the selected ingredient
     */
    private renderIngredientOption = (ing: IKeyedIngredient) =>
        ing.food_id && ing.unit_id ?
            this.measurement(ing.amount, this.props.food.filter(food => food.id === ing.food_id)[0], ing.unit_id) :
            '';

    /**
     * Package the component state into a new food item and send it to the server for creation
     * @param e the form submission event
     */
    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.props.createRecipe({
            cook_time: this.state.cook_time,
            ingredient_sections: this.state.ingredient.sections.map(keyedSection => ({
                ...(keyedSection.heading ? {heading: keyedSection.heading} : {}),
                ingredients: keyedSection.ingredients.map(ing => ({
                    amount: ing.amount,
                    food_id: ing.food_id,
                    unit_id: ing.unit_id
                }))
            })),
            method: this.state.method.steps.map(step => step.instruction),
            prep_time: this.state.prep_time,
            reference_url: this.state.reference,
            title: this.state.title,
            [this.state.servesSelected ? 'serves' : 'makes']: this.state.produces
        });
    };

    /**
     * Whenever an ingredient is selected, update the corresponding food_id and unit_id properties in the state
     * @param e the ChangeEvent triggered by selecting the ingredient menu item
     */
    private handleIngredientSelection = (e: ChangeEvent<HTMLSelectElement>) => {
        const sectionIdx: number = Number(e.target.value[0]);
        const ingIdx: number = Number(e.target.value[1]);
        const foodId: string = e.target.value[2];
        const unitId: number = Number(e.target.value[3]);
        const path = `sections[${sectionIdx}].ingredients[${ingIdx}]`;
        this.setState((state: IState) => ({ingredient: Utility.replaceField<string>(state.ingredient, `${path}.food_id`, foodId)}));
        this.setState((state: IState) => ({ingredient: Utility.replaceField<number>(state.ingredient, `${path}.unit_id`, unitId)}));
    };

    /**
     * Whenever the input value changes, set the corresponding property in the state
     * @param property the first-level state property to update
     * @param type the class to cast the value into before updating the state
     * @param subpath the (. delimited) path to the relevant sub-property, if it exists
     */
    private onInputChange = (property: string, type: StringConstructor | NumberConstructor, subpath?: string) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = type(e.target.value); // cache the result before React's Synthetic Handler clears it
            this.setState((state: IState) => {
                return subpath === undefined ?
                    {[property]: value} :
                    {[property]: Utility.replaceField<string | number>(state[property], subpath, value)};
            });
        };

    /**
     * Toggle whether the 'produces' value correspond to the number of items the recipe makes,
     * or the number of servings the recipe produces
     */
    private toggleProduces = () => this.setState((state: IState) => ({servesSelected: !state.servesSelected}));

    /**
     * Add a new empty ingredient section at the end of the list
     */
    private newIngredientSection = () => this.setState((state: IState) => ({
        ingredient: Utility.appendToNestedArray<IKeyedIngredientSection>(state.ingredient, 'sections', {
            heading: undefined,
            ingredients: [],
            key: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        })
    }));

    /**
     * Remove the specified ingredient section
     * @param idx the index of the ingredient section to remove
     */
    private removeIngredientSection = (idx: number) => () => {
        this.setState((state: IState) => ({
            ingredient: Utility.removeFromNestedArray<IKeyedIngredientSection>(state.ingredient, 'sections', idx)
        }));
    };

    /**
     * Add a new ingredient to the specified section
     * @param sectionIdx
     */
    private newIngredient = (sectionIdx: number) => () => this.setState((state: IState) => ({
        ingredient: Utility.appendToNestedArray<IKeyedIngredient>(
            state.ingredient, `sections[${sectionIdx}].ingredients`, {
                amount: 1,
                food_id: '',
                key: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
                unit_id: 0
            }
        )
    }));

    /**
     * Remove the specified ingredient
     * @param sectionIdx the index of the ingredient section that contains the ingredient to be removed
     * @param ingIdx the index of the ingredient
     */
    private removeIngredient = (sectionIdx: number, ingIdx: number) => () => {
        this.setState((state: IState) => ({
            ingredient: Utility.removeFromNestedArray<IKeyedIngredient>(state.ingredient, `sections[${sectionIdx}].ingredients`, ingIdx)
        }));
    };

    /**
     * Add a new empty step at the end of the method
     */
    private newStep = () => this.setState((state: IState) => ({
        method: Utility.appendToNestedArray<IKeyedStep>(state.method, 'steps', {
            instruction: '',
            key: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
        })
    }));

    /**
     * Remove the specified step in the method
     * @param idx the index of the step to remove
     */
    private removeStep = (idx: number) => () => {
        this.setState((state: IState) => ({
            method: Utility.removeFromNestedArray<IKeyedStep>(state.method, 'steps', idx)
        }));
    };

    /**
     * Display a human readable description of the food in the specified units
     * Use the singular form if quantity is 1, or the plural form otherwise
     * @param quantity the number of units
     * @param food the food item
     * @param unitId the unit id
     */
    private measurement = (quantity: number, food: IFood, unitId: number) =>
        quantity === 1 ?
            `${this.props.units[unitId].singular} ${food.name.singular}` :
            `${this.props.units[unitId].plural} ${food.name.plural}`;


}

interface IProps {
    units: IUnits;
    food: IFood[];
    createRecipe: (item: INewRecipe) => Promise<undefined>;
}

interface IKeyedProperty {
    key: number;
}

type IKeyedIngredient = IKeyedProperty & IIngredient;
type IKeyedIngredientSection = IKeyedProperty & {
    heading?: string;
    ingredients: IKeyedIngredient[];
}
type IKeyedStep = IKeyedProperty & {
    instruction: string;
}

interface IState {
    cook_time: number;
    ingredient: {
        sections: IKeyedIngredientSection[];
    }
    method: {
        steps: IKeyedStep[];
    };
    prep_time: number;
    produces: number;
    reference: string;
    servesSelected: boolean;
    title: string;
}

const mapStateToProps = (state: IGlobalState) => ({
    food: Object.getOwnPropertyNames(state.food).map(id => state.food[id]),
    units: state.units
});

export default connect(mapStateToProps, {createRecipe})(NewRecipe);