import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Switch,
    TextField,
    Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

import { IGlobalState } from '../../reducers'
import { createRecipe, deleteRecipe, getRecipe, updateRecipe } from '../../reducers/recipe/actions'
import { IState as IRecipeState } from '../../reducers/recipe/reducer'
import { IIngredientSection, INewRecipe, IngredientType } from '../../server/interfaces'
import Record from '../Record'
import Ingredients, { IState as IIngsState } from './Ingredients'
import RecipeImage, { IState as IImageState } from './RecipeImage'
import RecipeMethod, { IState as IMethodState } from './RecipeMethod'

/**
 * A class to create or update a Recipe Record
 */
class RecipeRecord extends Component<IProps> {
    public state: IState = this.initState()

    /**
     * Whenever the recipe is changed in the redux store or the location changes,
     * update the state accordingly
     */
    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>): void {
        const id = this.props.match.params.id
        const recipeChanged = id && (this.props.recipes[id] !== prevProps.recipes[id])
        // this could happen when we navigate from the new recipe to update recipe pages
        // since the Router loads the RecipeRecord component either way, it does not reload the component
        const locationChanged = id !== prevProps.match.params.id
        if (recipeChanged || locationChanged) {
            this.setState(() => this.initState())
        }
    }

    public render(): JSX.Element {
        const { cookTime, id, imageUrl, ingredientSections, lastUpdated, method, prepTime, produces, referenceUrl, servesSelected, title } = this.state
        const { authenticated, recipes } = this.props

        return (
            <Record id={ id }
                    records={ recipes }
                    retrieveRecord={ this.props.getRecipe }
                    title={ title }
                    valid={ this.valid }
                    produceRecord={ this.produceRecipe }
                    createRecord={ this.props.createRecipe }
                    onCreation={ this.routeToRecipe }
                    updateRecord={ this.props.updateRecipe }
                    deleteRecord={ this.props.deleteRecipe }
                    onDelete={ this.routeToHome }>
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
                            value={ prepTime }
                            onChange={ this.onInputChange('prepTime') }
                            type={ 'number' }
                            inputProps={ { readOnly: !authenticated, min: 1 } }
                />

                <InputField label={ 'cooking time (mins)' }
                            value={ cookTime }
                            onChange={ this.onInputChange('cookTime') }
                            type={ 'number' }
                            inputProps={ { readOnly: !authenticated, min: 1 } }
                />

                <Compress heading={ 'Ingredients' }>
                    <Ingredients state={ { sections: ingredientSections } }
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

                <Compress heading={ 'Image' }>
                    <RecipeImage state={ { imageUrl } }
                                 propagate={ this.updateImageUrl }
                                 authenticated={ authenticated }
                    />
                </Compress>

                <InputField label={ 'reference url' }
                            value={ referenceUrl }
                            onChange={ this.onInputChange('referenceUrl') }
                            inputProps={ { readOnly: !authenticated } }
                />

                { lastUpdated &&
                <InputField label={ 'last updated' }
                            value={ (new Date(lastUpdated)).toLocaleString() }
                            inputProps={ { readOnly: true } }
                />
                }
            </Record>
        )
    }

    /**
     * If the id is specified, retrieve the record from the redux store or the server
     * and use it to initialise the state. Otherwise, create a blank record.
     */
    private initState(): IState {
        const id = this.props.match.params.id

        let state: IState = {
            cookTime: 1,
            id,
            imageUrl: '',
            ingredientSections: [],
            method: [],
            prepTime: 1,
            produces: 1,
            referenceUrl: '',
            servesSelected: true,
            title: ''
        }

        if (id) {
            const recipe = this.props.recipes[id]
            if (recipe) {
                // this adds either 'makes' or 'serves' as an unused extraneous property
                state = Object.assign({}, recipe) as IState
                state.servesSelected = (recipe.serves !== undefined)
                state.produces = (state.servesSelected ? recipe.serves : recipe.makes) as number
                // every heading should be defined (so it can be controlled by react)
                state.ingredientSections.map(section => {
                    section.heading = section.heading ? section.heading : ''
                })
            }
        }

        return state
    }

    /**
     * Package the component state into an INewRecipe object
     */
    private produceRecipe = () => {
        const { title, servesSelected, produces, prepTime, cookTime, ingredientSections, method, referenceUrl, imageUrl } = this.state
        // for ui reasons, ingredientSections has strings instead of numbers, and empty strings instead of undefined properties
        // fix that before the recipe is sent to the server
        const sections: IIngredientSection[] = ingredientSections.map(section =>
            Object.assign(
                {
                    ingredients: section.ingredients.map(ingredient =>
                        ingredient.ingredientType === IngredientType.Quantified ?
                            Object.assign(
                                { ingredientType: ingredient.ingredientType, foodId: ingredient.foodId },
                                { amount: Number(ingredient.amount) },
                                { unitIds: ingredient.unitIds.map(unitId => Number(unitId)) },
                                ingredient.additionalDesc ? { additionalDesc: ingredient.additionalDesc } : {}
                            ) :
                            ingredient
                    )
                },
                section.heading ? { heading: section.heading } : {}
            )
        )

        return Object.assign({},
            { title, referenceUrl, imageUrl, method },
            { [servesSelected ? 'serves' : 'makes']: Number(produces) },
            { 'prepTime': Number(prepTime), 'cookTime': Number(cookTime), 'ingredientSections': sections }
        )
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
            const update = updateFn({ sections: state.ingredientSections })
            return update.sections ? { ingredientSections: update.sections } : {}
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
     * Whenever the RecipeImage sub-component update its internal state,
     * update this component's state accordingly
     * @param updateFn the update function that was used to update the RecipeImage component's state
     */
    private updateImageUrl = (updateFn: (imageState: IImageState) => Partial<IImageState>) =>
        this.setState((state: IState) => {
            const update = updateFn({ imageUrl: state.imageUrl })
            return update.imageUrl ? { imageUrl: update.imageUrl } : {}
        })

    /**
     * Returns a boolean indicating whether the component describes a valid recipe
     */
    private valid = () => {
        const { title, produces, prepTime, cookTime, ingredientSections, method, referenceUrl, imageUrl } = this.state
        const validTitle = title !== undefined && title.trim().length > 0
        const validQuantities =
            Number.isInteger(Number(produces)) && Number(produces) > 0 &&
            Number.isInteger(Number(prepTime)) && Number(prepTime) > 0 &&
            Number.isInteger(Number(cookTime)) && Number(cookTime) > 0
        const validIngredientSections =
            ingredientSections.length > 0 &&
            ingredientSections.reduce((allSectionsAreValid, section) =>
                allSectionsAreValid &&
                // we don't need to check the heading - it is valid in all circumstances
                section.ingredients.reduce((allIngredientsAreValid, ingredient) =>
                    allIngredientsAreValid && (
                        (
                            ingredient.ingredientType === IngredientType.Quantified &&
                            Number(ingredient.amount) > 0 &&
                            ingredient.unitIds.length > 0 &&
                            ingredient.unitIds.reduce((allUnitIdsAreValid, unitID) =>
                                allUnitIdsAreValid &&
                                Number.isInteger(Number(unitID)) &&
                                Number(unitID) >= 0 &&
                                Number(unitID) <= 12,
                                true) &&
                            // this component cannot confirm that the food id corresponds to a real food item
                            // the UI should enforce it.
                            ingredient.foodId.trim().length > 0
                            // we don't need to check the additionalDesc - it is valid in all circumstances
                        ) ||
                        (
                            ingredient.ingredientType === IngredientType.FreeText &&
                            ingredient.description.trim().length > 0
                        )
                    ),
                    true),
                true)
        const validMethod =
            method.length > 0 &&
            method.reduce((allStepsAreValid, step) => step.trim().length > 0, true)
        const validUrls = referenceUrl.trim().length > 0 && imageUrl.trim().length > 0

        return validTitle && validQuantities && validIngredientSections && validMethod && validUrls
    }

    /**
     * Route to the newly created recipe page
     * @param id the recipe id
     */
    private routeToRecipe = (id: string) => {
        const { history } = this.props
        history.push(`${ process.env.PUBLIC_URL }/recipe/${ id }`)
    }

    /**
     * Route to the home page
     */
    private routeToHome = () => {
        const { history } = this.props
        history.push(`${ process.env.PUBLIC_URL }`)
    }
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

interface IState {
    cookTime: number
    id: string | null
    imageUrl: string
    ingredientSections: IIngredientSection[]
    lastUpdated?: number
    method: string[]
    prepTime: number
    produces: number
    referenceUrl: string
    servesSelected: boolean
    title: string
}

type IProps = RouteComponentProps<{ id: string }> & {
    authenticated: boolean
    recipes: IRecipeState
    createRecipe: (item: INewRecipe) => Promise<string>
    deleteRecipe: (id: string) => Promise<undefined>
    getRecipe: (id: string) => Promise<undefined>
    updateRecipe: (id: string, item: Partial<INewRecipe>) => Promise<undefined>
}

const mapStateToProps = (state: IGlobalState) => ({
    authenticated: state.user.profile !== null,
    recipes: state.recipes
})

export default connect(mapStateToProps, { createRecipe, deleteRecipe, getRecipe, updateRecipe })(RecipeRecord)
