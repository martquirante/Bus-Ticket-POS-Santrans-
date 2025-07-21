document.addEventListener('DOMContentLoaded', () => {
    // --- Fare Data ---
    const fares = {
        "FVR": {
            "SAMPOL": 15.0,
            "AREA E": 15.0,
            "MOTORPOL": 15.0,
            "PROPER": 15.0,
            "NEW CITY HALL": 15.0,
            "KAYPIAN": 15.0,
            "SAN JOSE": 15.0,
            "ST. CRUZ": 100.0
        },
        "SAPANG PALAY": {
            "NEW CITY HALL": 15.0,
            "KAYPIAN": 15.0,
            "SAN JOSE": 18.0,
            "MUZON": 25.0,
            "LUMA DE GATO": 30.0,
            "FRENZA": 40.0,
            "DIVINE MERCY": 45.0,
            "MARILAO EXIT": 40.0,
            "AYALA MALLS (BALINTAWAK)": 85.0,
            "BALINTAWAK": 85.0,
            "ST. CRUZ": 100.0
        },
        "SAMPOL": { // New route from only
            "ST. CRUZ": 100.0
        },
        "KAYPIAN": { // New route from only
            "BALINTAWAK": 95.0
        },
        "SAN JOSE": { // New route with exclusion logic
            // Fares for "all routes except Sapang Palay, FVR, Sampol, Kaypian"
            // For simplicity, I'll list some common destinations that are NOT the excluded ones
            "MUZON": 20.0,
            "LUMA DE GATO": 25.0,
            "FRENZA": 35.0,
            "DIVINE MERCY": 40.0,
            "MARILAO EXIT": 35.0,
            "AYALA MALLS (BALINTAWAK)": 80.0,
            "BALINTAWAK": 80.0,
            "ST. CRUZ": 95.0,
            "CENTRAL": 70.0,
            "AYALA MALLS": 80.0 // Assuming Ayala Malls (Balintawak) is just Ayala Malls for San Jose
        },
        "MUZON": { // New routes
            "ST. CRUZ": 75.0,
            "AYALA MALLS": 68.0 // Assuming Ayala Malls (Balintawak) is just Ayala Malls for this context
        },
        "CENTRAL": { // New route
            "BALINTAWAK": 75.0
        },
        "MARILAO EXIT": { // New routes
            "BALINTAWAK": 60.0,
            "ST. CRUZ": 65.0
        }
    };

    const routesByOrigin = {
        "FVR": ["SAMPOL", "AREA E", "MOTORPOL", "PROPER", "NEW CITY HALL", "KAYPIAN", "SAN JOSE", "ST. CRUZ"],
        "SAPANG PALAY": ["NEW CITY HALL", "KAYPIAN", "SAN JOSE", "MUZON", "LUMA DE GATO", "FRENZA", "DIVINE MERCY", "MARILAO EXIT", "AYALA MALLS (BALINTAWAK)", "BALINTAWAK", "ST. CRUZ"],
        "SAMPOL": ["ST. CRUZ"],
        "KAYPIAN": ["BALINTAWAK"],
        "SAN JOSE": [], // This will be dynamically populated to exclude specific routes
        "MUZON": ["ST. CRUZ", "AYALA MALLS"], // Using "AYALA MALLS" for MUZON -> Ayala Malls
        "CENTRAL": ["BALINTAWAK"],
        "MARILAO EXIT": ["BALINTAWAK", "ST. CRUZ"]
    };

    // Populate "SAN JOSE" routes excluding specific destinations
    const sanJoseAllowedDestinations = [
        "MUZON", "LUMA DE GATO", "FRENZA", "DIVINE MERCY", "MARILAO EXIT", "AYALA MALLS (BALINTAWAK)", "BALINTAWAK", "ST. CRUZ", "CENTRAL", "AYALA MALLS"
    ];
    routesByOrigin["SAN JOSE"] = sanJoseAllowedDestinations;


    // --- Current Ticket and Session Data ---
    let currentTicket = {
        from: "",
        to: "",
        passengerType: "regular",
        regularFare: 0,
        discount: 0,
        finalFare: 0,
        paymentMethod: "",
        busNumber: "", // Will be loaded from session data
        driverName: "", // New: Will be loaded from session data
        conductorName: "" // New: Will be loaded from session data
    };

    // Initialize session data for Bus No., Driver, Conductor from localStorage or default
    let sessionData = JSON.parse(localStorage.getItem('sessionData')) || {
        busNumber: "",
        driverName: "",
        conductorName: ""
    };

    // Initialize stats from localStorage if available, otherwise use default
    let stats = JSON.parse(localStorage.getItem('conductorStats')) || {
        regularPassengers: 0,
        studentPassengers: 0,
        seniorPassengers: 0,
        totalPayments: 0,
        cashlessPayments: 0,
        cashPayments: 0
    };

    let qrCodeTimer; // To store the timer ID for clearing

    // --- DOM Elements ---
    const pages = {
        home: document.getElementById('home-page'),
        route: document.getElementById('route-page'),
        passenger: document.getElementById('passenger-page'),
        ticket: document.getElementById('ticket-page'),
        qrcode: document.getElementById('qrcode-page'),
        conductor: document.getElementById('conductor-page')
    };

    const busNumberInput = document.getElementById('bus-number-input');
    const driverNameInput = document.getElementById('driver-name-input');
    const conductorNameInput = document.getElementById('conductor-name-input');

    const displayBusNumberHeader = document.getElementById('display-bus-number');
    const displayDriverNameHeader = document.getElementById('display-driver-name');
    const displayConductorNameHeader = document.getElementById('display-conductor-name');

    const ticketBusNumberDisplay = document.getElementById('ticket-bus-number');
    const routeButtonsContainer = document.getElementById('route-buttons-container');
    const receiptNotification = document.getElementById('receipt-notification');
    const notificationMessage = document.getElementById('notification-message');
    const proceedQrCodeBtn = document.getElementById('proceed-qrcode-btn');
    const clearDataBtn = document.getElementById('clear-data-btn'); // Get the clear data button

    // --- Functions ---

    /**
     * Helper function to center text by adding spaces.
     * @param {string} text - The text to center.
     * @param {number} totalWidth - The desired total width for centering.
     * @returns {string} The centered text with padding.
     */
    function centerText(text, totalWidth) {
        const textLength = text.length;
        if (textLength >= totalWidth) {
            return text; // No need to center if text is too long or exact width
        }
        const padding = Math.floor((totalWidth - textLength) / 2);
        return ' '.repeat(padding) + text + ' '.repeat(totalWidth - textLength - padding);
    }

    /**
     * Shows a specified page and hides all other pages.
     * @param {string} pageId - The ID of the page to show (e.g., 'home', 'route').
     */
    function showPage(pageId) {
        Object.values(pages).forEach(p => p.classList.add('hidden'));
        pages[pageId].classList.remove('hidden');
    }

    /**
     * Updates the current date and time display.
     */
    function updateDateTime() {
        const now = new Date();
        const options = {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const formattedDate = now.toLocaleString('en-US', options).replace(',', '');
        document.getElementById('date-time-display').textContent = `DATE & TIME: ${formattedDate}`;
    }

    /**
     * Updates the statistics displayed on the conductor menu page.
     */
    function updateStatsDisplay() {
        document.getElementById('total-passengers').textContent =
            stats.regularPassengers + stats.studentPassengers + stats.seniorPassengers;
        document.getElementById('regular-passengers').textContent = stats.regularPassengers;
        document.getElementById('student-passengers').textContent = stats.studentPassengers;
        document.getElementById('senior-passengers').textContent = stats.seniorPassengers;
        document.getElementById('total-payments').textContent = stats.totalPayments.toFixed(2);
        document.getElementById('cashless-payments').textContent = stats.cashlessPayments.toFixed(2);
        document.getElementById('cash-payments').textContent = stats.cashPayments.toFixed(2);
    }

    /**
     * Saves current stats to Local Storage.
     */
    function saveStats() {
        localStorage.setItem('conductorStats', JSON.stringify(stats));
    }

    /**
     * Resets all conductor statistics to zero and updates Local Storage.
     */
    function clearStats() {
        stats = {
            regularPassengers: 0,
            studentPassengers: 0,
            seniorPassengers: 0,
            totalPayments: 0,
            cashlessPayments: 0,
            cashPayments: 0
        };
        saveStats(); // Save cleared stats
        updateStatsDisplay(); // Update display
        showNotification('Conductor data cleared!');
    }

    /**
     * Saves session data (bus number, driver, conductor) to Local Storage.
     */
    function saveSessionData() {
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
    }

    /**
     * Loads session data (bus number, driver, conductor) from Local Storage and updates displays.
     */
    function loadSessionData() {
        if (sessionData.busNumber) {
            busNumberInput.value = sessionData.busNumber;
            displayBusNumberHeader.textContent = `BUS #: ${sessionData.busNumber}`;
            currentTicket.busNumber = sessionData.busNumber; // Update currentTicket too
        }
        if (sessionData.driverName) {
            driverNameInput.value = sessionData.driverName;
            displayDriverNameHeader.textContent = `DRIVER: ${sessionData.driverName}`;
            currentTicket.driverName = sessionData.driverName;
        }
        if (sessionData.conductorName) {
            conductorNameInput.value = sessionData.conductorName;
            displayConductorNameHeader.textContent = `CONDUCTOR: ${sessionData.conductorName}`;
            currentTicket.conductorName = sessionData.conductorName;
        }
    }


    /**
     * Calculates the fare based on the current ticket's from, to, and passenger type.
     */
    function calculateFare() {
        let regularFare = 0;
        const originFares = fares[currentTicket.from];

        if (originFares) {
            let targetDestination = currentTicket.to;
            if (currentTicket.from === "MUZON" && currentTicket.to === "AYALA MALLS (BALINTAWAK)") {
                targetDestination = "AYALA MALLS";
            } else if (currentTicket.from === "SAN JOSE" && currentTicket.to === "AYALA MALLS (BALINTAWAK)") {
                targetDestination = "AYALA MALLS";
            }
            
            regularFare = originFares[targetDestination] || 0;
        }

        currentTicket.regularFare = regularFare;

        if (currentTicket.passengerType === "student" || currentTicket.passengerType === "senior") {
            currentTicket.discount = currentTicket.regularFare * 0.20;
        } else {
            currentTicket.discount = 0;
        }

        currentTicket.finalFare = currentTicket.regularFare - currentTicket.discount;

        // Update ticket display
        document.getElementById('regular-fare').textContent = currentTicket.regularFare.toFixed(2);
        document.getElementById('discount').textContent = currentTicket.discount.toFixed(2);
        document.getElementById('final-fare').textContent = currentTicket.finalFare.toFixed(2);
        document.getElementById('passenger-type-display').textContent =
            currentTicket.passengerType === "regular" ? "No Discount" :
            currentTicket.passengerType.charAt(0).toUpperCase() + currentTicket.passengerType.slice(1);
    }

    /**
     * Generates and displays route buttons based on the selected origin.
     * This function should be called after an origin is selected.
     */
    function generateRouteButtons() {
        routeButtonsContainer.innerHTML = ''; // Clear existing buttons

        const origins = Object.keys(routesByOrigin);

        origins.forEach(origin => {
            const heading = document.createElement('h3');
            heading.textContent = `${origin.toUpperCase()} ROUTES:`;
            routeButtonsContainer.appendChild(heading);

            const destinations = routesByOrigin[origin];

            destinations.forEach(destination => {
                const button = document.createElement('button');
                button.classList.add('route-btn', 'btn');
                button.dataset.from = origin;
                button.dataset.to = destination;
                button.textContent = `${origin} TO ${destination}`;
                routeButtonsContainer.appendChild(button);
            });
        });

        // Attach event listener to newly created buttons
        document.querySelectorAll('.route-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                currentTicket.from = this.dataset.from;
                currentTicket.to = this.dataset.to;
                document.getElementById('from-display').textContent = currentTicket.from;
                document.getElementById('to-display').textContent = currentTicket.to;
                document.getElementById('ticket-from').textContent = currentTicket.from;
                document.getElementById('ticket-to').textContent = currentTicket.to;
                showPage('passenger');
            });
        });
    }

    /**
     * Saves the receipt details to a text file.
     */
    function saveReceipt() {
        const now = new Date();
        const options = {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const formattedDate = now.toLocaleString('en-US', options).replace(',', '');

        // Define a consistent width for centering
        const receiptWidth = 40; // Adjust this width based on your preference for the receipt layout

        const receiptText = `${centerText('SANTRANS CORPORATION', receiptWidth)}\n` +
                            `${centerText(`Serial#: MP071455 BUS#: ${currentTicket.busNumber}`, receiptWidth)}\n` +
                            `${centerText('OFFICIAL RECEIPT', receiptWidth)}\n` +
                            `Driver: ${currentTicket.driverName}\n` + // Driver name, left-aligned
                            `Conductor: ${currentTicket.conductorName}\n` + // Conductor name, left-aligned
                            `DATE & TIME: ${formattedDate}\n` +
                            `From: ${currentTicket.from}\n` +
                            `To: ${currentTicket.to}\n` +
                            `Regular Fare: ₱${currentTicket.regularFare.toFixed(2)}\n` +
                            `Discount: ₱${currentTicket.discount.toFixed(2)} (${currentTicket.passengerType === "regular" ? "No Discount" : currentTicket.passengerType.charAt(0).toUpperCase() + currentTicket.passengerType.slice(1)})\n` +
                            `AMOUNT: ₱${currentTicket.finalFare.toFixed(2)} ${currentTicket.paymentMethod}\n\n` +
                            `${centerText('THIS SERVES AS AN OFFICIAL RECEIPT', receiptWidth)}`;

        downloadTextFile(receiptText, 'receipt.txt');
    }

    /**
     * Saves the conductor report to a text file.
     */
    function saveConductorReport() {
        const now = new Date();
        const options = {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        const formattedDate = now.toLocaleString('en-US', options).replace(',', '');

        const reportWidth = 50; // Adjust width for conductor report if needed

        const reportText = `${centerText('SANTRANS CORPORATION - CONDUCTOR REPORT', reportWidth)}\n` +
                           `${centerText(`Serial#: MP071455 BUS#: ${currentTicket.busNumber}`, reportWidth)}\n` +
                           `${centerText(`DRIVER: ${currentTicket.driverName}`, reportWidth)}\n` +
                           `${centerText(`CONDUCTOR: ${currentTicket.conductorName}`, reportWidth)}\n\n` +
                           `DATE & TIME: ${formattedDate}\n\n` +
                           `TOTAL TICKETED PASSENGER: ${stats.regularPassengers + stats.studentPassengers + stats.seniorPassengers}\n` +
                           `REGULAR PASSENGER: ${stats.regularPassengers}\n` +
                           `STUDENT PASSENGER: ${stats.studentPassengers}\n` +
                           `SENIOR CITIZEN PASSENGER: ${stats.seniorPassengers}\n` +
                           `TOTAL COLLECTED PAYMENTS: ₱${stats.totalPayments.toFixed(2)}\n` +
                           `CASHLESS METHOD (GCash): ₱${stats.cashlessPayments.toFixed(2)}\n` +
                           `CASH: ₱${stats.cashPayments.toFixed(2)}\n`;

        downloadTextFile(reportText, 'conductor_report.txt');
    }

    /**
     * Generic function to create and download a text file.
     * @param {string} content - The text content to save.
     * @param {string} filename - The name of the file to download.
     */
    function downloadTextFile(content, filename) {
        const blob = new Blob([content], {
            type: 'text/plain'
        });
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
     * Displays a temporary notification message.
     * @param {string} message - The message to display.
     */
    function showNotification(message) {
        notificationMessage.textContent = message;
        receiptNotification.classList.remove('hidden');
        setTimeout(() => {
            receiptNotification.classList.add('hidden');
        }, 3000); // Notification disappears after 3 seconds
    }

    /**
     * Updates passenger count based on the current ticket's passenger type.
     */
    function updatePassengerCount() {
        if (currentTicket.passengerType === "regular") {
            stats.regularPassengers++;
        } else if (currentTicket.passengerType === "student") {
            stats.studentPassengers++;
        } else if (currentTicket.passengerType === "senior") {
            stats.seniorPassengers++;
        }
        saveStats(); // Save stats after updating count
    }

    /**
     * Handles the completion of a payment (either cash or gcash).
     * Processes stats, saves receipt, shows notification, and navigates to route page.
     */
    function completePaymentFlow() {
        // Clear any existing timer to prevent multiple navigations (no longer needed here, but good practice)
        if (qrCodeTimer) {
            clearTimeout(qrCodeTimer);
        }

        stats.totalPayments += currentTicket.finalFare;
        updatePassengerCount();
        saveReceipt();
        showNotification('Receipt Saved!');
        
        // Navigate directly to the route page for the next transaction
        generateRouteButtons(); // Re-generate routes in case they need refreshing (though not strictly necessary for this use case)
        showPage('route');
    }

    // --- Event Listeners ---

    // Home Page - Proceed Button (after entering bus number, driver, conductor)
    document.getElementById('proceed-home-btn').addEventListener('click', () => {
        const busNumber = busNumberInput.value.trim();
        const driverName = driverNameInput.value.trim();
        const conductorName = conductorNameInput.value.trim();

        if (busNumber && driverName && conductorName) {
            sessionData.busNumber = busNumber;
            sessionData.driverName = driverName;
            sessionData.conductorName = conductorName;
            saveSessionData(); // Save session data

            // Update currentTicket with session data
            currentTicket.busNumber = busNumber;
            currentTicket.driverName = driverName;
            currentTicket.conductorName = conductorName;

            // Update header displays
            displayBusNumberHeader.textContent = `BUS #: ${busNumber}`;
            displayDriverNameHeader.textContent = `DRIVER: ${driverName}`;
            displayConductorNameHeader.textContent = `CONDUCTOR: ${conductorName}`;
            
            // Only bus number is needed for ticket details initially, driver/conductor is for receipt
            ticketBusNumberDisplay.textContent = `BUS #: ${busNumber}`; 
            
            generateRouteButtons();
            showPage('route');
        } else {
            alert('Please fill in all fields (Bus Number, Driver\'s Name, Conductor\'s Name) to proceed.');
        }
    });

    // Conductor Menu Button
    document.getElementById('conductor-btn').addEventListener('click', () => {
        updateStatsDisplay();
        showPage('conductor');
    });

    // Clear Data Button in Conductor Menu
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all conductor data? This action cannot be undone.')) {
            clearStats();
        }
    });


    // Back Buttons
    document.getElementById('back-from-route').addEventListener('click', () => {
        showPage('home'); // Still go back to home from route if needed
    });

    document.getElementById('back-from-passenger').addEventListener('click', () => {
        showPage('route');
    });

    document.getElementById('back-from-ticket').addEventListener('click', () => {
        showPage('passenger');
    });

    // NEW: Back button from QR code page to Ticket Details page
    document.getElementById('back-from-qrcode').addEventListener('click', () => {
        showPage('ticket'); 
    });

    document.getElementById('back-from-conductor').addEventListener('click', () => {
        showPage('home');
    });

    // Passenger type buttons
    document.getElementById('regular-btn').addEventListener('click', () => {
        currentTicket.passengerType = "regular";
        calculateFare();
        showPage('ticket');
    });

    document.getElementById('student-btn').addEventListener('click', () => {
        currentTicket.passengerType = "student";
        calculateFare();
        showPage('ticket');
    });

    document.getElementById('senior-btn').addEventListener('click', () => {
        currentTicket.passengerType = "senior";
        calculateFare();
        showPage('ticket');
    });

    // Payment method buttons
    document.getElementById('gcash-btn').addEventListener('click', () => {
        currentTicket.paymentMethod = "GCash";
        stats.cashlessPayments += currentTicket.finalFare; // Add to cashless immediately
        
        // Show QR code page
        showPage('qrcode');

        // REMOVED: Automatic timeout for QR code page
        // qrCodeTimer = setTimeout(() => {
        //     completePaymentFlow();
        // }, 7000); // 7-second delay for scanning QR code
    });

    // Manual proceed button on QR Code page
    proceedQrCodeBtn.addEventListener('click', () => {
        completePaymentFlow();
    });


    document.getElementById('cash-btn').addEventListener('click', () => {
        currentTicket.paymentMethod = "CASH";
        stats.cashPayments += currentTicket.finalFare; // Add to cash immediately
        completePaymentFlow(); // Call the shared payment completion flow
    });

    // Conductor Menu Print Report button
    document.getElementById('print-report-btn').addEventListener('click', () => {
        saveConductorReport();
        showNotification('Conductor Report Saved!');
    });

    // --- Initialization ---
    updateDateTime();
    loadSessionData(); // Load bus number, driver, conductor data on startup
    
    // Always show the home page initially, regardless of session data
    // The user must always explicitly click "PROCEED" from home page
    showPage('home');
    
    updateStatsDisplay();
});