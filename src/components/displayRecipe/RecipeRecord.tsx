import {
    Button,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Switch,
    TextField,
    Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import * as React from 'react'
import { ChangeEvent, Component, FormEvent } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

import { IGlobalState } from '../../reducers'
import { createRecipe, deleteRecipe, getRecipe, updateRecipe } from '../../reducers/recipe/actions'
import { IState as IRecipeState } from '../../reducers/recipe/reducer'
import { IIngredientSection, INewRecipe, IngredientType } from '../../server/interfaces'
import DeleteRecord from '../DeleteRecord'
import { Utility } from '../utility'
import Ingredients, { IState as IIngsState } from './Ingredients'
import RecipeMethod, { IState as IMethodState } from './RecipeMethod'

/**
 * A class to create or update a Recipe Record
 */
class RecipeRecord extends Component<IProps> {
    public state: IState = this.initState()

    public componentDidMount(): void {
        const id = this.props.match.params.id
        if (id && !this.props.recipes[id]) {
            this.props.getRecipe(id)
                .then(() => this.setState(() => this.initState()))
                .catch(() => this.setState(() => ({ status: RetrievalStatus.UNAVAILABLE })))
        }
    }

    public render(): JSX.Element {
        const { cook_time, id, image_url, ingredient_sections, last_updated, method, prep_time, produces, reference_url, status, servesSelected, title } = this.state
        const { authenticated } = this.props
        const action = id ? 'update' : 'create'

        switch (status) {
            case RetrievalStatus.RETRIEVING:
                return <h2>Retrieving Record...</h2>
            case RetrievalStatus.UNAVAILABLE:
                return <h2>Record Unavailable</h2>
            case RetrievalStatus.AVAILABLE:
                return (
                    <Typography component={ 'div' }>
                        <h2>{ title.toUpperCase() } { id ? `( ${ id } )` : null }</h2>
                        <form onSubmit={ this.onSubmit }>
                            <InputField label={ 'title' }
                                        value={ title }
                                        onChange={ this.onInputChange('title') }
                                        inputProps={ { readOnly: !authenticated } }
                            />

                            <InputField label={ servesSelected ? 'serves' : 'makes' }
                                        value={ produces }
                                        onChange={ this.onInputChange('produces') }
                                        type={ 'number' }
                                        inputProps={ { readOnly: !authenticated, min: 1 } }
                            />
                            <Switch checked={ this.state.servesSelected }
                                    onChange={ this.toggleProduces }
                                    disabled={ !authenticated }
                            />

                            <InputField label={ 'preparation time (mins)' }
                                        value={ prep_time }
                                        onChange={ this.onInputChange('prep_time') }
                                        type={ 'number' }
                                        inputProps={ { readOnly: !authenticated, min: 1 } }
                            />

                            <InputField label={ 'cooking time (mins)' }
                                        value={ cook_time }
                                        onChange={ this.onInputChange('cook_time') }
                                        type={ 'number' }
                                        inputProps={ { readOnly: !authenticated, min: 1 } }
                            />

                            <Compress heading={ 'Ingredients' }>
                                <Ingredients state={ { sections: ingredient_sections } }
                                             propagate={ this.updateIngredients }
                                             authenticated={ authenticated }
                                />
                            </Compress>

                            <Compress heading={ 'Method' }>
                                <RecipeMethod state={ { steps: method } }
                                              propagate={ this.updateMethod }
                                              authenticated={ authenticated }
                                />
                            </Compress>

                            <InputField label={ 'reference url' }
                                        value={ reference_url }
                                        onChange={ this.onInputChange('reference_url') }
                                        inputProps={ { readOnly: !authenticated } }
                            />

                            <InputField label={ 'image url' }
                                        value={ image_url }
                                        onChange={ this.onInputChange('image_url') }
                                        inputProps={ { readOnly: !authenticated } }
                            />

                            { last_updated ?
                                <InputField label={ 'last updated' }
                                            value={ (new Date(last_updated)).toLocaleString() }
                                            inputProps={ { readOnly: true } }
                                /> :
                                null
                            }

                            { authenticated ?
                                <React.Fragment>
                                    <Button type={ 'submit' }
                                            disabled={ !this.valid() }
                                            color={ 'primary' }>
                                        { action.toUpperCase() }
                                    </Button>
                                    { id ?
                                        <DeleteRecord id={ id } onDelete={ this.deleteRecipe(id) } />
                                        : null
                                    }
                                </React.Fragment> :
                                <p>{ `Please sign in to ${ action } the record` }</p>
                            }
                        </form>
                    </Typography>
                )
            default:
                return <h2>Internal Error on Recipe Record component</h2>
        }
    }

    /**
     * Initialise the component state to match the recipe item if one exists,
     * or a blank record otherwise
     */
    private initState(): IState {
        const id = this.props.match.params.id

        let state: IState = {
            cook_time: 1,
            id,
            image_url: '',
            ingredient_sections: [],
            method: [],
            prep_time: 1,
            produces: 1,
            reference_url: '',
            servesSelected: true,
            status: RetrievalStatus.AVAILABLE,
            title: ''
        }

        if (id) {
            const recipe = this.props.recipes[id]
            if (recipe) {
                // this adds either 'makes' or 'serves' as an unused extraneous property
                state = Object.assign({ status: RetrievalStatus.AVAILABLE }, recipe) as IState
                state.servesSelected = (recipe.serves !== undefined)
                state.produces = (state.servesSelected ? recipe.serves : recipe.makes) as number
                // every heading should be defined (so it can be controlled by react)
                state.ingredient_sections.map(section => {
                    section.heading = section.heading ? section.heading : ''
                })
            } else {
                state.status = RetrievalStatus.RETRIEVING
            }
        }

        return state
    }

    /**
     * Package the component state into a new recipe item (or partial recipe
     * item if we are updating an existing record) and send it to the
     * server for processing
     * @param e the form submission event
     */
    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { title, servesSelected, produces, prep_time, cook_time, ingredient_sections, method, reference_url, image_url, id } = this.state
        const { recipes } = this.props
        // for ui reasons, ingredient_sections has strings instead of numbers, and empty strings instead of undefined properties
        // fix that before submission
        const sections: IIngredientSection[] = ingredient_sections.map(section =>
            Object.assign(
                {
                    ingredients: section.ingredients.map(ingredient =>
                        ingredient.ingredient_type === IngredientType.Quantified ?
                            Object.assign(
                                { ingredient_type: ingredient.ingredient_type, food_id: ingredient.food_id },
                                { amount: Number(ingredient.amount) },
                                { unit_ids: ingredient.unit_ids.map(unitID => Number(unitID)) },
                                ingredient.additional_desc ? { additional_desc: ingredient.additional_desc } : {}
                            ) :
                            ingredient
                    )
                },
                section.heading ? { heading: section.heading } : {}
            )
        )

        const newRecipe: INewRecipe = Object.assign({},
            { title, reference_url, image_url, method },
            { [servesSelected ? 'serves' : 'makes']: Number(produces) },
            { 'prep_time': Number(prep_time), 'cook_time': Number(cook_time), 'ingredient_sections': sections }
        )

        if (id) {
            const update = Utility.subtract(newRecipe, recipes[id])
            if (Object.getOwnPropertyNames(update).length > 0) {
                this.props.updateRecipe(id, update)
                    .catch(() => null)
            }
        } else {
            this.props.createRecipe(newRecipe)
                .catch(() => null)
        }
    }

    /**
     * Update the specified property whenever the input box changes
     * @param property a first-level property on the component state
     */
    private onInputChange = (property: string) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = String(e.target.value) // cache the result before React's Synthetic Handler clears it
        this.setState(() => ({ [property]: value }))
    }

    /**
     * Toggle whether the 'produces' value correspond to the number of items the recipe makes,
     * or the number of servings the recipe produces
     */
    private toggleProduces = () => this.setState((state: IState) => ({ servesSelected: !state.servesSelected }))

    /**
     * Whenever the Ingredients sub-component updates its internal state,
     * update this component's state accordingly
     * @param updateFn the update function that was used to update the Ingredients component's state
     */
    private updateIngredients = (updateFn: (ingState: IIngsState) => Partial<IIngsState>) =>
        this.setState((state: IState) => {
            const update = updateFn({ sections: state.ingredient_sections })
            return update.sections ? { ingredient_sections: update.sections } : {}
        })

    /**
     * Whenever the RecipeMethod sub-component updates its internal state,
     * update this component's state accordingly
     * @param updateFn the update function that was used to update the RecipeMethod component's state
     */
    private updateMethod = (updateFn: (methodState: IMethodState) => Partial<IMethodState>) =>
        this.setState((state: IState) => {
            const update = updateFn({ steps: state.method })
            return update.steps ? { method: update.steps } : {}
        })

    /**
     * Returns a boolean indicating whether the component describes a valid recipe
     */
    private valid = () => {
        const { title, produces, prep_time, cook_time, ingredient_sections, method, reference_url, image_url } = this.state
        const validTitle = title && title.trim().length > 0
        const validQuantities =
            Number.isInteger(Number(produces)) && Number(produces) > 0 &&
            Number.isInteger(Number(prep_time)) && Number(prep_time) > 0 &&
            Number.isInteger(Number(cook_time)) && Number(cook_time) > 0
        const validIngredientSections =
            ingredient_sections.length > 0 &&
            ingredient_sections.reduce((allSectionsAreValid, section) =>
                allSectionsAreValid &&
                // we don't need to check the heading - it is valid in all circumstances
                section.ingredients.reduce((allIngredientsAreValid, ingredient) =>
                    allIngredientsAreValid && (
                        (
                            ingredient.ingredient_type === IngredientType.Quantified &&
                            Number(ingredient.amount) > 0 &&
                            ingredient.unit_ids.length > 0 &&
                            ingredient.unit_ids.reduce((allUnitIdsAreValid, unitID) =>
                                allUnitIdsAreValid &&
                                Number.isInteger(Number(unitID)) &&
                                Number(unitID) >= 0 &&
                                Number(unitID) <= 12,
                                true) &&
                            // this component cannot confirm that the food id corresponds to a real food item
                            // the UI should enforce it.
                            ingredient.food_id.trim().length > 0
                            // we don't need to check the additional_desc - it is valid in all circumstances
                        ) ||
                        (
                            ingredient.ingredient_type === IngredientType.FreeText &&
                            ingredient.description.trim().length > 0
                        )
                    ),
                    true),
                true)
        const validMethod =
            method.length > 0 &&
            method.reduce((allStepsAreValid, step) => step.trim().length > 0, true)
        const validUrls = reference_url.trim().length > 0 && image_url.trim().length > 0

        return validTitle && validQuantities && validIngredientSections && validMethod && validUrls
    }

    /**
     * The DeleteRecord component expects a function with no arguments, but we need to call
     * this.props.deleteRecipe with the recipe id.
     * This function simply adds a layer of indirection to get the call signatures to match
     */
    private deleteRecipe = (id: string) => () => this.props.deleteRecipe(id).catch(() => null)
}

/**
 * This component is a TextField with some default properties already set for simplicity
 * @param props any additional properties to add to the TextField
 */
const InputField = (props: any) => (
    <TextField required={ true }
               fullWidth={ true }
               margin={ 'normal' }
               { ...props } />
)

/**
 * This component wraps its children in an expansion panel
 */
const Compress = (props: ICompressProps) => (
    <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={ <ExpandMoreIcon /> }>
            <Typography>{ props.heading }</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            { props.children }
        </ExpansionPanelDetails>
    </ExpansionPanel>
)

interface ICompressProps {
    heading: string
    children: JSX.Element
}

enum RetrievalStatus {
    AVAILABLE = 'AVAILABLE',
    RETRIEVING = 'RETRIEVING',
    UNAVAILABLE = 'UNAVAILABLE'
}

interface IState {
    cook_time: number
    id: string | null
    image_url: string
    ingredient_sections: IIngredientSection[]
    last_updated?: number
    method: string[]
    prep_time: number
    produces: number
    reference_url: string
    servesSelected: boolean
    title: string
    status: RetrievalStatus
}

type IProps = RouteComponentProps<{ id: string }> & {
    authenticated: boolean
    recipes: IRecipeState
    createRecipe: (item: INewRecipe) => Promise<undefined>
    deleteRecipe: (id: string) => Promise<undefined>
    getRecipe: (id: string) => Promise<undefined>
    updateRecipe: (id: string, item: Partial<INewRecipe>) => Promise<undefined>
}

const mapStateToProps = (state: IGlobalState) => ({
    authenticated: state.user.profile !== null,
    recipes: state.recipes
})

export default connect(mapStateToProps, { createRecipe, deleteRecipe, getRecipe, updateRecipe })(RecipeRecord)
