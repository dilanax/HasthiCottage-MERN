import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '../assets/logo.png'; // Adjust the path as needed

const Footer = () => {

  return (
    <footer id="contact" className="bg-[#0A0A0A] text-white">
      <div className="grid gap-8 px-4 py-12 mx-auto max-w-7xl md:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} className="w-10 h-10 rounded-full ring-2 ring-white/10" alt="Logo" />
            <div>
              <p className="font-semibold">Hasthi Safari Cottage</p>
              <p className="text-xs text-white/60">Safari &amp; Stay</p>
            </div>
          </div>
          <p className="max-w-xs mt-3 text-sm text-white/70">
           Experience luxury in the heart of wilderness. Where comfort meets adventure in an unforgettable safari experience.
          </p>
        </div>

        <div>
          <p className="mb-3 font-semibold">Quick Links</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#rooms" className="hover:text-white">Rooms</a></li>
            <li><a href="#amenities" className="hover:text-white">Facilities</a></li>
            <li><a href="#gallery" className="hover:text-white">Gallery</a></li>
            <li><a href="#booking" className="hover:text-white">Book Now</a></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold">Contact</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Hasthi Safari Cottages, Walawe Junction, Udawalawe</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +94 76 830 5600</li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold">Newsletter</p>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Subscribed! (demo)"); }}
            className="flex gap-2"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 px-3 py-2 text-white border rounded-lg bg-white/5 border-white/10 placeholder-white/50"
            />
            <button
              className="px-4 py-2 font-medium rounded-lg"
              style={{ background: '#FFD700', color: '#222' }}
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="py-4 text-xs text-center border-t border-white/10 text-white/60">
        © {new Date().getFullYear()} Hasthi Safari Cottages. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;