"use client";

import { Button, Checkbox, Heading, Radio } from "@contentstack/venus-components";
import React, { useEffect, useState } from "react";

const EXTTYPES: Record<string, string> = {
    field: "Custom Field",
    rte_plugin: "RTE Plugin",
};
const EXTSTRING = '"extension_uid"';

type VerboseExtension = {
    title: string;
    type: string;
};

const ContentTypeList = (props: any) => {
    const { stack, appSdk, setActiveSchema, setExtensionsBySchema, schemas, setSchemas, setCurrentStackExtensions, headers } = props;

    const findSchemasWithExtensions = async (arrayOfSchemas: any[]) => {
        let exByType: Record<string, string[]>[] = [];
        // const arr = arrayOfSchemas.filter((c: any) => { // This will filter for any schemas using extensions
        const arr = arrayOfSchemas.map((c: any) => { // This will return all schemas, regardless of extension
            let ctString = JSON.stringify(c);
            let startIndex = 0,
                index,
                extensionsUsed: string[] = [];
            while ((index = ctString.indexOf(EXTSTRING, startIndex)) > -1) {
                startIndex = index + EXTSTRING.length;
                let nextStringStart = ctString.indexOf('"', startIndex) + 1;
                let extensionUid = ctString.substring(nextStringStart, ctString.indexOf('"', nextStringStart));
                if (extensionsUsed.indexOf(extensionUid) === -1) extensionsUsed.push(extensionUid);
            }
            if (extensionsUsed.length > 0) exByType.push({ uid: c.uid, extensionsUsed: extensionsUsed });
            // return extensionsUsed.length > 0; // This will return a schema using an extension
            return c // This will return the schema
        });
        return { arr, exByType };
    };

    const getAllContentTypes = async () => {
        let modHeaders = { ...headers, api_key: stack };
        let ct = await appSdk.stack.getContentTypes({});
        let gf = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}v3/global_fields`, { headers: modHeaders }).then((result) => {
            return result.json();
        });
        let { arr: ctf, exByType: exByCT } = await findSchemasWithExtensions(ct.content_types);
        let { arr: gff, exByType: exByGF } = await findSchemasWithExtensions(gf.global_fields);
        console.log(ctf, gff);
        setExtensionsBySchema([...exByCT, ...exByGF]);
        setSchemas([...ctf, ...gff]);
    };

    const changeActiveSchema = async (event: any, key: string) => {
        const actCT = schemas.filter((ct: any) => {
            return ct.uid === key;
        })[0];
        console.log(actCT);
        setActiveSchema(actCT);
    };

    useEffect(() => {
        const getExtensions = async () => {
            let modHeaders = { ...headers, api_key: stack };
            const req = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}v3/extensions?include_marketplace_extensions=true`, {
                headers: { ...modHeaders },
            }).then((data) => {
                let ret = data.json();
                return ret;
            });
            setCurrentStackExtensions(req.extensions);
        };
        getExtensions();
    }, [headers, setCurrentStackExtensions, stack]);

    return (
        <div className="mt-2a">
            <p className="mb-2">Get a list of all content types and global fields in this current stack that include extensions and/or apps.</p>
            <Button onClick={getAllContentTypes}>Fetch Schemas</Button>
            {schemas.length !== 0 ? (
                <div>
                    <ul>
                        {schemas.map((ct: any, key: number) => {
                            return (
                                <li key={key}>
                                    <Radio
                                        name="ctRadio"
                                        label={`${ct.title} (${ct.hasOwnProperty("options") ? "Content Type" : "Global Field"})`}
                                        key={key}
                                        onChange={(event: any) => changeActiveSchema(event, ct.uid)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                    <p>Select a content type to proceed.</p>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default ContentTypeList;
