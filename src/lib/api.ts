export async function getGameDays(): Promise<Date[]>{
    const url = "http://127.0.0.1:8000/game-days"
    const response = await fetch(url)
    const data = await response.json()
    return data.map((dateString: string) => new Date(dateString))
}