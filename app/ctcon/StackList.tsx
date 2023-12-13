"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ContentstackAppSDK from "@contentstack/app-sdk";
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation";
import { IFullPageLocation } from "@contentstack/app-sdk/dist/src/types";
import { SyntheticEvent } from "react";
import { Button, Checkbox, Heading } from "@contentstack/venus-components";
require("dotenv").config();

type AuthTokens = {
    accessToken?: string;
    refreshToken?: string;
};

const StackList = (props: any) => {
    const { stack, appSdk, headers, stackList, setStackList, transformCT, activeSchema } = props;
    // const [extensionsByStack, setExtensionsByStack] = useState<any>();

    const getStacks = async () => {
        setStackList(null);
        let stacksInOrg: any[] = [];
        let globalExtensions: any[] = [];
        if (appSdk && headers.organization_uid) {
            let stacks = await appSdk.stack.getAllStacks();
            stacksInOrg = await Promise.all(
                stacks.map(async (s: any) => {
                    let modHeaders = { ...headers, api_key: s.api_key };
                    const req = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}v3/extensions?include_marketplace_extensions=true`, {
                        headers: { ...modHeaders },
                    }).then((data) => {
                        let ret = data.json();
                        return ret;
                    });
                    let filterReq = req.extensions.filter((e: Record<string, string>) => {
                        return e.app_uid === process.env.NEXT_PUBLIC_APP_ID;
                    });
                    return { ...filterReq[0], ...s, extensions: req.extensions };
                })
            );
        }
        let stacksWithApp = stacksInOrg
            .filter((s) => {
                return s.app_installation_uid;
            })
            .flat();
        setStackList(stacksWithApp);
    };

    return (
        <div className="">
            <p className="mb-2">Get a list of stacks that have the CTCon app installed.</p>
            <Button className="mb-4" onClick={getStacks}>
                Fetch List of Stacks
            </Button>
            {stackList ? (
                <div mt-4>
                    <p>
                        Click a stack name below to download a transformed JSON file for the content type <br /><b>{activeSchema.title}</b>
                    </p>
                    <ul className="mt-4">
                        {activeSchema.hasOwnProperty("schema") ? (
                            stackList.map((s: any, key: any) => {
                                return stack !== s.api_key ? (
                                    <li className="my-4">
                                        <Button label={`${s.name}`} disabled={stack === s.api_key} onClick={() => transformCT(s.api_key)}>
                                            {s.name}
                                        </Button>
                                    </li>
                                ) : (
                                    ""
                                );
                            })
                        ) : (
                            <></>
                        )}
                    </ul>
                </div>
            ) : (
                ""
            )}
        </div>
    );
};

export default StackList;
