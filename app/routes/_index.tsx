import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import platform from 'platform';

export const loader = async (c: LoaderFunctionArgs) => {
  const AGENT_UUID_KEY = process.env.AGENT_UUID_KEY as string;
  const ipAddressApiUrl = 'http://ip-api.com/json';

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
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Screen Resolution Collection" },
  ];
};

export default function Index() {
  const { AGENT_UUID_KEY, country } = useLoaderData<{
    AGENT_UUID_KEY: string;
    country: string;
  }>();
  const fetcher = useFetcher();
  const insertAgentUUID = () => {
    let localUUID = localStorage.getItem(AGENT_UUID_KEY);
    if (!localUUID) {
      localUUID = uuidv4();
      localStorage.setItem(AGENT_UUID_KEY, localUUID);
    }
    return localUUID;
  }

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
    <div>
      auto measure screen collection
    </div>
  );
}
