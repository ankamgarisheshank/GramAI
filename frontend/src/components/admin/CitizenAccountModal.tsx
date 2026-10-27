import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { AdminAPI, type UserAccountResponse } from '../../lib/api';
import { 
  UserCircle, Mail, Phone, MapPin, Calendar, Activity, 
  FileText, CheckCircle, Clock, XCircle, ArrowRight, 
  ExternalLink, ShieldCheck, Tractor, GraduationCap, Heart
} from 'lucide-react';

interface Props {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CitizenAccountModal: React.FC<Props> = ({ userId, open, onOpenChange }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<UserAccountResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) {
      setAccountData(null);
      setError(null);
      return;
    }

    const fetchAccount = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await AdminAPI.getUserAccount(userId);
        setAccountData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load citizen account details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [open, userId]);

  const user = accountData?.user;
  const applications = accountData?.applications || [];

  const getPersonaBadge = (persona?: string) => {
    switch (persona?.toLowerCase()) {
      case 'farmer':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1">
            <Tractor className="w-3.5 h-3.5 mr-1" /> Farmer Account
          </Badge>
        );
      case 'student':
        return (
          <Badge className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-xs px-2.5 py-1">
            <GraduationCap className="w-3.5 h-3.5 mr-1" /> Student Account
          </Badge>
        );
      case 'senior':
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1">
            <Heart className="w-3.5 h-3.5 mr-1" /> Senior Citizen Account
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1">
            <UserCircle className="w-3.5 h-3.5 mr-1" /> General Citizen
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">Under Review</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[85vh] overflow-y-auto pr-1">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold font-heading">Citizen Account Dossier</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Complete account verification profile and all submitted applications for this citizen.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 my-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="p-6 text-center my-6 bg-destructive/10 border border-destructive/20 rounded-2xl">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : user ? (
          <div className="space-y-6 my-4">
            
            {/* Identity Card */}
            <div className="p-5 bg-gradient-to-br from-card to-muted/40 rounded-2xl border border-border/60 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <UserCircle className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground leading-tight">{user.full_name}</h3>
                      {getPersonaBadge(user.persona)}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">ID: {user.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                    Verified Active Account
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{user.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{user.phone_number || 'No phone registered'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{user.village ? `${user.village}, ` : ''}{user.district || 'Telangana'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Last Active: {user.last_active ? new Date(user.last_active).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}</span>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Applications Submitted by this Citizen ({applications.length})
                </h4>
              </div>

              {applications.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl bg-muted/10">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No applications found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">This citizen has not yet submitted any scheme applications.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {applications.map((app) => (
                    <div 
                      key={app.id} 
                      className="p-3.5 bg-card hover:bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold text-foreground">{app.application_id}</span>
                          {getStatusBadge(app.status)}
                          {app.document_count > 0 && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {app.document_count} doc{app.document_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-primary truncate" title={app.scheme_name}>
                          {app.scheme_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN') : (app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN') : '-')}
                        </p>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/admin/applications/${app.id}`);
                        }}
                        className="text-xs shrink-0 h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        Inspect Application
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : null}

        <div className="flex justify-end pt-3 border-t border-border/40 mt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
