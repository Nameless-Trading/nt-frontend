<script lang="ts">
    let connected = $state(false);
    let markets: Record<string, Market> = $state({})

    function parseUTC(dateString: string): Date {
        return new Date(dateString)
    }

    function parseMT(date_string: string): Date {
        const dateUTC = new Date(date_string)
        return new Date(dateUTC.toLocaleString('en-US', { timeZone: 'America/Denver' }))
    }

    function formatTime(date: Date): string {
        return date.toLocaleTimeString('en-US', {
            month: '2-digit',
            day: '2-digit',            
            timeZone: 'America/Denver',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    interface Market{
        ticker: string
        bidPrice: number
        bidQuantity: number
        askPrice: number
        askQuantity: number
        eventTicker: string
        title: string
        teamName: string
        expectedExpirationTimeUTC: Date
        gameStartTimeMT: Date
        status: string
    }

    const ws = new WebSocket("ws://localhost:8000/ws")

    ws.onopen = function(event) {
       connected = true
    };

    ws.onmessage = function(event) {
        const market_raw = JSON.parse(event.data)
        
        const market_clean: Market = {
            ticker: market_raw.ticker,
            bidPrice: market_raw.bid_price,
            bidQuantity: market_raw.bid_quantity,
            askPrice: market_raw.ask_price,
            askQuantity: market_raw.ask_quantity,
            eventTicker: market_raw.event_ticker,
            title: market_raw.title,
            teamName: market_raw.team_name,
            expectedExpirationTimeUTC: parseUTC(market_raw.expected_expiration_time_utc),
            gameStartTimeMT: parseMT(market_raw.game_start_time_mt),
            status: market_raw.status
        };
        
        const ticker: string = market_clean.ticker;
        // console.log(market_clean);
        markets = { ...markets, [ticker]: market_clean };
    };

</script>

<div class="page">
    <div>{connected ? 'Connected to websocket' : 'Disconnected from websocket'}</div>
    <table>
        <thead>
            <tr>
                <th colspan="2"></th>
                <th colspan="2">Bid</th>
                <th colspan="2">Ask</th>
                <th></th>
            </tr>
            <tr>
                <th>Ticker</th>
                <th>Team Name</th>
                <th>Game Start Time (MT)</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Price</th>
                <th>Quantity</th>
            </tr>
        </thead>
        <tbody>
        {#each Object.values(markets).sort((a, b) => a.gameStartTimeMT.getTime() - b.gameStartTimeMT.getTime()) as market}
        <tr>
            <td>{market.ticker.split('-')[2]}</td>
            <td>{market.teamName}</td>
            <td>{formatTime(market.gameStartTimeMT)}</td>
            <td>{market.bidQuantity}</td>
            <td>{market.bidPrice}</td>
            <td>{market.askPrice}</td>
            <td>{market.askQuantity}</td>
        </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>
    table{
        padding: 1rem;
        border: 1px solid black;
        border-collapse: collapse;
    }

    th{
        border: 1px solid black;
        padding: .5rem;
    }

    td{
        border: 1px solid black;
        padding: .5rem;
    }
</style>