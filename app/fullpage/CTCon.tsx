"use client"
import React, { useEffect, useState } from "react"
require("dotenv").config()
import { has } from "lodash"
import dynamic from "next/dynamic"
import { Button, Heading } from "@contentstack/venus-components"
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation"
import { IFullPageLocation } from "@contentstack/app-sdk/dist/src/types"
import CTConInterface from "./CTConInterface"
import ContentstackAppSDK from "@contentstack/app-sdk"
import pkceChallenge from "pkce-challenge"
let pkceChallengeCode = pkceChallenge()
const code_verifier = pkceChallengeCode.code_verifier
import { User } from "@contentstack/app-sdk/dist/src/types/user.types"
import { receiveAuthToken, getUrlEncodedFormData } from "@/lib/helper"
import type { AuthTokens } from "@/lib/helper"

const CTCon = () => {
	const [authenticating, setAuthenticating] = useState<boolean>(false)
	const [authTokens, setAuthTokens] = useState<AuthTokens>({})
	const [appSdk, setAppSdk] = useState<UiLocation>()
	const [stack, setStack] = useState<string>()
	const [location, setLocation] = useState<IFullPageLocation>()
	const [currentUser, setCurrentUser] = useState<User>()
	const [currentStackRoles, setCurrentStackRoles] = useState<string[]>()
	const windowProps = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=1200, height=800`
	const APP_ID = process.env.NEXT_PUBLIC_APP_ID
	const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL_AWS_NA
	const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID
	const REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL

	useEffect(() => {
		const getSDK = async () => {
			ContentstackAppSDK.init().then((appSDK) => {
				setAppSdk(appSDK)
				const loc = appSDK?.location.FullPage
				loc && setLocation(loc)
				setStack(appSDK.stack._data.api_key)
				setCurrentUser(appSDK.currentUser)
			})
		}

		getSDK().catch((err) => {
			console.error(err)
		})
	}, [])

	// Get basic information about the user.
	useEffect(() => {
		if (currentUser) {
			if (currentUser.is_owner) {
				setCurrentStackRoles(["Owner"])
			} else {
				setCurrentStackRoles(currentUser.roles.filter((r: any) => r.api_key === stack).map((r: any) => r.name))
			}
		}
	}, [currentUser, stack])

	// Set listener for OAuth actions.
	useEffect(() => {
		const authorize = async (event: MessageEvent) => {
			console.log(event)
			const authTokens = await receiveAuthToken(event.data)
			console.log(authTokens)
			if (authTokens) setAuthTokens(authTokens)
			setAuthenticating(false)
			return true
		}
		window.addEventListener("message", (event) => {
			return authorize(event as MessageEvent)
		})
		// const receiveAuthToken = async (event: MessageEvent) => {
		// 	if (!has(event?.data, "location")) {
		// 		return
		// 	}

		// 	const { code } = event.data
		// 	const params: Record<string, string> = {
		// 		grant_type: "authorization_code",
		// 		client_id: CLIENT_ID || "",
		// 		redirect_uri: `${process.env.NEXT_PUBLIC_LAUNCH_HOST}${REDIRECT_URL}` || "",
		// 		code_verifier: code_verifier,
		// 		code: code as string,
		// 	}

		// 	const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL_AWS_NA}/apps-api/apps/token` as string, {
		// 		method: "POST",
		// 		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		// 		body: getUrlEncodedFormData(params),
		// 	})
		// 	let data = { ...(await response.json()), code_verifier: code_verifier }
		// 	setAuthTokens({ accessToken: data.access_token, refreshToken: data.refresh_token })
		// 	setAuthenticating(false)
		// }
		// window.addEventListener("message", receiveAuthToken)
		return () => window.removeEventListener("message", receiveAuthToken)
	}, [CLIENT_ID, REDIRECT_URL])

	// Authenticate via OAuth. This will open a new window to authenticate.
	const auth = async () => {
		setAuthenticating(true)
		const url = `${AUTH_URL}/apps/${APP_ID}/authorize?response_type=code&client_id=${CLIENT_ID}&&auto_select_organizationredirect_uri=http://localhost${REDIRECT_URL}&code_challenge_method=plain&code_challenge=${code_verifier}`
		const popup = window.open(url, "User Authentication", windowProps)
		popup?.opener.postMessage({ message: "Open window" }, `${process.env.NEXT_PUBLIC_LAUNCH_HOST}`)
	}

	return (
		<div className="m-4">
			<div className="mb-4">
				<Heading tagName="h1" text="CTCon"></Heading>
				<Heading tagName="h3" text="Tool for transforming app uids across content types for multi-stack implementations."></Heading>
				<p>
					This tool leverages Contentstack&rsquo;s App SDK, Oauth, and Content Management API (CMA) endpoints. Note that it will require multiple
					calls to the CMA to gather information about your organization&rsquo;s stacks. For typical customer implementations, this shouldn&rsquo;t be
					an issue. To start, please click &lsquo;Authorize&rsquo;.
				</p>
			</div>
			{currentUser ? (
				<div className="mb-4">
					<p>
						Current user name: {currentUser.first_name} {currentUser.last_name} <br />
						<>{currentStackRoles ? `Role on current stack: ${currentStackRoles.join(", ")}` : <></>}</>
					</p>
				</div>
			) : (
				<></>
			)}
			<div>
				<Button onClick={auth} isLoading={authenticating} buttonType="primary" disabled={authTokens.accessToken}>
					{authTokens.accessToken ? "Authorized" : "Authorize"}
				</Button>
				{authTokens.accessToken && appSdk ? <CTConInterface {...{ stack, location, appSdk, authTokens }} /> : ""}
			</div>
		</div>
	)
}

export default CTCon
