export interface PortfolioSnapshot {
    timestamp: string;
    value: number;
    return_: number;
    cumulative_return: number;
    return_dollar: number;
    cumulative_return_dollar: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function getPortfolioHistory(period: string): Promise<PortfolioSnapshot[]> {
    const url = `${API_BASE_URL}/portfolio_history/${period}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch portfolio history: ${response.statusText}`);
    }

    const data: PortfolioSnapshot[] = await response.json();
    return data;
}
