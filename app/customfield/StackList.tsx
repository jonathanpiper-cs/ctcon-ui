"use client"
import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import ContentstackAppSDK from "@contentstack/app-sdk"
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation"
import { IFullPageLocation } from "@contentstack/app-sdk/dist/src/types"
import { SyntheticEvent } from "react"
import { Button, Checkbox, Heading, Paragraph } from "@contentstack/venus-components"
import { transformCT, pause } from "@/lib/helper"
import { CS_API_URL } from "@/lib/const"
import { captureRejectionSymbol } from "events"
require("dotenv").config()

export const fetchCache = "force-no-store"

type AuthTokens = {
	accessToken?: string
	refreshToken?: string
}

const StackList = (props: any) => {
	const { stack, appSdk, headers, stackList, setStackList, activeSchema, currentSchemaExtensions, location } = props
	// const [extensionsByStack, setExtensionsByStack] = useState<any>();
	const [contentType, setContentType] = useState<string>()
	const [entryTitle, setEntryTitle] = useState<string>()
	const [filteredStacks, setFilteredStacks] = useState<any>()
    const [filteredStacksByEntry, setFilteredStacksByEntry] = useState<any>()

	const getStacks = async () => {
		setStackList(null)
		let stacksInOrg: any[] = []
		let globalExtensions: any[] = []
		if (appSdk && headers.organization_uid) {
			stacksInOrg = await appSdk.stack.getAllStacks()
		}
		return stacksInOrg
	}

	useEffect(() => {
		const setup = async () => {
			const tmpContentType = await location.entry.content_type.uid
			setContentType(tmpContentType)
			const entryData = await location.entry.getData()
			setEntryTitle(entryData.title)
			console.log(entryData)
		}
		setup()
	})

	const filterStacksWithEntry = async () => {
		const stacksWithEntry = await Promise.all(
			filteredStacks.map(async (stack: any) => {
				await pause(10)
				console.log(stack)
				const queryString = `?query={"title":"${entryTitle}"`
				const response = await fetch(`${CS_API_URL}entries${queryString}`, {
					headers: { ...headers, api_key: stack.api_key },
				})
				let raw = await response.json()
				console.log(raw)
				return { contentTypes: raw.content_types, name: stack.name, api_key: stack.api_key }
			})
		)
        // const filteredStacks = stacksWithContentTypes.filter((s) => {
		// 	const filteredContentTypes = s.contentTypes.filter((ct: any) => {
		// 		// console.log("compare this", ct.uid, contentType, ct.uid === contentType)
		// 		return ct.uid === contentType && s.api_key !== stack.api_key
		// 	})
		// 	filteredContentTypes.length > 0 && console.log(filteredContentTypes)
		// 	return filteredContentTypes.length > 0
		// })
		// const filteredApiKeys = filteredStacks.map((stack) => {
		// 	return { api_key: stack.api_key, name: stack.name }
		// })
		// console.log("filtered stacks", filteredApiKeys)
		// setFilteredStacksByEntry(filteredApiKeys)
	}

	const filterStacksWithContentType = async () => {
		const stacks = await getStacks()
		const stacksWithContentTypes = await Promise.all(
			stacks.map(async (stack) => {
				await pause(10)
				const response = await fetch(`${CS_API_URL}content_types`, {
					headers: { ...headers, api_key: stack.api_key },
				})
				let raw = await response.json()
				return { contentTypes: raw.content_types, name: stack.name, api_key: stack.api_key }
			})
		)
		const filteredStacks = stacksWithContentTypes.filter((s) => {
			const filteredContentTypes = s.contentTypes.filter((ct: any) => {
				// console.log("compare this", ct.uid, contentType, ct.uid === contentType)
				return ct.uid === contentType && s.api_key !== stack.api_key
			})
			filteredContentTypes.length > 0 && console.log(filteredContentTypes)
			return filteredContentTypes.length > 0
		})
		const filteredApiKeys = filteredStacks.map((stack) => {
			return { api_key: stack.api_key, name: stack.name }
		})
		console.log("filtered stacks", filteredApiKeys)
		setFilteredStacks(filteredApiKeys)
	}

	return (
		<div className="columns-2">
			<div>
				<p className="mb-2">
					Fetch a list of all stacks in the organization with content type <b>{contentType}</b>.
				</p>
				<Button className="mb-4" onClick={filterStacksWithContentType}>
					Fetch List of Stacks
				</Button>
				{filteredStacks ? (
					<div>
						<div mt-4>
							<ul className="mt-4">
								{filteredStacks.map((stack: any) => {
									return (
										<li className="my-4" key={stack.api_key}>
											<p>
												<b>{stack.name}</b>
											</p>
										</li>
									)
								})}
							</ul>
						</div>
					</div>
				) : (
					<></>
				)}
			</div>
			<div>
				{filteredStacks ? (
					<div>
						<p className="mb-2">
							Fetch a list of all entries in the organization with content type <b>{contentType}</b> and title <b>{entryTitle}</b>.
						</p>
						<Button className="mb-4" onClick={filterStacksWithContentType}>
							Fetch List of Stacks
						</Button>
						<div mt-4>
							<ul className="mt-4">
								{filteredStacks.map((stack: any) => {
									return (
										<li className="my-4" key={stack.api_key}>
											<p>
												<b>{stack.name}</b>
											</p>
										</li>
									)
								})}
							</ul>
						</div>
					</div>
				) : (
					<></>
				)}
			</div>
		</div>
	)
}

export default StackList
