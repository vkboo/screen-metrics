"use client";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import platform from 'platform';
import redisClient from '~/redis';
import { Button, Card, Label, TextInput, ToggleSwitch } from "flowbite-react";

export const loader = async (c: LoaderFunctionArgs) => {
  const AGENT_UUID_KEY = process.env.AGENT_UUID_KEY as string;
  const ipAddressApiUrl = 'http://ip-api.com/json';
  const REDIS_TABLE_KEY = process.env.REDIS_TABLE_KEY as string;
  const tableStr = await redisClient.get(REDIS_TABLE_KEY);
  const table = (tableStr ? JSON.parse(tableStr) : []) as Item[];

  const ipAddressFromRequest = getClientIPAddress(c.request);
  const ipAddressFromHeaders = getClientIPAddress(c.request.headers);
  const ipAddress = ipAddressFromRequest ?? ipAddressFromHeaders;

  let country = null;
  if (ipAddressFromHeaders) {
    const response = await fetch(`${ipAddressApiUrl}/${ipAddress}`);
    const data = await response.json();
    country = data.country;
  }

  return {
    AGENT_UUID_KEY,
    country,
    table,
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Screen Resolution Collection" },
  ];
};

export default function Index() {

  const { AGENT_UUID_KEY, country, table } = useLoaderData<{
    AGENT_UUID_KEY: string;
    country: string;
    table: Item[],
  }>();

  const [switch1, setSwitch1] = useState<boolean>(true);
  const [id, setId] = useState<string | null>();

  const fetcher = useFetcher();
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
    setId(localStorage.getItem(AGENT_UUID_KEY));
  }, []);

  useEffect(() => {
    const uuid = insertAgentUUID();
    const { width, height } = window.screen;
    const formData = new FormData();
    formData.append('uuid', uuid);
    formData.append('screen_size_auto_measure', `${width} x ${height}`);
    formData.append('country', country);
    formData.append('platform', JSON.stringify(platform));
    fetcher.submit(formData, { method: 'POST', action: '/post' })
  }, []);
  return (
    <div className="flex flex-col items-center">
      <div className="space-y-4 container flex flex-col p-4 max-w-[56rem]">
        <Card>
          <div>
            <span className="text-gray-600">分辨率(Auto detect): </span>
            <span>{'1920 * 1080'}</span>
          </div>
          <div>
            <span className="text-gray-600">分辨率(用户填写): </span>
            <span>{'1920 * 1080'}</span>
          </div>
          <div>
            <span className="text-gray-600">国家: </span>
            <span>{'越南'}</span>
          </div>
          <div>
            <span className="text-gray-600">操作系统: </span>
            <span>{'OSX 15.4'}</span>
          </div>
        </Card>

        <Card>
          <form className="flex max-w-md flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email1" value="Your email" />
              </div>
              <TextInput id="email1" type="email" placeholder="example@iglooinsure.com" required />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1" value="系统auth detect的分辨率准确" />
              </div>
              <ToggleSwitch checked={switch1} label="准确无误" onChange={setSwitch1} />
            </div>
            {!switch1 && (
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="email1" value="设备分辨率" />
                </div>
                <TextInput id="screen_by_user" placeholder="input your devices' screen ratio" />
              </div>
            )}
            <Button type="submit">Submit</Button>
          </form>

        </Card>

      </div>
    </div>
  );
}
