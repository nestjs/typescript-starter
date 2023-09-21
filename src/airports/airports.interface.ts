export interface IAirport {
    id: number;
    airportName: string;
    data: string;
    status: number;
    version: number;
    createdAt: Date;
    createdBy: String;
    updatedAt: Date;
    updatedBy: String;
}

export default IAirport;