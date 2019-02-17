import { Button, TextField, Typography } from '@material-ui/core'
import * as React from 'react'
import { ChangeEvent, Component, FormEvent } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

import { IGlobalState } from '../../reducers'
import { createFood, deleteFood, getFood, updateFood } from '../../reducers/food/actions'
import { IState as IFoodState } from '../../reducers/food/reducer'
import { IState as IUnits } from '../../reducers/units/reducer'
import { INewFood } from '../../server/interfaces'
import DeleteRecord from '../DeleteRecord'
import { Utility } from '../utility'
import UnitsSelector, { IState as IUSState } from './UnitsSelector'

/**
 * A class to create or update a Food Record
 */
class FoodRecord extends Component<IProps> {
    public state: IState = this.initState()

    public componentDidMount(): void {
        const id = this.props.match.params.id
        if (id && !this.props.food[id]) {
            this.props.getFood(id)
                .then(() => this.setState(() => this.initState()))
                .catch(() => this.setState(() => ({ status: RetrievalStatus.UNAVAILABLE })))
        }
    }

    public render(): JSX.Element {
        const { singular, plural, id, selections, status } = this.state
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
                        <h2>{ singular.toUpperCase() } { id ? `( ${ id } )` : null }</h2>
                        <form onSubmit={ this.onSubmit }>
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

                            { authenticated ?
                                <React.Fragment>
                                    <Button type={ 'submit' }
                                            disabled={ !this.valid() }
                                            color={ 'primary' }>
                                        { action.toUpperCase() }
                                    </Button>
                                    { id ?
                                        <DeleteRecord id={ id } onDelete={ this.deleteFood(id) } /> :
                                        null
                                    }
                                </React.Fragment> :
                                <p>{ `Please sign in to ${ action } the record` }</p>
                            }
                        </form>
                    </Typography>
                )
            default:
                return <h2>Internal Error on Food Record component</h2>
        }
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
            singular: '',
            status: RetrievalStatus.AVAILABLE
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
            } else {
                state.status = RetrievalStatus.RETRIEVING
            }
        }

        return state
    }

    /**
     * Package the component state into a new food item (or partial food
     * item if we are updating an existing record) and send it to the
     * server for processing
     * @param e the form submission event
     */
    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { id, singular, plural, selections } = this.state

        const newItem: INewFood = {
            conversions: selections.map((_, unitId) => unitId)
                .filter(unitId => selections[unitId].selected)
                .map(unitId => ({
                    ratio: Number(selections[unitId].quantity),
                    unitId
                })),
            name: { plural, singular }
        }

        if (id) {
            const update = Utility.subtract(newItem, this.props.food[id])
            if (Object.getOwnPropertyNames(update).length > 0) {
                this.props.updateFood(id, update)
                    .catch(() => null)
            }
        } else {
            this.props.createFood(newItem)
                .catch(() => null)
        }
    }


    /**
     * Update the specified property whenever the input box changes
     * @param property a first-level property on the component state
     */
    private onInputChange = (property: string) => (e: ChangeEvent<HTMLInputElement>) =>
        this.setState({ [property]: e.target.value })

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
     * The DeleteRecord component expects a function with no arguments, but we need to call
     * this.props.deleteFood with the recipe id.
     * This function simply adds a layer of indirection to get the call signatures to match
     */
    private deleteFood = (id: string) => () => this.props.deleteFood(id).catch(() => null)
}

enum RetrievalStatus {
    AVAILABLE = 'AVAILABLE',
    RETRIEVING = 'RETRIEVING',
    UNAVAILABLE = 'UNAVAILABLE'
}

interface IState {
    id: string | null
    plural: string
    singular: string
    selections: IUnitSelection[]
    status: RetrievalStatus
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
