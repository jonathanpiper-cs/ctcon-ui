"use client"

import { Button, Radio } from "@contentstack/venus-components"
import React, { useEffect, useState } from "react"
import { EXTTYPES, EXTSTRING, getAllContentTypes, findSchemasWithExtensions, getExtensions } from "../../lib/helper"

const ContentTypeList = (props: any) => {
	const { stack, appSdk, setActiveSchema, setExtensionsBySchema, schemas, setSchemas, setCurrentStackExtensions, headers } = props

	// This function originally found only schemas with extensions. Now finds all schemas but still looks for extensions.

	// Gets all content types and global fields.

	const changeActiveSchema = async (event: any, key: string) => {
		const actCT = schemas.filter((ct: any) => {
			return ct.uid === key
		})[0]
		setActiveSchema(actCT)
	}

	useEffect(() => {
		const setExtensions = async (headers: any, stack: any) => {
			let extensions = await getExtensions(headers, stack)
			setCurrentStackExtensions(extensions)
		}
		setExtensions(headers, stack)
	}, [headers, setCurrentStackExtensions, stack])

	const setContentTypesAndSchemas = () => {
		getAllContentTypes(headers, stack, appSdk).then((data: any) => {
			setExtensionsBySchema(data.extensionsBySchema)
			setSchemas(data.schemas)
		})
	}

	return (
		<div className="mt-2a">
			<p className="mb-2">Get a list of all content types and global fields in this current stack.</p>
			<Button onClick={setContentTypesAndSchemas}>Fetch Schemas</Button>
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
							)
						})}
					</ul>
					<p>Select a content type to proceed.</p>
				</div>
			) : (
				<div></div>
			)}
		</div>
	)
}

export default ContentTypeList
