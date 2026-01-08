export interface PortfolioSnapshot {
    timestamp: string;
    value: number;
    return_: number;
    cumulative_return: number;
}

export async function getPortfolioHistory(period: string): Promise<PortfolioSnapshot[]> {
    const url = `http://127.0.0.1:8000/portfolio_history/${period}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch portfolio history: ${response.statusText}`);
    }

    const data: PortfolioSnapshot[] = await response.json();
    return data;
}