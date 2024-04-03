import { LoaderFunctionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData, ShouldRevalidateFunction } from "@remix-run/react";
import dayjs from 'dayjs';
import { Table, Button, Popover, TextInput, Select, Badge } from "flowbite-react";
import { FaFilter } from "react-icons/fa";
import { useMemo, useState } from 'react';
import Qs from 'qs';
import { loader as users } from "./api.users";

export const loader = async (c: LoaderFunctionArgs) => {
    const table = await users(c);
    return table;
};

export const shouldRevalidate: ShouldRevalidateFunction = () => {
    return false;
};

export default function Dashboard() {
    const allTable = useLoaderData<typeof loader>();
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<{
        email: string;
        screen_size_auto_measure: string[];
    }>({
        email: '',
        screen_size_auto_measure: ['all']
    });
    const fetcher = useFetcher();

    const table = useMemo(() => {
        return fetcher.data as Item[] ?? allTable;
    }, [allTable, fetcher.data]);

    const onReset = () => {
        setFilter({
            email: '',
            screen_size_auto_measure: ['all']
        });
    };
    const onSubmit = () => {
        const params = {} as { [k: string]: any };
        Object.entries(filter).forEach(([k, v]) => {
            if (k === 'screen_size_auto_measure') {
                params[k] = (v as string[]).filter(e => e !== 'all');
            } else {
                params[k] = v;
            }
        });
        setOpen(false);
        fetcher.load(`/api/users?${Qs.stringify(params)}`)
    };
    return <div className="p-4">
        <div className="overflow-x-autos">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold dark:text-white">
                    total {table.length} entities
                </h4>
                <Popover
                    open={open}
                    onOpenChange={setOpen}
                    content={
                        <div className="flex w-64 flex-col gap-4 p-4 text-sm text-gray-500 dark:text-gray-400">
                            <div>
                                <h2 className="text-base text-gray-500">分辨率</h2>
                                <Select
                                    value={filter.screen_size_auto_measure[0]}
                                    onChange={e => {
                                        setFilter(prev => {
                                            return {
                                                ...prev,
                                                screen_size_auto_measure: [e.target.value]
                                            };
                                        });
                                    }}
                                >
                                    <option value="all">All</option>
                                    <option value="1920 * 1080">1920 * 1080</option>
                                    <option value="1280 * 760">1280 * 760</option>
                                </Select>
                            </div>
                            <div>
                                <h2 className="text-base text-gray-500">Email</h2>
                                <TextInput value={filter.email} onChange={e => {
                                    setFilter(prev => {
                                        return {
                                            ...prev,
                                            email: e.target.value
                                        };
                                    });
                                }} />
                            </div>
                            <div className="flex gap-2">
                                <Button color="gray" onClick={onReset}>Reset</Button>
                                <Button color="success" onClick={onSubmit}>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    }
                >
                    {/* isProcessing */}
                    {/* gradientDuoTone="purpleToBlue" */}
                    <Button >
                        <span className="flex items-center gap-1">
                            <FaFilter />
                            {/* Filtered */}
                            Filter
                        </span>
                    </Button>
                </Popover>
            </div>
            <Table hoverable className="mt-2">
                <Table.Head>
                    <Table.HeadCell>id</Table.HeadCell>
                    <Table.HeadCell>Email</Table.HeadCell>
                    <Table.HeadCell>Screen Resolution(auto detect)</Table.HeadCell>
                    <Table.HeadCell>Screen Resolution(user input)</Table.HeadCell>
                    <Table.HeadCell>Platform</Table.HeadCell>
                    <Table.HeadCell>Browser</Table.HeadCell>
                    <Table.HeadCell>Created Date</Table.HeadCell>
                    <Table.HeadCell>Updated Date</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {table.map(row => {
                        return (
                            <Table.Row key={row.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    {row.id}
                                </Table.Cell>
                                <Table.Cell>
                                    {row.email}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color="purple" className="inline-block">
                                        {row.screen_size_auto_measure}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    {row.screen_size_input ? (
                                        <Badge color="pink" className="inline-block">
                                            {row.screen_size_input}
                                        </Badge>
                                    ) : '-'}
                                </Table.Cell>
                                <Table.Cell>
                                    {row.platform}
                                </Table.Cell>
                                <Table.Cell>
                                    {row.browser}
                                </Table.Cell>
                                <Table.Cell>
                                    {dayjs(row.create_at).format('YYYY-MM-DD HH:mm:ss')}
                                </Table.Cell>
                                <Table.Cell>
                                    {dayjs(row.update_at).format('YYYY-MM-DD HH:mm:ss')}
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>
        </div>
    </div>
};