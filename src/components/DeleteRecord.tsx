import {
    Button,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    TextField,
    Typography
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import FlexView from 'react-flexview'


interface IProps {
    id: string
    onDelete: () => void
}

class DeleteRecord extends Component<IProps> {
    public state: IState = {
        confirmation: ''
    }

    public render(): JSX.Element {
        const { confirmation } = this.state
        const { id } = this.props
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={ <ExpandMoreIcon /> }>
                    <Typography color={ 'secondary' }>DELETE RECORD</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <FlexView column={ true } grow={ true }>
                        <TextField label={ 'Record ID' }
                                   required={ true }
                                   fullWidth={ true }
                                   margin={ 'normal' }
                                   onChange={ this.onConfirmationChange }
                        />
                        <Button disabled={ confirmation !== id }
                                onClick={ this.props.onDelete }
                                color={ 'secondary' }
                                variant={ 'contained' }>
                            DELETE
                        </Button>
                    </FlexView>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    /**
     * Update the confirmation value whenever the input box changes
     */
    private onConfirmationChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value // cache the result before React's Synthetic Handler clears it
        this.setState(() => ({ confirmation: value }))
    }
}

interface IState {
    confirmation: string
}

export default DeleteRecord