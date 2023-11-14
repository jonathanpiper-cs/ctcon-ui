"use client";
import React, { useEffect } from "react";
require("dotenv").config();
import { has } from "lodash";

import pkceChallenge from "pkce-challenge";
let pkceChallengeCode = pkceChallenge();
const code_verifier = pkceChallengeCode.code_verifier;

const CTCon = async () => {
    const windowProps = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=1200, height=800`;
    const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
    const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL_AWS_NA;
    const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
    const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;
    console.log(typeof CLIENT_ID);

    useEffect(() => {
        const receiveAuthToken = async (event: MessageEvent) => {
            if (!has(event?.data, "location")) {
                return;
            }
            console.log(event.data);
            const { code } = event.data;
            const body = {
                grant_type: "authorization_code",
                client_id: CLIENT_ID,
                redirect_uri: `http://localhost:3000${REDIRECT_URL}` || "",
                code_verifier: code_verifier,
                code: code as string,
            };
            console.log(body);
            const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL_AWS_NA}/apps-api/apps/token` as string, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: JSON.stringify(body),
            });
            let data = { ...(await response.json()), code_verifier: code_verifier };
            console.log(data);
        };
        window.addEventListener("message", receiveAuthToken);
        return () => window.removeEventListener("message", receiveAuthToken);
    }, []);

    const auth = async () => {
        const url = `${AUTH_URL}/apps/${APP_ID}/authorize?response_type=code&client_id=${CLIENT_ID}&&auto_select_organizationredirect_uri=http://localhost${REDIRECT_URL}&code_challenge_method=plain&code_challenge=${code_verifier}`;
        const popup = window.open(url, "User Authentication", windowProps);
        popup?.opener.postMessage({ message: "Open window" }, "http://localhost:3000");
    };

    return <h1 onClick={auth}>you're here!</h1>;
};

export default CTCon;
