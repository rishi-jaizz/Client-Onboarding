'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientAPI, profileAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, User, Building2, MapPin, Save, Upload, Camera } from 'lucide-react';

const clientSchema = z.object({
  firstName: z.string().min(1, 'Required').max(50),
  lastName: z.string().min(1, 'Required').max(50),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  country: z.string().optional(),
});

const profileSchema = z.object({
  businessType: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  bio: z.string().optional(),
  annualRevenue: z.string().optional(),
  employeeCount: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Real Estate', 'Other'];
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
];

export default function ProfilePage() {
  const { client, refreshClient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'business'>('account');
  const [imageUploading, setImageUploading] = useState(false);

  const { register: regClient, handleSubmit: handleClient, reset: resetClient, formState: { errors: clientErrors } } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (client) {
      resetClient({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        phone: client.phone || '',
        company: client.company || '',
        industry: client.industry || '',
        country: client.country || '',
      });
    }
  }, [client, resetClient]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getProfile();
        const p = res.data.data;
        resetProfile({
          businessType: p.businessType || '',
          website: p.website || '',
          taxId: p.taxId || '',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          zipCode: p.zipCode || '',
          bio: p.bio || '',
          annualRevenue: p.annualRevenue || '',
          employeeCount: p.employeeCount || '',
        });
      } catch { /* profile might not exist */ }
    };
    fetchProfile();
  }, [resetProfile]);

  const onClientSubmit = async (data: ClientForm) => {
    setIsLoading(true);
    try {
      await clientAPI.updateClient(data);
      await refreshClient();
      toast.success('Account information updated!');
    } catch {
      toast.error('Failed to update account');
    } finally {
      setIsLoading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsProfileLoading(true);
    try {
      await profileAPI.updateProfile(data);
      toast.success('Business profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      await clientAPI.uploadProfileImage(file);
      await refreshClient();
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Profile Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account and business information</p>
      </div>

      {/* Profile Image */}
      <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {client?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`http://localhost:5000${client.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {client?.firstName?.[0]}{client?.lastName?.[0]}
                </span>
              )}
            </div>
            <label
              htmlFor="profile-image-input"
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            >
              {imageUploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Camera className="w-4 h-4 text-white" />}
            </label>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div>
            <h3 className="font-semibold text-white">{client?.firstName} {client?.lastName}</h3>
            <p className="text-sm text-gray-400">{client?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                client?.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                client?.status === 'IN_PROGRESS' ? 'bg-indigo-500/20 text-indigo-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {client?.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('profile-image-input')?.click()}
            className="ml-auto flex items-center gap-2 px-4 py-2 glass border border-white/10 hover:border-white/20 rounded-xl text-sm text-gray-300 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([['account', 'Account Info', User], ['business', 'Business Profile', Building2]] as const).map(([tab, label, Icon]) => (
          <button
            key={tab}
            id={`profile-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'glass border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Account Info Form */}
      {activeTab === 'account' && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <form onSubmit={handleClient(onClientSubmit)} className="space-y-4" id="account-form">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="profile-firstName">First Name</label>
                <input
                  id="profile-firstName"
                  {...regClient('firstName')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                />
                {clientErrors.firstName && <p className="mt-1 text-xs text-red-400">{clientErrors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="profile-lastName">Last Name</label>
                <input
                  id="profile-lastName"
                  {...regClient('lastName')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                />
                {clientErrors.lastName && <p className="mt-1 text-xs text-red-400">{clientErrors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="profile-phone">Phone</label>
              <input
                id="profile-phone"
                {...regClient('phone')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="profile-company">Company</label>
              <input
                id="profile-company"
                {...regClient('company')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                placeholder="Your company name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="profile-industry">Industry</label>
                <select
                  id="profile-industry"
                  {...regClient('industry')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="" className="bg-gray-900">Select industry</option>
                  {industries.map(i => <option key={i} value={i} className="bg-gray-900">{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="profile-country">Country</label>
                <select
                  id="profile-country"
                  {...regClient('country')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="" className="bg-gray-900">Select country</option>
                  {countries.map(c => <option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              id="save-account-btn"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-xl font-medium text-white transition-all shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Business Profile Form */}
      {activeTab === 'business' && (
        <div className="glass rounded-2xl p-6 border border-white/10">
          <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4" id="business-form">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-type">Business Type</label>
                <select
                  id="biz-type"
                  {...regProfile('businessType')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="" className="bg-gray-900">Select type</option>
                  {['Sole Proprietor', 'LLC', 'Corp', 'Partnership', 'Non-Profit'].map(t => (
                    <option key={t} value={t} className="bg-gray-900">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-taxId">Tax ID</label>
                <input
                  id="biz-taxId"
                  {...regProfile('taxId')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                  placeholder="XX-XXXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-website">Website</label>
              <input
                id="biz-website"
                {...regProfile('website')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                placeholder="https://yourcompany.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-address">
                <MapPin className="w-4 h-4 inline mr-1" />Address
              </label>
              <input
                id="biz-address"
                {...regProfile('address')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 input-glow transition-all"
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-city">City</label>
                <input id="biz-city" {...regProfile('city')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-state">State</label>
                <input id="biz-state" {...regProfile('state')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="CA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-zip">ZIP Code</label>
                <input id="biz-zip" {...regProfile('zipCode')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="94102" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-revenue">Annual Revenue</label>
                <select id="biz-revenue" {...regProfile('annualRevenue')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all">
                  <option value="" className="bg-gray-900">Select range</option>
                  {['<100K', '100K-500K', '500K-1M', '1M-10M', '10M-100M', '>100M'].map(r => (
                    <option key={r} value={r} className="bg-gray-900">{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-employees">Employees</label>
                <select id="biz-employees" {...regProfile('employeeCount')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all">
                  <option value="" className="bg-gray-900">Select count</option>
                  {['1-10', '11-50', '51-200', '201-500', '>500'].map(r => (
                    <option key={r} value={r} className="bg-gray-900">{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="biz-bio">Business Description</label>
              <textarea id="biz-bio" {...regProfile('bio')} rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                placeholder="Brief description of your business..." />
            </div>

            <button
              type="submit"
              id="save-business-btn"
              disabled={isProfileLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-xl font-medium text-white transition-all shadow-lg shadow-indigo-500/25"
            >
              {isProfileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isProfileLoading ? 'Saving...' : 'Save Business Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
