import * as React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'

import { IGlobalState } from '../../reducers'
import { IState as IUnit } from '../../reducers/units/reducer'
import { IFood } from '../../server/interfaces'
import InteractiveTable from '../InteractiveTable'

/**
 * A class to display and interact with all food items
 */
class DisplayFood extends Component<IProps> {

    public render(): JSX.Element {
        const foodItems = this.props.foodItems
        return (
            <InteractiveTable
                headings={ ['Singular', 'Plural', 'Unit'] }
                keyFn={ this.key }
                valueFn={ this.value }
                records={ foodItems }
                newRoute={ '/food/new' }
                selectRoute={ this.select } />
        )
    }

    /**
     * Use the record id as a unique key
     * @param food the food record being displayed
     */
    private key = (food: IFood) => food.id

    /**
     * Navigate to a route that includes the record id when the food item is selected
     * @param food the selected food record
     */
    private select = (food: IFood) => `/food/${ food.id }`

    /**
     * Return the JSX Element that should be inserted in the table under the specified heading
     * For the name parameters, simply return a span with the name in it
     * For the unit parameter, return a list of human-readable units separated by line breaks
     * @param food the food record to display
     * @param heading the particular property to display
     */
    private value = (food: IFood, heading: string): JSX.Element => {
        switch (heading) {
            case 'Singular':
                return (<span>{ food.name.singular }</span>)
            case 'Plural':
                return (<span>{ food.name.plural }</span>)
            case 'Unit':
                return this.displayUnits(food)
            default:
                throw new Error(`Unrecognised heading: ${ heading }`)
        }
    }

    /**
     * Creates a JSX element containing the food item's conversions separated by line breaks
     * @param food the food item
     */
    private displayUnits = (food: IFood): JSX.Element => {
        const units = this.props.units
        return (
            <span>
                { food.conversions.map(conv => {
                    const unit = units[conv.unit_id]
                    const singular = `${ unit.singular } ${ food.name.singular }`
                    const plural = `${ unit.plural } ${ food.name.plural }`
                    return (
                        <span key={ conv.unit_id }>{ conv.ratio }{ conv.ratio === 1 ? singular : plural }<br /></span>)
                }) }
            </span>
        )
    }
}

interface IProps {
    foodItems: IFood[]
    units: IUnit
}

const mapStateToProps = (state: IGlobalState) => ({
    foodItems: Object.getOwnPropertyNames(state.food).map(id => state.food[id]),
    units: state.units
})

export default connect(mapStateToProps)(DisplayFood)