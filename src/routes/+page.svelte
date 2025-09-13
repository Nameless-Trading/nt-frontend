<script lang="ts">
    let connected = $state(false);
    let markets: Record<string, Market> = $state({})

    interface Market{
        ticker: string
        bid_price: number
        bid_quantity: number
        ask_price: number
        ask_quantity: number
    }

    const ws = new WebSocket("ws://localhost:8000/ws")

    ws.onopen = function(event) {
       connected = true
    };

    ws.onmessage = function(event) {
        const market: Market = JSON.parse(event.data)
        console.log(market)
        const ticker: string = market['ticker']
        markets = { ...markets, [ticker]: market };
    };

</script>

<div>{connected ? 'Connected to websocket' : 'Disconnected from websocket'}</div>
<div>
    {#each Object.values(markets) as market}
    <div>
        <div>{market.ticker}</div>
        <div>Bid: {market.bid_price}</div>
        <div>Ask: {market.ask_price}</div>
    </div>
    {/each}
</div>