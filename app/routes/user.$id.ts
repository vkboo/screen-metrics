
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { loader as loaderGetAllUsers } from "./users.get";
import redisClient from '~/redis';

const REDIS_TABLE_KEY = process.env.REDIS_TABLE_KEY as string;
const insertToDb = (list: (Omit<Item, 'create_at'> & {
    create_at?: number;
})[]) => redisClient.set(REDIS_TABLE_KEY, JSON.stringify(list))

export const loader = async (c: LoaderFunctionArgs) => {
    const response = await loaderGetAllUsers(c);
    const list = await response.json();
    const target = list.find(e => e.id === c.params.id);
    return json(target);
};

export const action = async (c: ActionFunctionArgs) => {
    const method = c.request.method.toUpperCase();
    const formData = await c.request.formData();
    const id = formData.get('uuid');
    const data = {
        id,
        email: formData.get('email') as string,
        screen_size_auto_measure: formData.get('screen_size_auto_measure') as string,
        screen_size_input: formData.get('screen_size_input') as string,
        is_confirm_by_user: formData.get('is_confirm_by_user') === 'on',
        country: formData.get('country') as string,
        platform: JSON.parse(formData.get('platform') as string),
        update_at: (new Date()).getTime(),
    };
    const response = await loaderGetAllUsers(c);
    const list = await response.json();
    switch (method) {
        case 'POST': {
            Object.assign(data, {
                create_at: (new Date()).getTime(),
            });
            const newList = [...list];
            newList.push(data as Item);
            insertToDb(newList);
            break;
        }
        case 'PUT': {
            const newList = list.map(e => {
                if (e['id'] === id) {
                    return {
                        ...data,
                        id: id,
                    }
                } return e;
            });
            insertToDb(newList);
            break;
        }

    }
    return json({
        success: true,
        requestData: data
    });
};