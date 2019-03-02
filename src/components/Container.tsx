import * as React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import { initFood } from '../reducers/food/actions'
import { initRecipes } from '../reducers/recipe/actions'
import { retrieveUser } from '../reducers/user/actions'
import AppBar from './appBar/AppBar'
import FoodRecord from './displayFood/FoodRecord'
import RecipeRecord from './displayRecipe/RecipeRecord'
import Home from './Home'

/**
 * A wrapper for the UI components.
 * The purpose of this component is:
 *   - to perform any initialisation logic when the app loads
 *   - to live for the duration of the app,
 *     so the initialisation logic is not repeated as components are destroyed and/or re-rendered.
 *   - choose which components to display based on the route
 * Note that we cannot use the main App component for this purpose because the redux store
 * is only available in children of the App component
 */
class Container extends Component<IProps> {
    public componentDidMount(): void {
        Promise.all([
            this.props.initRecipes(),
            this.props.initFood(),
            this.props.retrieveUser()
        ]).catch(() => null)
    }

    public render(): JSX.Element {
        const base = process.env.PUBLIC_URL

        return (
            <BrowserRouter>
                <React.Fragment>
                    <AppBar />
                    <Switch>
                        <Route exact={ true } path={ `${ base }/food/new` } component={ FoodRecord } />
                        <Route exact={ true } path={ `${ base }/food/:id?` } component={ FoodRecord } />
                        <Route exact={ true } path={ `${ base }/recipe/new` } component={ RecipeRecord } />
                        <Route exact={ true } path={ `${ base }/recipe/:id?` } component={ RecipeRecord } />
                        <Route path={ `${ base }/` } component={ Home } />
                    </Switch>
                </React.Fragment>
            </BrowserRouter>
        )
    }
}

interface IProps {
    initFood: () => Promise<undefined>
    initRecipes: () => Promise<undefined>
    retrieveUser: () => Promise<undefined>
}

export default connect(null, { initFood, initRecipes, retrieveUser })(Container)
