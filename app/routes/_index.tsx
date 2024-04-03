"use client";

import { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useLoaderData, Form, redirect, useFetcher } from "@remix-run/react";
import { useEffect, useState, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import platform from 'platform';
import redisClient from '~/redis';
import { Button, Card, Label, TextInput, ToggleSwitch } from "flowbite-react";
import { loader as loaderUserId } from "./user.$id";
import { loader as loaderGetAllUsers } from "./users.get";

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

const update = async (list: Item[], id: string, item: Omit<Item, 'create_at'>) => {
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

export const loader = async (c: LoaderFunctionArgs) => {
  return { table: [] };
  // const AGENT_UUID_KEY = process.env.AGENT_UUID_KEY as string;
  // const ipAddressApiUrl = 'http://ip-api.com/json';
  // const REDIS_TABLE_KEY = process.env.REDIS_TABLE_KEY as string;
  // const tableStr = await redisClient.get(REDIS_TABLE_KEY);
  // const table = (tableStr ? JSON.parse(tableStr) : []) as Item[];

  const ipAddressFromRequest = getClientIPAddress(c.request);
  const ipAddressFromHeaders = getClientIPAddress(c.request.headers);
  const ipAddress = ipAddressFromRequest ?? ipAddressFromHeaders;
  // const __redirect = redirect;
  // debugger
  // const response = await redirect('http://localhost:5173/user/766e8c65-6387-4e3c-ae1f-502fcdc215fa/get', 200);



  const _response2 = await loaderUserId({
    ...c, params: {
      id: '766e8c65-6387-4e3c-ae1f-502fcdc215fa',
    }
  });
  const _data2 = await _response2.json();

  // let country = null;
  // if (ipAddressFromHeaders) {
  //   const response = await fetch(`${ipAddressApiUrl}/${ipAddress}`);
  //   const data = await response.json();
  //   country = data.country;
  // }

  // return {
  //   AGENT_UUID_KEY,
  //   country,
  //   table,
  // }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Screen Resolution Collection" },
  ];
};

export default function Index() {
  const fetcher = useFetcher();
  const { AGENT_UUID_KEY, country, table } = useLoaderData<{
    AGENT_UUID_KEY: string;
    country: string;
    table: Item[],
  }>();
  const [screen, setScreen] = useState<{
    width: number;
    height: number;
  }>();
  useEffect(() => {
    const { width, height } = window.screen;
    setScreen({ width, height });
  }, []);


  const [confirmed, setConfirmed] = useState<boolean>(true);
  const [id, setId] = useState<string | null>();

  const insertAgentUUID = () => {
    let localUUID = localStorage.getItem(AGENT_UUID_KEY);
    if (!localUUID) {
      localUUID = uuidv4();
      localStorage.setItem(AGENT_UUID_KEY, localUUID);
    }
    return localUUID;
  }

  const data = useMemo(() => {
    return table.find((item) => item.id === id);
  }, [table, id])

  useEffect(() => {
    setId(insertAgentUUID());
  }, []);

  const screenSizeAutoMeasure = useMemo(() => {
    if (screen?.width && screen?.height) {
      return `${screen?.width} * ${screen?.height}`
    }
    return null;
  }, [screen]);

  return (
    <div className="flex flex-col items-center">
      <div className="space-y-4 container flex flex-col p-4 max-w-[56rem]">
        <Card>
          {/* <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {'vkbo@gmail.com 的此设备已经提过相关信息，如下: '}
          </h5> */}
          <div>
            <span className="text-gray-600">分辨率(Auto detect): </span>
            <span>{screenSizeAutoMeasure ?? '-'}</span>
          </div>
          {/* <div>
            <span className="text-gray-600">分辨率(用户填写): </span>
            <span>{'1920 * 1080'}</span>
          </div> */}
          <div>
            <span className="text-gray-600">国家: </span>
            <span>{country ?? '-'}</span>
          </div>
          <div>
            <span className="text-gray-600">操作系统: </span>
            <span>{platform?.os?.toString()}</span>
          </div>
        </Card>

        <Card>
          <fetcher.Form className="flex max-w-md flex-col gap-4" method="POST" action={`/user/${id}`}>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your email" />
              </div>
              <TextInput id="email" name="email" type="email" placeholder="example@iglooinsure.com" required />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1" value="系统auth detect的分辨率准确" />
              </div>
              <ToggleSwitch name="is_confirm_by_user" checked={confirmed} label="准确无误" onChange={setConfirmed} />
            </div>
            {!confirmed && (
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="screen_size_input" value="设备分辨率" />
                </div>
                <TextInput name="screen_size_input" id="screen_size_input" placeholder="input your devices' screen ratio" />
              </div>
            )}
            <input hidden name="uuid" defaultValue={id!} />
            <input hidden name="screen_size_auto_measure" defaultValue={screenSizeAutoMeasure!} />
            <input hidden name="country" defaultValue={country!} />
            <input hidden name="platform" defaultValue={platform ? JSON.stringify(platform) : '{}'} />

            <Button type="submit">Submit</Button>
          </fetcher.Form>

        </Card>

      </div>
    </div>
  );
}
