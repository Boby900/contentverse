
const TARGET_URL = "http://localhost:3000/api/collection"; // Replace with your endpoint
const REQUESTS_PER_SECOND = 500; // Number of requests to send per second
const TOTAL_REQUESTS = 5000; // Total number of requests to send
const TIME_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds

async function sendRequest(ip:string, reason:string) {
  try {
    // Simulate a request with custom IP and data
    const response = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": ip, // Set a custom IP for tracking
      },
      body: JSON.stringify({
        exampleField: "testData", // Replace with your API payload
        status: "success",
        message: "Collection created successfully",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`Request from ${ip} succeeded.`);
  } catch (error) {
    console.error(`Request from ${ip} failed: ${error}`);
  }
}

async function simulateRequests() {
  let completedRequests = 0;
  const startTime = Date.now();

  // Generate IPs for the simulation
  const ips = Array.from({ length: REQUESTS_PER_SECOND }, (_, i) => `192.168.1.${i + 1}`);
  const reason = "Load Testing";

  while (completedRequests < TOTAL_REQUESTS) {
    const requests = ips.map((ip) => sendRequest(ip, reason));
    await Promise.all(requests); // Wait for all requests to complete

    completedRequests += REQUESTS_PER_SECOND;
    const elapsedTime = Date.now() - startTime;

    console.log(
      `Sent ${completedRequests} requests in ${elapsedTime / 1000}s`
    );

    // Sleep for 1 second before sending the next batch
    if (completedRequests < TOTAL_REQUESTS) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("Load test completed.");
}

// Run the simulation
simulateRequests().catch(console.error);