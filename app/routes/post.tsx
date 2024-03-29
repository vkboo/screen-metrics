import type { ActionFunctionArgs } from "@remix-run/node";
import Redis from "ioredis"

type Item = {
    email: string;
    screen_size_auto_measure: string;
    screen_size_input: string;
    is_confirm_by_user: boolean;
    country: string;
    agent_id: string;
}

export const action = async (c: ActionFunctionArgs) => {
    const REDIS_TABLE_KEY = process.env.REDIS_TABLE_KEY as string;
    const formData = await c.request.formData();
    const client = new Redis(process.env.REDIS_DATABASE_URL as string);
    const tableStr = await client.get(REDIS_TABLE_KEY);
    const table = (tableStr ? JSON.parse(tableStr) : []) as Item[];

    // await client.set(REDIS_TABLE_KEY, );
    return { success: true };
};
