# InvoiceApp

InvoiceApp is a responsive invoice management application built with Next.js, React, TypeScript, Material UI, and Recharts. It provides authenticated access to item and invoice management features and integrates with the provided REST APIs.

## Features

- User login and signup
- Authenticated/protected application routes
- Dashboard with company and user information
- Item management
  - Create, edit, and delete items
  - Item name, description, sales rate, and discount
  - Item image upload with preview and validation
  - Thumbnail display in the item list
  - Search, sorting, pagination, and column visibility
  - CSV export
- Invoice management
  - Create, edit, and delete invoices
  - Customer and invoice details
  - Multiple invoice line items
  - Quantity, rate, discount, tax, subtotal, and total calculations
  - Search and sorting
  - Date range filtering
  - Pagination and column visibility
  - Invoice printing
  - Update concurrency handling for stale invoice edits
- Invoice dashboard metrics
  - Invoice count
  - Total amount
  - Last 12 Months line chart
  - Top Items pie chart
- Responsive desktop and mobile layouts
- Logout confirmation dialog

## Tech Stack

- Next.js 16 App Router
- React
- TypeScript
- Material UI (MUI)
- Recharts
- CryptoJS for the existing encrypted local-storage utility
- REST APIs using the browser Fetch API

## Project Structure

```text
src/
├── api/
│   ├── auth.service.ts
│   ├── invoice.service.ts
│   ├── item.service.ts
│   └── routes.ts
├── app/
│   ├── (authenticated)/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   │   └── editor/
│   │   ├── items/
│   │   └── layout.tsx
│   ├── login/
│   ├── signup/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── forms/
│       └── AddItemForm.tsx
├── context/
│   └── AuthContext.tsx
├── theme/
│   └── theme.ts
└── utils/
    └── secureStorage.ts
```

## Authentication

Authentication is handled through `AuthContext`. Login and signup expose the authenticated user, company, and token to the application. Authenticated routes are wrapped by the authenticated layout, which redirects unauthenticated users to `/login`.

The dashboard provides a logout action with confirmation before clearing the stored authentication data and returning to the login page.

## Items

The Items module integrates with the item APIs for listing, creating, updating, deleting, and uploading item pictures. Item thumbnails are loaded for display in the list.

Client-side search, sorting, pagination, column visibility, and CSV export are handled in the Items page.

## Invoices

The Invoice module integrates with the invoice APIs for listing, retrieving, creating, updating, and deleting invoices.

The invoice editor supports multiple line items and calculates the displayed subtotal, tax, and total. Invoice updates include the server-provided update timestamp so stale edits can be detected and handled with a conflict dialog.

The invoice list supports search, date filtering, sorting, pagination, column visibility, editing, deletion, and printing.

## Dashboard Metrics and Charts

Invoice metrics are loaded from the invoice metrics API and respond to the selected invoice date range.

The Last 12 Months chart uses the dedicated 12-month trend API and remains independent of the selected invoice list date filter.

The Top Items pie chart uses the Top Items API and updates when the selected invoice date range changes.

## API Configuration

The application reads the API base URL from the following environment variable:

```text
NEXT_PUBLIC_API_BASE_URL
```

Set this variable to the base URL of the provided backend API before running the application.

## Installation

Install the project dependencies from the project root:

```bash
npm install
```

Create the environment configuration required by the project and set `NEXT_PUBLIC_API_BASE_URL`.

## Development

Start the development server:

```bash
npm run dev
```

Then open the application in the browser. The root route `/` redirects to `/login`.

## Production Build

Create a production build with:

```bash
npm run build
```

## Notes

- API endpoints and request/response formats are defined in the API service layer and route configuration.
- The frontend expects the provided backend APIs to be available and accessible from the configured API base URL.
- No frontend mock invoice or item data is required for the main application flows.
