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
import { IState as IFoodState } from '../../reducers/food/reducer';
import FoodItem from './FoodItem';
import NewFood from './NewFood';

/**
 * A class to display and interact with all food items
 */
class DisplayFood extends Component<IProps> {
    public state: IState = {
        modal_open: false
    };

    public render(): JSX.Element {
        return (
            <div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Singular</TableCell>
                            <TableCell>Plural</TableCell>
                            <TableCell>Standard Unit</TableCell>
                            <TableCell>
                                <Fab size={'small'} onClick={this.setModalOpen(true)}><AddIcon/></Fab>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{
                        Object.getOwnPropertyNames(this.props.food).map(id => (
                            <FoodItem key={id} food={this.props.food[id]}/>
                        ))
                    }</TableBody>
                </Table>
                <Modal open={this.state.modal_open} onClose={this.setModalOpen(false)}>
                    <Paper>
                        <NewFood/>
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
    modal_open: boolean;
}

interface IProps {
    food: IFoodState;
}


const mapStateToProps = (state: IGlobalState) => ({
    food: state.food
});

export default connect(mapStateToProps)(DisplayFood);