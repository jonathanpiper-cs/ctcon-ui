"use client"

import React, { useState, useEffect } from "react"
import StackList from "./StackList"
import ContentTypeList from "./ContentTypeList"
import { Button, Heading, cbModal, ModalBody, ModalFooter, ModalHeader, Paragraph } from "@contentstack/venus-components"
import { transformCT } from "../../lib/helper"

const EXTTYPES: Record<string, string> = {
	field: "Custom Field",
	rte_plugin: "RTE Plugin",
}
const EXTSTRING = '"extension_uid"'
type VerboseExtension = {
	title: string
	type: string
	uid: string
}

const CTConInterface = (props: any) => {
	const { stack, location, appSdk, authTokens } = props
	const [stackList, setStackList] = useState<any>()
	const [activeSchema, setActiveSchema] = useState<any>({})
	const [extensionsBySchema, setExtensionsBySchema] = useState<Record<string, string[]>[]>([])
	const [schemas, setSchemas] = useState<any[]>([])
	const [currentStackExtensions, setCurrentStackExtensions] = useState<any>()
	const [targetStacks, setTargetStacks] = useState<string[]>([])
	const [currentSchemaExtensions, setCurrentSchemaExtensions] = useState<any>([])
	const headers = {
		"Content-Type": "application/json",
		authorization: `Bearer ${authTokens.accessToken}`,
		organization_uid: appSdk.currentUser.org_uid[0] || appSdk.currentUser.organizations[0].uid || "",
	}

	const changeTargetStackList = async (event: any, key: string) => {
		const checked = event?.target?.checked || false
		checked
			? setTargetStacks([key, ...targetStacks])
			: setTargetStacks(
					targetStacks.filter((k) => {
						return k !== key
					})
			  )
	}

	useEffect(() => {
		if (extensionsBySchema.length > 0) {
			let ctExt: Record<string, string[]> = extensionsBySchema.filter((e) => {
				return e.uid === activeSchema.uid
			})[0]
			console.log(activeSchema, ctExt)
			if (ctExt) {
				let extTmp = ctExt.extensionsUsed.map((e: any, key: number) => {
					return currentStackExtensions.filter((cse: any) => {
						return cse.uid === e
					})[0]
				})
				ctExt = extTmp as unknown as Record<string, string[]>
			}
			setCurrentSchemaExtensions(ctExt)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeSchema])

	const ErrorModal = (props: any) => {
		return (
			<>
				<ModalHeader title="Error" closeModal={props.closeModal} />
				<ModalBody>
					<Heading tagName="h3" text="There was an issue:" />
					<p>{props.error}</p>
				</ModalBody>
				<ModalFooter>
					<Button onClick={() => props.closeModal()}>Close</Button>
				</ModalFooter>
			</>
		)
	}

	const openErrorModal = (props: any, error: string) => {
		cbModal({
			component: (props: any) => <ErrorModal error={error} {...props} />,
		})
	}

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
							{...{
								stack,
								location,
								appSdk,
								authTokens,
								headers,
								changeTargetStackList,
								stackList,
								currentSchemaExtensions,
								setStackList,
								activeSchema,
							}}
						/>
					) : (
						<></>
					)}
				</div>
			</div>
			<div className="my-4">
				<div className="grid grid-cols-2">
					{activeSchema.hasOwnProperty("schema") ? (
						currentSchemaExtensions ? (
							<div>
								<p>
									The {activeSchema.hasOwnProperty("options") ? "content type" : "global field"} <b>{activeSchema.title}</b> uses the
									following extensions/apps:
								</p>
								<ul className="mt-2">
									{currentSchemaExtensions.map((extVerbose: any, key: number) => {
										return extVerbose ? (
											<li className="ml-2" key={key}>
												<Paragraph text={`${extVerbose.title} (${EXTTYPES[extVerbose.type]})`} />
											</li>
										) : (
											<li className="ml-2">Could not retrieve extension/app information. Please check the schema definition.</li>
										)
									})}
								</ul>
							</div>
						) : (
							<></>
						)
					) : (
						<p></p>
					)}
				</div>
			</div>
		</div>
	)
}

export default CTConInterface
