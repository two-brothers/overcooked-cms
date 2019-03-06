import { withStyles } from '@material-ui/core'
import * as React from 'react'

const Overlay = (props: IProps) => (
    <div className={ props.active ? props.classes.overlay: undefined } />
)

const styles = () => ({
    overlay: {
        'background-color': 'rgba(0,0,0,0.5)',
        'cursor': 'progress',
        'height': '100%',
        'left': 0,
        'position': 'fixed',
        'top': 0,
        'width': '100%',
        'z-index': 2
    }
})

interface IProps {
    active: boolean;
    classes: any;
}

// @ts-ignore - position: 'fixed' inexplicably causes a type error
export default withStyles(styles)(Overlay)
