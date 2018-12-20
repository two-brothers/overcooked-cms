import { Fab, Table, TableBody, TableCell, TableHead, TableRow, withStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Component } from 'react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

interface IPassedProps<T> {
    // the table headings
    headings: string[]
    // the list of records to display
    records: T[];
    // a unique key per record
    keyFn: (record: T) => string;
    // accepts a record and heading and returns the corresponding value to display
    valueFn: (record: T, heading: string) => JSX.Element;
    // the route that will let the user create a new record
    newRoute: string;
    // the route to navigate to when a record is selected
    selectRoute: (record: T) => string;
}

/**
 * A component that displays an array of values and navigates to a predefined route
 * whenever a user wants to interact with the items or create a new one
 */
class InteractiveTable<T> extends Component<IProps<T>> {
    public render(): JSX.Element {
        const {headings, classes, records, keyFn, valueFn} = this.props;

        return (
            <div>
                <Table className={classes.section}>
                    <TableHead>
                        <TableRow>
                            {headings.map(heading => (<TableCell key={heading}>{heading}</TableCell>))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map(record => (
                            <TableRow key={keyFn(record)} hover={true} onClick={this.navigateTo(record)}>
                                {headings.map(heading => (
                                    <TableCell key={heading}>{valueFn(record, heading)}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Fab color={'primary'} size={'small'}><AddIcon onClick={this.newRecord}/></Fab>
            </div>
        );
    }

    /**
     * Navigate to the route associated with the specified record
     * @param record the record that was selected
     */
    private navigateTo = (record: T) => () => {
        const {history, selectRoute} = this.props;
        history.push(selectRoute(record));
    };

    /**
     * Navigate to the new record route
     */
    private newRecord = () => {
        const {history, newRoute} = this.props;
        history.push(newRoute);
    };
}

const styles = () => ({
    section: {
        marginBottom: 8 * 3
    }
});

type IProps<T> = IPassedProps<T> & RouteComponentProps & {
    classes: any;
};

export default withRouter(withStyles(styles)(InteractiveTable));