export type IState = IUnit[];

/**
 * The measurement units are hardcoded and never change.
 */
export default function (state = initialState) {
    return state;
};

const initialState: IState = [
    {singular: '', plural: ''},
    {singular: 'g', plural: 'g'},
    {singular: 'ml', plural: 'ml'},
    {singular: ' tsp', plural: ' tsp'},
    {singular: ' Tbsp', plural: ' Tbsp'},
    {singular: ' cup', plural: ' cups'},
    {singular: ' bunch of', plural: ' bunches of'},
    {singular: ' rasher of', plural: ' rashes of'},
    {singular: ' head of', plural: ' heads of'},
    {singular: ' sprig of', plural: ' sprigs of'},
    {singular: ' stalk of', plural: ' stalks of'},
    {singular: ' sheet of', plural: ' sheets of'},
    {singular: ' slice of', plural: ' slices of'}

];

interface IUnit {
    singular: string;
    plural: string;
}