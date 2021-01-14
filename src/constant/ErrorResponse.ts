interface IErrorResponse {
	[key: string]: {
		message: string
		code: string | any
	}
}
export const ERROR_RESPONSE = {
	NOT_FOUND_USER: {
		message: `Not Found user`,
		code: `NOT_FOUND_USER`
	},
	INVALID_PASSWORD: {
		message: `Invalid Password`,
		code: `INVALID_PASSWORD`
	},
	INVALID_TOKEN:{
		message: `Invalid Token`,
		code: `INVALID_TOKEN`
	}



}