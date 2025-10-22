/**
 * script.js - FIXED VERSION
 * SANTRANS CORPORATION - Ticketing System
 * Fixed navigation issues and added missing functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================
    // --- GLOBAL / STATE -----
    // =========================

    // Current ticket/session state
    let currentTicket = {
        from: "",
        to: "",
        passengerType: "regular",
        regularFare: 0,
        discount: 0,
        finalFare: 0,
        paymentMethod: "",
        busNumber: "",
        driverName: "",
        conductorName: "",
        passengerCount: 0,
        timestamp: "",
        dateObject: null,
        location: { latitude: null, longitude: null }
    };

    // Direction flag for route generation (false = forward, true = reverse)
    let currentRouteDirection = false;

    // Session data + stats (persisted in localStorage)
    let sessionData = JSON.parse(localStorage.getItem('sessionData')) || {
        busNumber: "",
        driverName: "",
        conductorName: ""
    };

    let stats = JSON.parse(localStorage.getItem('conductorStats')) || {
        regularPassengers: 0,
        studentPassengers: 0,
        seniorPassengers: 0,
        totalPayments: 0,
        cashlessPayments: 0,
        cashPayments: 0,
        ticketCounter: 0
    };

    // Issued tickets history
    let issuedTickets = JSON.parse(localStorage.getItem('issuedTickets')) || [];

    // Geolocation holder
    let locationData = { latitude: null, longitude: null };

    let qrCodeTimer = null;

    // =========================
    // --- FARES & ROUTES -----
    // =========================

    const allRoutes = {
        'FVR to ST.CRUZ': [
            { origin: 'FVR', destination: 'SAMPOL', fare: 15 },
            { origin: 'FVR', destination: 'AREA E', fare: 15 },
            { origin: 'FVR', destination: 'MOTORPOL', fare: 15 },
            { origin: 'FVR', destination: 'PROPER', fare: 15 },
            { origin: 'FVR', destination: 'NEW CITY HALL', fare: 15 },
            { origin: 'FVR', destination: 'KAYPIAN', fare: 15 },
            { origin: 'FVR', destination: 'SAN JOSE', fare: 20 },
            { origin: 'FVR', destination: 'MUZON', fare: 22 },
            { origin: 'FVR', destination: 'MUZON (CENTRAL)', fare: 22 },
            { origin: 'FVR', destination: 'LUMA DE GATO', fare: 22 },
            { origin: 'FVR', destination: 'FRENZA', fare: 28 },
            { origin: 'FVR', destination: 'MARILAO EXIT', fare: 35 },
            { origin: 'FVR', destination: 'AYALA MALLS', fare: 75 },
            { origin: 'FVR', destination: 'BALINTAWAK', fare: 80 },
            { origin: 'FVR', destination: 'ST. CRUZ', fare: 100 },
            { origin: 'SAPANG PALAY', destination: 'SAMPOL', fare: 15 },
            { origin: 'SAPANG PALAY', destination: 'AREA E', fare: 15 },
            { origin: 'SAPANG PALAY', destination: 'PROPER', fare: 15 },
            { origin: 'SAPANG PALAY', destination: 'NEW CITY HALL', fare: 15 },
            { origin: 'SAPANG PALAY', destination: 'KAYPIAN', fare: 15 },
            { origin: 'SAPANG PALAY', destination: 'SAN JOSE', fare: 18 },
            { origin: 'SAPANG PALAY', destination: 'MUZON', fare: 25 },
            { origin: 'SAPANG PALAY', destination: 'MUZON (CENTRAL)', fare: 25 },
            { origin: 'SAPANG PALAY', destination: 'LUMA DE GATO', fare: 30 },
            { origin: 'SAPANG PALAY', destination: 'FRENZA', fare: 40 },
            { origin: 'SAPANG PALAY', destination: 'MARILAO EXIT', fare: 40 },
            { origin: 'SAPANG PALAY', destination: 'AYALA MALLS', fare: 85 },
            { origin: 'SAPANG PALAY', destination: 'BALINTAWAK', fare: 85 },
            { origin: 'SAPANG PALAY', destination: 'ST. CRUZ', fare: 100 },
            { origin: 'SAPANG PALAY', destination: 'LACSON', fare: 85 },
            { origin: 'KAYPIAN', destination: 'MUZON', fare: 15 },
            { origin: 'KAYPIAN', destination: 'LUMA DE GATO', fare: 18 },
            { origin: 'KAYpiAN', destination: 'FRENZA', fare: 20 },
            { origin: 'KAYPIAN', destination: 'MARILAO EXIT', fare: 30 },
            { origin: 'KAYPIAN', destination: 'AYALA MALLS', fare: 70 },
            { origin: 'KAYPIAN', destination: 'BALINTAWAK', fare: 75 },
            { origin: 'KAYPIAN', destination: 'LACSON', fare: 85 },
            { origin: 'KAYPIAN', destination: 'ST. CRUZ', fare: 95 },
            { origin: 'SAN JOSE', destination: 'MUZON', fare: 15 },
            { origin: 'SAN JOSE', destination: 'LUMA DE GATO', fare: 15 },
            { origin: 'SAN JOSE', destination: 'FRENZA', fare: 18 },
            { origin: 'SAN JOSE', destination: 'MARILAO EXIT', fare: 25 },
            { origin: 'SAN JOSE', destination: 'AYALA MALLS', fare: 65 },
            { origin: 'SAN JOSE', destination: 'BALINTAWAK', fare: 70 },
            { origin: 'SAN JOSE', destination: 'LACSON', fare: 75 },
            { origin: 'SAN JOSE', destination: 'ST.CRUZ', fare: 90 },
            { origin: 'MUZON', destination: 'MARILAO EXIT', fare: 15 },
            { origin: 'MUZON', destination: 'BALINTAWAK', fare: 60 },
            { origin: 'MUZON', destination: 'AYALA MALLS', fare: 55 },
            { origin: 'MUZON', destination: 'LACSON', fare: 75 },
            { origin: 'MUZON', destination: 'ST.CRUZ', fare: 75 },
            { origin: 'MARILAO EXIT', destination: 'BALINTAWAK', fare: 30 },
            { origin: 'MARILAO EXIT', destination: 'AYALA MALLS', fare: 35 },
            { origin: 'MARILAO EXIT', destination: 'LACSON', fare: 40 },
            { origin: 'MARILAO EXIT', destination: 'ST. CRUZ', fare: 45 }
        ],
        'ST.CRUZ to FVR': [
            { origin: 'ST. CRUZ', destination: 'MARILAO EXIT', fare: 30 },
            { origin: 'ST. CRUZ', destination: 'FRENZA', fare: 35 },
            { origin: 'ST. CRUZ', destination: 'LUMA DE GATO', fare: 40 },
            { origin: 'ST. CRUZ', destination: 'MUZON', fare: 50 },
            { origin: 'ST. CRUZ', destination: 'SAN JOSE', fare: 60 },
            { origin: 'ST.CRUZ', destination: 'KAYPIAN', fare: 95 },
            { origin: 'ST. CRUZ', destination: 'SAPANG PALAY', fare: 70 },
            { origin: 'ST. CRUZ', destination: 'FVR', fare: 100 },
            { origin: 'BALINTAWAK', destination: 'MARILAO EXIT', fare: 35 },
            { origin: 'BALINTAWAK', destination: 'FRENZA', fare: 40 },
            { origin: 'BALINTAWAK', destination: 'MUZON', fare: 60 },
            { origin: 'BALINTAWAK', destination: 'SAN JOSE', fare: 65 },
            { origin: 'BALINTAWAK', destination: 'KAYPIAN', fare: 90 },
            { origin: 'BALINTAWAK', destination: 'FVR', fare: 95 },
            { origin: 'AYALA MALLS', destination: 'MUZON', fare: 65 },
            { origin: 'AYALA MALLS', destination: 'SAN JOSE', fare: 90 },
            { origin: 'AYALA MALLS', destination: 'FVR', fare: 90 },
            { origin: 'MARILAO EXIT', destination: 'MUZON', fare: 15 },
            { origin: 'MARILAO EXIT', destination: 'SAN JOSE', fare: 20 },
            { origin: 'MARILAO EXIT', destination: 'SAPANG PALAY', fare: 30 },
            { origin: 'MARILAO EXIT', destination: 'FVR', fare: 35 },
            { origin: 'MUZON', destination: 'SAN JOSE', fare: 15 },
            { origin: 'MUZON', destination: 'SAPANG PALAY', fare: 20 },
            { origin: 'MUZON', destination: 'FVR', fare: 22 },
            { origin: 'SAN JOSE', destination: 'SAPANG PALAY', fare: 18 },
            { origin: 'SAN JOSE', destination: 'FVR', fare: 20 },
            { origin: 'SAPANG PALAY', destination: 'FVR', fare: 15 }
        ]
    };

    // =========================
    // --- DOM ELEMENTS -------
    // =========================

    const pages = {
        home: document.getElementById('home-page'),
        selectionLoop: document.getElementById('selection-loop-page'),
        selectionRoute: document.getElementById('selection-route-page'),
        passenger: document.getElementById('passenger-page'),
        ticket: document.getElementById('ticket-page'),
        qrcode: document.getElementById('qrcode-page'),
        conductorHome: document.getElementById('conductor-page-home'),
        conductorRoute: document.getElementById('conductor-page-route'),
        fareData: document.getElementById('fare-data-page')
    };

    const busNumberInput = document.getElementById('bus-no-input');
    const driverNameInput = document.getElementById('driver-name-input');
    const conductorNameInput = document.getElementById('conductor-name-input');
    const passengerCountInput = document.getElementById('passenger-count-input');

    const displayBusNumberHeader = document.getElementById('display-bus-number');
    const displayDriverNameHeader = document.getElementById('display-driver-name');
    const displayConductorNameHeader = document.getElementById('display-conductor-name');

    const prevFromDisplay = document.getElementById('prev-from-display');
    const prevToDisplay = document.getElementById('prev-to-display');

    const routeButtonsContainer = document.getElementById('route-buttons-container');
    const ticketBusNumberDisplay = document.getElementById('ticket-bus-number');
    const ticketSummaryContainer = document.getElementById('ticket-summary-container');
    const receiptNotification = document.getElementById('receipt-notification');
    const notificationMessage = document.getElementById('notification-message');
    const proceedQrCodeBtn = document.getElementById('proceed-qrcode-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const fareDataList = document.getElementById('fare-data-list');

    // =========================
    // --- UTILITY FUNCTIONS ---
    // =========================

    /**
     * Get device location if user allows.
     */
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                locationData.latitude = position.coords.latitude;
                locationData.longitude = position.coords.longitude;
            }, (error) => {
                console.warn("Location not obtained:", error);
            });
        }
    }

    /**
     * Center text (used for plain-text receipts)
     */
    function centerText(text, totalWidth) {
        const textLength = text.length;
        if (textLength >= totalWidth) return text;
        const padding = Math.floor((totalWidth - textLength) / 2);
        return ' '.repeat(padding) + text + ' '.repeat(totalWidth - textLength - padding);
    }

    /**
     * Show page by id and hide others
     */
    function showPage(pageId) {
        Object.values(pages).forEach(p => { if (p) p.classList.add('hidden'); });
        if (pages[pageId]) pages[pageId].classList.remove('hidden');

        // When showing passenger page, show the selected from/to values
        if (pageId === 'passenger') {
            if (prevFromDisplay) prevFromDisplay.textContent = `From: ${currentTicket.from}`;
            if (prevToDisplay) prevToDisplay.textContent = `To: ${currentTicket.to}`;
        }
        // Update stats when showing conductor pages
        if (pageId === 'conductorHome') updateStatsDisplay(true);
        if (pageId === 'conductorRoute') updateStatsDisplay(false);
    }

    /**
     * Update date/time display (12-hour format with AM/PM)
     */
    function updateDateTime() {
        const now = new Date();
        const options = {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        };
        const formatted = now.toLocaleString('en-US', options).replace(',', '');
        const el = document.getElementById('date-time-display');
        if (el) el.textContent = `DATE & TIME: ${formatted}`;
        return formatted;
    }

    /**
     * Update conductor stats display in UI
     */
    function updateStatsDisplay(isHome = false) {
        const totalPassengers = stats.regularPassengers + stats.studentPassengers + stats.seniorPassengers;
        const suffix = isHome ? 'home' : 'route';
        const updateIfExists = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        updateIfExists(`total-passengers-${suffix}`, totalPassengers);
        updateIfExists(`regular-passengers-${suffix}`, stats.regularPassengers);
        updateIfExists(`student-passengers-${suffix}`, stats.studentPassengers);
        updateIfExists(`senior-passengers-${suffix}`, stats.seniorPassengers);
        updateIfExists(`total-payments-${suffix}`, stats.totalPayments.toFixed(2));
        updateIfExists(`cashless-payments-${suffix}`, stats.cashlessPayments.toFixed(2));
        updateIfExists(`cash-payments-${suffix}`, stats.cashPayments.toFixed(2));
    }

    /**
     * Save stats & issued tickets to localStorage
     */
    function saveStats() { localStorage.setItem('conductorStats', JSON.stringify(stats)); }
    function saveIssuedTickets() { localStorage.setItem('issuedTickets', JSON.stringify(issuedTickets)); }

    // --- FEATURE: Binago ang function na ito para humingi ng passcode ---
    /**
     * Clear all conductor data (confirm first)
     */
    function clearAllData() {
        const passcode = prompt('To clear all data, please enter the admin passcode:');
        
        if (passcode === null) {
            // User clicked "Cancel"
            return; 
        }

        if (passcode === "111111") {
            // Correct passcode. Now, show the original confirmation.
            if (confirm('Are you sure you want to clear ALL conductor data, including ticket history? This action cannot be undone.')) {
                stats = { regularPassengers: 0, studentPassengers: 0, seniorPassengers: 0, totalPayments: 0, cashlessPayments: 0, cashPayments: 0, ticketCounter: 0 };
                issuedTickets = [];
                saveStats();
                saveIssuedTickets();
                updateStatsDisplay(true);
                updateStatsDisplay(false);
                showNotification('All conductor data cleared!');
            }
        } else {
            // Incorrect passcode
            showNotification('Incorrect passcode. Data was not cleared.', 'error');
        }
    }
    // --- END OF FEATURE ---

    /**
     * Save and load session data (bus #, driver, conductor)
     */
    function saveSessionData() { localStorage.setItem('sessionData', JSON.stringify(sessionData)); }
    function loadSessionData() {
        if (sessionData.busNumber && busNumberInput) {
            busNumberInput.value = sessionData.busNumber;
            if (displayBusNumberHeader) displayBusNumberHeader.textContent = `BUS #: ${sessionData.busNumber}`;
            currentTicket.busNumber = sessionData.busNumber;
        }
        if (sessionData.driverName && driverNameInput) {
            driverNameInput.value = sessionData.driverName;
            if (displayDriverNameHeader) displayDriverNameHeader.textContent = `DRIVER: ${sessionData.driverName}`;
            currentTicket.driverName = sessionData.driverName;
        }
        if (sessionData.conductorName && conductorNameInput) {
            conductorNameInput.value = sessionData.conductorName;
            if (displayConductorNameHeader) displayConductorNameHeader.textContent = `CONDUCTOR: ${sessionData.conductorName}`;
            currentTicket.conductorName = sessionData.conductorName;
        }
    }

    /**
     * Calculate fare based on currentTicket (type & count)
     */
    function calculateFare() {
        const passengerCount = parseInt(passengerCountInput.value) || 0;
        currentTicket.passengerCount = passengerCount;

        // Find the correct fare from allRoutes
        let regularFare = 0;
        const routeKey = currentRouteDirection ? 'ST.CRUZ to FVR' : 'FVR to ST.CRUZ';
        const routeData = allRoutes[routeKey];
        
        const fareData = routeData.find(item => 
            item.origin === currentTicket.from && 
            item.destination === currentTicket.to
        );
        
        if (fareData) {
            regularFare = fareData.fare;
        }

        currentTicket.regularFare = regularFare;

        // discount 20% for student & senior
        if (currentTicket.passengerType === "student" || currentTicket.passengerType === "senior") {
            currentTicket.discount = currentTicket.regularFare * 0.20;
        } else {
            currentTicket.discount = 0;
        }

        const singleFinalFare = currentTicket.regularFare - currentTicket.discount;
        currentTicket.finalFare = singleFinalFare * passengerCount;

        // Update UI fields if present
        const regFareEl = document.getElementById('regular-fare');
        const discountEl = document.getElementById('discount');
        const finalFareEl = document.getElementById('final-fare');
        const passengerTypeDisplay = document.getElementById('passenger-type-display');

        if (regFareEl) regFareEl.textContent = currentTicket.regularFare.toFixed(2);
        if (discountEl) discountEl.textContent = currentTicket.discount.toFixed(2);
        if (finalFareEl) finalFareEl.textContent = currentTicket.finalFare.toFixed(2);
        if (passengerTypeDisplay) {
            passengerTypeDisplay.textContent = currentTicket.passengerType === "regular" ? "No Discount" :
                currentTicket.passengerType.charAt(0).toUpperCase() + currentTicket.passengerType.slice(1);
        }
    }

    /**
     * Display ticket summary in ticket page
     */
    function displayTicketSummary() {
        if (!ticketSummaryContainer) return;
        ticketSummaryContainer.innerHTML = '';
        const singleFinalFare = currentTicket.regularFare - currentTicket.discount;
        const summaryItem = document.createElement('div');
        summaryItem.classList.add('info-item');
        summaryItem.innerHTML = `
            <span class="info-label">Ticket Details:</span><br>
            ${currentTicket.passengerCount} x ${currentTicket.passengerType.charAt(0).toUpperCase() + currentTicket.passengerType.slice(1)} - ₱${singleFinalFare.toFixed(2)}<br>
            <span class="info-label">Sub-Total:</span> ₱${currentTicket.finalFare.toFixed(2)}
        `;
        ticketSummaryContainer.appendChild(summaryItem);
    }

    /**
     * Save receipt as text file (for individual tickets)
     */
    function saveReceipt() {
        const now = new Date();
        const options = {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        };
        const formattedDate = now.toLocaleString('en-US', options).replace(',', '');
        const receiptWidth = 40;
        let receiptText = '';
        const singleFinalFare = currentTicket.regularFare - currentTicket.discount;

        for (let i = 0; i < currentTicket.passengerCount; i++) {
            stats.ticketCounter++;

            const ticketToSave = {
                id: stats.ticketCounter,
                busNumber: currentTicket.busNumber,
                driverName: currentTicket.driverName,
                conductorName: currentTicket.conductorName,
                timestamp: formattedDate,
                dateObject: now.toISOString(),
                from: currentTicket.from,
                to: currentTicket.to,
                regularFare: currentTicket.regularFare,
                discount: currentTicket.discount,
                passengerType: currentTicket.passengerType,
                finalFare: singleFinalFare,
                paymentMethod: currentTicket.paymentMethod,
                location: { ...locationData }
            };

            issuedTickets.push(ticketToSave);

            receiptText += `${centerText('SANTRANS CORPORATION', receiptWidth)}\n` +
                `${centerText(`Serial#: MP071455 BUS#: ${ticketToSave.busNumber}`, receiptWidth)}\n` +
                `${centerText('OFFICIAL RECEIPT', receiptWidth)}\n` +
                `Driver: ${ticketToSave.driverName}\n` +
                `Conductor: ${ticketToSave.conductorName}\n` +
                `DATE & TIME: ${ticketToSave.timestamp}\n` +
                `From: ${ticketToSave.from}\n` +
                `To: ${ticketToSave.to}\n` +
                `Regular Fare: ₱${ticketToSave.regularFare.toFixed(2)}\n` +
                `Discount: ₱${ticketToSave.discount.toFixed(2)} (${ticketToSave.passengerType === "regular" ? "No Discount" : ticketToSave.passengerType.charAt(0).toUpperCase() + ticketToSave.passengerType.slice(1)})\n` +
                `AMOUNT: ₱${singleFinalFare.toFixed(2)} ${ticketToSave.paymentMethod}\n\n`;
        }

        if (currentTicket.passengerCount > 1) {
            receiptText += `${currentTicket.passengerCount} x ₱${singleFinalFare.toFixed(2)} TOTAL of: ${currentTicket.finalFare.toFixed(2)}\n\n`;
        }

        receiptText += `${centerText('THIS SERVES AS AN OFFICIAL RECEIPT', receiptWidth)}\n`;

        downloadTextFile(receiptText, `receipt_${stats.ticketCounter}.txt`);
        saveStats();
        saveIssuedTickets();
    }

    /**
     * Display issued tickets on fare data page
     */
    function displayIssuedTickets() {
        if (!fareDataList) return;
        fareDataList.innerHTML = '';

        if (issuedTickets.length === 0) {
            fareDataList.innerHTML = '<p style="text-align:center;">No tickets have been issued yet.</p>';
            return;
        }

        const header = document.createElement('h3');
        header.textContent = 'Issued Tickets';
        fareDataList.appendChild(header);

        issuedTickets.forEach(ticket => {
            const ticketDiv = document.createElement('div');
            ticketDiv.classList.add('info-item');

            let locationLink = 'No Location Data';
            if (ticket.location.latitude && ticket.location.longitude) {
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ticket.location.latitude},${ticket.location.longitude}`;
                locationLink = `<a href="${googleMapsUrl}" target="_blank">View on Google Maps</a>`;
            }

            ticketDiv.innerHTML = `
                <span class="info-label">TICKET #:</span> ${ticket.id}<br>
                <span class="info-label">DATE & TIME:</span> ${ticket.timestamp}<br>
                <span class="info-label">From:</span> ${ticket.from}<br>
                <span class="info-label">To:</span> ${ticket.to}<br>
                <span class="info-label">Passenger Type:</span> ${ticket.passengerType.charAt(0).toUpperCase() + ticket.passengerType.slice(1)}<br>
                <span class="info-label">Regular Fare:</span> ₱${ticket.regularFare.toFixed(2)}<br>
                <span class="info-label">Discount:</span> ₱${ticket.discount.toFixed(2)}<br>
                <span class="info-label">AMOUNT:</span> ₱${ticket.finalFare.toFixed(2)} ${ticket.paymentMethod}<br>
                <span class="info-label">Location:</span> ${locationLink}
            `;
            fareDataList.appendChild(ticketDiv);
        });
    }

    /**
     * Export issued tickets to Excel-friendly .xls file (HTML table).
     */
    function exportToExcel() {
        if (issuedTickets.length === 0) {
            alert('No data to export.');
            return;
        }

        // Build HTML table with extra heading info
        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"></head><body>
            <table border="1" style="border-collapse:collapse;text-align:center;">
                <tr>
                    <th colspan="9" style="background-color:yellow;font-size:16px;font-weight:bold;text-align:center;">
                        SANTRANS CORPORATION – DATA FARE COLLECTED
                    </th>
                </tr>
                <tr>
                    <td colspan="9" style="text-align:left;font-weight:bold;">BUS #: ${currentTicket.busNumber || ''}</td>
                </tr>
                <tr>
                    <td colspan="9" style="text-align:left;font-weight:bold;">SERIAL #: MP071455</td>
                </tr>
                <tr>
                    <td colspan="9" style="text-align:left;font-weight:bold;">DRIVER: ${currentTicket.driverName || ''}</td>
                </tr>
                <tr>
                    <td colspan="9" style="text-align:left;font-weight:bold;">CONDUCTOR: ${currentTicket.conductorName || ''}</td>
                </tr>
                <tr style="background-color:#0066cc;color:white;">
                    <th>Ticket ID</th>
                    <th>Date & Time</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Passenger Type</th>
                    <th>Regular Fare (₱)</th>
                    <th>Discount (₱)</th>
                    <th>Amount Collected (₱)</th>
                    <th>Payment Method</th>
                </tr>`;

        issuedTickets.forEach(t => {
            html += `
                <tr>
                    <td>${t.id}</td>
                    <td>${t.timestamp}</td>
                    <td>${t.from}</td>
                    <td>${t.to}</td>
                    <td>${t.passengerType.charAt(0).toUpperCase() + t.passengerType.slice(1)}</td>
                    <td>₱${parseFloat(t.regularFare).toFixed(2)}</td>
                    <td>₱${parseFloat(t.discount).toFixed(2)}</td>
                    <td>₱${parseFloat(t.finalFare).toFixed(2)}</td>
                    <td>${t.paymentMethod}</td>
                </tr>`;
        });

        // Summary rows (gray background, only span 9 columns)
        html += `
                <tr style="font-weight:bold;background:#f2f2f2;">
                    <td colspan="4">Total Tickets Issued</td><td colspan="5">${issuedTickets.length}</td>
                </tr>
                <tr style="font-weight:bold;background:#f2f2f2;">
                    <td colspan="4">Total Regular Passengers</td><td colspan="5">${stats.regularPassengers}</td>
                </tr>
                <tr style="font-weight:bold;background:#f2f2f2;">
                    <td colspan="4">Total Student Passengers</td><td colspan="5">${stats.studentPassengers}</td>
                </tr>
                <tr style="font-weight:bold;background:#f2f2f2;">
                    <td colspan="4">Total Senior Passengers</td><td colspan="5">${stats.seniorPassengers}</td>
                </tr>
                <tr style="font-weight:bold;background:#f2f2f2;">
                    <td colspan="4">Total Collected Payments (All)</td><td colspan="5">₱${stats.totalPayments.toFixed(2)}</td>
                </tr>
                <tr style="font-weight:bold;background:#f2f2f2;">
                    <td colspan="4">Total Cash Payments</td><td colspan="5">₱${stats.cashPayments.toFixed(2)}</td>
                </tr>
                <tr style="font-weight:bold;background:#f2f2f2;">
                    <td colspan="4">Total GCash Payments</td><td colspan="5">₱${stats.cashlessPayments.toFixed(2)}</td>
                </tr>
            </table>
            </body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'santrans_ticket_report.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Ticket data exported to santrans_ticket_report.xls!');
    }

    /**
     * Save conductor report as plain text file (old-school)
     */
    function saveConductorReportAsTxt() {
        const totalPassengers = stats.regularPassengers + stats.studentPassengers + stats.seniorPassengers;
        const now = new Date();
        const options = {
            month: '2-digit', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        };
        const formattedDate = now.toLocaleString('en-US', options).replace(',', '');

        const txtContent = `========================================
SANTRANS CORPORATION
========================================
Serial #: MP071455
Bus #: ${currentTicket.busNumber}
Date & Time: ${formattedDate}
Driver: ${currentTicket.driverName}
Conductor: ${currentTicket.conductorName}
========================================
CONDUCTOR'S REPORT
----------------------------------------
Regular Passengers: ${stats.regularPassengers}
Student Passengers: ${stats.studentPassengers}
Senior Citizen Passengers: ${stats.seniorPassengers}
Total Ticketed Passengers: ${totalPassengers}
----------------------------------------
Total Collected Payments: ₱${stats.totalPayments.toFixed(2)}
  (GCash): ₱${stats.cashlessPayments.toFixed(2)}
  (Cash): ₱${stats.cashPayments.toFixed(2)}
========================================
`;
        downloadTextFile(txtContent, 'Conductor_Report.txt');
        showNotification('Conductor report saved!');
    }

    /**
     * Utility to download a text file
     */
    function downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Show toast/notification
     * type: 'success' or 'error' (red background for error)
     */
    function showNotification(message, type = 'success') {
        if (!notificationMessage || !receiptNotification) return;
        notificationMessage.textContent = message;
        receiptNotification.style.backgroundColor = (type === 'error') ? '#ff4d4d' : '#4CAF50';
        receiptNotification.classList.remove('hidden');
        setTimeout(() => {
            receiptNotification.classList.add('hidden');
        }, 2500);
    }

    /**
     * Update passenger stats when tickets issued
     */
    function updatePassengerCount() {
        if (currentTicket.passengerType === "regular") {
            stats.regularPassengers += currentTicket.passengerCount;
        } else if (currentTicket.passengerType === "student") {
            stats.studentPassengers += currentTicket.passengerCount;
        } else if (currentTicket.passengerType === "senior") {
            stats.seniorPassengers += currentTicket.passengerCount;
        }
        saveStats();
    }

    /**
     * Complete payment flow (after GCash or cash)
     */
    function completePaymentFlow() {
        if (qrCodeTimer) clearTimeout(qrCodeTimer);

        // Update stats
        stats.totalPayments += currentTicket.finalFare;
        updatePassengerCount();

        // Save receipt(s)
        saveReceipt();
        showNotification('Receipt saved!');

        // Return to selection route and regenerate buttons
        showPage('selectionRoute');
        generateRouteButtons(currentRouteDirection);
    }

    // =========================
    // --- ROUTE BUTTONS ------
    // =========================

    /**
     * Generate route buttons based on direction (isReverse)
     * Buttons: Heading "FROM ORIGIN:" then each destination button "FROM ORIGIN → DEST"
     * Also attach event listeners for selection.
     */
    function generateRouteButtons(isReverse = false) {
        if (!routeButtonsContainer) return;
        routeButtonsContainer.innerHTML = '';
        currentRouteDirection = isReverse;

        // Get the correct route based on direction
        const routeKey = isReverse ? 'ST.CRUZ to FVR' : 'FVR to ST.CRUZ';
        const selectedRoute = allRoutes[routeKey];

        // Group destinations by origin
        const routesByOrigin = {};
        selectedRoute.forEach(route => {
            if (!routesByOrigin[route.origin]) {
                routesByOrigin[route.origin] = [];
            }
            routesByOrigin[route.origin].push(route.destination);
        });

        // Create buttons for each origin-destination pair
        Object.entries(routesByOrigin).forEach(([origin, destinations]) => {
            const heading = document.createElement('h3');
            heading.textContent = `FROM ${origin}:`;
            routeButtonsContainer.appendChild(heading);

            destinations.forEach(destination => {
                const button = document.createElement('button');
                button.classList.add('route-btn');
                button.dataset.from = origin;
                button.dataset.to = destination;
                button.textContent = `FROM ${origin} → ${destination}`;
                routeButtonsContainer.appendChild(button);
            });
        });

        // Add click listeners
        document.querySelectorAll('.route-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                currentTicket.from = this.dataset.from;
                currentTicket.to = this.dataset.to;

            // Update ticket page placeholders
                const ticketFromEl = document.getElementById('ticket-from');
                const ticketToEl = document.getElementById('ticket-to');
                if (ticketFromEl) ticketFromEl.textContent = currentTicket.from;
                if (ticketToEl) ticketToEl.textContent = currentTicket.to;

                // Show passenger page
                showPage('passenger');
            });
        });
    }

    // =========================
    // --- EVENT LISTENERS ----
    // =========================

    // Home page: PROCEED button
    document.getElementById('proceed-home-btn')?.addEventListener('click', () => {
        // Save session data first
        sessionData.busNumber = busNumberInput.value;
        sessionData.driverName = driverNameInput.value;
        sessionData.conductorName = conductorNameInput.value;
        saveSessionData();
        
        // Update header displays
        if (displayBusNumberHeader) displayBusNumberHeader.textContent = `BUS #: ${sessionData.busNumber}`;
        if (displayDriverNameHeader) displayDriverNameHeader.textContent = `DRIVER: ${sessionData.driverName}`;
        if (displayConductorNameHeader) displayConductorNameHeader.textContent = `CONDUCTOR: ${sessionData.conductorName}`;
        
        // Update current ticket
        currentTicket.busNumber = sessionData.busNumber;
        currentTicket.driverName = sessionData.driverName;
        currentTicket.conductorName = sessionData.conductorName;
        
        // Proceed to selection loop
        showPage('selectionLoop');
    });

    // Home page: Conductor Menu button
    document.getElementById('conductor-menu-home-btn')?.addEventListener('click', () => {
        // Save session data first
       
        sessionData.busNumber = busNumberInput.value;
        sessionData.driverName = driverNameInput.value;
        sessionData.conductorName = conductorNameInput.value;
        saveSessionData();
        
        // Update header displays
        if (displayBusNumberHeader) displayBusNumberHeader.textContent = `BUS #: ${sessionData.busNumber}`;
        if (displayDriverNameHeader) displayDriverNameHeader.textContent = `DRIVER: ${sessionData.driverName}`;
        if (displayConductorNameHeader) displayConductorNameHeader.textContent = `CONDUCTOR: ${sessionData.conductorName}`;
        
        // Update current ticket
        currentTicket.busNumber = sessionData.busNumber;
        currentTicket.driverName = sessionData.driverName;
        currentTicket.conductorName = sessionData.conductorName;
        
        // Go to conductor page
        showPage('conductorHome');
    });

    // --- FIX: Dinagdag ang event listener para sa conductor menu button sa selection loop page ---
    // Selection Loop: Conductor Menu button
    document.getElementById('conductor-menu-main-btn')?.addEventListener('click', () => {
        // This button should also lead to the main conductor report page
        showPage('conductorHome');
    });
    // --- END OF FIX ---

    // Selection Loop: FVR to ST.CRUZ
    document.getElementById('fvr-to-stcruz-btn')?.addEventListener('click', () => {
        generateRouteButtons(false);
        showPage('selectionRoute');
    });

    // Selection Loop: ST.CRUZ to FVR
    document.getElementById('stcruz-to-fvr-btn')?.addEventListener('click', () => {
        generateRouteButtons(true);
        showPage('selectionRoute');
    });

    // Selection Loop: Back button
    document.getElementById('back-from-loop')?.addEventListener('click', () => {
        showPage('home');
    });

    // Selection Route: Back button
    document.getElementById('back-from-sub-route')?.addEventListener('click', () => {
        showPage('selectionLoop');
    });

    // Passenger page: Back button
    document.getElementById('back-from-passenger')?.addEventListener('click', () => {
        showPage('selectionRoute');
    });

    // Passenger page: Passenger type buttons
    document.getElementById('regular-btn')?.addEventListener('click', () => {
        currentTicket.passengerType = "regular";
        calculateFare();
        proceedToTicket();
    });

    document.getElementById('student-btn')?.addEventListener('click', () => {
        currentTicket.passengerType = "student";
        calculateFare();
        proceedToTicket();
    });

    document.getElementById('senior-btn')?.addEventListener('click', () => {
        currentTicket.passengerType = "senior";
        calculateFare();
        proceedToTicket();
    });

    // Function to proceed to ticket page with validation
    function proceedToTicket() {
        const passengerCount = parseInt(passengerCountInput.value) || 0;

        if (ticketBusNumberDisplay) {
    ticketBusNumberDisplay.textContent = currentTicket.busNumber;
}
        
        if (passengerCount <= 0 || isNaN(passengerCount)) {
            showNotification('Cannot enter a value of 0. Please enter a valid number of passengers.', 'error');
            return;
        }
        
        currentTicket.passengerCount = passengerCount;
        calculateFare();
        displayTicketSummary();
        showPage('ticket');
    }

    // Passenger count input validation
    passengerCountInput?.addEventListener('input', () => {
        calculateFare();
    });

    // Ticket page: Back button
    document.getElementById('back-from-ticket')?.addEventListener('click', () => {
        showPage('passenger');
    });

    // Ticket page: GCash button
    document.getElementById('gcash-btn')?.addEventListener('click', () => {
        currentTicket.paymentMethod = "GCash";
        if (ticketBusNumberDisplay) ticketBusNumberDisplay.textContent = `BUS #: ${currentTicket.busNumber}`;
        showPage('qrcode');
        // Set timer to auto-complete after 10 seconds
        qrCodeTimer = setTimeout(() => {
            completePaymentFlow();
        }, 10000);
    });

    // Ticket page: Cash button
    document.getElementById('cash-btn')?.addEventListener('click', () => {
        currentTicket.paymentMethod = "Cash";
        if (currentTicket.paymentMethod === "Cash") {
            stats.cashPayments += currentTicket.finalFare;
        } else {
            stats.cashlessPayments += currentTicket.finalFare;
        }
        completePaymentFlow();
    });

    // QR Code page: Proceed button (manual complete)
    proceedQrCodeBtn?.addEventListener('click', () => {
        if (currentTicket.paymentMethod === "GCash") {
            stats.cashlessPayments += currentTicket.finalFare;
        }
        completePaymentFlow();
    });

    // QR Code page: Back button
    document.getElementById('back-from-qrcode')?.addEventListener('click', () => {
        showPage('ticket');
    });

    // Conductor Home: Back button
    document.getElementById('back-from-conductor-home')?.addEventListener('click', () => {
        showPage('home');
    });

    // Conductor Route: Back button
    document.getElementById('back-from-conductor-route')?.addEventListener('click', () => {
        showPage('conductorHome');
    });

    // Conductor Home: Print Report button
    document.getElementById('print-report-home-btn')?.addEventListener('click', () => {
        saveConductorReportAsTxt();
    });

    // Conductor Route: Print Report button
    document.getElementById('print-report-route-btn')?.addEventListener('click', () => {
        saveConductorReportAsTxt();
    });

    // Conductor Home: View Fare Data button
    document.getElementById('view-fare-data-home-btn')?.addEventListener('click', () => {
        displayIssuedTickets();
        showPage('fareData');
    });

    // Conductor Route: View Fare Data button
    document.getElementById('view-fare-data-route-btn')?.addEventListener('click', () => {
        displayIssuedTickets();
        showPage('fareData');
    });

    // Fare Data: Back button
    document.getElementById('back-from-fare-data')?.addEventListener('click', () => {
        showPage('conductorRoute');
    });

    // Fare Data: Export to Excel button
    document.getElementById('export-excel-btn')?.addEventListener('click', () => {
        exportToExcel();
    });

    // Clear Data button
    clearDataBtn?.addEventListener('click', () => {
        clearAllData();
    });

    // Session data inputs (bus #, driver, conductor)
    busNumberInput?.addEventListener('input', () => {
        sessionData.busNumber = busNumberInput.value;
        currentTicket.busNumber = busNumberInput.value;
        if (displayBusNumberHeader) displayBusNumberHeader.textContent = `BUS #: ${busNumberInput.value}`;
        saveSessionData();
    });

    driverNameInput?.addEventListener('input', () => {
        sessionData.driverName = driverNameInput.value;
        currentTicket.driverName = driverNameInput.value;
        if (displayDriverNameHeader) displayDriverNameHeader.textContent = `DRIVER: ${driverNameInput.value}`;
        saveSessionData();
    });

    conductorNameInput?.addEventListener('input', () => {
        sessionData.conductorName = conductorNameInput.value;
        currentTicket.conductorName = conductorNameInput.value;
        if (displayConductorNameHeader) displayConductorNameHeader.textContent = `CONDUCTOR: ${conductorNameInput.value}`;
        saveSessionData();
    });

    // =========================
    // --- INITIALIZATION -----
    // =========================

    // Initialize
    getLocation();
    loadSessionData();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Start on home page
    showPage('home');
});