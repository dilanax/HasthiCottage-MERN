import React, { useEffect, useState } from "react";
import { updatePackage, imageURL } from "../../utils/api";
import Swal from "sweetalert2";

export default function EditPackageModal({ pkg, onClose, onUpdated }) {
  const [form, setForm] = useState({
    type: "Luxury",
    description: "",
    destination: "",
    date: "",
    period: "3 hours",
    visitors: "",
    price: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (pkg) {
      setForm({
        type: pkg.type || "Luxury",
        description: pkg.description || "",
        destination: pkg.destination || "",
        date: new Date().toISOString().split('T')[0], // Set to current date
        period: pkg.period || "",
        visitors: String(pkg.visitors ?? ""),
        price: String(pkg.price ?? ""),
      });
      setPreview(imageURL(pkg.image));
    }
  }, [pkg]);

  const validate = (f) => {
    const e = {};
    if (!f.description || f.description.trim().length < 5) e.description = "Description must be at least 5 characters.";
    if (!f.destination || !/^[A-Za-z ]{2,50}$/.test(f.destination.trim())) e.destination = "Destination must be letters only (2–50 chars).";
    // Date validation removed since it's automatically set to today's date
    if (!f.visitors || isNaN(f.visitors) || Number(f.visitors) < 1) e.visitors = "Visitors must be at least 1.";
    if (!f.price || isNaN(f.price) || Number(f.price) < 1) e.price = "Price must be at least $1.00.";
    // Note: Image validation is optional for edit form since existing image can be kept
    return e;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors(validate({ ...form, [name]: value }));
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));

  const canSubmit = Object.keys(errors).length === 0;

  const handleClose = async () => {
    const hasChanges = Object.keys(form).some(key => {
      if (key === 'date') {
        return false; // Date is always set to current date, so no change detection needed
      }
      return form[key] !== (pkg[key] || "");
    }) || file !== null;

    if (hasChanges) {
      const result = await Swal.fire({
        title: 'Unsaved Changes',
        text: "You have unsaved changes. Are you sure you want to close?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d3af37',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Close',
        cancelButtonText: 'Cancel',
        background: '#ffffff',
        color: '#0a0a0a'
      });

      if (result.isConfirmed) {
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const eNow = validate(form);
    setErrors(eNow);
    setTouched({ description: true, destination: true, visitors: true, price: true });
    if (Object.keys(eNow).length > 0) return;

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);
      await updatePackage(pkg._id, fd);
      
      await Swal.fire({
        title: 'Success!',
        text: 'Safari package has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#d3af37',
        background: '#ffffff',
        color: '#0a0a0a'
      });
      
      onUpdated?.();
      onClose?.();
    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to update safari package. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#ffffff',
        color: '#0a0a0a'
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[820px] max-h-[90vh] rounded-2xl bg-white p-6 shadow-2xl border border-[#d3af37] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[#d3af37] pb-3">
          <h3 className="text-xl font-semibold text-[#0a0a0a]">Edit Package</h3>
          <button
            className="text-xl leading-none rounded-md p-2 hover:bg-[#d3af37] hover:text-white transition-colors"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="grid grid-cols-1 gap-2 md:grid-cols-2" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={onChange}
              className="w-full rounded-lg border border-[#d3af37] bg-white px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
            >
              <option>Luxury</option>
              <option>Semi-Luxury</option>
              <option>Budget</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={onChange}
              onBlur={() => markTouched("description")}
              placeholder="Description"
              className="w-full rounded-lg border border-[#d3af37] bg-white px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
            />
            {touched.description && errors.description && <div className="text-xs text-red-600">{errors.description}</div>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Destination</label>
            <input
              name="destination"
              value={form.destination}
              onChange={onChange}
              onBlur={() => markTouched("destination")}
              placeholder="Destination"
              className="w-full rounded-lg border border-[#d3af37] bg-white px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
            />
            {touched.destination && errors.destination && <div className="text-xs text-red-600">{errors.destination}</div>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              onBlur={() => markTouched("date")}
              className="w-full rounded-lg border border-[#d3af37] bg-gray-100 px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a] cursor-not-allowed"
              disabled
              title="Date is automatically set to today's date"
            />
            <div className="text-xs text-gray-500">Date is automatically set to today's date</div>
            {touched.date && errors.date && <div className="text-xs text-red-600">{errors.date}</div>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Period</label>
            <select
              name="period"
              value={form.period}
              onChange={onChange}
              className="w-full rounded-lg border border-[#d3af37] bg-white px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
            >
              <option value="3 hours">3 hours</option>
              <option value="6 hours">6 hours</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Visitors</label>
            <input
              name="visitors"
              value={form.visitors}
              onChange={onChange}
              onBlur={() => markTouched("visitors")}
              className="w-full rounded-lg border border-[#d3af37] bg-white px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
            />
            {touched.visitors && errors.visitors && <div className="text-xs text-red-600">{errors.visitors}</div>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Price (USD)</label>
            <input
              name="price"
              value={form.price}
              onChange={onChange}
              onBlur={() => markTouched("price")}
              className="w-full rounded-lg border border-[#d3af37] bg-white px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]"
            />
            {touched.price && errors.price && <div className="text-xs text-red-600">{errors.price}</div>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0a0a0a]">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              onBlur={() => markTouched("image")}
              className="block w-full cursor-pointer rounded-lg border border-[#d3af37] bg-white px-3 py-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#d3af37] file:px-3 file:py-1.5 file:font-semibold file:text-[#0a0a0a] hover:file:bg-[#b89d2e]"
            />
            {touched.image && errors.image && <div className="text-xs text-red-600">{errors.image}</div>}
          </div>

          {preview && (
            <div className="md:col-span-2">
              <div className="rounded-lg border border-[#d3af37] p-2 bg-white">
                <p className="text-xs font-medium text-[#0a0a0a] mb-1">Image Preview:</p>
                <img
                  src={preview}
                  alt="preview"
                  className="mx-auto max-h-32 w-full max-w-xs rounded-lg object-cover border border-gray-200"
                />
              </div>
            </div>
          )}

          <div className="col-span-full mt-4 flex items-center justify-center gap-4 border-t border-[#d3af37] pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border-2 border-[#d3af37] bg-white px-5 py-2 font-semibold text-[#0a0a0a] shadow-md hover:bg-[#d3af37] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#d3af37] px-6 py-2 font-semibold text-[#0a0a0a] shadow-md hover:bg-[#b89d2e] active:translate-y-px transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canSubmit}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
