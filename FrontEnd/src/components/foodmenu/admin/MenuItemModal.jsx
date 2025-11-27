import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { convertAndFormatLKRToUSD } from "../../../utils/currencyUtils.js";

const CATS = ["BREAKFAST", "LUNCH", "DINNER", "SNACKS", "BEVERAGE", "DESSERT", "OTHER"];
const NAME_RE = /^[A-Za-z0-9 ]{2,50}$/;       // name: letters/numbers/spaces, 2–50 chars
const DESC_CHARS_RE = /^[A-Za-z0-9 ,]+$/;     // description: letters/numbers/spaces/commas
const TAG_TEXT_RE = /^[A-Za-z0-9 ]+$/;        // each tag text: letters/numbers/spaces only
const MIN_PRICE = 1;
const MAX_TAG_WORDS = 10;                      // max 10 tags/words for tags input
const MAX_DESC_WORDS = 150;                    // description must not exceed 150 words

export default function MenuItemModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "LUNCH",
    price: "",
    spicyLevel: 0,
    tags: "",            // comma-separated; validated below
    status: "Available",
    image: null,
  });
  const [preview, setPreview] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const splitWords = (s) =>
    (s || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const splitTags = (s) =>
    (s || "")
      .split(",")               // split by comma
      .map(t => t.trim())
      .filter(Boolean);         // remove empties

  const validate = (f) => {
    const e = {};

    // Name
    if (!f.name || !NAME_RE.test(f.name.trim())) {
      e.name = "Name: letters, numbers, spaces only (2–50 chars).";
    }

    // Description: required, >=2 words, <= 50 chars, <= 10 words, only letters/numbers/spaces
    const d = (f.description || "").trim();
    if (!d) {
      e.description = "Description is required.";
    } else {
      const wc = splitWords(d).length;
      if (wc < 2) e.description = "Description must have at least 2 words.";
      else if (wc > MAX_DESC_WORDS) e.description = `Description must not exceed ${MAX_DESC_WORDS} words.`;
      else if (d.length > 1000) e.description = "Description must be 1000 characters or fewer.";
      else if (!DESC_CHARS_RE.test(d)) e.description = "Description can only contain letters, numbers, spaces, and commas.";
    }

    // Price
    const p = Number(f.price);
    if (Number.isNaN(p)) e.price = "Price must be a number.";
    else if (p < MIN_PRICE) e.price = `Price must be at least $${MIN_PRICE.toFixed(2)}.`;

    // Tags: allow only letters/numbers/spaces per tag, comma-separated, and max 10 tags/words
    const tagsArr = splitTags(f.tags);
    if (tagsArr.length > MAX_TAG_WORDS) {
      e.tags = `Maximum ${MAX_TAG_WORDS} tags allowed.`;
    } else {
      const bad = tagsArr.find(t => !TAG_TEXT_RE.test(t));
      if (bad) e.tags = "Tags may only contain letters, numbers, and spaces (use commas to separate).";
    }

    return e;
  };

  const setField = (k, v) => {
    setForm((s) => {
      const next = { ...s, [k]: v };
      setErrors(validate(next));
      return next;
    });
  };

  const markTouched = (k) => setTouched((t) => ({ ...t, [k]: true }));

  useEffect(() => {
    if (initial) {
      const next = {
        name: initial.name ?? "",
        description: initial.description ?? "",
        category: initial.category ?? "LUNCH",
        price: initial.price ?? "",
        spicyLevel: initial.spicyLevel ?? 0,
        tags: (initial.tags || []).join(", "),
        status: initial.available?.isAvailable === false ? "Unavailable" : "Available",
        image: null,
      };
      setForm(next);
      setErrors(validate(next));
      setPreview(initial.image || ""); // Azure URL is already complete
      setTouched({});
    } else {
      const blank = {
        name: "",
        description: "",
        category: "LUNCH",
        price: "",
        spicyLevel: 0,
        tags: "",
        status: "Available",
        image: null,
      };
      setForm(blank);
      setErrors(validate(blank));
      setPreview("");
      setTouched({});
    }
  }, [initial, open]);

  if (!open) return null;

  const canSubmit = Object.keys(errors).length === 0;

  const submit = async () => {
    const e = validate(form);
    setErrors(e);
    setTouched({ name: true, price: true, description: true, tags: true });
    if (Object.keys(e).length) return;
    
    // Show confirmation dialog
    const result = await Swal.fire({
      title: initial ? 'Update Menu Item?' : 'Create Menu Item?',
      text: initial ? 'Are you sure you want to update this menu item?' : 'Are you sure you want to create this menu item?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d3af37',
      cancelButtonColor: '#d33',
      confirmButtonText: initial ? 'Yes, Update!' : 'Yes, Create!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;
    
    try {
      await onSubmit(form);
      
      // Show success message
      await Swal.fire({
        title: 'Success!',
        text: initial ? 'Menu item updated successfully!' : 'Menu item created successfully!',
        icon: 'success',
        confirmButtonColor: '#d3af37'
      });
    } catch (error) {
      // Show error message
      await Swal.fire({
        title: 'Error!',
        text: initial ? 'Failed to update menu item. Please try again.' : 'Failed to create menu item. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(90vh-10px)] overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#d3af37] to-[#b89d2e] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {initial ? "Edit Menu Item" : "Create New Menu Item"}
                </h2>
                <p className="text-white text-opacity-90 text-sm">
                  {initial ? "Update the menu item details" : "Add a new item to your menu"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-6">
            {/* Basic Information */}
        <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Item Name <span className="text-red-500">*</span>
                  </label>
            <input
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 ${
                      touched.name && errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              onBlur={() => markTouched("name")}
              placeholder="e.g. Chicken Fried Rice"
              maxLength={50}
            />
                  {touched.name && errors.name && (
                    <div className="flex items-center text-sm text-red-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </div>
                  )}
          </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
            <input
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 ${
                        touched.price && errors.price 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
              type="number"
              step="0.01"
              min={MIN_PRICE}
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              onBlur={() => markTouched("price")}
                      placeholder="0.00"
                    />
                  </div>
                  {touched.price && errors.price && (
                    <div className="flex items-center text-sm text-red-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.price}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 resize-none ${
                    touched.description && errors.description 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  rows={5}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  onBlur={() => markTouched("description")}
                  placeholder="Describe the taste, ingredients, and appeal of this dish..."
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  {touched.description && errors.description ? (
                    <div className="flex items-center text-sm text-red-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.description}
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <span className="text-xs text-gray-500">{form.description.length}/1000</span>
                </div>
              </div>
          </div>

            {/* Category & Attributes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Category & Attributes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Category</label>
              <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Spice Level</label>
              <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                value={form.spicyLevel}
                onChange={(e) => setField("spicyLevel", Number(e.target.value))}
              >
                    <option value={0}>🌶️ None</option>
                    <option value={1}>🌶️ Mild</option>
                    <option value={2}>🌶️🌶️ Medium</option>
                    <option value={3}>🌶️🌶️🌶️ Hot</option>
              </select>
          </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
              <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                    <option>✅ Available</option>
                    <option>❌ Unavailable</option>
              </select>
                </div>
            </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tags <span className="text-gray-500 text-sm font-normal">(comma separated)</span>
                </label>
              <input
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3af37] focus:border-transparent transition-all duration-200 ${
                    touched.tags && errors.tags 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="e.g. vegetarian, vegan, gluten-free, spicy, healthy"
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                onBlur={() => markTouched("tags")}
              />
                {touched.tags && errors.tags && (
                  <div className="flex items-center text-sm text-red-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.tags}
                  </div>
                )}
              </div>
          </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Image Upload
              </h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#d3af37] transition-colors duration-200">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setField("image", file || null);
                if (file) setPreview(URL.createObjectURL(file));
              }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-[#d3af37] hover:text-[#b89d2e]">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </label>
                </div>

                {preview && (
                  <div className="relative">
                    <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-lg shadow-md" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview("");
                        setField("image", null);
                        document.getElementById("image-upload").value = "";
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer with Buttons - Fixed at bottom */}
        <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 border-t border-gray-200 sticky bottom-0">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-[#d3af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Fields marked with <span className="text-red-500">*</span> are required</span>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              className="group relative inline-flex items-center justify-center px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-sm min-w-[100px]"
              onClick={onClose}
            >
              <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            
            <button
              type="button"
              className={`group relative inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-bold text-sm min-w-[140px] transition-all duration-200 ${
                canSubmit
                  ? 'bg-gradient-to-r from-[#d3af37] to-[#b89d2e] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#d3af37]/25 transform hover:-translate-y-0.5 hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none'
              }`}
              onClick={submit}
              disabled={!canSubmit}
            >
              {canSubmit ? (
                <>
                  <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {initial ? "Update Item" : "Create Item"}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
              {initial ? "Update Item" : "Create Item"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
