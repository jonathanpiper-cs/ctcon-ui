"use client";

require("dotenv").config();

import pkceChallenge from "pkce-challenge";
let pkceChallengeCode = pkceChallenge();
console.log(pkceChallengeCode)

const CTCon = async () => {
    const windowProps = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=1200, height=800`;
    const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
    const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL_AWS_NA;
    const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
    const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL;
    const receiveAuthToken = (event: MessageEvent) => {
        console.log(event.data)
    }
    const auth = async () => {
        const url = `${AUTH_URL}/apps/${APP_ID}/authorize?response_type=code&client_id=${CLIENT_ID}&&auto_select_organizationredirect_uri=http://localhost${REDIRECT_URL}&code_challenge_method=plain&code_challenge=${pkceChallengeCode.code_verifier}`;
        const popup = window.open(url, "User Authentication", windowProps);
        popup?.opener.postMessage({ message: "Open window" }, 'http://localhost:3000');
    };
    return <h1 onClick={auth}>you're here!</h1>;
};

export default CTCon;
