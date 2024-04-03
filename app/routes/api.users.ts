import { LoaderFunctionArgs, json } from "@remix-run/node";
import redis from '~/redis';

export const loader = async (c: LoaderFunctionArgs) => {
    const tableStr = await redis.get(process.env.REDIS_TABLE_KEY as string);
    const table = (tableStr ? JSON.parse(tableStr) : []) as Item[];
    return table;
};