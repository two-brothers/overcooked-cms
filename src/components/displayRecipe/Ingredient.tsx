import { Chip, FormControl, InputLabel, MenuItem, Select, TextField, withStyles } from '@material-ui/core'
import * as React from 'react'
import { ChangeEvent } from 'react'
import FlexView from 'react-flexview'
import { connect } from 'react-redux'


import { IGlobalState } from '../../reducers'
import { IState as IFoodState } from '../../reducers/food/reducer'
import { IState as IUnits } from '../../reducers/units/reducer'
import { IIngredient, IngredientType, IQuantifiedIngredient } from '../../server/interfaces'
import NestedUtility from '../nestedUtility'
import SubComponent from '../SubComponent'

interface IPassedProps {
    authenticated: boolean
}

class Ingredient extends SubComponent<IProps, IState> {
    public render(): JSX.Element {
        if (this.state.ing.ingredientType === IngredientType.Quantified) {
            const { amount, unitIds, foodId, additionalDesc } = this.state.ing
            const { units, food, authenticated, classes } = this.props
            const isSingular = Number(amount) === 1

            // the unit id options are either restricted by the chosen food, or not restricted at all
            // filter out the ones already chosen
            let unitIdOptions = foodId ? food[foodId].conversions.map(conv => conv.unitId) : units.map((_, idx) => idx)
            unitIdOptions = unitIdOptions.filter(id => unitIds.indexOf(id) < 0)

            let unitNames = units.map(unit => isSingular ? unit.singular : unit.plural)
            // replace the singular (empty) unit symbol with '(item)' or '(items)'
            unitNames = [isSingular ? '(item)' : '(items)', ...unitNames.slice(1)]

            const selectedUnitNames = unitIds.map(id => unitNames[id])
            const unitOptions = unitIdOptions.map(id => ({ idx: id, name: unitNames[id] }))

            const foodIds = Object.getOwnPropertyNames(food)

            return (
                <FlexView grow={ true } vAlignContent={ 'center' }>
                    <FlexView basis={ 100 } className={ classes.spaced }>
                        <TextField label={ 'quantity' }
                                   value={ amount }
                                   onChange={ this.onInputChange('amount') }
                                   type={ 'number' }
                                   required={ true }
                                   inputProps={ { min: 0, step: 0.01, readOnly: !authenticated } }
                        />
                    </FlexView>
                    <FlexView basis={ 100 } className={ classes.spaced }>
                        <FormControl className={ classes.fullWidth }>
                            <InputLabel required={ true }>Food</InputLabel>
                            <Select onChange={ authenticated ? this.onFoodSelection : undefined }
                                    value={ foodId }
                                    renderValue={ this.renderFoodSelection }>
                                { foodIds.map(id => (
                                    <MenuItem value={ id } key={ id } disabled={ !authenticated }>
                                        { isSingular ? food[id].name.singular : food[id].name.plural }
                                    </MenuItem>
                                )) }
                            </Select>
                        </FormControl>
                    </FlexView>
                    <FlexView basis={ 75 } className={ classes.spaced }>
                        <FormControl className={ classes.fullWidth }>
                            <InputLabel required={ true }>Units</InputLabel>
                            <Select onChange={ this.onUnitSelection } value={ '' }>
                                { unitOptions.map(option => (
                                    <MenuItem value={ option.idx }
                                              disabled={ !authenticated }
                                              key={ option.idx }>
                                        { option.name }
                                    </MenuItem>
                                )) }
                            </Select>
                        </FormControl>
                    </FlexView>
                    { selectedUnitNames.map((selection, selectionIdx) => (
                        <FlexView key={ selection } className={ classes.spaced }>
                            <Chip label={ selection }
                                  onDelete={ authenticated ? this.deleteSelectedUnit(selectionIdx) : undefined }
                                  color={ selectionIdx === 0 ? 'primary' : 'secondary' }
                            />
                        </FlexView>
                    )) }
                    <FlexView grow={ true }>
                        <TextField label={ 'description (optional)' }
                                   value={ additionalDesc }
                                   onChange={ this.onInputChange('additionalDesc') }
                                   required={ false }
                                   inputProps={ { readOnly: !authenticated } }
                                   fullWidth={ true }
                        />
                    </FlexView>
                </FlexView>
            )
        } else if (this.state.ing.ingredientType === IngredientType.FreeText) {
            const { authenticated, classes } = this.props

            return (
                <FlexView className={ classes.fullWidth }>
                    <TextField label={ 'description' }
                               value={ this.state.ing.description }
                               onChange={ this.onInputChange('description') }
                               required={ true }
                               inputProps={ { readOnly: !authenticated } }
                               fullWidth={ true }
                    />
                </FlexView>
            )
        } else { // we should never get to here
            return (<div />)
        }
    }

    /**
     * Update the specified property whenever the input box changes
     * @param property a first-level property on the component state
     */
    private onInputChange = (property: string) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = String(e.target.value) // cache the result before React's Synthetic Handler clears it
        this.setState((state: IState) => ({
            ing: NestedUtility.replaceField(state.ing, property, value)
        }))
    }

    /**
     * Whenever a new unit is selected, add it to the list of unitIds
     */
    private onUnitSelection = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = Number(e.target.value) // cache the result before React's Synthetic Handler clears it
        this.setState((state: IState) => {
            if (state.ing.ingredientType === IngredientType.Quantified && state.ing.unitIds.indexOf(value) < 0) {
                return { ing: NestedUtility.appendToNestedArray(state.ing, 'unitIds', value) }
            }
            return {}
        })
    }

    /**
     * Delete the specified unit from the list of unitIds
     * @param idx the index of the unit to delete
     */
    private deleteSelectedUnit = (idx: number) => () =>
        this.setState((state: IState) => (state.ing.ingredientType === IngredientType.Quantified) ?
            { ing: NestedUtility.removeFromNestedArray(state.ing, 'unitIds', idx) } :
            {}
        )

    /**
     * Whenever a food is selected, set the foodId and remove any incompatible units
     */
    private onFoodSelection = (e: ChangeEvent<HTMLSelectElement>) => {
        const foodId = e.target.value // cache the result before React's Synthetic Handler clear it
        this.setState((state: IState) => {
            if (state.ing.ingredientType === IngredientType.Quantified) {
                const ing: IQuantifiedIngredient = NestedUtility.replaceField(state.ing, 'foodId', foodId)
                const matchingUnitIds = this.props.food[foodId].conversions.map(conv => conv.unitId)
                const unitIds = ing.unitIds.filter(unitId => matchingUnitIds.indexOf(unitId) >= 0)
                return { ing: NestedUtility.replaceField(ing, 'unitIds', unitIds) }
            }
            return {}

        })
    }

    /**
     * Return the name of the food to display on the food select box
     * If the amount is 1 use the singular form, otherwise use the plural form
     * @param foodId the id of the selected food item
     */
    private renderFoodSelection = (foodId: string) => {
        if (foodId && this.state.ing.ingredientType === IngredientType.Quantified) {
            return this.state.ing.amount === 1 ?
                this.props.food[foodId].name.singular :
                this.props.food[foodId].name.plural
        }
        return ''
    }
}

const styles = () => ({
    fullWidth: {
        width: '100%'
    },
    spaced: {
        marginRight: '10px'
    }
})

type IProps = IPassedProps & {
    food: IFoodState
    units: IUnits
    classes: {
        fullWidth: any
        spaced: any
    }
}

export interface IState {
    ing: IIngredient
}


const mapStateToProps = (state: IGlobalState) => ({
    food: state.food,
    units: state.units
})

export default connect(mapStateToProps)(withStyles(styles)(Ingredient))
