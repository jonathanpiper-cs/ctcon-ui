export const EXTTYPES: Record<string, string> = {
	field: "Custom Field",
	rte_plugin: "RTE Plugin",
}

// Type definition for AuthTokens
export type AuthTokens = {
	accessToken?: string
	refreshToken?: string
}

export type VerboseExtension = {
	title: string
	type: string
	uid: string
}