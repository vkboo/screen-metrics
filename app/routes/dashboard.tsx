import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import dayjs from 'dayjs';
import { Table, Button, Popover, TextInput, Select, Badge } from "flowbite-react";
import { FaFilter } from "react-icons/fa";
import { useState } from 'react';
import { loader as users } from "./api.users";

export const loader = async (c: LoaderFunctionArgs) => {
    const table = await users(c);
    return table;
};

export default function Dashboard() {
    const table = useLoaderData<typeof loader>();
    const [open, setOpen] = useState(false);
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
                                <Select>
                                    <option>All</option>
                                    <option>1920*1080</option>
                                    <option>1280*760</option>
                                </Select>
                            </div>
                            <div>
                                <h2 className="text-base text-gray-500">Email</h2>
                                <TextInput />
                            </div>
                            <div className="flex gap-2">
                                <Button color="gray">Reset</Button>
                                <Button color="success" onClick={() => setOpen(false)}>
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