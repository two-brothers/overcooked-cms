export interface IPagedFood {
    food: IFood[];
    last_page: boolean;
}

export interface INewFood {
    name: {
        singular: string;
        plural: string;
    }
    conversions: IUnitConversion[];
}

export type IFood = INewFood & {
    id: string;
}

export interface IUnitConversion {
    unit_id: number;
    ratio: number;
}