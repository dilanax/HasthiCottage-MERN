// src/pages/admin/AddEditRoom.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';
import { getRoomById, createRoom, updateRoom } from '../../../api/rooms';
import RoomTypeDropdownWithCRUD from '../../../components/common/RoomTypeDropdownWithCRUD';
import BedLabelDropdownWithCRUD from '../../../components/common/BedLabelDropdownWithCRUD';
import ImagePreview from '../../../components/rooms/admin/ImagePreview';

// IMPORTANT:
// - getRoomById(roomId) => GET /api/room-packages/:roomId
// - updateRoom(roomId, formData) => PUT /api/room-packages/:roomId
// Backend should resolve by room_id, e.g. findOne({ room_id: req.params.roomId })

const initialFeatures = {
  freeWifi: true,
  airConditioning: false,
  patio: false,
  bidet: false,
  balcony: false,
  dishwasher: false,
};
const initialPerks = {
  gardenView: false,
  landmarkView: false,
  innerCourtyardView: false,
  privateBathroom: true,
  privatePool: false,
};

const LabelWithEdit = ({ label, enabled, onEnable }) => (
  <div className="flex items-center justify-between mb-1">
    <label className="font-medium">{label}</label>
    {!enabled && (
      <button
        type="button"
        onClick={onEnable}
        className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-100"
        title="Enable editing"
      >
        <Pencil size={14} />
        Edit
      </button>
    )}
  </div>
);

const AddEditRoom = ({ id: propId = null, onClose }) => {
  const params = useParams();
  const navigate = useNavigate();

  // Treat 'id' as the business room_id always
  const roomId = useMemo(() => propId ?? params.id ?? null, [propId, params.id]);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    roomType: '',
    bedLabel: '',
    sizeSqm: '',
    capacityAdults: 2,
    capacityChildren: 0,
    features: initialFeatures,
    perks: initialPerks,
    active: true,
    availableCount: 1,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  // Per-field/section enable switches
  const [enabled, setEnabled] = useState({
    roomType: true,           // enabled when creating
    bedLabel: true,
    sizeSqm: true,
    capacityAdults: true,
    capacityChildren: true,
    features: true,
    perks: true,
    active: true,
    availableCount: true,
    images: true,
  });

  // On edit, default all fields to disabled until pencil is clicked
  useEffect(() => {
    if (roomId) {
      setEnabled({
        roomType: false,
        bedLabel: false,
        sizeSqm: false,
        capacityAdults: false,
        capacityChildren: false,
        features: false,
        perks: false,
        active: false,
        availableCount: false,
        images: false,
      });
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) loadRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const res = await getRoomById(roomId); // expects room_id-based route
      const room = res.data?.data;

      setForm({
        roomType: room?.roomType || '',
        bedLabel: room?.bedLabel || '',
        sizeSqm: room?.sizeSqm ?? '',
        capacityAdults: room?.capacityAdults ?? 2,
        capacityChildren: room?.capacityChildren ?? 0,
        features: { ...initialFeatures, ...(room?.features || {}) },
        perks: { ...initialPerks, ...(room?.perks || {}) },
        active: room?.active ?? true,
        availableCount: room?.availableCount ?? 1,
      });

      setExistingImages(room?.imageGallery || room?.imageUrl || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load room');
    } finally {
      setLoading(false);
    }
  };

  const enableField = (key) => setEnabled((prev) => ({ ...prev, [key]: true }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('features.')) {
      if (!enabled.features) return;
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, features: { ...prev.features, [key]: checked } }));
      return;
    }

    if (name.startsWith('perks.')) {
      if (!enabled.perks) return;
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, perks: { ...prev.perks, [key]: checked } }));
      return;
    }

    if (!enabled[name]) return; // block edit unless enabled

    if (type === 'checkbox') setForm((prev) => ({ ...prev, [name]: checked }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (!enabled.images) return;
    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files].slice(0, 8)); // Increased limit to 8
  };

  const toggleRemoveExisting = (url) => {
    if (!enabled.images) return;
    setRemovedImageUrls((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomType || !form.bedLabel || !form.sizeSqm) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();

      Object.entries({
        roomType: form.roomType,
        bedLabel: form.bedLabel,
        sizeSqm: form.sizeSqm,
        capacityAdults: form.capacityAdults,
        capacityChildren: form.capacityChildren,
        active: form.active,
        availableCount: form.availableCount,
      }).forEach(([k, v]) => fd.append(k, v));

      fd.append('features', JSON.stringify(form.features));
      fd.append('perks', JSON.stringify(form.perks));
      if (removedImageUrls.length) fd.append('removeImages', JSON.stringify(removedImageUrls));
      newFiles.forEach((f) => fd.append('imageUrl', f));

      if (roomId) {
        // UPDATE by room_id
        await updateRoom(roomId, fd);
        toast.success('Room updated', { duration: 2500 });
      } else {
        await createRoom(fd);
        toast.success('Room created', { duration: 2500 });
      }

      if (onClose) onClose();
      else navigate('/admin/rooms');
    } catch (err) {
      console.error(err);
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f0f0f0] rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-[#0a0a0a]">
          {roomId ? 'Edit Room' : 'Create Room'}
        </h2>
        {roomId && (
          <span className="text-xs text-gray-600">
            Room ID: <code>{roomId}</code>
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4 text-[#0a0a0a]">
        {/* Room Type */}
        <div>
          <LabelWithEdit
            label="Room Type"
            enabled={enabled.roomType}
            onEnable={() => enableField('roomType')}
          />
          <div className={!enabled.roomType ? 'opacity-60 pointer-events-none' : ''}>
            <RoomTypeDropdownWithCRUD
              selectedRoomType={form.roomType}
              onSelectRoomType={(roomType) => {
                if (enabled.roomType) {
                  setForm(prev => ({ ...prev, roomType }));
                }
              }}
              placeholder="-- Select Room Type --"
              className="w-full"
              disabled={!enabled.roomType}
            />
          </div>
        </div>

        {/* Bed Label */}
        <div>
          <LabelWithEdit
            label="Bed Label"
            enabled={enabled.bedLabel}
            onEnable={() => enableField('bedLabel')}
          />
          <div className={!enabled.bedLabel ? 'opacity-60 pointer-events-none' : ''}>
            <BedLabelDropdownWithCRUD
              selectedBedLabel={form.bedLabel}
              onSelectBedLabel={(bedLabel) => {
                if (enabled.bedLabel) {
                  setForm(prev => ({ ...prev, bedLabel }));
                }
              }}
              placeholder="-- Select Bed Label --"
              className="w-full"
              disabled={!enabled.bedLabel}
            />
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <LabelWithEdit
              label="Size (sqm)"
              enabled={enabled.sizeSqm}
              onEnable={() => enableField('sizeSqm')}
            />
            <input
              name="sizeSqm"
              type="number"
              value={form.sizeSqm}
              onChange={handleChange}
              disabled={!enabled.sizeSqm}
              className={`w-full p-2 border rounded bg-white ${!enabled.sizeSqm ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <LabelWithEdit
              label="Capacity Adults"
              enabled={enabled.capacityAdults}
              onEnable={() => enableField('capacityAdults')}
            />
            <input
              name="capacityAdults"
              type="number"
              value={form.capacityAdults}
              onChange={handleChange}
              disabled={!enabled.capacityAdults}
              className={`w-full p-2 border rounded bg-white ${!enabled.capacityAdults ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <LabelWithEdit
              label="Capacity Children"
              enabled={enabled.capacityChildren}
              onEnable={() => enableField('capacityChildren')}
            />
            <input
              name="capacityChildren"
              type="number"
              value={form.capacityChildren}
              onChange={handleChange}
              disabled={!enabled.capacityChildren}
              className={`w-full p-2 border rounded bg-white ${!enabled.capacityChildren ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <LabelWithEdit
            label="Features"
            enabled={enabled.features}
            onEnable={() => enableField('features')}
          />
          <div className={`grid grid-cols-3 gap-2 ${!enabled.features ? 'opacity-60' : ''}`}>
            {Object.keys(initialFeatures).map((k) => (
              <label key={k} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={`features.${k}`}
                  checked={!!form.features[k]}
                  onChange={handleChange}
                  disabled={!enabled.features}
                />
                <span>{k}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div>
          <LabelWithEdit
            label="Perks"
            enabled={enabled.perks}
            onEnable={() => enableField('perks')}
          />
          <div className={`grid grid-cols-3 gap-2 ${!enabled.perks ? 'opacity-60' : ''}`}>
            {Object.keys(initialPerks).map((k) => (
              <label key={k} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={`perks.${k}`}
                  checked={!!form.perks[k]}
                  onChange={handleChange}
                  disabled={!enabled.perks}
                />
                <span>{k}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Active & Available Count */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <LabelWithEdit
              label="Active"
              enabled={enabled.active}
              onEnable={() => enableField('active')}
            />
            <label className={`inline-flex items-center gap-2 ${!enabled.active ? 'opacity-60' : ''}`}>
              <input
                type="checkbox"
                name="active"
                checked={!!form.active}
                onChange={handleChange}
                disabled={!enabled.active}
              />
              <span>Active</span>
            </label>
          </div>
          <div>
            <LabelWithEdit
              label="Available Count"
              enabled={enabled.availableCount}
              onEnable={() => enableField('availableCount')}
            />
            <input
              name="availableCount"
              type="number"
              value={form.availableCount}
              onChange={handleChange}
              disabled={!enabled.availableCount}
              className={`w-full p-2 border rounded bg-white ${!enabled.availableCount ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <LabelWithEdit
            label="Images"
            enabled={enabled.images}
            onEnable={() => enableField('images')}
          />
          <div className={`${!enabled.images ? 'opacity-60' : ''}`}>
            <label className="block">Existing Images</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {existingImages.length === 0 && <p className="col-span-full text-gray-500">No existing images</p>}
              {existingImages.map((img) => {
                const url = img.url || img;
                return (
                  <div key={url} className="relative">
                    <ImagePreview
                      src={url}
                      alt="Existing image"
                      size="medium"
                      onRemove={() => toggleRemoveExisting(url)}
                      showActions={enabled.images}
                    />
                    {removedImageUrls.includes(url) && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        To Remove
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-2">
              <label>Upload New Images (max 8)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="p-1 bg-white rounded"
                disabled={!enabled.images}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {newFiles.map((f, i) => (
                  <ImagePreview
                    key={i}
                    src={URL.createObjectURL(f)}
                    alt="New image"
                    size="medium"
                    onRemove={() => setNewFiles(prev => prev.filter((_, idx) => idx !== i))}
                    showActions={enabled.images}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            disabled={loading}
            className="px-4 py-2 bg-[#d3af37] text-[#0a0a0a] rounded hover:opacity-90 transition"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => (onClose ? onClose() : navigate('/admin/rooms'))}
            className="px-4 py-2 bg-white border border-[#d3af37] text-[#0a0a0a] rounded hover:opacity-90 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditRoom;
