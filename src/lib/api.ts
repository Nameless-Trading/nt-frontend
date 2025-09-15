import {PUBLIC_FASTAPI_URL} from "$env/static/public"

export async function getGameDays(): Promise<Date[]>{
    const endpoint = "/game-days"
    const url = PUBLIC_FASTAPI_URL + endpoint
    const response = await fetch(url)
    const data = await response.json()
    return data.map((dateString: string) => new Date(dateString))
}