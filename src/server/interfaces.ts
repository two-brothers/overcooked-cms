
export interface IPagedFood {
    food: IFood[];
    last_page: boolean;
}

export interface IFood {
    id: string;
    name: {
        singular: string;
        plural: string;
    }
    conversions: IUnitConversion[]
}

interface IUnitConversion {
    unit_id: number;
    ratio: number;
}