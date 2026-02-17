import { has } from "lodash"
import { CLIENT_ID, REDIRECT_URL } from "./const"
import pkceChallenge from "pkce-challenge"
import type { AuthTokens } from "./types"

export const fetchCache = "force-no-store"

export const EXTSTRING = '"extension_uid"'

export const transformCT = (activeSchema: any, currentSchemaExtensions: any, stackList: any, key: any) => {
	let ctTemp = JSON.stringify({
		title: activeSchema.title,
		uid: activeSchema.uid,
		schema: activeSchema.schema,
	})
	console.log(currentSchemaExtensions)
	// Execute this if extensions are found in the target stack.
	if (currentSchemaExtensions) {
		currentSchemaExtensions.forEach((cte: any) => {
			let targetStack = stackList.filter((s: any) => {
				return s.api_key === key
			})[0]
			console.log(targetStack)
			let targetStackExt = targetStack.extensions.filter((e: any) => {
				return e.title === cte.title
			})[0]
			// This logic is used only when we need to present an error related to missing extensions.
			// if (!targetStackExt) {
			// 	openErrorModal({}, `No matching extensions on stack ${targetStack.name}.`)
			// 	return
			// }
			if (targetStackExt) ctTemp = ctTemp.replaceAll(cte.uid, targetStackExt.uid)
			const file = new File([new Blob([ctTemp])], `${targetStack.name} - ${activeSchema.title}.json`)
			const link = document.createElement("a")
			const url = URL.createObjectURL(file)

			link.href = url
			link.download = file.name
			document.body.appendChild(link)
			link.click()

			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
		})
		// Or this if there are no extensions in the target stack.
	} else {
		let targetStack = stackList.filter((s: any) => {
			return s.api_key === key
		})[0]
		const file = new File([new Blob([ctTemp])], `${targetStack.name} - ${activeSchema.title}.json`)
		const link = document.createElement("a")
		const url = URL.createObjectURL(file)

		link.href = url
		link.download = file.name
		document.body.appendChild(link)
		link.click()
		console.log(ctTemp)
		document.body.removeChild(link)
		window.URL.revokeObjectURL(url)
	}
}

export const getAllContentTypes = async (headers: any, stack: any, appSdk: any) => {
	let modHeaders = { ...headers, api_key: stack }
	let ct = await appSdk.stack.getContentTypes({})
	let gf = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}v3/global_fields`, { headers: modHeaders }).then((result) => {
		return result.json()
	})
	let { arr: ctf, exByType: exByCT } = await findSchemasWithExtensions(ct.content_types)
	let { arr: gff, exByType: exByGF } = await findSchemasWithExtensions(gf.global_fields)
	return {
		extensionsBySchema: [...exByCT, ...exByGF],
		schemas: [...ctf, ...gff],
	}
	// setExtensionsBySchema([...exByCT, ...exByGF]);
	// setSchemas([...ctf, ...gff]);
}

export const findSchemasWithExtensions = async (arrayOfSchemas: any[]) => {
	let exByType: Record<string, string[]>[] = []
	// const arr = arrayOfSchemas.filter((c: any) => { // This will filter for any schemas using extensions
	const arr = arrayOfSchemas.map((c: any) => {
		// This will return all schemas, regardless of extension
		let ctString = JSON.stringify(c)
		let startIndex = 0,
			index,
			extensionsUsed: string[] = []
		while ((index = ctString.indexOf(EXTSTRING, startIndex)) > -1) {
			startIndex = index + EXTSTRING.length
			let nextStringStart = ctString.indexOf('"', startIndex) + 1
			let extensionUid = ctString.substring(nextStringStart, ctString.indexOf('"', nextStringStart))
			if (extensionsUsed.indexOf(extensionUid) === -1) extensionsUsed.push(extensionUid)
		}
		if (extensionsUsed.length > 0) exByType.push({ uid: c.uid, extensionsUsed: extensionsUsed })
		// return extensionsUsed.length > 0; // This will return a schema using an extension
		return c // This will return the schema
	})
	return { arr, exByType }
}

export const getExtensions = async (headers: any, stack: any) => {
	let modHeaders = { ...headers, api_key: stack }
	const req = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}v3/extensions?include_marketplace_extensions=true`, {
		headers: { ...modHeaders },
	}).then((data) => {
		let ret = data.json()
		return ret
	})
	return req.extensions
	// setCurrentStackExtensions(req.extensions)
}

export const receiveAuthToken = async (code: string, location: string, code_verifier: string) => {
	if (!location) {
		return
	}
	const params: Record<string, string> = {
		grant_type: "authorization_code",
		client_id: CLIENT_ID || "",
		redirect_uri: `${process.env.NEXT_PUBLIC_LAUNCH_HOST}${REDIRECT_URL}` || "",
		code_verifier: code_verifier,
		code: code as string,
	}

	const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL_AWS_NA}/apps-api/apps/token` as string, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: getUrlEncodedFormData(params),
	})
	let data = { ...(await response.json()), code_verifier: code_verifier }
	console.log(data)
	// return { accessToken: data.access_token, refreshToken: data.refresh_token } as AuthTokens
    return data
}

export const getUrlEncodedFormData = (params: Record<string, string>) => {
	const formBody: any[] = []
	for (const property in params) {
		const encodedKey: any = encodeURIComponent(property)
		const encodedValue: any = encodeURIComponent(params[property])
		formBody.push(encodedKey + "=" + encodedValue)
	}
	return formBody.join("&")
}

export const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
