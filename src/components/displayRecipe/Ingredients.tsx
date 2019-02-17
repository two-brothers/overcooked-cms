import { Button, Divider, TextField } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import * as React from 'react'
import { ChangeEvent } from 'react'
import FlexView from 'react-flexview'

import { IIngredientSection, IngredientType } from '../../server/interfaces'
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
                    ingredientKeys: section.ingredients.map(() => random()),
                    sectionKey: random()
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
                    <React.Fragment key={ keys[secIdx].sectionKey }>
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
                                <FlexView key={ keys[secIdx].ingredientKeys[ingIdx] }>
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
                            <Button onClick={ this.newIngredient(IngredientType.Quantified, secIdx) }
                                    disabled={ !authenticated }
                                    color={ 'primary' }>
                                Add Quantified Ingredient
                            </Button>
                            <Button onClick={ this.newIngredient(IngredientType.FreeText, secIdx) }
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
            keys: [...(state.keys ? state.keys : []), { sectionKey: random(), ingredientKeys: [] }]
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
     * @param ingType the ingredient type
     * @param idx the index of the ingredient section
     */
    private newIngredient = (ingType: IngredientType, idx: number) => () => {
        this.setLocalState((state: IState) => {
            return { keys: NestedUtility.appendToNestedArray(state, `keys[${ idx }].ingredientKeys`, random()).keys }
        })
        const newIngredient = ingType === IngredientType.Quantified ?
            {
                additionalDesc: '',
                amount: '',
                foodId: '',
                ingredientType: ingType,
                unitIds: []
            } :
            {
                description: '',
                ingredientType: ingType
            }
        this.setState((state: IState) => ({
            sections: NestedUtility.appendToNestedArray(state, `sections[${ idx }].ingredients`, newIngredient).sections
        }))
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
            keys: NestedUtility.removeFromNestedArray(state, `keys[${ secIdx }].ingredientKeys`, ingIdx).keys
        }))
    }
}

export interface IState {
    sections: IIngredientSection[]
    keys?: ISectionKeys[]
}

interface ISectionKeys {
    sectionKey: number,
    ingredientKeys: number[]
}

const random = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

export default Ingredients

