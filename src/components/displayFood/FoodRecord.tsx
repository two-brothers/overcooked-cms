import { Button, TextField, Typography } from '@material-ui/core';
import * as React from 'react';
import { ChangeEvent, Component, FormEvent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { IGlobalState } from '../../reducers';
import { createFood, deleteFood, updateFood } from '../../reducers/food/actions';
import { IState as IFoodState } from '../../reducers/food/reducer';
import { IState as IUnits } from '../../reducers/units/reducer';
import { INewFood } from '../../server/interfaces';
import DeleteRecord from '../DeleteRecord';
import { Utility } from '../utility';
import UnitsSelector, { IState as IUSState } from './UnitsSelector';

/**
 * A class to create or update a Food Record
 */
class FoodRecord extends Component<IProps> {
    public state: IState = this.initState();

    public render(): JSX.Element {
        const {singular, plural, id, selections} = this.state;
        const {food, authenticated} = this.props;
        const action = id ? 'update' : 'create';

        return (id && !food[id]) ?
            <h2>Record Not Found</h2> :
            (
                <Typography component={'div'}>
                    <h2>{singular.toUpperCase()} {id ? `( ${id} )` : null}</h2>
                    <form onSubmit={this.onSubmit}>
                        <TextField label={'singular'}
                                   value={singular}
                                   onChange={this.onInputChange('singular')}
                                   required={true}
                                   fullWidth={true}
                                   margin={'normal'}
                                   inputProps={{readOnly: !authenticated}}
                        />

                        <TextField label={'plural'}
                                   value={plural}
                                   onChange={this.onInputChange('plural')}
                                   required={true}
                                   fullWidth={true}
                                   margin={'normal'}
                                   inputProps={{readOnly: !authenticated}}
                        />

                        <UnitsSelector state={{selections}}
                                       propagate={this.updateUnitSelection}
                                       singular={singular}
                                       plural={plural}
                                       readOnly={!authenticated}
                        />

                        {authenticated ?
                            <React.Fragment>
                                <Button type={'submit'}
                                        disabled={!this.valid()}
                                        color={'primary'}>
                                    {action.toUpperCase()}
                                </Button>
                                {id ?
                                    <DeleteRecord id={id} onDelete={this.deleteFood(id)} /> :
                                    null
                                }
                            </React.Fragment> :
                            <p>{`Please sign in to ${action} the record`}</p>
                        }
                    </form>
                </Typography>
            );
    }

    /**
     * Initialise the component state to match the food item if one exists,
     * or a blank record otherwise.
     */
    private initState(): IState {
        const selections = this.props.units.map(() => ({
            quantity: 1,
            selected: false
        }));

        const state: IState = {
            id: this.props.match.params.id,
            plural: '',
            selections,
            singular: ''
        };

        if (state.id && this.props.food[state.id]) {
            const food = this.props.food[state.id];
            state.singular = food.name.singular;
            state.plural = food.name.plural;
            food.conversions.map(conv => {
                state.selections[conv.unit_id].selected = true;
                state.selections[conv.unit_id].quantity = conv.ratio;
            });
        }

        return state;
    };

    /**
     * Package the component state into a new food item (or partial food
     * item if we are updating an existing record) and send it to the
     * server for processing
     * @param e the form submission event
     */
    private onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const {id, singular, plural, selections} = this.state;

        const newItem: INewFood = {
            conversions: selections.map((_, unitID) => unitID)
                .filter(unitID => selections[unitID].selected)
                .map(unitID => ({
                    ratio: Number(selections[unitID].quantity),
                    unit_id: unitID
                })),
            name: {plural, singular}
        };

        if (id) {
            const update = Utility.subtract(newItem, this.props.food[id]);
            if (Object.getOwnPropertyNames(update).length > 0) {
                this.props.updateFood(id, update);
            }
        } else {
            this.props.createFood(newItem);
        }
    };


    /**
     * Update the specified property whenever the input box changes
     * @param property a first-level property on the component state
     */
    private onInputChange = (property: string) => (e: ChangeEvent<HTMLInputElement>) =>
        this.setState({[property]: e.target.value});

    /**
     * This function will be called by UnitsSelector whenever its own state changes.
     * It should reproduce the change made to the UnitsSelector on the FoodRecord copy of the state.
     * @param updateFn the function called on the UnitsSelector to update it own state
     */
    private updateUnitSelection = (updateFn: (childState: IUSState) => Partial<IUSState>) =>
        this.setState((state: IState) => updateFn({selections: state.selections}));

    /**
     * Returns a boolean indicating whether the component describes a valid food item
     */
    private valid = () => {
        const {singular, plural, selections} = this.state;
        return singular.length > 0 &&
            plural.length > 0 &&
            selections.filter(unit => unit.selected).length > 0 &&
            selections.filter(unit => unit.selected && Number(unit.quantity) <= 0).length === 0;
    };

    /**
     * The DeleteRecord component expects a function with no arguments, but we need to call
     * this.props.deleteFood with the recipe id.
     * This function simply adds a layer of indirection to get the call signatures to match
     */
    private deleteFood = (id: string) => () => this.props.deleteFood(id);
}

interface IState {
    id: string | null;
    plural: string;
    singular: string;
    selections: IUnitSelection[];
}

export interface IUnitSelection {
    quantity: number;
    selected: boolean;
}

type IProps = RouteComponentProps<{ id: string }> & {
    authenticated: boolean;
    food: IFoodState;
    units: IUnits;
    createFood: (item: INewFood) => Promise<undefined>;
    deleteFood: (id: string) => Promise<undefined>;
    updateFood: (id: string, item: Partial<INewFood>) => Promise<undefined>;
}

const mapStateToProps = (state: IGlobalState) => ({
    authenticated: state.user.profile !== null,
    food: state.food,
    units: state.units
});

export default connect(mapStateToProps, {createFood, deleteFood, updateFood})(FoodRecord);