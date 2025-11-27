import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Pencil, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye,
  Bed,
  Square,
  Users,
  Wifi,
  Wind,
  Home,
  Droplet,
  Building,
  Utensils,
  TreePine,
  MapPin,
  Droplets,
  Lock
} from 'lucide-react';
import { getRoomById, createRoom, updateRoom } from '../../../api/rooms';
import RoomTypeDropdownWithCRUD from '../../common/RoomTypeDropdownWithCRUD';
import BedLabelDropdownWithCRUD from '../../common/BedLabelDropdownWithCRUD';
import ImagePreview from './ImagePreview';
import ImageManagement from './ImageManagement';

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

const featureIcons = {
  freeWifi: Wifi,
  airConditioning: Wind,
  patio: Home,
  bidet: Droplet,
  balcony: Building,
  dishwasher: Utensils,
};

const perkIcons = {
  gardenView: TreePine,
  landmarkView: MapPin,
  innerCourtyardView: Home,
  privateBathroom: Lock,
  privatePool: Droplets,
};

const SectionHeader = ({ title, description, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-4">
    {Icon && <Icon className="w-5 h-5 text-yellow-600" />}
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  </div>
);

const FormSection = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
    {children}
  </div>
);

const LabelWithEdit = ({ label, enabled, onEnable, required = false }) => (
  <div className="flex items-center justify-between mb-2">
    <label className="font-medium text-gray-700 flex items-center gap-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {!enabled && (
      <button
        type="button"
        onClick={onEnable}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
        title="Enable editing"
      >
        <Pencil size={14} />
        Edit
      </button>
    )}
  </div>
);

const OptimizedRoomEdit = ({ id: propId = null, onClose }) => {
  const params = useParams();
  const navigate = useNavigate();

  const roomId = useMemo(() => propId ?? params.id ?? null, [propId, params.id]);
  const isEditing = !!roomId;

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
    roomType: !isEditing,
    bedLabel: !isEditing,
    sizeSqm: !isEditing,
    capacityAdults: !isEditing,
    capacityChildren: !isEditing,
    features: !isEditing,
    perks: !isEditing,
    active: !isEditing, // Disabled by default, enable with edit button
    availableCount: !isEditing,
    images: !isEditing,
  });

  useEffect(() => {
    if (roomId) loadRoom();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const res = await getRoomById(roomId);
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

    if (!enabled[name]) return;

    if (type === 'checkbox') setForm((prev) => ({ ...prev, [name]: checked }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files) => {
    if (!enabled.images) return;
    setNewFiles((prev) => [...prev, ...files].slice(0, 8));
  };

  const handleRemoveExisting = (url) => {
    if (!enabled.images) return;
    setRemovedImageUrls((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  };

  const handleRemoveNew = (index) => {
    if (!enabled.images) return;
    setNewFiles((prev) => prev.filter((_, idx) => idx !== index));
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
      }).forEach(([k, v]) => {
        // Convert boolean to string for FormData
        const value = typeof v === 'boolean' ? v.toString() : v;
        fd.append(k, value);
      });

      fd.append('features', JSON.stringify(form.features));
      fd.append('perks', JSON.stringify(form.perks));
      if (removedImageUrls.length) fd.append('removeImages', JSON.stringify(removedImageUrls));
      newFiles.forEach((f) => fd.append('imageUrl', f));

      if (roomId) {
        await updateRoom(roomId, fd);
        toast.success('Room updated successfully');
      } else {
        await createRoom(fd);
        toast.success('Room created successfully');
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

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Room' : 'Add New Room'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update room information and settings' : 'Create a new room with all details'}
            </p>
          </div>
          {isEditing && roomId && (
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              Room ID: <code className="font-mono">{roomId}</code>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Basic Information */}
        <FormSection>
          <SectionHeader 
            title="Basic Information" 
            description="Essential room details and specifications"
            icon={Home}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Type */}
            <div>
              <LabelWithEdit
                label="Room Type"
                enabled={enabled.roomType}
                onEnable={() => enableField('roomType')}
                required
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
                label="Bed Configuration"
                enabled={enabled.bedLabel}
                onEnable={() => enableField('bedLabel')}
                required
              />
              <div className={!enabled.bedLabel ? 'opacity-60 pointer-events-none' : ''}>
                <BedLabelDropdownWithCRUD
                  selectedBedLabel={form.bedLabel}
                  onSelectBedLabel={(bedLabel) => {
                    if (enabled.bedLabel) {
                      setForm(prev => ({ ...prev, bedLabel }));
                    }
                  }}
                  placeholder="-- Select Bed Type --"
                  className="w-full"
                  disabled={!enabled.bedLabel}
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Room Specifications */}
        <FormSection>
          <SectionHeader 
            title="Room Specifications" 
            description="Size, capacity, and physical details"
            icon={Square}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Size */}
            <div>
              <LabelWithEdit
                label="Room Size (m²)"
                enabled={enabled.sizeSqm}
                onEnable={() => enableField('sizeSqm')}
                required
              />
              <div className={!enabled.sizeSqm ? 'opacity-60 pointer-events-none' : ''}>
                <input
                  name="sizeSqm"
                  type="number"
                  value={form.sizeSqm}
                  onChange={handleChange}
                  disabled={!enabled.sizeSqm}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter room size"
                />
              </div>
            </div>

            {/* Adult Capacity */}
            <div>
              <LabelWithEdit
                label="Adult Capacity"
                enabled={enabled.capacityAdults}
                onEnable={() => enableField('capacityAdults')}
              />
              <div className={!enabled.capacityAdults ? 'opacity-60 pointer-events-none' : ''}>
                <input
                  name="capacityAdults"
                  type="number"
                  value={form.capacityAdults}
                  onChange={handleChange}
                  disabled={!enabled.capacityAdults}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            {/* Children Capacity */}
            <div>
              <LabelWithEdit
                label="Children Capacity"
                enabled={enabled.capacityChildren}
                onEnable={() => enableField('capacityChildren')}
              />
              <div className={!enabled.capacityChildren ? 'opacity-60 pointer-events-none' : ''}>
                <input
                  name="capacityChildren"
                  type="number"
                  value={form.capacityChildren}
                  onChange={handleChange}
                  disabled={!enabled.capacityChildren}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Features */}
        <FormSection>
          <SectionHeader 
            title="Room Features" 
            description="Amenities and facilities available in the room"
            icon={Wifi}
          />
          
          <div className={!enabled.features ? 'opacity-60 pointer-events-none' : ''}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(initialFeatures).map(([key, defaultValue]) => {
                const Icon = featureIcons[key];
                return (
                  <label key={key} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name={`features.${key}`}
                      checked={!!form.features[key]}
                      onChange={handleChange}
                      disabled={!enabled.features}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    {Icon && <Icon className="w-5 h-5 text-gray-600" />}
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* Perks */}
        <FormSection>
          <SectionHeader 
            title="Room Perks" 
            description="Special views and exclusive amenities"
            icon={TreePine}
          />
          
          <div className={!enabled.perks ? 'opacity-60 pointer-events-none' : ''}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(initialPerks).map(([key, defaultValue]) => {
                const Icon = perkIcons[key];
                return (
                  <label key={key} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name={`perks.${key}`}
                      checked={!!form.perks[key]}
                      onChange={handleChange}
                      disabled={!enabled.perks}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    {Icon && <Icon className="w-5 h-5 text-gray-600" />}
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* Status & Availability */}
        <FormSection>
          <SectionHeader 
            title="Status & Availability" 
            description="Room status and availability settings"
            icon={Users}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Status */}
            <div>
              <LabelWithEdit
                label="Room Status"
                enabled={enabled.active}
                onEnable={() => enableField('active')}
              />
              <div className={!enabled.active ? 'opacity-60 pointer-events-none' : ''}>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    name="active"
                    checked={!!form.active}
                    onChange={handleChange}
                    disabled={!enabled.active}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Active Room</span>
                    <p className="text-xs text-gray-500">Room is available for booking</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Available Count */}
            <div>
              <LabelWithEdit
                label="Available Rooms"
                enabled={enabled.availableCount}
                onEnable={() => enableField('availableCount')}
              />
              <div className={!enabled.availableCount ? 'opacity-60 pointer-events-none' : ''}>
                <input
                  name="availableCount"
                  type="number"
                  value={form.availableCount}
                  onChange={handleChange}
                  disabled={!enabled.availableCount}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Number of rooms of this type available</p>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Images */}
        <FormSection>
          <LabelWithEdit
            label="Room Images"
            enabled={enabled.images}
            onEnable={() => enableField('images')}
          />
          <p className="text-sm text-gray-600 mb-4">Upload and manage room photos (max 8 images)</p>
          
          <div className={!enabled.images ? 'opacity-60 pointer-events-none' : ''}>
            <ImageManagement
              existingImages={existingImages}
              newFiles={newFiles}
              removedImageUrls={removedImageUrls}
              onFileChange={handleFileChange}
              onRemoveExisting={handleRemoveExisting}
              onRemoveNew={handleRemoveNew}
              enabled={enabled.images}
              maxFiles={8}
            />
          </div>
        </FormSection>


        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => (onClose ? onClose() : navigate('/admin/rooms'))}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : (isEditing ? 'Update Room' : 'Create Room')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OptimizedRoomEdit;
