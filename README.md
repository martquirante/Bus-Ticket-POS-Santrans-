🚌 SANTRANS CORPORATION — Bus Ticket POS

A Web-Based Ticketing & Fare Collection System

🔗 Live Demo

👉 https://martquirante.github.io/Bus-Ticket-POS-Santrans-/

📌 Overview

The SANTRANS Bus Ticket POS is a modern, fully interactive ticketing system built with HTML, CSS, and JavaScript.
It allows bus conductors to:

✔ Select routes
✔ Enter passenger count
✔ Apply fare discounts
✔ Choose payment method (Cash / GCash)
✔ Display QR code for GCash payments
✔ Print ticket
✔ Generate conductor reports
✔ Export fare data to Excel

All data is stored in the browser using localStorage, making it work even offline.

🗂 Project Structure
/
├── index.html        # Main application interface (All pages rendered using JS)
├── style.css         # Complete UI styling and layout
├── script.js         # Logic for routing, ticketing, payments, reports, exports
├── SantransLogo.png  # Company Logo
├── GCashLogog.png    # Button logo for GCash
├── QRcode.jpg        # GCash QR Code image
└── README.md         # Documentation

🚀 Features
🎟 Ticketing System

Select Bus No., Driver, and Conductor

Route Direction:

FVR → Sta. Cruz

Sta. Cruz → FVR

Dynamic route buttons (auto-generated)

Passenger type:

Regular

Student

Senior Citizen

Automatic fare calculation & discounts

Support for multiple passengers per ticket

💵 Payment Options

GCash

Shows QR for scanning

One-tap ticket printing after payment

Cash

Straightforward ticket confirmation

🖨 Ticket Printing

Clean ticket layout

Shows:

Bus No.

Serial No.

From / To

Passenger Type

Fare breakdown

Total Amount

Payment Method

Date & Time

📊 Conductor Report

Includes both:

HOME REPORT

ROUTE REPORT

Reports show:

Total passengers

Regular / Student / Senior count

Total payments

Cash vs. GCash summary

Export to Excel button

“Clear Data” option

📁 Fare Data Collection

List of every transaction

Scrollable UI

Export to Excel (.xlsx)

🧑‍💻 Technologies Used

HTML5

CSS3

JavaScript (Vanilla)

localStorage (data persistence)

FileSaver.js / XLSX.js (Excel exporting, built inside script.js)

▶️ How to Run Locally

Clone the repository:

git clone https://github.com/martquirante/Bus-Ticket-POS-Santrans-.git


Open the folder:

cd Bus-Ticket-POS-Santrans-


Run the system by opening:

index.html


No server required — it works 100% offline.

🧩 System Flow
1️⃣ Home Page

Enter:

Bus No.

Driver Name

Conductor Name

2️⃣ Select Direction

FVR → ST. CRUZ
ST. CRUZ → FVR

3️⃣ Select Route

Routes dynamically generated depending on direction.

4️⃣ Select Passenger Type

Regular / Student / Senior
Enter number of passengers.

5️⃣ Payment Method

GCash → Shows QR → Print Ticket
Cash → Direct Print Ticket

6️⃣ Generate Reports

Home Report → All collected fares
Route Report → Per direction
Fare Data → List of each transaction
Export Excel → For company documentation

📌 Future Improvements (Optional)

Add receipt .txt download

Add printer-friendly thermal layout

Add admin login

Add cloud database syncing

Add fleet-wide monitoring dashboard

👤 Author

Raymart Quirante
BSIT — Bulacan State University – Sarmiento Campus

📄 License

This project is open-source under the MIT License.
