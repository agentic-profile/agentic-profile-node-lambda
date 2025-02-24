import {
	UserId,
	Account
} from "./models.js"

import {
    queryFirstRow
} from "../util/sql.js"

export async function fetchAccountFields( uid: UserId, fields?: string ) {
    return await queryFirstRow<Account>( `SELECT ${fields ?? "*"} FROM users WHERE uid=?`, [uid] );
}