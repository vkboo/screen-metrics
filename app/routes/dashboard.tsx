import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { Table, Pagination, Button, Popover, Label, TextInput, Select } from "flowbite-react";
import { FaFilter } from "react-icons/fa";
import { useState } from 'react';
import { loader as users } from "./users";


export const loader = async (c: LoaderFunctionArgs) => {
    const table = await users(c);
    return table;
};

export default function Dashboard() {
    const table = useLoaderData<typeof loader>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [open, setOpen] = useState(false);
    const onPageChange = (page: number) => setCurrentPage(page);
    return <div className="p-4">
        <div className="overflow-x-autos">
            <div className="flex justify-end">
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
                    <Table.HeadCell>Product name</Table.HeadCell>
                    <Table.HeadCell>Color</Table.HeadCell>
                    <Table.HeadCell>Category</Table.HeadCell>
                    <Table.HeadCell>Price</Table.HeadCell>
                    <Table.HeadCell>
                        <span className="sr-only">Edit</span>
                    </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {'Apple MacBook Pro 17"'}
                        </Table.Cell>
                        <Table.Cell>Sliver</Table.Cell>
                        <Table.Cell>Laptop</Table.Cell>
                        <Table.Cell>$2999</Table.Cell>
                        <Table.Cell>
                            <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                                Edit
                            </a>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            Microsoft Surface Pro
                        </Table.Cell>
                        <Table.Cell>White</Table.Cell>
                        <Table.Cell>Laptop PC</Table.Cell>
                        <Table.Cell>$1999</Table.Cell>
                        <Table.Cell>
                            <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                                Edit
                            </a>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">Magic Mouse 2</Table.Cell>
                        <Table.Cell>Black</Table.Cell>
                        <Table.Cell>Accessories</Table.Cell>
                        <Table.Cell>$99</Table.Cell>
                        <Table.Cell>
                            <a href="#" className="font-medium text-cyan-600 hover:underline dark:text-cyan-500">
                                Edit
                            </a>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
            <div className="flex justify-end mt-4">
                <h4 className="mt-2">total 23 entities</h4>
            </div>
        </div>
    </div>
};