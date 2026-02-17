"use client";

import React, { useEffect, useState } from "react";
import { Map } from "immutable";
import { HOST_URL } from "@/lib/const";

export const ErrNoCode = new Error("no code available");

const urlDecode = (urlString: string): Map<string, string> =>
    Map(
        urlString.split("&").map<[string, string]>((param: string): [string, string] => {
            const sepIndex = param.indexOf("=");
            const k = decodeURIComponent(param.slice(0, sepIndex));
            const v = decodeURIComponent(param.slice(sepIndex + 1));
            return [k, v];
        })
    );

const Callback: React.FunctionComponent<{children: React.ReactNode}> = ({children}) => {
    const [search] = useState([...urlDecode(window.location.search.slice(1))]);
    const [hash] = React.useState([...urlDecode(window.location.hash.slice(1))]);

    React.useEffect(() => {
        const params = Map([... search, ...hash])
        const code = params.get('code')
        const location = params.get('location')
        const cancellationError = params.get('error')
        if (code === undefined) throw ErrNoCode;
        const authCredentials = {
            code: code ?? 'Invalid code',
            location: location ?? 'Invalid location'
        }
        window.opener.postMessage(authCredentials, `${HOST_URL}/`);
        window.close()
    }, [search, hash]);
    return <>{children || 'please wait'}</>;
};

export const OAuthCallback: React.FunctionComponent<{
    children?: React.ReactNode
}> = ({ children }) => {
    return <Callback>{children}</Callback>
}

export default OAuthCallback;
