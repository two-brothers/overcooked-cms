import { TextField } from '@material-ui/core'
import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

import { IGlobalState } from '../../reducers'
import { createFood, deleteFood, getFood, updateFood } from '../../reducers/food/actions'
import { IState as IFoodState } from '../../reducers/food/reducer'
import { IState as IUnits } from '../../reducers/units/reducer'
import { INewFood } from '../../server/interfaces'
import Record from '../Record'
import UnitsSelector, { IState as IUSState } from './UnitsSelector'

/**
 * A class to create or update a Food Record
 */
class FoodRecord extends Component<IProps> {
    public state: IState = this.initState()

    /**
     * Whenever the food is changed in the redux store, update the state accordingly
     */
    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>): void {
        const id = this.props.match.params.id
        if (id && (this.props.food[id] !== prevProps.food[id])) {
            this.setState(() => this.initState())
        }
    }

    public render(): JSX.Element {
        const { singular, plural, id, selections } = this.state
        const { authenticated, food } = this.props

        return (
            <Record id={ id }
                    records={ food }
                    retrieveRecord={ this.props.getFood }
                    title={ singular }
                    valid={ this.valid }
                    produceRecord={ this.produceFoodItem }
                    createRecord={ this.props.createFood }
                    onCreation={ this.routeToHome }
                    updateRecord={ this.props.updateFood }
                    deleteRecord={ this.props.deleteFood }>
                <TextField label={ 'singular' }
                           value={ singular }
                           onChange={ this.onInputChange('singular') }
                           required={ true }
                           fullWidth={ true }
                           margin={ 'normal' }
                           inputProps={ { readOnly: !authenticated } }
                />

                <TextField label={ 'plural' }
                           value={ plural }
                           onChange={ this.onInputChange('plural') }
                           required={ true }
                           fullWidth={ true }
                           margin={ 'normal' }
                           inputProps={ { readOnly: !authenticated } }
                />

                <UnitsSelector state={ { selections } }
                               propagate={ this.updateUnitSelection }
                               singular={ singular }
                               plural={ plural }
                               readOnly={ !authenticated }
                />
            </Record>
        )
    }

    /**
     * If the id is specified, retrieve the record from the redux store or the server
     * and use it to initialise the state. Otherwise, create a blank record.
     */
    private initState(): IState {
        const id = this.props.match.params.id
        const selections = this.props.units.map(() => ({
            quantity: 1,
            selected: false
        }))

        const state: IState = {
            id,
            plural: '',
            selections,
            singular: ''
        }

        if (id) {
            const food = this.props.food[id]
            if (food) {
                food.conversions.map(conv => {
                    selections[conv.unitId].selected = true
                    selections[conv.unitId].quantity = conv.ratio
                })
                state.singular = food.name.singular
                state.plural = food.name.plural
            }
        }

        return state
    }

    /**
     * Package the component state into an INewFood object
     */
    private produceFoodItem = () => {
        const { singular, plural, selections } = this.state
        return {
            conversions: selections.map((_, unitId) => unitId)
                .filter(unitId => selections[unitId].selected)
                .map(unitId => ({
                    ratio: Number(selections[unitId].quantity),
                    unitId
                })),
            name: { plural, singular }
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
     * This function will be called by UnitsSelector whenever its own state changes.
     * It should reproduce the change made to the UnitsSelector on the FoodRecord copy of the state.
     * @param updateFn the function called on the UnitsSelector to update it own state
     */
    private updateUnitSelection = (updateFn: (childState: IUSState) => Partial<IUSState>) =>
        this.setState((state: IState) => updateFn({ selections: state.selections }))

    /**
     * Returns a boolean indicating whether the component describes a valid food item
     */
    private valid = () => {
        const { singular, plural, selections } = this.state
        return singular.length > 0 &&
            plural.length > 0 &&
            selections.filter(unit => unit.selected).length > 0 &&
            selections.filter(unit => unit.selected && Number(unit.quantity) <= 0).length === 0
    }

    /**
     * Route to the home page
     */
    private routeToHome = () => {
        const { history } = this.props
        history.push(`${process.env.PUBLIC_URL}`)
    }
}

interface IState {
    id: string | null
    plural: string
    singular: string
    selections: IUnitSelection[]
}

export interface IUnitSelection {
    quantity: number
    selected: boolean
}

type IProps = RouteComponentProps<{ id: string }> & {
    authenticated: boolean
    food: IFoodState
    units: IUnits
    createFood: (item: INewFood) => Promise<undefined>
    deleteFood: (id: string) => Promise<undefined>
    getFood: (id: string) => Promise<undefined>
    updateFood: (id: string, item: Partial<INewFood>) => Promise<undefined>
}

const mapStateToProps = (state: IGlobalState) => ({
    authenticated: state.user.profile !== null,
    food: state.food,
    units: state.units
})

export default connect(mapStateToProps, { createFood, deleteFood, getFood, updateFood })(FoodRecord)
