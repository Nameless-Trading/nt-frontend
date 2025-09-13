<script lang="ts">
    const ws = new WebSocket("ws://localhost:8000/ws")

    ws.onopen = function(event) {
        console.log("Connected to WebSocket", "system");
    };

    ws.onmessage = function(event) {
        console.log("Received: " + event.data, "server");
    };

    ws.onclose = function(event) {
        console.log("WebSocket connection closed", "system");
    };
    
    ws.onerror = function(error) {
        console.log("WebSocket error: " + error, "system");
    };

    function sendMessage(){
        ws.send("Hello, world!")
    }

</script>

<h1>Hello, world!</h1>
<button onclick={() => sendMessage()}>Send</button>
