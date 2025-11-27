import React, { useState, useEffect } from "react";
import { createPackage } from "../../utils/api";
import Swal from "sweetalert2";

export default function CreatePackageForm({ onCreated, onSuccessSwitchToTable }) {
  const [form, setForm] = useState({
    type: "Luxury",
    description: "",
    destination: "",
    date: new Date().toISOString().split('T')[0], // Set today's date as default
    period: "3 hours",
    visitors: "",
    price: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors(validate({ ...form, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] || null;
    setFile(selectedFile);
    
    // Clean up previous preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Create preview URL
    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
//validation form
  const validate = (f) => {
    const e = {};
    if (!file) e.image = "Image is required.";
    if (!f.description || f.description.trim().length < 5) e.description = "Description must be at least 5 characters.";
    if (!f.destination || !/^[A-Za-z ]{2,50}$/.test(f.destination.trim())) e.destination = "Destination must be letters only (2–50 chars).";
    // Date validation removed since it's automatically set to today's date
    if (!f.period) e.period = "Period is required.";
    if (!f.visitors || isNaN(f.visitors) || Number(f.visitors) < 1) e.visitors = "Visitors must be at least 1.";
    if (!f.price || isNaN(f.price) || Number(f.price) < 1) e.price = "Price must be at least $1.00.";
    return e;
  };

  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));

  const submit = async (e) => {
    e.preventDefault();
    const eNow = validate(form);
    setErrors(eNow);
    setTouched({ image: true, description: true, destination: true, period: true, visitors: true, price: true });
    if (Object.keys(eNow).length > 0) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);
      await createPackage(fd);
      
      await Swal.fire({
        title: 'Success!',
        text: 'Safari package has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#d3af37',
        background: '#ffffff',
        color: '#0a0a0a'
      });
      
      setForm({ type: "Luxury", description: "", destination: "", date: new Date().toISOString().split('T')[0], period: "3 hours", visitors: "", price: "" });
      setFile(null);
      setImagePreview(null);
      onCreated?.();
      onSuccessSwitchToTable?.();
    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to create safari package. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#ffffff',
        color: '#0a0a0a'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Object.keys(errors).length === 0;
  const label = "text-sm font-medium text-[#0a0a0a]";
  const input = "w-full rounded-lg border border-[#d3af37] bg-white px-3 py-2 outline-none focus:border-[#d3af37] focus:ring-2 focus:ring-[#d3af37]/20 text-[#0a0a0a]";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg border border-[#d3af37]">
      <div className="mb-4 border-b border-[#d3af37] pb-3">
        <h3 className="text-xl font-semibold text-[#0a0a0a]">Create New Safari Package</h3>
      </div>
      <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={submit}>
        <div className="flex flex-col gap-1">
          <label className={label}>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            onBlur={() => markTouched("image")}
            className="block w-full cursor-pointer rounded-lg border border-[#d3af37] bg-white px-3 py-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#d3af37] file:px-3 file:py-1.5 file:font-semibold file:text-[#0a0a0a] hover:file:bg-[#b89d2e]"
          />
          {file && (
            <div className="mt-2 space-y-2">
              <div className="rounded-lg bg-white border border-[#d3af37] px-3 py-2">
                <span className="text-sm text-[#0a0a0a] font-medium">Chosen file: </span>
                <span className="text-sm text-[#d3af37] font-semibold">{file.name}</span>
              </div>
              {imagePreview && (
                <div className="rounded-lg bg-white border border-[#d3af37] p-3">
                  <p className="text-sm font-medium text-[#0a0a0a] mb-2">Image Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}
          {touched.image && errors.image && <div className="text-xs text-red-600">{errors.image}</div>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Type</label>
          <select name="type" value={form.type} onChange={onChange} className={input}>
            <option>Luxury</option><option>Semi-Luxury</option><option>Budget</option>
          </select>
        </div>


        <div className="flex flex-col gap-1">
          <label className={label}>Description</label>
          <input name="description" value={form.description} onChange={onChange} onBlur={() => markTouched("description")} placeholder="Description" className={input} />
          {touched.description && errors.description && <div className="text-xs text-red-600">{errors.description}</div>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Destination</label>
          <input name="destination" value={form.destination} onChange={onChange} onBlur={() => markTouched("destination")} placeholder="Destination" className={input} />
          {touched.destination && errors.destination && <div className="text-xs text-red-600">{errors.destination}</div>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Date</label>
          <input 
            type="date" 
            name="date" 
            value={form.date} 
            onChange={onChange} 
            onBlur={() => markTouched("date")} 
            className={`${input} bg-gray-100 cursor-not-allowed`}
            disabled
            title="Date is automatically set to today's date"
          />
          <div className="text-xs text-gray-500">Date is automatically set to today's date</div>
          {touched.date && errors.date && <div className="text-xs text-red-600">{errors.date}</div>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Period</label>
          <select name="period" value={form.period} onChange={onChange} onBlur={() => markTouched("period")} className={input}>
            <option value="3 hours">3 hours</option>
            <option value="6 hours">6 hours</option>
          </select>
          {touched.period && errors.period && <div className="text-xs text-red-600">{errors.period}</div>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Visitors</label>
          <input type="number" min="1" name="visitors" value={form.visitors} onChange={onChange} onBlur={() => markTouched("visitors")} placeholder="Number" className={input} />
          {touched.visitors && errors.visitors && <div className="text-xs text-red-600">{errors.visitors}</div>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Price (USD)</label>
          <input type="number" min="1" step="0.01" name="price" value={form.price} onChange={onChange} onBlur={() => markTouched("price")} placeholder="e.g., 1.67" className={input} />
          {touched.price && errors.price && <div className="text-xs text-red-600">{errors.price}</div>}
        </div>

        <div className="col-span-full mt-6 flex items-center justify-center border-t border-[#d3af37] pt-4">
          <button className="rounded-xl bg-[#d3af37] px-8 py-3 font-semibold text-[#0a0a0a] shadow-md hover:bg-[#b89d2e] disabled:cursor-not-allowed disabled:opacity-60 transition-colors" disabled={submitting || !canSubmit}>
            {submitting ? "Saving..." : "Add Package"}
          </button>
        </div>

      </form>
    </div>
  );
}
