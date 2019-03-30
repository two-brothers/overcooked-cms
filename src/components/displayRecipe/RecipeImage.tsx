import { Button, TextField } from '@material-ui/core'
import * as React from 'react'
import { ChangeEvent } from 'react'
import FlexView from 'react-flexview'
import { connect } from 'react-redux'

import { upload } from '../../reducers/upload/actions'
import SubComponent from '../SubComponent'

interface IPassedProps {
    authenticated: boolean
}

class RecipeImage extends SubComponent<IProps, IState> {
    public render(): JSX.Element {
        const { authenticated } = this.props
        const { imageUrl } = this.state
        return (

            <FlexView column={ true } grow={ true }>
                <FlexView>
                    <TextField label={ 'image' }
                               type={ 'file' }
                               onChange={ this.setImage }
                               required={ false }
                               fullWidth={ true }
                               inputProps={ { readOnly: !authenticated } }
                    />

                    <Button onClick={ this.uploadImage }
                            disabled={ !authenticated }
                            color={ 'primary' }>
                        Upload
                    </Button>
                </FlexView>

                <TextField label={ 'image url' }
                           value={ imageUrl }
                           inputProps={ { readOnly: true } }
                           disabled={ !authenticated }
                />

                <img src={ imageUrl }
                     width={ '300px' }
                />
            </FlexView>
        )
    }

    /**
     * Save the selected image file to the local state
     */
    private setImage = (e: ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files ? e.target.files[0] : null
        this.setState(() => ({ image }))
    }

    /**
     * Upload the image file to the server and update the image url accordingly
     */
    private uploadImage = () => {
        if (this.state.image) {
            this.props.upload(this.state.image)
                .then(imageUrl => this.setState(() => ({ imageUrl })))
        }
    }
}

export interface IState {
    image?: Blob | null
    imageUrl: string
}

type IProps = IPassedProps & {
    upload: (file: Blob) => Promise<string>
}

export default connect(null, { upload })(RecipeImage)
