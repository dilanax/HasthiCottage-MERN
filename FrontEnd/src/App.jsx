import React from "react";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Home from "./pages/Home.jsx";

import ReservationStart from "./pages/reservations/ReservationStart.jsx";
import RoomsSelect from "./pages/reservations/RoomsSelect.jsx";
import GuestDetails from "./pages/reservations/GuestDetails.jsx";
import Summary from "./pages/reservations/Summary.jsx";
import Payment from "./pages/payment/Payment.jsx";
import SuccessPage from './pages/payment/paymentsuccessful.jsx';
import CancelPage from './pages/payment/paymentcancel.jsx';
import GuestLayout from './components/guest/GuestLayout.jsx';
import Dashboard from './pages/guest/Dashboard.jsx';
import Bookings from './pages/guest/Bookings.jsx';
import BookingDetailsPage from './pages/guest/BookingDetailsPage.jsx';
import BookingAnalytics from './pages/guest/BookingAnalytics.jsx';
import ReservationDetails from './pages/guest/ReservationDetails.jsx';
import Profile from './pages/guest/Profile.jsx';
import ErrorBoundary from "./components/ErrorBoundary";
import MyReservations from "./pages/payment/MyReservations.jsx";
import Chatbot from "./components/chatbot/Chatbot.jsx";
import ChatbotManagement from "./pages/admin/ChatbotManagement.jsx";
import UserProfile from "./pages/UserProfile.jsx";


import LoginPage from "./pages/admin/usermanagement/loginpage.jsx";
import UserManagementPage from "./pages/admin/usermanagement/alldetails.jsx";
import AdminDashboard from "./pages/admin/usermanagement/dashboard.jsx";
import RegisterPage from "./pages/admin/usermanagement/register.jsx";

import CreateReview from './pages/review/guest/CreateReview.jsx';
import ManageReview from './pages/review/admin/manageReview.jsx';
import EditReview from './pages/review/guest/EditReview.jsx';
import ReviewSection from './pages/review/guest/ReviewSection.jsx';
import AllReviews from './pages/review/guest/AllReviews';
import CreateReviewCard from './components/review/CreateReviewCard.jsx';

import CreateArtisanal from './pages/artisanal/admin/CreateArtisanal.jsx';
import ManageArtisanal from './pages/artisanal/admin/manageArtisanal.jsx';
import EditArtisanal from './pages/artisanal/admin/EditArtisanal.jsx';
import ArtDisplay from './pages/artisanal/guest/ArtDisplay.jsx';
import AllArtisanal from './pages/artisanal/guest/allArtisanal.jsx';

import VisitorPage from "./pages/safaripackage/VisitorPage.jsx";
import SAdminDashboard from "./pages/safaripackage/SAdminDashboard.jsx";

import AdminMenuPage from "./pages/foodmenu/AdminMenuPage.jsx";
import PublicMenuPage from "./pages/foodmenu/PublicMenuPage.jsx";
import FoodBookingAdmin from "./pages/admin/FoodBookingAdmin.jsx";
import SafariBookingAdmin from "./pages/admin/SafariBookingAdmin.jsx";
import ReservationsAdmin from "./pages/admin/reservation_admin/ReservationsAdmin.jsx";
import FoodBookingAnalytics from "./pages/foodmenu/FoodBookingAnalytics.jsx";
import PackageDetailsForm from "./pages/admin/packagedetails/PackageDetailsForm.jsx";
import PackagesCrud from "./pages/admin/packagedetails/packageList.jsx";

import PromotionsLayout from "./components/layout/PromotionsLayout.jsx";
import PromotionsPage from "./pages/promotion/PromotionsPage.jsx";
import UserPromotionPage from "./pages/promotion/UserPromotionPage.jsx";
import NotificationsPage from "./pages/notification/NotificationsPage.jsx";
import UseNotification from "./pages/notification/UseNotification.jsx";
import ReservationLayout from "./components/reservations/ReservationLayout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Chatbot />
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<UserProfile />} />

      {/* Reservations flow */}
      <Route path="/reserve/*" element={<ReservationLayout />}>
        <Route index element={<ErrorBoundary><ReservationStart /></ErrorBoundary>} />
        <Route path="start" element={<ErrorBoundary><ReservationStart /></ErrorBoundary>} />
        <Route path="rooms/*" element={<ErrorBoundary><RoomsSelect /></ErrorBoundary>} />
        <Route path="guest" element={<ErrorBoundary><GuestDetails /></ErrorBoundary>} />
        <Route path="summary" element={<ErrorBoundary><Summary /></ErrorBoundary>} />
        <Route path="payment" element={<ErrorBoundary><Payment /></ErrorBoundary>} />
      </Route>
      
      {/* Payment status */}
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/cancel" element={<CancelPage />} />
      <Route path="/my-reservations" element={<MyReservations/>} />

      
      {/* Guest area with layout + nested routes */}
      <Route path="/guest/*" element={<GuestLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="analytics" element={<BookingAnalytics />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="reservation/:reservationNumber" element={<ReservationDetails />} />
          <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/alluser/*" element={<UserManagementPage />} />
      <Route path="/admin/package-details/new" element={<PackageDetailsForm />} />
      <Route path="/admin/package-details/:id/edit" element={<PackageDetailsForm />} />
      <Route path="/admin/chatbot" element={<ChatbotManagement />} />
      {/* Admin - Specific routes first */}
      {/* <Route path="/admin/reservations" element={<ReservationsAdmin />} /> */}
      <Route path="/admin/package-details/new" element={<PackageDetailsForm />} />
      <Route path="/admin/package-details/:id/edit" element={<PackageDetailsForm />} />

      <Route path="/admin/foodmenu" element={<AdminMenuPage />} />
      <Route path="/admin/foodmenu/bookings" element={<FoodBookingAdmin />} />
      <Route path="/admin/foodmenu/analytics" element={<FoodBookingAnalytics />} />
      <Route path="/admin/safaripackage" element={<SAdminDashboard />} />
      <Route path="/admin/safari-bookings" element={<SafariBookingAdmin />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/alluser/*" element={<UserManagementPage />} />
      
      <Route path="/packages" element={<PackagesCrud />} />

    {/* Reviews */}
      <Route path="/review/create" element={<CreateReviewCard />} />
      <Route path="/review" element={<ReviewSection />} />
      <Route path="/reviews/all" element={<AllReviews />} />
      <Route path="/review/edit/:reviewId" element={<EditReview />} />
      <Route path="/review/list" element={<ManageReview />} />
    {/* Artisanal */}   
      <Route path="/artisanal/create" element={<CreateArtisanal />} />
      <Route path="/artisanal/edit/:artisanalId" element={<EditArtisanal />} />
      <Route path="/artisanal/manage" element={<ManageArtisanal />} />
      <Route path="/artisanal/all" element={<AllArtisanal />} />
      <Route path="/artisanal" element={<ArtDisplay />} />

      {/* Akila*/}
      <Route path="/safari" element={<VisitorPage />} />
      <Route path="/food" element={<PublicMenuPage />} />

      {/* YoMAL */}
      <Route path="/promotions" element={<PromotionsLayout />}>
       
        <Route index element={<PromotionsPage />} />
        <Route path="user-promotions" element={<UserPromotionPage />} />
      </Route>
      <Route path="/offers" element={<UserPromotionPage />} />
      <Route path="/notification" element={<UseNotification />}></Route>



      
      {/* 404 */}
      <Route path="*" element={<div className="p-8 text-center text-red-500">404 Not Found</div>} />
    </Routes>
  </BrowserRouter>
  );
}

