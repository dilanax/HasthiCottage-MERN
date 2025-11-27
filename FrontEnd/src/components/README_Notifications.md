# Booking Notification System

This notification system provides real-time updates for food and safari bookings in the admin dashboard.

## Components

### 1. BookingNotificationModal
A modal that displays when there are new bookings available, allowing users to choose between food and safari bookings.

**Usage:**
```jsx
import BookingNotificationModal from './components/BookingNotificationModal.jsx';

<BookingNotificationModal 
  isOpen={showModal} 
  onClose={() => setShowModal(false)} 
/>
```

### 2. NotificationBell
A bell icon component that shows pending booking counts and triggers the notification modal.

**Usage:**
```jsx
import NotificationBell from './components/NotificationBell.jsx';

<NotificationBell onNotificationClick={handleNotificationClick} />
```

### 3. AdminNotificationPanel
A comprehensive panel for the admin dashboard that shows booking statistics and quick access buttons.

**Usage:**
```jsx
import AdminNotificationPanel from './components/AdminNotificationPanel.jsx';

<AdminNotificationPanel />
```

### 4. NotificationContext
A React context that provides notification data throughout the app.

**Usage:**
```jsx
import { NotificationProvider } from './contexts/NotificationContext.jsx';

// Wrap your app with the provider
<NotificationProvider>
  <App />
</NotificationProvider>

// Use in components
import { useNotifications } from './contexts/NotificationContext.jsx';

const { foodCount, safariCount, totalCount, refreshNotifications } = useNotifications();
```

## Features

- **Real-time Updates**: Automatically polls for new bookings every 30 seconds
- **Dual Booking Types**: Supports both food and safari bookings
- **Visual Indicators**: Shows pending counts with color-coded badges
- **Quick Navigation**: Direct links to booking management pages
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Shows loading indicators while fetching data

## API Requirements

The system requires these API endpoints:
- `GET /api/food-bookings/admin/pending-count` - Returns food booking count
- `GET /api/safari-bookings/admin/pending-count` - Returns safari booking count

## Styling

The components use Tailwind CSS with the following color scheme:
- **Food Bookings**: Golden yellow (`#d3af37` to `#b89d2e`)
- **Safari Bookings**: Dark gray/black (`#gray-800`)
- **Success States**: Green
- **Warning States**: Yellow
- **Error States**: Red

## Integration Example

```jsx
import React from 'react';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import AdminNotificationPanel from './components/AdminNotificationPanel.jsx';

function AdminDashboard() {
  return (
    <NotificationProvider>
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <AdminNotificationPanel />
        {/* Other dashboard content */}
      </div>
    </NotificationProvider>
  );
}
```
