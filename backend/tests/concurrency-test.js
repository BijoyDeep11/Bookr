
const API_URL = "http://localhost:5000/bookings";

// Existing booking reference:
// ID: 526cf033-910c-49f9-9905-c32bfe367b86
// Customer: Amit Das
// Service: Premium Haircut
// Staff: Rahul Sharma
// Location: Central Branch
// Previous status: completed
//
// This existing booking is only our reference.
// We are creating two NEW bookings for the concurrency test.

const bookingData = {
    customerId: "c5fb3152-495c-4614-9f2d-e9358e8ff506",
    serviceId: "aa379cd2-886e-4c3e-86fb-a05ccb82f6ad",
    staffId: "c35d3284-dde9-45c4-9d36-bc75d23efd1c",
    locationId: "0e6bcbef-6655-4b0d-ac1c-abda541a79e0",

    startTime: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
    ).toISOString(),

    endTime: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 45 * 60 * 1000
    ).toISOString(),
    
    price: 500,
    status: "confirmed"
};

async function sendBookingRequest(requestName) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        return {
            request: requestName,
            status: response.status,
            result
        };

    } catch (error) {
        return {
            request: requestName,
            error: error.message
        };
    }
}

async function testConcurrency() {
    console.log("Sending two simultaneous booking requests...\n");

    console.log("Testing slot:");
    console.log("Start:", bookingData.startTime);
    console.log("End:", bookingData.endTime);
    console.log("Staff:", bookingData.staffId);

    const results = await Promise.all([
        sendBookingRequest("Customer A"),
        sendBookingRequest("Customer B")
    ]);

    console.dir(results, { depth: null });
}

testConcurrency();
