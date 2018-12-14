import Fab from '@material-ui/core/Fab';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { deleteRecipe } from '../../reducers/recipe/actions';
import { IRecipe } from '../../server/interfaces';
import UpdateRecipe from './UpdateRecipe';

interface IPassedProps {
    // the recipe to interact with
    recipe: IRecipe;
}

class RecipeItem extends Component<IProps> {
    public state: IState = {
        editing: false
    };


    public render(): JSX.Element {
        return (
            <TableRow>
                <TableCell>{this.props.recipe.title}</TableCell>
                <TableCell>
                    <Fab size={'small'} onClick={this.setEditModalOpen(true)}><EditIcon/></Fab>
                    <Fab size={'small'} onClick={this.remove}><DeleteIcon/></Fab>
                </TableCell>
                <Modal open={this.state.editing} onClose={this.setEditModalOpen(false)}>
                    <Paper>
                        <UpdateRecipe recipe={this.props.recipe}/>
                    </Paper>
                </Modal>

            </TableRow>
        );
    }

    /**
     * Remove this recipe from the server
     */
    private remove = () => {
        this.props.deleteRecipe(this.props.recipe.id);
    };

    /**
     * Return a function that can be used to either open or close the edit modal
     * @param open whether the returned function opens (if 'open' is true) or closes the modal
     */
    private setEditModalOpen = (open: boolean) => () => {
        this.setState({editing: open});
    };
}

type IProps = IPassedProps & {
    deleteRecipe: (id: string) => Promise<undefined>;
}

interface IState {
    editing: boolean;
}

export default connect(null, {deleteRecipe})(RecipeItem);