import Reservation from '../models/Reservation.js';
import dayjs from 'dayjs';

/**
 * Get comprehensive analytics for reservations
 */
export const getReservationAnalytics = async (req, res) => {
  try {
    const today = dayjs().startOf('day');
    const weekStart = dayjs().startOf('week');
    const monthStart = dayjs().startOf('month');

    // Get all reservations for calculations
    const allReservations = await Reservation.find({}).populate('package');

    // Calculate today's analytics
    const todayReservations = allReservations.filter(r => 
      dayjs(r.createdAt).isSame(today, 'day')
    );
    const todayAnalytics = {
      reservations: todayReservations.length,
      revenue: todayReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      guests: todayReservations.reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0)
    };

    // Calculate weekly analytics
    const weeklyReservations = allReservations.filter(r => 
      dayjs(r.createdAt).isAfter(weekStart) || dayjs(r.createdAt).isSame(weekStart, 'day')
    );
    const weeklyAnalytics = {
      reservations: weeklyReservations.length,
      revenue: weeklyReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      guests: weeklyReservations.reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0)
    };

    // Calculate monthly analytics
    const monthlyReservations = allReservations.filter(r => 
      dayjs(r.createdAt).isAfter(monthStart) || dayjs(r.createdAt).isSame(monthStart, 'day')
    );
    const monthlyAnalytics = {
      reservations: monthlyReservations.length,
      revenue: monthlyReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      guests: monthlyReservations.reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0)
    };

    // Generate chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day');
      const dayReservations = allReservations.filter(r => 
        dayjs(r.createdAt).isSame(date, 'day')
      );
      chartData.push({
        date: date.format('MM/DD'),
        reservations: dayReservations.length,
        revenue: dayReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
      });
    }

    // Generate status distribution
    const statusCounts = {};
    allReservations.forEach(r => {
      const status = r.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    res.json({
      ok: true,
      analytics: {
        today: todayAnalytics,
        weekly: weeklyAnalytics,
        monthly: monthlyAnalytics
      },
      chartData,
      statusData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ ok: false, error: 'Failed to fetch analytics' });
  }
};

/**
 * Get analytics for a specific period (today, weekly, monthly)
 */
export const getPeriodAnalytics = async (req, res) => {
  try {
    const { period } = req.params;
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = dayjs().startOf('day');
        endDate = dayjs().endOf('day');
        break;
      case 'weekly':
        startDate = dayjs().startOf('week');
        endDate = dayjs().endOf('week');
        break;
      case 'monthly':
        startDate = dayjs().startOf('month');
        endDate = dayjs().endOf('month');
        break;
      default:
        return res.status(400).json({ ok: false, error: 'Invalid period. Use: today, weekly, or monthly' });
    }

    // Get reservations for the period
    const reservations = await Reservation.find({
      createdAt: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate()
      }
    }).populate('package');

    // Calculate analytics
    const analytics = {
      reservations: reservations.length,
      revenue: reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      guests: reservations.reduce((sum, r) => sum + (r.adults || 0) + (r.children || 0), 0)
    };

    // Generate detailed data for PDF
    const detailedData = reservations.map(r => ({
      reservationNumber: r.reservationNumber,
      guestName: `${r.guest?.firstName || ''} ${r.guest?.lastName || ''}`,
      email: r.guest?.email,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      adults: r.adults,
      children: r.children,
      roomsWanted: r.roomsWanted,
      totalAmount: r.totalAmount,
      status: r.status,
      createdAt: r.createdAt
    }));

    // Generate chart data for the period
    const chartData = [];
    if (period === 'today') {
      // Hourly data for today
      for (let i = 0; i < 24; i++) {
        const hour = dayjs().hour(i);
        const hourReservations = reservations.filter(r => 
          dayjs(r.createdAt).hour() === i
        );
        chartData.push({
          date: hour.format('HH:00'),
          reservations: hourReservations.length,
          revenue: hourReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
        });
      }
    } else if (period === 'weekly') {
      // Daily data for the week
      for (let i = 0; i < 7; i++) {
        const date = dayjs().startOf('week').add(i, 'day');
        const dayReservations = reservations.filter(r => 
          dayjs(r.createdAt).isSame(date, 'day')
        );
        chartData.push({
          date: date.format('ddd MM/DD'),
          reservations: dayReservations.length,
          revenue: dayReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
        });
      }
    } else if (period === 'monthly') {
      // Weekly data for the month
      const weeksInMonth = Math.ceil(dayjs().daysInMonth() / 7);
      for (let i = 0; i < weeksInMonth; i++) {
        const weekStart = dayjs().startOf('month').add(i * 7, 'day');
        const weekEnd = weekStart.add(6, 'day');
        const weekReservations = reservations.filter(r => {
          const rDate = dayjs(r.createdAt);
          return rDate.isAfter(weekStart) && rDate.isBefore(weekEnd) || 
                 rDate.isSame(weekStart, 'day') || rDate.isSame(weekEnd, 'day');
        });
        chartData.push({
          date: `Week ${i + 1}`,
          reservations: weekReservations.length,
          revenue: weekReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
        });
      }
    }

    // Generate status distribution for the period
    const statusCounts = {};
    reservations.forEach(r => {
      const status = r.status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    res.json({
      ok: true,
      period,
      analytics: {
        [period]: analytics
      },
      chartData,
      statusData,
      detailedData,
      summary: {
        period: period.charAt(0).toUpperCase() + period.slice(1),
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        totalReservations: analytics.reservations,
        totalRevenue: analytics.revenue,
        totalGuests: analytics.guests,
        averagePerReservation: analytics.reservations > 0 ? (analytics.revenue / analytics.reservations).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error(`Error fetching ${period} analytics:`, error);
    res.status(500).json({ ok: false, error: `Failed to fetch ${period} analytics` });
  }
};