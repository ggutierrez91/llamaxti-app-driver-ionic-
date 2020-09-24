export default interface ITracker {
    lat: number;
    lng: number;
    run: boolean;
    pkClient?: number;
    distanceText?: string;
    minutesText?: string;
    distance?: number;
    minutes?: number;
}
