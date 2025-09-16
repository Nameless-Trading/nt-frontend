<script lang="ts">
	import { getGameDays } from '$lib/api';
	import { onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import {PUBLIC_FASTAPI_URL} from "$env/static/public"

	let connected = $state(false);
	let markets: Record<string, Market> = $state({});
	let gameDays: Date[] = $state([]);

	// Load game days on component mount
	onMount(() => {
		getGameDays().then((days) => {
			gameDays = days;
		});
	});

	function parseUTC(dateString: string): Date {
		return new Date(dateString);
	}

	function parseMT(date_string: string): Date {
		const dateUTC = new Date(date_string);
		return new Date(dateUTC.toLocaleString('en-US', { timeZone: 'America/Denver' }));
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			month: '2-digit',
			day: '2-digit',
			timeZone: 'America/Denver',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		});
	}

	interface Market {
		ticker: string;
		bidPrice: number;
		bidQuantity: number;
		askPrice: number;
		askQuantity: number;
		eventTicker: string;
		title: string;
		teamName: string;
		expectedExpirationTimeUTC: Date;
		gameStartTimeMT: Date;
		estimatedStartTime: Date;
		gameDate: string;
	}

	const ws = new WebSocket("wss://" + PUBLIC_FASTAPI_URL + "/ws");

	console.log(PUBLIC_FASTAPI_URL)

	ws.onopen = function (event) {
		connected = true;
	};

	ws.onmessage = function (event) {
		const market_raw = JSON.parse(event.data);

		console.log(market_raw)

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
			estimatedStartTime: parseUTC(market_raw.estimated_start_time),
			gameDate: market_raw.game_date
		};


		const ticker: string = market_clean.ticker;
		markets = { ...markets, [ticker]: market_clean };
	};
</script>

<div class="flex flex-col gap-4">
    <Card.Root class="p-4">
        Status: {connected ? 'Connected to websocket' : 'Disconnected from websocket'}
    </Card.Root>
	<div class="flex flex-col gap-4">
		{#each gameDays as gameDay}
			<Card.Root>
                <Card.Title class="text-center">{formatDate(gameDay)}</Card.Title>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head colspan={3}></Table.Head>
							<Table.Head colspan={2}>Bid</Table.Head>
							<Table.Head colspan={2}>Ask</Table.Head>
						</Table.Row>
						<Table.Row>
							<Table.Head>Ticker</Table.Head>
							<Table.Head>Team Name</Table.Head>
							<Table.Head>Game Start Time (MT)</Table.Head>
							<Table.Head>Quantity</Table.Head>
							<Table.Head>Price</Table.Head>
							<Table.Head>Price</Table.Head>
							<Table.Head>Quantity</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each Object.values(markets)
							.filter((market) => market.gameDate === gameDay.toISOString().split('T')[0])
							.sort((a, b) => a.gameStartTimeMT.getTime() - b.gameStartTimeMT.getTime()) as market}
							<Table.Row>
								<Table.Cell>{market.ticker.split('-')[2]}</Table.Cell>
								<Table.Cell>{market.teamName}</Table.Cell>
								<Table.Cell>{formatTime(market.gameStartTimeMT)}</Table.Cell>
								<Table.Cell>{market.bidQuantity}</Table.Cell>
								<Table.Cell>{market.bidPrice}</Table.Cell>
								<Table.Cell>{market.askPrice}</Table.Cell>
								<Table.Cell>{market.askQuantity}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Root>
		{/each}
	</div>
</div>
