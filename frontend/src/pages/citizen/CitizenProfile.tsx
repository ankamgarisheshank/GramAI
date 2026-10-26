import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/Alert';
import { useAuthStore } from '../../store/authStore';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useToast } from '../../components/ui/Toast';
import { UserCircle, Mail, Phone, MapPin, Edit3, Save, X, Shield, Camera, AlertCircle, Briefcase, IndianRupee, Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const CitizenProfile: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const updateMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    occupation: '',
    income: '',
    address: '',
    caste_category: '',
  });

  // Sync form data whenever profile is fetched or updated
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.full_name || '',
        age: profile.age != null ? String(profile.age) : '',
        gender: profile.gender || '',
        occupation: profile.occupation || '',
        income: profile.income != null ? String(profile.income) : '',
        address: profile.address || '',
        caste_category: profile.caste_category || '',
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.email ? user.email.split('@')[0] : 'Citizen',
      }));
    }
  }, [profile, user]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Validation Error', description: 'Full Name is required.', type: 'error' });
      return;
    }

    const payload: Record<string, any> = {
      full_name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      gender: formData.gender.trim() || undefined,
      occupation: formData.occupation.trim() || undefined,
      caste_category: formData.caste_category.trim() || undefined,
    };

    if (formData.age.trim()) {
      const parsedAge = parseInt(formData.age, 10);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) {
        toast({ title: 'Validation Error', description: 'Please enter a valid age.', type: 'error' });
        return;
      }
      payload.age = parsedAge;
    }

    if (formData.income.trim()) {
      const parsedIncome = parseFloat(formData.income);
      if (isNaN(parsedIncome) || parsedIncome < 0) {
        toast({ title: 'Validation Error', description: 'Please enter a valid income amount.', type: 'error' });
        return;
      }
      payload.income = parsedIncome;
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        setIsEditing(false);
        toast({
          title: 'Profile Updated',
          description: 'Your profile details have been saved successfully.',
          type: 'success',
        });
      },
      onError: (err: any) => {
        toast({
          title: 'Update Failed',
          description: err.response?.data?.message || 'Could not save profile changes.',
          type: 'error',
        });
      },
    });
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.full_name || '',
        age: profile.age != null ? String(profile.age) : '',
        gender: profile.gender || '',
        occupation: profile.occupation || '',
        income: profile.income != null ? String(profile.income) : '',
        address: profile.address || '',
        caste_category: profile.caste_category || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        <Skeleton className="h-10 w-48" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans animate-in fade-in duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your citizen profile information.</p>
        </div>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel} disabled={updateMutation.isPending}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
              <Save className="w-4 h-4" /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error instanceof Error ? error.message : 'Failed to retrieve profile data.'}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="ml-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden border shadow-sm relative bg-card">
            <div className="h-20 bg-primary/10 w-full absolute top-0 left-0"></div>
            <CardContent className="pt-10 flex flex-col items-center text-center relative z-10 pb-6">
              <div className="w-20 h-20 rounded-full bg-background border-4 border-background shadow-md flex items-center justify-center relative mb-3">
                <UserCircle className="w-16 h-16 text-muted-foreground" />
                {isEditing && (
                  <button type="button" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold font-heading">{formData.name || 'Citizen'}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              
              <div className="mt-4 flex flex-col items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 text-xs">
                  <Shield className="w-3 h-3" />
                  Verified Citizen
                </Badge>
                {profile?.completion_percentage != null && (
                  <span className="text-xs font-mono text-muted-foreground">
                    Profile: {profile.completion_percentage}% Complete
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full p-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="font-medium p-2.5 bg-muted/20 rounded-lg text-sm">{formData.name || 'Not provided'}</p>
                  )}
                </div>

                {/* Email Address (Immutable) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg text-muted-foreground text-sm">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{user?.email || 'Not provided'}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">* Account email cannot be changed</p>
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age</label>
                  {isEditing ? (
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="number"
                        className="w-full p-2.5 pl-9 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Age in years"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{formData.age ? `${formData.age} years` : 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</label>
                  {isEditing ? (
                    <select
                      className="w-full p-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="font-medium p-2.5 bg-muted/20 rounded-lg text-sm">{formData.gender || 'Not provided'}</p>
                  )}
                </div>

                {/* Occupation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Occupation</label>
                  {isEditing ? (
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text"
                        className="w-full p-2.5 pl-9 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="e.g. Farmer, Student, Artisan"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{formData.occupation || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Annual Income */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annual Income (₹)</label>
                  {isEditing ? (
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="number"
                        className="w-full p-2.5 pl-9 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.income}
                        onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                        placeholder="Annual income in ₹"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg text-sm">
                      <IndianRupee className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{formData.income ? `₹${Number(formData.income).toLocaleString('en-IN')}` : 'Not provided'}</span>
                    </div>
                  )}
                </div>

                {/* Address / Location */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address / Location</label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input 
                        type="text"
                        className="w-full p-2.5 pl-9 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Village, Mandal, District"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{formData.address || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
