import Fab from '@material-ui/core/Fab';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import DeleteIcon from '@material-ui/icons/Delete';
import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { deleteRecipe } from '../../reducers/recipe/actions';
import { IRecipe } from '../../server/interfaces';

class RecipeItem extends Component<IProps> {
    public render(): JSX.Element {
        return (
            <TableRow>
                <TableCell>{this.props.recipe.title}</TableCell>
                <TableCell>
                    <Fab size={'small'} onClick={this.remove}><DeleteIcon/></Fab>
                </TableCell>
            </TableRow>
        );
    }

    /**
     * Remove this recipe from the server
     */
    private remove = () => {
        this.props.deleteRecipe(this.props.recipe.id);
    };
}

interface IProps {
    recipe: IRecipe;
    deleteRecipe: (id: string) => Promise<undefined>;
}

export default connect(null, {deleteRecipe})(RecipeItem);