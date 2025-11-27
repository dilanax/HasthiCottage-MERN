# Reservation Creation Components

This directory contains the components for creating reservations in the admin panel.

## Components

### CreateReservationForm.jsx
The main form component that handles reservation creation with the following features:

- **Guest Information**: First name, last name, email, phone, country
- **Package Selection**: Dropdown to select from available room packages
- **Stay Dates**: Check-in and check-out date selection
- **Room & Guest Details**: Number of rooms, adults, and children
- **Additional Options**: Pet travel and safari experience checkboxes
- **Currency Selection**: USD or LKR payment currency
- **Form Validation**: Comprehensive validation for all required fields
- **Error Handling**: User-friendly error messages and loading states

### CreateReservationModal.jsx
A modal wrapper component that:

- Displays the CreateReservationForm in a modal overlay
- Shows success confirmation after reservation creation
- Handles modal open/close states
- Auto-closes after successful creation

## Integration

The components are integrated into the ReservationsAdmin page:

1. **Create Reservation Button**: Located in the navigation buttons section
2. **Modal Integration**: Opens the CreateReservationModal when clicked
3. **Success Handling**: Refreshes the reservations list after successful creation

## API Endpoints Used

- **GET /api/room_package/packages**: Fetches available room packages
- **POST /api/reservations/reserve**: Creates a new reservation

## Usage

1. Click the "Create Reservation" button in the admin reservations page
2. Fill in the guest information (required fields marked with *)
3. Select a package from the dropdown
4. Choose check-in and check-out dates
5. Specify room and guest details
6. Add any additional options if needed
7. Select payment currency
8. Click "Create Reservation" to submit

## Features

- **Real-time Validation**: Form validates as user types
- **Package Information**: Shows selected package details
- **Admin Reservation Support**: Special "Admin Reservation" option for custom packages
- **Custom Pricing**: Admin can specify custom room ID and pricing
- **Date Validation**: Prevents past dates and invalid date ranges
- **Loading States**: Shows loading indicators during API calls
- **Success Feedback**: Displays confirmation with reservation details
- **Error Handling**: Shows specific error messages for failed operations

## Admin Reservation Feature

The form now includes a special "Admin Reservation" option that allows administrators to:

- Create reservations with custom room IDs
- Set custom pricing per night
- Specify custom adults included count
- Bypass standard package requirements
- Create reservations without affecting room availability counts

When "Admin Reservation" is selected:
- A custom package details section appears
- Admin can specify Room ID, Price per Night, and Adults Included
- The system creates a virtual package for the reservation
- Room availability checks are bypassed
- The reservation is marked as an admin reservation in the database

## Styling

The components use the same color scheme as the main admin interface:
- Accent color: `#d3af37` (gold)
- Text color: `#0a0a0a` (dark)
- Success color: `#10b981` (green)

All components are responsive and work on both desktop and mobile devices.
