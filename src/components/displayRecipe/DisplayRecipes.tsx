import Fab from '@material-ui/core/Fab';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '../../reducers';
import { IState as IRecipeState } from '../../reducers/recipe/reducer';
import NewRecipe from './NewRecipe';
import RecipeItem from './RecipeItem';

/**
 * A class to display and interact with all recipes
 */
class DisplayRecipes extends Component<IProps> {
    public state: IState = {
        modal_open: false
    };

    public render(): JSX.Element {
        return (
            <div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>
                                <Fab size={'small'} onClick={this.setModalOpen(true)}><AddIcon/></Fab>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{
                        this.props.recipes.map(recipe => (
                           <RecipeItem key={recipe.id} recipe={recipe}/>
                        ))
                    }</TableBody>
                </Table>
                <Modal open={this.state.modal_open} onClose={this.setModalOpen(false)}>
                    <Paper>
                        <NewRecipe/>
                    </Paper>
                </Modal>
            </div>
        );
    }

    /**
     * Return a function that can be used to either open or close the modal
     * @param open whether the returned function opens (if 'open' is true) or closes the modal
     */
    private setModalOpen = (open: boolean) => () => {
        this.setState({modal_open: open});
    };

}

interface IState {
    modal_open: boolean
}

interface IProps {
    recipes: IRecipeState
}

const mapStateToProps = (state: IGlobalState) => ({
    recipes: state.recipes
});

export default connect(mapStateToProps)(DisplayRecipes);