export type IState = IUnit[];

/**
 * The measurement units are hardcoded and never change.
 */
export default function (state = initialState) {
    return state;
};

const initialState: IState = [
    {name: 'Singular', singular: ' x ', plural: ' x '},
    {name: 'Grams', singular: 'g ', plural: 'g '},
    {name: 'Millilitres', singular: 'ml ', plural: 'ml '},
    {name: 'tsp', singular: ' tsp ', plural: ' tsp '},
    {name: 'Tbsp', singular: ' Tbsp ', plural: ' Tbsp '},
    {name: 'Cups', singular: ' cup ', plural: ' cups '},
    {name: 'Bunch', singular: ' bunch of ', plural: ' bunches of '},
    {name: 'Rashers', singular: ' rasher of ', plural: ' rashes of '},
    {name: 'Head', singular: ' head of ', plural: ' heads of '},
    {name: 'Sprig', singular: ' sprig of ', plural: ' sprigs of '},
    {name: 'Stalk', singular: ' stalk of ', plural: ' stalks of '},
    {name: 'Sheets', singular: ' sheet of ', plural: ' sheets of '},
    {name: 'Slice', singular: ' slice of ', plural: ' slices of '}
];

interface IUnit {
    name: string;
    singular: string;
    plural: string;
}