import { LoaderFunctionArgs } from "@remix-run/node";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";

export const loader = async (c: LoaderFunctionArgs) => {
    const ipAddressApiUrl = 'http://ip-api.com/json';
    const ipAddressFromRequest = getClientIPAddress(c.request);
    const ipAddressFromHeaders = getClientIPAddress(c.request.headers);
    const ipAddress = ipAddressFromRequest ?? ipAddressFromHeaders;

    let country = null;
    if (ipAddress) {
        const response = await fetch(`${ipAddressApiUrl}/${ipAddress}`);
        const data = await response.json();
        country = data.country;
    }
    return country;
}