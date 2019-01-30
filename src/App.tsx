import * as React from 'react'
import { Provider } from 'react-redux'

import Container from './components/Container'
import store from './store'

class App extends React.Component {
    public render() {
        return (
            <Provider store={ store }>
                <Container />
            </Provider>
        )
    }
}

export default App