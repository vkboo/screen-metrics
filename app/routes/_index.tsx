"use client";

import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useFetcher, ShouldRevalidateFunction } from "@remix-run/react";
import { useEffect, useState, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import platform from 'platform';
import { Button, Card, Label, TextInput, ToggleSwitch, Badge } from "flowbite-react";
import clsx from 'clsx';
import { loader as clientIpCountry } from "./api.client.ip.country";

export const meta: MetaFunction = () => {
  return [
    { title: "Screen Resolution Collection" },
  ];
};

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export const loader = async (c: LoaderFunctionArgs) => {
  const AGENT_UUID_KEY = process.env.AGENT_UUID_KEY as string;
  const country = await clientIpCountry(c);
  return { AGENT_UUID_KEY, country }
}

function useUserInfo(AGENT_UUID_KEY: string) {
  const [id, setId] = useState<string | null>();
  const userFetcher = useFetcher();

  const insertAgentUUID = () => {
    let localUUID = localStorage.getItem(AGENT_UUID_KEY);
    if (!localUUID) {
      localUUID = uuidv4();
      localStorage.setItem(AGENT_UUID_KEY, localUUID);
    }
    return localUUID;
  }

  useEffect(() => {
    const _id = insertAgentUUID();
    setId(_id);
    userFetcher.load(`/api/user/${_id}`);
  }, []);

  const responseUser = userFetcher.data;
  return {
    id,
    user: responseUser as Item,
  };
}

function useScreenSize() {
  const [screen, setScreen] = useState<{
    width: number;
    height: number;
  }>();
  useEffect(() => {
    const { width, height } = window.screen;
    setScreen({ width, height });
  }, []);
  const screenSizeAutoMeasure = useMemo(() => {
    if (screen?.width && screen?.height) {
      return `${screen?.width} * ${screen?.height}`
    }
    return null;
  }, [screen]);
  return screenSizeAutoMeasure;
}

export default function Index() {
  const [confirmed, setConfirmed] = useState<boolean>(true);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const userFetcher = useFetcher<any>();
  const isSubmitted = userFetcher.state === 'idle' && userFetcher.data && !userFetcher.data?.error;
  const { AGENT_UUID_KEY, country } = useLoaderData<typeof loader>();
  const screenSizeAutoMeasure = useScreenSize();
  const { id, user } = useUserInfo(AGENT_UUID_KEY);

  useEffect(() => {
    if (isSubmitted) {
      setFormVisible(false);
    }
  }, [isSubmitted]);

  const displays = useMemo(
    () => ({
      email: user?.email,
      screenSizeAutoMeasure: user?.screen_size_auto_measure ?? screenSizeAutoMeasure,
      screenSizeInput: user?.screen_size_input,
      country: user?.country ?? country,
      platform: user?.platform ?? platform?.os?.toString(),
      browser: user?.browser ?? `${platform?.name} ${platform?.version}`,
      updateAt: user?.update_at ? dayjs(user?.update_at).format('YYYY-MM-DD HH:mm:ss') : null,
    }),
    [user, screenSizeAutoMeasure, country, platform]
  );

  return (
    <div className="flex flex-col items-center">
      <div className="space-y-4 container flex flex-col p-4 max-w-[56rem]">
        <Card className={clsx(displays?.updateAt && 'relative pt-2')}>
          {displays?.updateAt && (
            <Badge color="info" className="inline-block absolute right-0 top-0">
              Last Updated Date: {displays.updateAt}
            </Badge>
          )}
          {displays.email && (
            <h5 className="text-2xl">
              The device associated with &nbsp;
              <b className="tracking-tight text-gray-900">
                {displays.email}
              </b>
              &nbsp; has already provided relevant information, as follows:
            </h5>
          )}
          <div>
            <span className="text-gray-600">Screen Resolution(Auto detect): </span>
            <Badge color="purple" className="inline-block">
              {displays?.screenSizeAutoMeasure || '-'}
            </Badge>
          </div>
          {displays.screenSizeInput && (
            <div>
              <span className="text-gray-600">Screen Resolution(用户填写): </span>
              <Badge color="pink" className="inline-block">
                {displays.screenSizeInput}
              </Badge>
            </div>
          )}
          <div>
            <span className="text-gray-600">Country/Region: </span>
            <span>{displays.country || '-'}</span>
          </div>
          <div>
            <span className="text-gray-600">Operation System: </span>
            <span>{displays.platform || '-'}</span>
          </div>
          <div>
            <span className="text-gray-600">Browser: </span>
            <span>{displays.browser || '-'}</span>
          </div>
          {(!formVisible && user) && (
            <Button
              className="max-w-md"
              type="button"
              onClick={() => {
                setFormVisible(true);
              }}
            >
              Need Update?
            </Button>
          )}

        </Card>

        <Card className={clsx((!formVisible && user) && 'hidden')}>
          <userFetcher.Form
            className="flex max-w-md flex-col gap-4"
            method={user ? 'PUT' : 'POST'}
            action={`/api/user/${id}`}
          >
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your email" />
              </div>
              <TextInput id="email" name="email" defaultValue={user?.email} type="email" placeholder="example@iglooinsure.com" required />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password1" value="Is the screen resolution detected by the system accurate?" />
              </div>
              <ToggleSwitch name="is_confirm_by_user" checked={confirmed} label="Absolutely accurate" onChange={setConfirmed} />
            </div>
            {!confirmed && (
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="screen_size_input" value="Device Screen Resolution" />
                </div>
                <TextInput name="screen_size_input" id="screen_size_input" placeholder="Input your device's screen ratio" />
              </div>
            )}
            <input hidden name="uuid" defaultValue={id!} />
            <input hidden name="screen_size_auto_measure" defaultValue={screenSizeAutoMeasure!} />
            <input hidden name="country" defaultValue={country!} />
            <input hidden name="platform" defaultValue={platform?.os?.toString()} />
            <input hidden name="browser" defaultValue={`${platform?.name} ${platform?.version}`} />
            <input hidden name="create_at" defaultValue={user?.create_at} />

            <Button type="submit" isProcessing={userFetcher.state === 'submitting'}>Submit</Button>
          </userFetcher.Form>

        </Card>

      </div>
    </div>
  );
}