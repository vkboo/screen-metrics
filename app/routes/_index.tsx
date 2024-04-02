"use client";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import platform from 'platform';
import redisClient from '~/redis';

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
    <div className="space-y-4">
      <div>
        <span>分辨率(Auto detect): </span>
        <span>{'1920 * 1080'}</span>
      </div>
      <div>
        <span>分辨率(用户填写): </span>
        <span>{'1920 * 1080'}</span>
      </div>
      <div>
        <span>国家: </span>
        <span>{'越南'}</span>
      </div>
      <div>
        <span>操作系统: </span>
        <span>{'OSX 15.4'}</span>
      </div>

    </div>
  );
}
