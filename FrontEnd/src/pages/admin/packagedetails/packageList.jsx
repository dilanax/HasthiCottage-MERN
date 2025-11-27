// src/pages/PackagesCrud.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

/** Axios instance (self-contained) */
const RAW_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const clean = (s) => (s || "").replace(/\/+$/, "");

// Packages API (stays the same)
const API_BASE = `${clean(RAW_BASE)}/api/room_package`;
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// NEW: Rooms API (for room ids, single room, etc.)
const roomsApi = axios.create({
  baseURL: `${clean(RAW_BASE)}/api/room-packages`,
  timeout: 15000,
});

/** Helpers */
const currency = (n) =>
  n === undefined || n === null
    ? "-"
    : new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

const emptyForm = {
  roomId: "",
  adultsIncluded: 2,

  perks_freeCancellationAnytime: false,
  perks_noPrepaymentNeeded: false,
  perks_noCreditCardNeeded: false,

  meals_breakfastIncluded: false,
  meals_lunchPriceUSD: 0,
  meals_dinnerPriceUSD: 0,

  geniusDiscountPercent: 0,
  geniusFreeBreakfast: false,

  ribbonsInput: "",

  wasPriceUSD: 0,
  priceUSD: 0,
  taxesAndChargesUSD: 0,

  startDate: "",
  endDate: "",

  isActive: true,
};

export default function PackagesCrud() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [active, setActive] = useState("");
  const [roomIdFilter, setRoomIdFilter] = useState("");
  const params = useMemo(
    () => ({
      page,
      limit,
      ...(active !== "" ? { active } : {}),
      ...(roomIdFilter ? { roomId: roomIdFilter } : {}),
    }),
    [page, limit, active, roomIdFilter]
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const [roomIds, setRoomIds] = useState([]);
  const [roomIdsLoading, setRoomIdsLoading] = useState(false);
  const [roomIdsErr, setRoomIdsErr] = useState("");
  
  const selectRoomId = (roomId) => {
  setForm((f) => ({ ...f, roomId }));
  setRoomIdFilter(roomId || "");
  setPage(1);
};



  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/packages", { params });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setRoomIdsLoading(true);
      setRoomIdsErr("");
      try {
        const { data } = await roomsApi.get("/ids"); // ✅ correct base now
        if (mounted) setRoomIds(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        if (mounted) setRoomIdsErr(e?.response?.data?.message || e.message || "Failed to load room IDs");
      } finally {
        if (mounted) setRoomIdsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);



  function buildPayload(from) {
    const ribbons =
      (from.ribbonsInput || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    return {
      roomId: from.roomId || undefined,
      adultsIncluded: Number(from.adultsIncluded) || 2,
      perks: {
        freeCancellationAnytime: !!from.perks_freeCancellationAnytime,
        noPrepaymentNeeded: !!from.perks_noPrepaymentNeeded,
        noCreditCardNeeded: !!from.perks_noCreditCardNeeded,
      },
      meals: {
        breakfastIncluded: !!from.meals_breakfastIncluded,
        lunchPriceUSD: Number(from.meals_lunchPriceUSD) || 0,
        dinnerPriceUSD: Number(from.meals_dinnerPriceUSD) || 0,
      },
      geniusDiscountPercent: Number(from.geniusDiscountPercent) || 0,
      geniusFreeBreakfast: !!from.geniusFreeBreakfast,
      ribbons,
      wasPriceUSD: Number(from.wasPriceUSD) || 0,
      priceUSD: Number(from.priceUSD) || 0,
      taxesAndChargesUSD: Number(from.taxesAndChargesUSD) || 0,
      startDate: from.startDate ? new Date(from.startDate).toISOString() : undefined,
      endDate: from.endDate ? new Date(from.endDate).toISOString() : undefined,
      isActive: !!from.isActive,
    };
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    
    // Validation
    if (!form.roomId) {
      await Swal.fire({
        title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Validation Error</div>',
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Room ID is required</div>
              <div style="font-size: 14px; color: #6b7280;">Please select a room for this package</div>
            </div>
          </div>
        `,
        icon: 'error',
        iconColor: '#dc2626',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-center',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
        }
      });
      return;
    }

    if (!form.priceUSD || form.priceUSD <= 0) {
      await Swal.fire({
        title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Validation Error</div>',
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Price is required</div>
              <div style="font-size: 14px; color: #6b7280;">Please enter a valid price greater than 0</div>
            </div>
          </div>
        `,
        icon: 'error',
        iconColor: '#dc2626',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-center',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
        }
      });
      return;
    }

    if (form.adultsIncluded < 1) {
      await Swal.fire({
        title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Validation Error</div>',
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Invalid Adults Count</div>
              <div style="font-size: 14px; color: #6b7280;">Please enter at least 1 adult for this package</div>
            </div>
          </div>
        `,
        icon: 'error',
        iconColor: '#dc2626',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-center',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
        }
      });
      return;
    }

    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    if (form.startDate) {
      const startDate = new Date(form.startDate);
      if (startDate < today) {
        await Swal.fire({
          title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Date Error</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Invalid Start Date</div>
                <div style="font-size: 14px; color: #6b7280;">Start date cannot be in the past. Please select today or a future date.</div>
              </div>
            </div>
          `,
          icon: 'error',
          iconColor: '#dc2626',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-center',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
          }
        });
        return;
      }
    }

    if (form.endDate) {
      const endDate = new Date(form.endDate);
      if (endDate < today) {
        await Swal.fire({
          title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Date Error</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Invalid End Date</div>
                <div style="font-size: 14px; color: #6b7280;">End date cannot be in the past. Please select today or a future date.</div>
              </div>
            </div>
          `,
          icon: 'error',
          iconColor: '#dc2626',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-center',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
          }
        });
        return;
      }
    }

    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      await Swal.fire({
        title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Date Error</div>',
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Invalid Date Range</div>
              <div style="font-size: 14px; color: #6b7280;">Start date cannot be after end date</div>
            </div>
          </div>
        `,
        icon: 'error',
        iconColor: '#dc2626',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-center',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
        }
      });
      return;
    }

    try {
      const payload = buildPayload(form);
      if (editingId) {
        await api.put(`/packages/${editingId}`, payload);
        
        await Swal.fire({
          title: '<div style="color: #059669; font-weight: 600; font-size: 24px;">✅ Package Updated</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">Package Updated Successfully</div>
                <div style="font-size: 14px; color: #6b7280;">Room ID: ${form.roomId}</div>
                <div style="font-size: 14px; color: #6b7280;">Price: $${form.priceUSD}</div>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 8px;">
                <div style="color: #1e40af; font-size: 14px;">✓ Package details updated</div>
                <div style="color: #1e40af; font-size: 14px;">✓ Changes applied immediately</div>
              </div>
            </div>
          `,
          icon: 'success',
          iconColor: '#059669',
          confirmButtonColor: '#d3af37',
          confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-check"></i>Continue</span>',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-center',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
          },
          showCloseButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        await api.post("/packages", payload);
        
        await Swal.fire({
          title: '<div style="color: #059669; font-weight: 600; font-size: 24px;">✅ Package Created</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">New Package Created</div>
                <div style="font-size: 14px; color: #6b7280;">Room ID: ${form.roomId}</div>
                <div style="font-size: 14px; color: #6b7280;">Price: $${form.priceUSD}</div>
                <div style="font-size: 14px; color: #6b7280;">Adults: ${form.adultsIncluded}</div>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 8px;">
                <div style="color: #1e40af; font-size: 14px;">✓ Package added to system</div>
                <div style="color: #1e40af; font-size: 14px;">✓ Ready for bookings</div>
              </div>
            </div>
          `,
          icon: 'success',
          iconColor: '#059669',
          confirmButtonColor: '#d3af37',
          confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-check"></i>Continue</span>',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-center',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
          },
          showCloseButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
      
      await load();
      setForm(emptyForm);
      setEditingId(null);
      setFormOpen(false);
    } catch (e) {
      await Swal.fire({
        title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Save Failed</div>',
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Failed to save package</div>
              <div style="font-size: 14px; color: #dc2626; background: #fee2e2; padding: 8px; border-radius: 6px; margin-top: 8px;">${e?.response?.data?.message || e.message || "Save failed"}</div>
            </div>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px;">
              <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">💡 Common Issues</div>
              <div style="color: #78350f; font-size: 14px;">• Check if room ID exists</div>
              <div style="color: #78350f; font-size: 14px;">• Verify all required fields are filled</div>
              <div style="color: #78350f; font-size: 14px;">• Ensure server connection is stable</div>
            </div>
          </div>
        `,
        icon: 'error',
        iconColor: '#dc2626',
        confirmButtonColor: '#dc2626',
        confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-redo"></i>Try Again</span>',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-center',
          confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
        },
        showCloseButton: true
      });
    }
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setForm({
      roomId: item.roomId || "",
      adultsIncluded: item.adultsIncluded ?? 2,

      perks_freeCancellationAnytime: !!item?.perks?.freeCancellationAnytime,
      perks_noPrepaymentNeeded: !!item?.perks?.noPrepaymentNeeded,
      perks_noCreditCardNeeded: !!item?.perks?.noCreditCardNeeded,

      meals_breakfastIncluded: !!item?.meals?.breakfastIncluded,
      meals_lunchPriceUSD: item?.meals?.lunchPriceUSD ?? 0,
      meals_dinnerPriceUSD: item?.meals?.dinnerPriceUSD ?? 0,

      geniusDiscountPercent: item.geniusDiscountPercent ?? 0,
      geniusFreeBreakfast: !!item.geniusFreeBreakfast,

      ribbonsInput: (item.ribbons || []).join(", "),

      wasPriceUSD: item.wasPriceUSD ?? 0,
      priceUSD: item.priceUSD ?? 0,
      taxesAndChargesUSD: item.taxesAndChargesUSD ?? 0,

      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : "",
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : "",

      isActive: !!item.isActive,
    });
    setRoomIdFilter(item.roomId || "");  // 👈 mirror to search
    setPage(1);
    setFormOpen(true);
  }

  async function handleDelete(id) {
    // Find the package to get its details
    const packageToDelete = items.find(pkg => pkg._id === id);
    
    const result = await Swal.fire({
      title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">🗑️ Delete Package</div>',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">Room Package</div>
            <div style="font-size: 14px; color: #6b7280;">Room ID: ${packageToDelete?.roomId || 'N/A'}</div>
            <div style="font-size: 14px; color: #6b7280;">Adults: ${packageToDelete?.adultsIncluded || 2}</div>
            <div style="font-size: 14px; color: #6b7280;">Price: $${packageToDelete?.priceUSD || 0}</div>
            <div style="font-size: 14px; color: #6b7280;">Status: ${packageToDelete?.isActive ? 'Active' : 'Inactive'}</div>
          </div>
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px;">
            <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">⚠️ Warning</div>
            <div style="color: #78350f; font-size: 14px;">This action cannot be undone. All package data will be permanently deleted.</div>
          </div>
        </div>
      `,
      icon: 'warning',
      iconColor: '#dc2626',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-trash"></i>Yes, Delete Package</span>',
      cancelButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-times"></i>Cancel</span>',
      buttonsStyling: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-center',
        confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200',
        cancelButton: 'rounded-xl px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200',
        actions: 'gap-3'
      },
      showCloseButton: true,
      focusCancel: true,
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/packages/${id}`);
        
        await Swal.fire({
          title: '<div style="color: #059669; font-weight: 600; font-size: 24px;">✅ Package Deleted</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">Package Removed Successfully</div>
                <div style="font-size: 14px; color: #6b7280;">Room ID: ${packageToDelete?.roomId || 'N/A'}</div>
                <div style="font-size: 14px; color: #6b7280;">has been permanently deleted from the system</div>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 8px;">
                <div style="color: #1e40af; font-size: 14px;">✓ Package deleted</div>
                <div style="color: #1e40af; font-size: 14px;">✓ All associated data removed</div>
              </div>
            </div>
          `,
          icon: 'success',
          iconColor: '#059669',
          confirmButtonColor: '#d3af37',
          confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-check"></i>Done</span>',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-center',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
          },
          showCloseButton: false,
          timer: 4000,
          timerProgressBar: true
        });
        
        await load();
      } catch (e) {
        await Swal.fire({
          title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Delete Failed</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Failed to delete package</div>
                <div style="font-size: 14px; color: #dc2626; background: #fee2e2; padding: 8px; border-radius: 6px; margin-top: 8px;">${e?.response?.data?.message || e.message || "Delete failed"}</div>
              </div>
              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px;">
                <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">💡 Suggestion</div>
                <div style="color: #78350f; font-size: 14px;">Please check your connection and try again. If the problem persists, contact support.</div>
              </div>
            </div>
          `,
          icon: 'error',
          iconColor: '#dc2626',
          confirmButtonColor: '#dc2626',
          confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-redo"></i>Try Again</span>',
          customClass: {
            popup: 'rounded-2xl shadow-2xl',
            title: 'text-center',
            confirmButton: 'rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
          },
          showCloseButton: true
        });
      }
    }
  }

  /* ---------------- Export PDF ---------------- */
  async function exportPDF() {
    try {
      // Get all packages for export (not just current page)
      const { data } = await api.get("/packages", { 
        params: { 
          page: 1, 
          limit: 1000, // Get all packages
          ...(active !== "" ? { active } : {}),
          ...(roomIdFilter ? { roomId: roomIdFilter } : {}),
        } 
      });
      const allPackages = data.items || [];

      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const autoTable = autoTableMod.default || autoTableMod;

      const doc = new jsPDF();
      
      // Add hotel logo to header with professional styling
      try {
        const logoResponse = await fetch('/logo.png');
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });
        
        // Create a professional logo background
        doc.setFillColor(211, 175, 55); // Golden background
        doc.rect(15, 10, 25, 25, 'F');
        doc.addImage(logoDataUrl, 'PNG', 17, 12, 21, 21);
      } catch (logoError) {
        console.warn('Could not load logo:', logoError);
        // Fallback: Create a simple golden square
        doc.setFillColor(211, 175, 55);
        doc.rect(15, 10, 25, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('HASTHI', 20, 20);
        doc.text('SAFARI', 20, 25);
        doc.text('COTTAGE', 20, 30);
      }

      // Professional Header Styling
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Hasthi Safari Cottage', 50, 20);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Room Packages Report', 50, 28);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 35);
      doc.text(`Total Packages: ${allPackages.length}`, 50, 40);

      // Summary Statistics with professional styling
      const totalPackages = allPackages.length;
      const activePackages = allPackages.filter(pkg => pkg.isActive).length;
      const inactivePackages = totalPackages - activePackages;
      const totalRevenue = allPackages.reduce((sum, pkg) => sum + (pkg.priceUSD || 0), 0);
      const averagePrice = totalPackages > 0 ? totalRevenue / totalPackages : 0;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Summary Statistics', 15, 55);
      
      // Draw underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(15, 57, 60, 57);
      
      const stats = [
        ['Total Packages', totalPackages],
        ['Active Packages', activePackages],
        ['Inactive Packages', inactivePackages],
        ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
        ['Average Price', `$${averagePrice.toFixed(2)}`]
      ];
      
      autoTable(doc, {
        body: stats,
        startY: 62,
        theme: 'plain',
        styles: { 
          fontSize: 10,
          font: 'helvetica',
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 60, halign: 'left' },
          1: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
      });

      // Professional Room Packages Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Room Packages Details', 15, 100);
      
      // Draw underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(15, 102, 60, 102);
      
      const tableData = allPackages.map(pkg => [
        pkg.roomId || 'N/A',
        pkg.adultsIncluded || 2,
        `$${pkg.priceUSD || 0}`,
        pkg.isActive ? 'Active' : 'Inactive',
        pkg.startDate ? new Date(pkg.startDate).toLocaleDateString() : 'N/A',
        pkg.endDate ? new Date(pkg.endDate).toLocaleDateString() : 'N/A'
      ]);

      autoTable(doc, {
        head: [['Room ID', 'Adults', 'Price (USD)', 'Status', 'Start Date', 'End Date']],
        body: tableData,
        startY: 107,
        theme: 'plain',
        styles: { 
          fontSize: 8,
          font: 'helvetica',
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [211, 175, 55],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'left' },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 20, halign: 'right' },
          3: { cellWidth: 15, halign: 'left' },
          4: { cellWidth: 20, halign: 'left' },
          5: { cellWidth: 20, halign: 'left' }
        },
        margin: { left: 15, right: 15 },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1
      });

      // Add footer with company info
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Hasthi Safari Cottage - Professional Safari Experience', 15, pageHeight - 10);
      doc.text(`Report generated on ${new Date().toLocaleString()}`, 15, pageHeight - 5);

      // Save the PDF
      doc.save(`room-packages-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      await Swal.fire({
        title: 'PDF Generated!',
        text: 'Professional room packages report has been downloaded successfully.',
        icon: 'success',
        confirmButtonColor: '#d3af37',
        timer: 3000
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      await Swal.fire({
        title: 'Export Failed',
        text: 'Failed to generate PDF report. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  }

  return (
    <div className="pkg">
      {/* Theme (scoped to this page) */}
      <style>{`
        .pkg {
          --y: #d3af37;  /* gold */
          --b: #0a0a0a;  /* black */
          --w: #f0f0f0;  /* white-ish */
          color: var(--b);
          background: var(--w);
          min-height: 100dvh;
          padding: 24px 16px;
        }
        .pkg .container { max-width: 1120px; margin: 0 auto; }

        /* Head & controls */
        .pkg .head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .pkg h2 { margin:0; letter-spacing:.2px; }
        .btn {
          border:1.5px solid var(--b);
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 700;
          transition: transform .06s ease, box-shadow .12s ease, background .12s ease;
          cursor: pointer;
        }
        .btn:active { transform: translateY(1px); }
        .btn-primary {
          background: var(--y);
          color: var(--b);
          box-shadow: 0 3px 0 rgba(10,10,10,.18);
        }
        .btn-ghost {
          background: transparent;
          color: var(--b);
        }
        .btn-danger {
          border-color: #c0392b;
          color: #c0392b;
          background: #ffecec;
        }

        .grid-controls {
          display:grid; gap:12px; grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
          align-items: end; margin-bottom:16px;
        }
        .fld label { display:block; font-size:12px; opacity:.8; margin:0 0 6px; }
        .fld input, .fld select, .fld button {
          width:100%; padding:10px; border-radius:10px; border:1.5px solid #d1d5db;
          outline:none; background:#fff;
        }
        .fld input:focus, .fld select:focus { border-color: var(--y); box-shadow: 0 0 0 3px rgba(211,175,55,.25); }

        .alert {
          border:1.5px solid #f6c3c3; background:#fff3f3; color:#8a1f1f;
          padding:12px; border-radius:10px; margin-bottom:12px;
        }

        /* Card */
        .card {
          border:1.5px solid #e5e7eb;
          border-radius:14px;
          padding:16px;
          background:#fff;
          display:flex; gap:16px;
          box-shadow: 0 6px 14px rgba(10,10,10,.04);
        }
        .card.inactive { background: #fafafa; opacity:.92; }

        .chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
        .chip { font-size:12px; padding:4px 8px; border-radius:999px; background: rgba(211,175,55,.14); color: var(--b); border:1px solid rgba(211,175,55,.4); }
        .chip-green { background:#ecfdf5; color:#065f46; border:1px solid #bbf7d0; }
        .chip-red { background:#fee2e2; color:#991b1b; border:1px solid #fecaca; }
        .muted { color:#6b7280; }
        .price-zone { min-width:240px; display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
        .strike { text-decoration: line-through; color:#6b7280; }
        .price { font-size:22px; font-weight:800; color:var(--b); }

        /* Skeleton */
        .sk { height:120px; border-radius:12px; background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 37%,#f3f4f6 63%); background-size:400% 100%; animation: shimmer 1.35s ease infinite; }
        @keyframes shimmer { 0%{background-position:100% 0;} 100%{background-position:-100% 0;} }

        /* Form card */
        .form { border:1.5px solid #e5e7eb; border-radius:14px; padding:16px; background:#fff; margin-bottom:16px; }
        .grid-form { display:grid; gap:12px; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); }

        /* Pagination */
        .pager { display:flex; justify-content:space-between; align-items:center; margin-top:16px; }
        .small { font-size:12px; color:#6b7280; }
      `}</style>

      <div className="container">
        {/* Header */}
        <header className="head">
          <h2>All Packages</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={exportPDF}
              className="btn btn-ghost"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setFormOpen((v) => !v);
              }}
              className="btn btn-primary"
            >
              {formOpen ? "Close" : "+ Add Package"}
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="grid-controls">
          <div className="fld">
            <label>Active</label>
            <select
              value={active}
              onChange={(e) => {
                setActive(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
          </div>

          <div className="fld">
            <label>Room ID</label>
            <input
              placeholder="Paste a Room code or _id"
              value={roomIdFilter}
              onChange={(e) => setRoomIdFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>

          <div className="fld">
            <button className="btn btn-ghost" onClick={() => { setPage(1); load(); }}>
              Apply
            </button>
          </div>
        </div>

        {/* Error */}
        {err && <div className="alert">{err}</div>}

        {/* Form */}
        {formOpen && (
          <form onSubmit={handleSubmit} className="form">
            <h3 style={{ marginTop: 0 }}> {editingId ? "Edit Package" : "Add Package"} </h3>

            <div className="grid-form">
              
              <div className="fld">
                <label>Room ID</label>
                <select
                  value={form.roomId}
                  onChange={(e) => {
                    const roomId = e.target.value;
                    // ✅ update the form field
                    setForm((f) => ({ ...f, roomId }));
                    // ✅ also update the list filter for better UX
                    setRoomIdFilter(roomId || "");
                    setPage(1);
                  }}
                  disabled={roomIdsLoading}
                >
                  <option value="">
                    {roomIdsLoading ? "Loading…" : "Select a room"}
                  </option>
                  {roomIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>

                {/* Optional “Filter” hint or error display */}
                {roomIdsErr && <div className="alert">{roomIdsErr}</div>}
              </div>



              <div className="fld">
                <label>Adults Included</label>
                <input
                  type="number"
                  min={1}
                  value={form.adultsIncluded}
                  onChange={(e) => setForm({ ...form, adultsIncluded: e.target.value })}
                  required
                />
              </div>

              <div className="fld">
                <label>Ribbons (comma separated)</label>
                <input
                  value={form.ribbonsInput}
                  onChange={(e) => setForm({ ...form, ribbonsInput: e.target.value })}
                  placeholder="38% off, Mobile-only price"
                />
              </div>

              <div className="fld">
                <label>Was Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={form.wasPriceUSD}
                  onChange={(e) => setForm({ ...form, wasPriceUSD: e.target.value })}
                />
              </div>

              <div className="fld">
                <label>Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={form.priceUSD}
                  onChange={(e) => setForm({ ...form, priceUSD: e.target.value })}
                  required
                />
              </div>

              <div className="fld">
                <label>Taxes & Charges (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={form.taxesAndChargesUSD}
                  onChange={(e) => setForm({ ...form, taxesAndChargesUSD: e.target.value })}
                />
              </div>

              <div className="fld">
                <label>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="fld">
                <label>End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="fld">
                <label>Genius Discount %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.geniusDiscountPercent}
                  onChange={(e) => setForm({ ...form, geniusDiscountPercent: e.target.value })}
                />
              </div>

              <div className="fld">
                <label>Active</label>
                <select
                  value={String(form.isActive)}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Perks */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 6 }}>Perks</label>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <label><input type="checkbox" checked={form.perks_freeCancellationAnytime} onChange={(e) => setForm({ ...form, perks_freeCancellationAnytime: e.target.checked })} /> Free cancellation anytime</label>
                  <label><input type="checkbox" checked={form.perks_noPrepaymentNeeded} onChange={(e) => setForm({ ...form, perks_noPrepaymentNeeded: e.target.checked })} /> No prepayment needed</label>
                  <label><input type="checkbox" checked={form.perks_noCreditCardNeeded} onChange={(e) => setForm({ ...form, perks_noCreditCardNeeded: e.target.checked })} /> No credit card needed</label>
                </div>
              </div>

              {/* Meals */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 6 }}>Meals</label>
                <div className="grid-form" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
                  <label><input type="checkbox" checked={form.meals_breakfastIncluded} onChange={(e) => setForm({ ...form, meals_breakfastIncluded: e.target.checked })} /> Breakfast included</label>
                  <div className="fld">
                    <label>Lunch Price (USD)</label>
                    <input type="number" min={0} value={form.meals_lunchPriceUSD} onChange={(e) => setForm({ ...form, meals_lunchPriceUSD: e.target.value })} />
                  </div>
                  <div className="fld">
                    <label>Dinner Price (USD)</label>
                    <input type="number" min={0} value={form.meals_dinnerPriceUSD} onChange={(e) => setForm({ ...form, meals_dinnerPriceUSD: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Create"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setForm(emptyForm); setEditingId(null); setFormOpen(false); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="sk" />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
            No packages found. Add one to get started.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((it) => (
              <div key={it._id} className={`card ${!it.isActive ? "inactive" : ""}`}>
                <div style={{ flex: 1 }}>
                  <div className="chips">
                    {(it.ribbons || []).map((r, i) => <span key={i} className="chip">{r}</span>)}
                    {it.geniusDiscountPercent > 0 && <span className="chip">Genius {it.geniusDiscountPercent}% off</span>}
                    {it.geniusFreeBreakfast && <span className="chip chip-green">Free breakfast</span>}
                    {!it.isActive && <span className="chip chip-red">Inactive</span>}
                  </div>

                  <h5 className="muted" style={{ margin: "0 0 6px", fontSize: 13 }}>
                    Room ID: {it.roomId || "-"}
                  </h5>

                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                    Package for {it.adultsIncluded ?? 2} adult{(it.adultsIncluded ?? 2) > 1 ? "s" : ""}
                  </h3>

                  {(it.startDate || it.endDate) && (
                    <p className="muted" style={{ margin: "6px 0", fontSize: 13 }}>
                      {it.startDate ? new Date(it.startDate).toLocaleDateString() : "—"} → {it.endDate ? new Date(it.endDate).toLocaleDateString() : "—"}
                    </p>
                  )}

                  <ul style={{ margin: "8px 0", paddingLeft: 18 }}>
                    {it?.perks?.freeCancellationAnytime && <li>Free cancellation anytime</li>}
                    {it?.perks?.noPrepaymentNeeded && <li>No prepayment needed</li>}
                    {it?.perks?.noCreditCardNeeded && <li>No credit card needed</li>}
                    {it?.meals?.breakfastIncluded && <li>Breakfast included</li>}
                    {it?.meals?.lunchPriceUSD > 0 && <li>Lunch: {currency(it.meals.lunchPriceUSD)}</li>}
                    {it?.meals?.dinnerPriceUSD > 0 && <li>Dinner: {currency(it.meals.dinnerPriceUSD)}</li>}
                  </ul>

                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    Added: {it.createdAt ? new Date(it.createdAt).toLocaleString() : "-"}
                  </p>
                </div>

                <div className="price-zone">
                  {it.wasPriceUSD > 0 && <div className="strike">{currency(it.wasPriceUSD)}</div>}
                  <div className="price">{currency(it.priceUSD)}</div>
                  {it.taxesAndChargesUSD > 0 && <div className="small">+ {currency(it.taxesAndChargesUSD)} taxes & charges</div>}

                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <button className="btn btn-ghost" onClick={() => handleEdit(it)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(it._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="pager">
          <div className="small">Page {page} of {pages} • {total} total</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Prev</button>
            <button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
