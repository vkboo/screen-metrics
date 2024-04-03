
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import redisClient from '~/redis';

export const loader = async (c: LoaderFunctionArgs) => {
    const tableStr = await redisClient.get(process.env.REDIS_TABLE_KEY as string);
    const table = (tableStr ? JSON.parse(tableStr) : []) as Item[];
    return json(table);
}



