import { Tab, Tabs, Theme, Typography, withStyles } from '@material-ui/core';
import * as React from 'react';
import { ChangeEvent, Component } from 'react';

import DisplayFood from './displayFood/DisplayFood';
import DisplayRecipes from './displayRecipe/DisplayRecipes';
import User from './User';

/**
 * A launchpad component that lets a user authenticate
 * and interact with either Food or Recipes
 */
class Home extends Component<IProps> {
    public state: IState = {
        activeTab: 0
    };

    public render(): JSX.Element {
        return (
            <Typography component={'div'}>
                <Tabs onChange={this.changeTab} value={this.state.activeTab} className={this.props.classes.tabs}>
                    <Tab label={'Recipes'}/>
                    <Tab label={'Food'}/>
                </Tabs>
                {this.state.activeTab === 0 && <DisplayRecipes/>}
                {this.state.activeTab === 1 && <DisplayFood/>}
                <User/>
            </Typography>
        );
    };

    /**
     * Switch the active tab
     * @param event the tab select
     * @param idx the index of the selected tab
     */
    private changeTab = (event: ChangeEvent, idx: number) => this.setState({activeTab: idx});
}

const styles = (theme: Theme) => ({
    tabs: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText
    }
});

interface IProps {
    classes: any;
}

interface IState {
    activeTab: number;
}

export default withStyles(styles)(Home);
