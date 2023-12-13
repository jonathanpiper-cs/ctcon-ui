"use client";

import React, { useState, useEffect } from "react";
import StackList from "./StackList";
import ContentTypeList from "./ContentTypeList";
import { Button, Heading, cbModal, ModalBody, ModalFooter, ModalHeader } from "@contentstack/venus-components";

const EXTTYPES: Record<string, string> = {
    field: "Custom Field",
    rte_plugin: "RTE Plugin",
};
const EXTSTRING = '"extension_uid"';
type VerboseExtension = {
    title: string;
    type: string;
    uid: string;
};

const CTConInterface = (props: any) => {
    const { stack, location, appSdk, authTokens } = props;
    const [stackList, setStackList] = useState<any>();
    const [activeSchema, setActiveSchema] = useState<any>({});
    const [extensionsBySchema, setExtensionsBySchema] = useState<Record<string, string[]>[]>([]);
    const [schemas, setSchemas] = useState<any[]>([]);
    const [currentStackExtensions, setCurrentStackExtensions] = useState<any>();
    const [targetStacks, setTargetStacks] = useState<string[]>([]);
    const [currentSchemaExtensions, setCurrentSchemaExtensions] = useState<any>([]);
    const headers = {
        "Content-Type": "application/json",
        authorization: `Bearer ${authTokens.accessToken}`,
        organization_uid: appSdk.currentUser.org_uid[0] || "",
    };

    const changeTargetStackList = async (event: any, key: string) => {
        const checked = event?.target?.checked || false;
        checked
            ? setTargetStacks([key, ...targetStacks])
            : setTargetStacks(
                  targetStacks.filter((k) => {
                      return k !== key;
                  })
              );
    };

    useEffect(() => {
        if (extensionsBySchema.length > 0) {
            const ctExt = extensionsBySchema
                .filter((e) => {
                    return e.uid === activeSchema.uid;
                })[0]
                .extensionsUsed.map((e: any, key: number) => {
                    return currentStackExtensions.filter((cse: any) => {
                        return cse.uid === e;
                    })[0];
                });
            setCurrentSchemaExtensions(ctExt);
        }
    }, [activeSchema]);

    const ErrorModal = (props: any) => {
        return (
            <>
                <ModalHeader title="Error" closeModal={props.closeModal} />
                <ModalBody>
                    <Heading tagName="h3" text="There was issue:" />
                    <p>{props.error}</p>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => props.closeModal()}>Close</Button>
                </ModalFooter>
            </>
        );
    };

    const openErrorModal = (props: any, error: string) => {
        cbModal({
            component: (props: any) => <ErrorModal error={error} {...props} />,
        });
    };

    const transformCT = (key: any) => {
        let ctTemp = JSON.stringify({
            title: activeSchema.title,
            uid: activeSchema.uid,
            schema: activeSchema.schema,
        });
        currentSchemaExtensions.forEach((cte: any) => {
            let targetStack = stackList.filter((s: any) => {
                return s.api_key === key;
            })[0];
            let targetStackExt = targetStack.extensions.filter((e: any) => {
                return e.title === cte.title;
            })[0];
            if (!targetStackExt) {
                openErrorModal({}, `No matching extensions on stack ${targetStack.name}.`);
                return;
            }
            ctTemp = ctTemp.replaceAll(cte.uid, targetStackExt.uid);
            const file = new File([new Blob([ctTemp])], `${targetStack.name} - ${activeSchema.title}.json`);
            const link = document.createElement("a");
            const url = URL.createObjectURL(file);

            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
    };

    return (
        <div>
            <div className="grid grid-cols-2 mt-4">
                <div>
                    <ContentTypeList
                        {...{
                            stack,
                            appSdk,
                            authTokens,
                            setActiveSchema,
                            setExtensionsBySchema,
                            schemas,
                            setSchemas,
                            setCurrentStackExtensions,
                            headers,
                        }}
                    />
                </div>
                <div>
                    {activeSchema.hasOwnProperty("schema") ? (
                        <StackList
                            {...{ stack, location, appSdk, authTokens, headers, changeTargetStackList, stackList, setStackList, transformCT, activeSchema }}
                        />
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            <div className="my-4">
                <div className="grid grid-cols-2">
                    {activeSchema.hasOwnProperty("schema") ? (
                        <div>
                            <p>
                                The {activeSchema.hasOwnProperty("options") ? "content type" : "global field"} <b>{activeSchema.title}</b> uses the following
                                extensions/apps:
                            </p>
                            <ul className="mt-2">
                                {currentSchemaExtensions
                                    ? currentSchemaExtensions.map((extVerbose: any, key: number) => {
                                          return extVerbose ? (
                                              <li className="ml-2" key={key}>
                                                  {extVerbose.title} ({EXTTYPES[extVerbose.type]})
                                              </li>
                                          ) : (
                                              <li className="ml-2">Could not retrieve extension/app information. Please check the schema definition.</li>
                                          );
                                      })
                                    : ""}
                            </ul>
                        </div>
                    ) : (
                        <p></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CTConInterface;
