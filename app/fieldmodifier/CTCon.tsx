"use client"
import React, { useEffect, useState } from "react"
require("dotenv").config()
import { has } from "lodash"
import dynamic from "next/dynamic"
import { Button, Heading } from "@contentstack/venus-components"
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation"
import { IFieldModifierLocation, IFullPageLocation } from "@contentstack/app-sdk/dist/src/types"
import CTConInterface from "./CTConInterface"
import ContentstackAppSDK from "@contentstack/app-sdk"
import pkceChallenge from "pkce-challenge"
let pkceChallengeCode = pkceChallenge()
const code_verifier = pkceChallengeCode.code_verifier
import { User } from "@contentstack/app-sdk/dist/src/types/user.types"

// Type definition for AuthTokens
type AuthTokens = {
	accessToken?: string
	refreshToken?: string
}

// Required for OAuth
export const getUrlEncodedFormData = (params: Record<string, string>) => {
	const formBody: any[] = []
	for (const property in params) {
		const encodedKey: any = encodeURIComponent(property)
		const encodedValue: any = encodeURIComponent(params[property])
		formBody.push(encodedKey + "=" + encodedValue)
	}
	return formBody.join("&")
}

const CTCon = () => {
	const [authenticating, setAuthenticating] = useState<boolean>(false)
	const [authTokens, setAuthTokens] = useState<AuthTokens>({})
	const [appSdk, setAppSdk] = useState<UiLocation>()
	const [stack, setStack] = useState<string>()
	const [location, setLocation] = useState<IFieldModifierLocation>()
	const [currentUser, setCurrentUser] = useState<User>()
	const [currentStackRoles, setCurrentStackRoles] = useState<string[]>()
	const [currentRate, setCurrentRate] = useState<any>()
	const [entry, setEntry] = useState<any>()
	const [field, setField] = useState<any>()
	const windowProps = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=1200, height=800`
	const APP_ID = process.env.NEXT_PUBLIC_APP_ID
	const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL_AWS_NA
	const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID
	const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL

	useEffect(() => {
		const getSDK = async () => {
			ContentstackAppSDK.init().then((appSDK) => {
				setAppSdk(appSDK)
				const loc = appSDK?.location.FieldModifierLocation
				if (loc) {
					setLocation(loc)
					setStack(appSDK.stack._data.api_key)
					setCurrentUser(appSDK.currentUser)
					setEntry(loc.entry.getData())
					setField(loc.field)
				}
			})
		}

		getSDK().catch((err) => {
			console.error(err)
		})
	}, [])

	const getCurrent = async () => {
		const request = await fetch(`https://api.vatcomply.com/rates?base=USD`)
		const response = await request.json()
		setCurrentRate(response.rates.EUR)
		console.log(response)
	}

	const setRate = async () => {
		if (appSdk && location) {
            console.log(location.entry.content_type, entry.uid)
			appSdk.stack.ContentType(location.entry.content_type.uid).Entry(entry.uid).update({ entry: { [field.uid]: currentRate.toString() } })
		}
		// stack.ContentType(entry.content_type.uid).Entry(
	}

	return (
		<div className="m-4">
			<div className="mb-4">
				<Button onClick={getCurrent}>Fetch Current USD to EUR</Button>
				{currentRate && <p>{currentRate}</p>}
				{currentRate && <Button onClick={setRate}>Set current rate?</Button>}
			</div>
		</div>
	)
}

export default CTCon
