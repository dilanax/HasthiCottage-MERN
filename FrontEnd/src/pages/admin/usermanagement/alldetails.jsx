// src/pages/admin/UserManagementPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

function authHeaders(json = true) {
  const token = localStorage.getItem("token");
  const h = { Accept: "application/json" };
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

function fmtDate(s) {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d)) return "-";
  return d.toLocaleString();
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/user/all`, { headers: authHeaders(false) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchUsers error:", e);
      setError("Could not load users — check backend URL / console.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      `${u.employeeId || ""} ${u.firstName} ${u.lastName} ${u.email} ${u.phone} ${u.role}`.toLowerCase().includes(s)
    );
  }, [users, q]);

  function openEdit(u) { setEditing({ ...u }); setModalOpen(true); }
  function openCreate() {
    setEditing({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "user",
    });
    setModalOpen(true);
  }

  function openCreateWithDemo() {
    // Demo data for auto-filling the form
    const demoUsers = [
      {
        employeeId: "EMP001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@hastisafari.com",
        phone: "+94 77 123 4567",
        role: "user",
        password: "demo123"
      },
      {
        employeeId: "EMP002", 
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah.wilson@hastisafari.com",
        phone: "+94 76 987 6543",
        role: "admin",
        password: "admin123"
      },
      {
        employeeId: "EMP003",
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@hastisafari.com", 
        phone: "+94 75 555 1234",
        role: "user",
        password: "user123"
      }
    ];

    // Randomly select a demo user
    const randomDemo = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    setEditing({
      employeeId: randomDemo.employeeId,
      firstName: randomDemo.firstName,
      lastName: randomDemo.lastName,
      email: randomDemo.email,
      phone: randomDemo.phone,
      role: randomDemo.role,
      password: randomDemo.password
    });
    setModalOpen(true);
  }

  async function handleSave(form) {
    setSaving(true);
    try {
      if (form._id || form.id) {
        const id = form._id || form.id;
        const res = await fetch(`${BASE}/api/user/${id}`, {
          method: "PUT",
          headers: authHeaders(true),
          body: JSON.stringify(form),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.message || `Update failed (${res.status})`);
      } else {
        const res = await fetch(`${BASE}/api/user/register`, {
          method: "POST",
          headers: authHeaders(true),
          body: JSON.stringify(form),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.message || `Create failed (${res.status})`);
      }
      await fetchUsers();
      setModalOpen(false); setEditing(null);
    } catch (e) {
      alert("Save failed: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    const result = await Swal.fire({
      title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">🗑️ Delete User</div>',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">${u.firstName} ${u.lastName}</div>
            <div style="font-size: 14px; color: #6b7280;">${u.email}</div>
            <div style="font-size: 14px; color: #6b7280;">Employee ID: ${u.employeeId || 'N/A'}</div>
            <div style="font-size: 14px; color: #6b7280;">Role: ${u.role}</div>
          </div>
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px;">
            <div style="font-weight: 600; color: #92400e; margin-bottom: 4px;">⚠️ Warning</div>
            <div style="color: #78350f; font-size: 14px;">This action cannot be undone. All user data will be permanently deleted.</div>
          </div>
        </div>
      `,
      icon: 'warning',
      iconColor: '#dc2626',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-trash"></i>Yes, Delete User</span>',
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
        const res = await fetch(`${BASE}/api/user/${u._id || u.id}`, {
          method: "DELETE",
          headers: authHeaders(true),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j?.message || `Delete failed (${res.status})`);
        
        await Swal.fire({
          title: '<div style="color: #059669; font-weight: 600; font-size: 24px;">✅ User Deleted</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">${u.firstName} ${u.lastName}</div>
                <div style="font-size: 14px; color: #6b7280;">has been successfully removed from the system</div>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 8px;">
                <div style="color: #1e40af; font-size: 14px;">✓ User account deleted</div>
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
        
        await fetchUsers();
      } catch (e) {
        await Swal.fire({
          title: '<div style="color: #dc2626; font-weight: 600; font-size: 24px;">❌ Delete Failed</div>',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">Failed to delete user</div>
                <div style="font-size: 14px; color: #dc2626; background: #fee2e2; padding: 8px; border-radius: 6px; margin-top: 8px;">${e?.message || e}</div>
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
  async function exportPDF(rows = filtered) {
    try {
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
      doc.text('Users Report', 50, 28);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 35);
      doc.text(`Total Users: ${rows.length}`, 50, 40);

      // Summary Statistics with professional styling
      const totalUsers = rows.length;
      const adminUsers = rows.filter(u => u.role?.toLowerCase() === 'admin').length;
      const regularUsers = totalUsers - adminUsers;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Summary Statistics', 15, 55);
      
      // Draw underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(15, 57, 60, 57);
      
      const stats = [
        ['Total Users', totalUsers],
        ['Admin Users', adminUsers],
        ['Regular Users', regularUsers]
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

      // Professional Users Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Users Details', 15, 100);
      
      // Draw underline
      doc.setDrawColor(211, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(15, 102, 60, 102);
      
      const tableData = rows.map(user => [
        user.employeeId || 'N/A',
        `${user.firstName || ""} ${user.lastName || ""}`,
        user.role || 'N/A',
        user.email || 'N/A',
        user.phone || 'N/A'
      ]);

      autoTable(doc, {
        head: [['Employee ID', 'Full name', 'Role', 'Email', 'Phone']],
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
          0: { cellWidth: 20, halign: 'left' },
          1: { cellWidth: 25, halign: 'left' },
          2: { cellWidth: 15, halign: 'left' },
          3: { cellWidth: 30, halign: 'left' },
          4: { cellWidth: 20, halign: 'left' }
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
      doc.save(`users-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      await Swal.fire({
        title: 'PDF Generated!',
        text: 'Professional users report has been downloaded successfully.',
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-gray-500">All registered users from the database.</p>
          {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => fetchUsers()} className="px-3 py-2 rounded-lg border">Refresh</button>
          <button onClick={openCreate} className="px-4 py-2 rounded-lg bg-[#d3af37] text-white">+ Add user</button>
          <button onClick={openCreateWithDemo} className="px-4 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#d3af37' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#b8941f'} onMouseLeave={(e) => e.target.style.backgroundColor = '#d3af37'}>
            Demo Fill
          </button>
          <button onClick={() => exportPDF(filtered)} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50">Export PDF</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by Employee ID, name, email, role..." className="w-full md:w-1/2 border rounded-xl px-3 py-2" />
        <div className="text-sm text-gray-500">{filtered.length} records</div>
      </div>

      <div className="overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 text-left w-32">Employee ID</th>
              <th className="p-3 text-left w-48">Full name</th>
              <th className="p-3 text-left w-24">Role</th>
              <th className="p-3 text-center">Email</th>
              <th className="p-3 text-left w-32">Phone</th>
              <th className="p-3 text-left w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No users found</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id || u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{u.employeeId || "N/A"}</td>
                  <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-center break-words">{u.email}</td>
                  <td className="p-3">{u.phone || "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="px-2 py-1 rounded-lg border">Edit</button>
                      <button onClick={() => handleDelete(u)} className="px-2 py-1 rounded-lg border text-rose-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* edit/create modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setModalOpen(false); setEditing(null); }} />
          <div className="absolute left-1/2 top-1/2 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-5 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              {editing && (editing._id || editing.id) ? "Edit user" : "Create user"}
              {editing?.password && !(editing._id || editing.id) && (
                <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#d3af37', color: 'white' }}>
                  Demo Data
                </span>
              )}
            </h3>
            <UserForm
              initial={editing}
              onCancel={() => { setModalOpen(false); setEditing(null); }}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Enhanced User Form (create/edit) -------------------- */
function UserForm({ initial, onSave, onCancel, saving }) {
  const [employeeId, setEmployeeId] = useState(initial?.employeeId || "");
  const [firstName, setFirstName] = useState(initial?.firstName || "");
  const [lastName, setLastName] = useState(initial?.lastName || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [role, setRole] = useState(initial?.role || "user");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+94', flag: '🇱🇰', name: 'Sri Lanka' });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [errors, setErrors] = useState({});

  // Country data
  const countries = [
    { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
    { code: '+81', flag: '🇯🇵', name: 'Japan' },
    { code: '+82', flag: '🇰🇷', name: 'South Korea' },
    { code: '+65', flag: '🇸🇬', name: 'Singapore' },
    { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
    { code: '+66', flag: '🇹🇭', name: 'Thailand' },
    { code: '+63', flag: '🇵🇭', name: 'Philippines' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+974', flag: '🇶🇦', name: 'Qatar' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+46', flag: '🇸🇪', name: 'Sweden' },
    { code: '+47', flag: '🇳🇴', name: 'Norway' },
    { code: '+45', flag: '🇩🇰', name: 'Denmark' },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
    { code: '+43', flag: '🇦🇹', name: 'Austria' },
    { code: '+32', flag: '🇧🇪', name: 'Belgium' },
    { code: '+351', flag: '🇵🇹', name: 'Portugal' },
    { code: '+30', flag: '🇬🇷', name: 'Greece' },
    { code: '+90', flag: '🇹🇷', name: 'Turkey' },
    { code: '+7', flag: '🇷🇺', name: 'Russia' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+52', flag: '🇲🇽', name: 'Mexico' },
    { code: '+1', flag: '🇨🇦', name: 'Canada' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+20', flag: '🇪🇬', name: 'Egypt' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya' },
    { code: '+233', flag: '🇬🇭', name: 'Ghana' },
    { code: '+212', flag: '🇲🇦', name: 'Morocco' },
    { code: '+213', flag: '🇩🇿', name: 'Algeria' },
    { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
    { code: '+218', flag: '🇱🇾', name: 'Libya' },
    { code: '+220', flag: '🇬🇲', name: 'Gambia' },
    { code: '+221', flag: '🇸🇳', name: 'Senegal' },
    { code: '+222', flag: '🇲🇷', name: 'Mauritania' },
    { code: '+223', flag: '🇲🇱', name: 'Mali' },
    { code: '+224', flag: '🇬🇳', name: 'Guinea' },
    { code: '+225', flag: '🇨🇮', name: 'Ivory Coast' },
    { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
    { code: '+227', flag: '🇳🇪', name: 'Niger' },
    { code: '+228', flag: '🇹🇬', name: 'Togo' },
    { code: '+229', flag: '🇧🇯', name: 'Benin' },
    { code: '+230', flag: '🇲🇺', name: 'Mauritius' },
    { code: '+231', flag: '🇱🇷', name: 'Liberia' },
    { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
    { code: '+235', flag: '🇹🇩', name: 'Chad' },
    { code: '+236', flag: '🇨🇫', name: 'Central African Republic' },
    { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
    { code: '+238', flag: '🇨🇻', name: 'Cape Verde' },
    { code: '+239', flag: '🇸🇹', name: 'Sao Tome and Principe' },
    { code: '+240', flag: '🇬🇶', name: 'Equatorial Guinea' },
    { code: '+241', flag: '🇬🇦', name: 'Gabon' },
    { code: '+242', flag: '🇨🇬', name: 'Republic of the Congo' },
    { code: '+243', flag: '🇨🇩', name: 'Democratic Republic of the Congo' },
    { code: '+244', flag: '🇦🇴', name: 'Angola' },
    { code: '+245', flag: '🇬🇼', name: 'Guinea-Bissau' },
    { code: '+246', flag: '🇮🇴', name: 'British Indian Ocean Territory' },
    { code: '+247', flag: '🇦🇨', name: 'Ascension Island' },
    { code: '+248', flag: '🇸🇨', name: 'Seychelles' },
    { code: '+249', flag: '🇸🇩', name: 'Sudan' },
    { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
    { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
    { code: '+252', flag: '🇸🇴', name: 'Somalia' },
    { code: '+253', flag: '🇩🇯', name: 'Djibouti' },
    { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
    { code: '+256', flag: '🇺🇬', name: 'Uganda' },
    { code: '+257', flag: '🇧🇮', name: 'Burundi' },
    { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
    { code: '+260', flag: '🇿🇲', name: 'Zambia' },
    { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
    { code: '+262', flag: '🇷🇪', name: 'Reunion' },
    { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
    { code: '+264', flag: '🇳🇦', name: 'Namibia' },
    { code: '+265', flag: '🇲🇼', name: 'Malawi' },
    { code: '+266', flag: '🇱🇸', name: 'Lesotho' },
    { code: '+267', flag: '🇧🇼', name: 'Botswana' },
    { code: '+268', flag: '🇸🇿', name: 'Eswatini' },
    { code: '+269', flag: '🇰🇲', name: 'Comoros' },
    { code: '+290', flag: '🇸🇭', name: 'Saint Helena' },
    { code: '+291', flag: '🇪🇷', name: 'Eritrea' },
    { code: '+297', flag: '🇦🇼', name: 'Aruba' },
    { code: '+298', flag: '🇫🇴', name: 'Faroe Islands' },
    { code: '+299', flag: '🇬🇱', name: 'Greenland' },
    { code: '+350', flag: '🇬🇮', name: 'Gibraltar' },
    { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
    { code: '+353', flag: '🇮🇪', name: 'Ireland' },
    { code: '+354', flag: '🇮🇸', name: 'Iceland' },
    { code: '+355', flag: '🇦🇱', name: 'Albania' },
    { code: '+356', flag: '🇲🇹', name: 'Malta' },
    { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
    { code: '+358', flag: '🇫🇮', name: 'Finland' },
    { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
    { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
    { code: '+371', flag: '🇱🇻', name: 'Latvia' },
    { code: '+372', flag: '🇪🇪', name: 'Estonia' },
    { code: '+373', flag: '🇲🇩', name: 'Moldova' },
    { code: '+374', flag: '🇦🇲', name: 'Armenia' },
    { code: '+375', flag: '🇧🇾', name: 'Belarus' },
    { code: '+376', flag: '🇦🇩', name: 'Andorra' },
    { code: '+377', flag: '🇲🇨', name: 'Monaco' },
    { code: '+378', flag: '🇸🇲', name: 'San Marino' },
    { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
    { code: '+381', flag: '🇷🇸', name: 'Serbia' },
    { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
    { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
    { code: '+385', flag: '🇭🇷', name: 'Croatia' },
    { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
    { code: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
    { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
    { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
    { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
    { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
    { code: '+500', flag: '🇫🇰', name: 'Falkland Islands' },
    { code: '+501', flag: '🇧🇿', name: 'Belize' },
    { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
    { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
    { code: '+504', flag: '🇭🇳', name: 'Honduras' },
    { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
    { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
    { code: '+507', flag: '🇵🇦', name: 'Panama' },
    { code: '+508', flag: '🇵🇲', name: 'Saint Pierre and Miquelon' },
    { code: '+509', flag: '🇭🇹', name: 'Haiti' },
    { code: '+590', flag: '🇬🇵', name: 'Guadeloupe' },
    { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
    { code: '+592', flag: '🇬🇾', name: 'Guyana' },
    { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
    { code: '+594', flag: '🇬🇫', name: 'French Guiana' },
    { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
    { code: '+596', flag: '🇲🇶', name: 'Martinique' },
    { code: '+597', flag: '🇸🇷', name: 'Suriname' },
    { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
    { code: '+599', flag: '🇧🇶', name: 'Caribbean Netherlands' },
    { code: '+670', flag: '🇹🇱', name: 'East Timor' },
    { code: '+672', flag: '🇦🇶', name: 'Antarctica' },
    { code: '+673', flag: '🇧🇳', name: 'Brunei' },
    { code: '+674', flag: '🇳🇷', name: 'Nauru' },
    { code: '+675', flag: '🇵🇬', name: 'Papua New Guinea' },
    { code: '+676', flag: '🇹🇴', name: 'Tonga' },
    { code: '+677', flag: '🇸🇧', name: 'Solomon Islands' },
    { code: '+678', flag: '🇻🇺', name: 'Vanuatu' },
    { code: '+679', flag: '🇫🇯', name: 'Fiji' },
    { code: '+680', flag: '🇵🇼', name: 'Palau' },
    { code: '+681', flag: '🇼🇫', name: 'Wallis and Futuna' },
    { code: '+682', flag: '🇨🇰', name: 'Cook Islands' },
    { code: '+683', flag: '🇳🇺', name: 'Niue' },
    { code: '+684', flag: '🇦🇸', name: 'American Samoa' },
    { code: '+685', flag: '🇼🇸', name: 'Samoa' },
    { code: '+686', flag: '🇰🇮', name: 'Kiribati' },
    { code: '+687', flag: '🇳🇨', name: 'New Caledonia' },
    { code: '+688', flag: '🇹🇻', name: 'Tuvalu' },
    { code: '+689', flag: '🇵🇫', name: 'French Polynesia' },
    { code: '+690', flag: '🇹🇰', name: 'Tokelau' },
    { code: '+691', flag: '🇫🇲', name: 'Micronesia' },
    { code: '+692', flag: '🇲🇭', name: 'Marshall Islands' },
    { code: '+850', flag: '🇰🇵', name: 'North Korea' },
    { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
    { code: '+853', flag: '🇲🇴', name: 'Macau' },
    { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
    { code: '+856', flag: '🇱🇦', name: 'Laos' },
    { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
    { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
    { code: '+960', flag: '🇲🇻', name: 'Maldives' },
    { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
    { code: '+962', flag: '🇯🇴', name: 'Jordan' },
    { code: '+963', flag: '🇸🇾', name: 'Syria' },
    { code: '+964', flag: '🇮🇶', name: 'Iraq' },
    { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+967', flag: '🇾🇪', name: 'Yemen' },
    { code: '+968', flag: '🇴🇲', name: 'Oman' },
    { code: '+970', flag: '🇵🇸', name: 'Palestine' },
    { code: '+972', flag: '🇮🇱', name: 'Israel' },
    { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
    { code: '+974', flag: '🇶🇦', name: 'Qatar' },
    { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
    { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
    { code: '+977', flag: '🇳🇵', name: 'Nepal' },
    { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
    { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
    { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
    { code: '+995', flag: '🇬🇪', name: 'Georgia' },
    { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
    { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' }
  ];

  const [filteredCountries, setFilteredCountries] = useState(countries);

  useEffect(() => {
    setEmployeeId(initial?.employeeId || "");
    setFirstName(initial?.firstName || "");
    setLastName(initial?.lastName || "");
    setEmail(initial?.email || "");
    setPhone(initial?.phone || "");
    setRole(initial?.role || "user");
    setPassword(initial?.password || "");
    setPasswordConfirm("");
    setErrors({});
  }, [initial]);

  function validateForm() {
    const newErrors = {};
    
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";
    
    if (password && password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (password && passwordConfirm && password !== passwordConfirm) newErrors.passwordConfirm = "Passwords do not match";
    
    if (phone) {
      const fullPhone = `${selectedCountry.code} ${phone}`;
      if (!/^\+?[0-9()\s-]{7,}$/.test(fullPhone)) newErrors.phone = "Enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const payload = { 
      employeeId, 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      email: email.trim().toLowerCase(), 
      phone: phone ? `${selectedCountry.code} ${phone.trim()}` : undefined, 
      role 
    };
    
    if (password) payload.password = password;
    if (initial?._id || initial?.id) payload._id = initial._id || initial.id;
    
    onSave(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Employee ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
        <input 
          value={employeeId} 
          onChange={(e) => setEmployeeId(e.target.value)} 
          placeholder="EMP001" 
          className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            required 
            placeholder="John" 
            className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            required 
            placeholder="Doe" 
            className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="john@example.com" 
          type="email" 
          className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Phone with Country Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
        <div className="flex gap-2">
          {/* Country Code Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.code}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Country Dropdown */}
            {showCountryPicker && (
              <div className="absolute top-full left-0 z-50 w-64 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const search = e.target.value.toLowerCase();
                      setFilteredCountries(countries.filter(country => 
                        country.name.toLowerCase().includes(search) || 
                        country.code.includes(search)
                      ));
                    }}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                        setFilteredCountries(countries);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium">{country.code}</span>
                      <span className="text-sm text-gray-600">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Phone Number Input */}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`flex-1 rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-400' : 'border-gray-200'
            }`}
            placeholder="77 123 4567"
            inputMode="tel"
          />
        </div>
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        {!errors.phone && phone && (
          <p className="text-xs text-gray-400 mt-1">Full number: {selectedCountry.code} {phone}</p>
        )}
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User Role *</label>
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password {!initial?._id && !initial?.id ? '*' : ''}
        </label>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPw ? "text" : "password"}
            className={`w-full border rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-400' : 'border-gray-200'
            }`}
            placeholder={initial?._id || initial?.id ? "Leave blank to keep current password" : "Enter password"}
            required={!initial?._id && !initial?.id}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password (only for new users) */}
      {(!initial?._id && !initial?.id) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
          <input
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            type={showPw ? "text" : "password"}
            className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.passwordConfirm ? 'border-red-400' : 'border-gray-200'
            }`}
            placeholder="Confirm password"
            required
          />
          {errors.passwordConfirm && <p className="text-xs text-red-600 mt-1">{errors.passwordConfirm}</p>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={saving} 
          className="px-4 py-2 rounded-xl text-white font-medium"
          style={{ backgroundColor: '#d3af37' }}
        >
          {saving ? "Saving..." : "Save User"}
        </button>
      </div>
    </form>
  );
}