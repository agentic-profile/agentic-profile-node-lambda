import {
	OkPacket,
	RowDataPacket
} from "mysql2"
import mysql from "./mysql-pool.js"
import { ServerError } from "./net.js"

export async function queryResult( sql: string, params?: any[] ) {
    const [ result, fields ] = await mysql.query( sql, params );
    return result as OkPacket;
}

export async function queryRows<T>( sql: string, params?: any[] ) {
    const [ result, fields ] = await mysql.query( sql, params );
    return result as T[];
}

export async function queryFirstRow<T>( sql: string, params: any[] ) {
    let rows = await queryRows( sql, params );
    return rows.length > 0 ? rows[0] as T: null;
}

export function setOfRowColumnValues( rows: any[], columnName: string ) {
    let set = new Set<any>();
    for( let i = 0; i < rows.length; i++ )
        set.add( rows[i][columnName] );
    return Array.from(set.values());
}

export async function updateDB( sql: string, params: any[], failureMessage: string ) {
    const { affectedRows } = await queryResult( sql, params );
    if( affectedRows < 1 )
        throw new ServerError([4], failureMessage );    
}