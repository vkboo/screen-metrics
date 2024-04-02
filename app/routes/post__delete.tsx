import type { ActionFunctionArgs } from "@remix-run/node";
import redisClient from '~/redis';

type Item = {
    id: string;
    // email: string;
    screen_size_auto_measure: string;
    // screen_size_input: string;
    // is_confirm_by_user: boolean;
    // country: string;
    country: string;
    platform: object;
}

const REDIS_TABLE_KEY = process.env.REDIS_TABLE_KEY as string;


const getAllList = async () => {
    const tableStr = await redisClient.get(REDIS_TABLE_KEY);
    const table = (tableStr ? JSON.parse(tableStr) : []) as Item[];
    return table;
}

const insert = async (list: Item[], item: Item) => {
    const newList = [...list];
    newList.push(item);
    redisClient.set(REDIS_TABLE_KEY, JSON.stringify(newList));
};

const update = async (list: Item[], id: string, item: Item) => {
    const newList = list.map(e => {
        if (e['id'] === id) {
            return {
                ...item,
                id: id,
            }
        } return e;
    });
    redisClient.set(REDIS_TABLE_KEY, JSON.stringify(newList));
};


export const action = async (c: ActionFunctionArgs) => {
    const formData = await c.request.formData();
    const list = await getAllList();
    const id = formData.get('uuid') as string;
    const json = {
        id,
        screen_size_auto_measure: formData.get('screen_size_auto_measure') as string,
        country: formData.get('country') as string,
        platform: JSON.parse(formData.get('platform') as string),
    };
    if (list.findIndex(e => e['id'] === id) > -1) {
        await update(list, id, json);
    } else {
        await insert(list, json);
    }
    return { success: true, json };
};
