import { LoaderFunctionArgs, json } from "@remix-run/node";
import redis from '~/redis';
import Qs from 'qs';

export const loader = async (c: LoaderFunctionArgs) => {
    const url = new URL(c.request.url);
    const searchObject = Qs.parse(url.search.slice(1));
    const email = searchObject?.['email'];
    const screenList = (searchObject?.['screen_size_auto_measure'] ?? []) as string[];
    const tableStr = await redis.get(process.env.REDIS_TABLE_KEY as string);
    const table = (tableStr ? JSON.parse(tableStr) : []) as Item[];
    if (!email && screenList.length === 0) return table
    return table.filter(item => {
        return (
            (email ? item.email === email : true) &&
            (screenList.length === 0 ? true : screenList.includes(item.screen_size_auto_measure))
        );
    });
};