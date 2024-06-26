
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { loader as users } from "./api.users";
import redisClient from '~/redis';

const REDIS_TABLE_KEY = process.env.REDIS_TABLE_KEY as string;
const insertToDb = (list: Item[]) => redisClient.set(REDIS_TABLE_KEY, JSON.stringify(list))

export const loader = async (c: LoaderFunctionArgs) => {
    const list = await users(c);
    const target = list.find(e => e.id === c.params.id);
    return target ?? null;
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
        platform: formData.get('platform') as string,
        browser: formData.get('browser') as string,
        update_at: (new Date()).getTime(),
        create_at: Number(formData.get('create_at')) || (new Date()).getTime(),
    };
    const list = await users(c);
    switch (method) {
        case 'POST': {
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