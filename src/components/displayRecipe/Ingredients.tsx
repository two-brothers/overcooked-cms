import { Button, Divider, TextField } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import * as React from 'react'
import { ChangeEvent } from 'react'
import FlexView from 'react-flexview'

import { IIngredientSection } from '../../server/interfaces'
import NestedUtility from '../nestedUtility'
import SubComponent from '../SubComponent'
import Ingredient, { IState as IIngState } from './Ingredient'

interface IProps {
    authenticated: boolean
}

class Ingredients extends SubComponent<IProps, IState> {
    /**
     * Before rendering the component, create a unique key for each
     * ingredient section and ingredient
     */
    public componentWillMount(): void {
        this.setLocalState((state: IState) => {
            return {
                keys: state.sections.map(section => ({
                    ingredient_keys: section.ingredients.map(() => random()),
                    section_key: random()
                }))
            }
        })
    }

    public render(): JSX.Element {
        const { authenticated } = this.props
        const { sections } = this.state
        // ensure typescript knows the keys are defined
        const keys = Object.assign({}, this.state.keys)

        return (
            <FlexView column={ true } width={ '100%' }>
                <FlexView>
                    <Button onClick={ this.newSection }
                            disabled={ !authenticated }
                            color={ 'primary' }>
                        New Section
                    </Button>
                </FlexView>
                { sections.map((section, secIdx) => (
                    <React.Fragment key={ keys[secIdx].section_key }>
                        { secIdx > 0 ? <Divider /> : null }
                        <FlexView column={ true } grow={ true }>
                            <TextField label={ 'heading (optional)' }
                                       value={ section.heading }
                                       onChange={ this.onHeadingChange(secIdx) }
                                       inputProps={ { readOnly: !authenticated } }
                                       required={ false }
                                       fullWidth={ true }
                                       margin={ 'normal' }
                            />
                            { section.ingredients.map((ing, ingIdx) => (
                                <FlexView key={ keys[secIdx].ingredient_keys[ingIdx] }>
                                    <Ingredient state={ { ing } }
                                                propagate={ this.updateIngredient(secIdx, ingIdx) }
                                                authenticated={ authenticated }
                                    />
                                    <Button onClick={ this.deleteIngredient(secIdx, ingIdx) }
                                            disabled={ !authenticated }>
                                        <DeleteIcon />
                                    </Button>
                                </FlexView>
                            )) }
                        </FlexView>
                        <FlexView>
                            <Button onClick={ this.newIngredient('Quantified', secIdx) }
                                    disabled={ !authenticated }
                                    color={ 'primary' }>
                                Add Quantified Ingredient
                            </Button>
                            <Button onClick={ this.newIngredient('FreeText', secIdx) }
                                    disabled={ !authenticated }
                                    color={ 'primary' }>
                                Add FreeText Ingredient
                            </Button>
                            <Button onClick={ this.deleteSection(secIdx) }
                                    disabled={ !authenticated }
                                    color={ 'secondary' }>
                                Delete Section
                            </Button>
                        </FlexView>
                    </React.Fragment>
                )) }
            </FlexView>
        )
    }

    /**
     * Update the heading of the specified ingredient section whenever the input box is updated
     * @param idx the index of the ingredient section
     */
    private onHeadingChange = (idx: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value // cache the result before React's Synthetic Handler clears it
        this.setState((state: IState) => ({
            sections: NestedUtility.replaceField(state, `sections[${ idx }].heading`, value).sections
        }))
    }

    /**
     * Create a new ingredient section
     */
    private newSection = () => {
        this.setLocalState((state: IState) => ({
            keys: [...(state.keys ? state.keys : []), { section_key: random(), ingredient_keys: [] }]
        }))
        this.setState((state: IState) => ({
            sections: NestedUtility.appendToNestedArray(state, `sections`, { heading: '', ingredients: [] }).sections
        }))
    }

    /**
     * Remove the specified ingredient section
     * @param idx the index of the ingredient section
     */
    private deleteSection = (idx: number) => () => {
        this.setState((state: IState) => ({
            sections: NestedUtility.removeFromNestedArray(state, `sections`, idx).sections
        }))
        this.setLocalState((state: IState) => ({
            keys: NestedUtility.removeFromNestedArray(state, `keys`, idx).keys
        }))
    }

    /**
     * Append a new empty ingredient of the specified type
     * at the end of the specified section's ingredient list
     * @param ingType the ingredient type (either 'Quantified' or 'FreeText')
     * @param idx the index of the ingredient section
     */
    private newIngredient = (ingType: string, idx: number) => () => {
        const validType = (ingType === 'Quantified' || ingType === 'FreeText')
        if (validType) {
            this.setLocalState((state: IState) => {
                return { keys: NestedUtility.appendToNestedArray(state, `keys[${ idx }].ingredient_keys`, random()).keys }
            })
            const newIngredient = ingType === 'Quantified' ?
                {
                    additional_desc: '',
                    amount: '',
                    food_id: '',
                    ingredient_type: ingType,
                    unit_ids: []
                } :
                {
                    description: '',
                    ingredient_type: ingType
                }
            this.setState((state: IState) => ({
                sections: NestedUtility.appendToNestedArray(state, `sections[${ idx }].ingredients`, newIngredient).sections
            }))
        }
    }

    /**
     * Whenever the sub-component corresponding to the specified ingredient is updated,
     * update this component's state accordingly.
     * @param secIdx the index of the ingredient section
     * @param ingIdx the index of the ingredient within the section
     */
    private updateIngredient = (secIdx: number, ingIdx: number) => (updateFn: (ingState: IIngState) => Partial<IIngState>) =>
        this.setState((state: IState) => {
            const update = updateFn({ ing: state.sections[secIdx].ingredients[ingIdx] })
            return update.ing !== undefined ?
                { sections: NestedUtility.replaceField(state, `sections[${ secIdx }].ingredients[${ ingIdx }]`, update.ing).sections } :
                {}
        })

    /**
     * Remove the specified ingredient
     * @param secIdx the index of the ingredient section
     * @param ingIdx the index of the ingredient within the section
     */
    private deleteIngredient = (secIdx: number, ingIdx: number) => () => {
        this.setState((state: IState) => ({
            sections: NestedUtility.removeFromNestedArray(state, `sections[${ secIdx }].ingredients`, ingIdx).sections
        }))
        this.setLocalState((state: IState) => ({
            keys: NestedUtility.removeFromNestedArray(state, `keys[${ secIdx }].ingredient_keys`, ingIdx).keys
        }))
    }
}

export interface IState {
    sections: IIngredientSection[]
    keys?: ISectionKeys[]
}

interface ISectionKeys {
    section_key: number,
    ingredient_keys: number[]
}

const random = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

export default Ingredients

