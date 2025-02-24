export type UserId = string | number;

export interface User {
    uid: number
}

export interface Account extends User {
    credit?: number
}