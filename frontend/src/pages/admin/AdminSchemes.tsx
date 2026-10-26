import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Dialog, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { Edit, Plus, Search } from 'lucide-react';
import { useAdminSchemes, useCreateScheme, useUpdateScheme } from '../../hooks/useSchemes';

export const AdminSchemes = () => {
  const { data: schemes, isLoading, isError } = useAdminSchemes();
  const { mutateAsync: createScheme, isPending: isCreating } = useCreateScheme();
  const { mutateAsync: updateScheme, isPending: isUpdating } = useUpdateScheme();
  
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    description: '',
    benefits: '',
    required_documents: '',
    application_process: '',
    official_link: '',
    status: 'Active',
    beneficiary_type: '',
    income_limit: '',
    age_limit_min: '',
    age_limit_max: '',
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      department: '',
      description: '',
      benefits: '',
      required_documents: '',
      application_process: '',
      official_link: '',
      status: 'Active',
      beneficiary_type: '',
      income_limit: '',
      age_limit_min: '',
      age_limit_max: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (scheme: any) => {
    setEditingId(scheme.id);
    setFormData({
      name: scheme.name || '',
      department: scheme.department || '',
      description: scheme.description || '',
      benefits: scheme.benefits || '',
      required_documents: scheme.required_documents || '',
      application_process: scheme.application_process || '',
      official_link: scheme.official_link || '',
      status: scheme.status || 'Active',
      beneficiary_type: scheme.beneficiary_type || '',
      income_limit: scheme.income_limit !== null ? String(scheme.income_limit) : '',
      age_limit_min: scheme.age_limit_min !== null ? String(scheme.age_limit_min) : '',
      age_limit_max: scheme.age_limit_max !== null ? String(scheme.age_limit_max) : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.age_limit_min && formData.age_limit_max) {
      if (Number(formData.age_limit_min) > Number(formData.age_limit_max)) {
        toast({ title: 'Validation Error', description: 'Min age cannot be greater than max age', type: 'error' });
        return;
      }
    }

    if (formData.income_limit && Number(formData.income_limit) < 0) {
      toast({ title: 'Validation Error', description: 'Income limit cannot be negative', type: 'error' });
      return;
    }
    
    const payload = {
      ...formData,
      income_limit: formData.income_limit ? Number(formData.income_limit) : null,
      age_limit_min: formData.age_limit_min ? Number(formData.age_limit_min) : null,
      age_limit_max: formData.age_limit_max ? Number(formData.age_limit_max) : null,
    };

    try {
      if (editingId) {
        await updateScheme({ id: editingId, data: payload });
        toast({ title: 'Success', description: 'Scheme updated successfully', type: 'success' });
      } else {
        await createScheme(payload);
        toast({ title: 'Success', description: 'Scheme created successfully', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.response?.data?.message || err.message || 'Something went wrong', 
        type: 'error' 
      });
    }
  };

  const filteredSchemes = schemes?.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Scheme Management</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Scheme
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search schemes..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheme Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Beneficiary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <div className="space-y-2">
                    <Skeleton className="w-full h-8" />
                    <Skeleton className="w-full h-8" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive h-24">
                  Failed to load schemes
                </TableCell>
              </TableRow>
            ) : filteredSchemes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No schemes found
                </TableCell>
              </TableRow>
            ) : (
              filteredSchemes?.map((scheme: any) => (
                <TableRow key={scheme.id}>
                  <TableCell className="font-medium">{scheme.name}</TableCell>
                  <TableCell>{scheme.department}</TableCell>
                  <TableCell>
                    <span className="capitalize">{scheme.beneficiary_type || 'Any'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      scheme.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      scheme.status === 'Inactive' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-muted text-muted-foreground'
                    }>
                      {scheme.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(scheme)}>
                      <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Edit Scheme' : 'Add New Scheme'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin">
          <form id="scheme-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scheme Name *</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department *</label>
                <Input 
                  required 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea 
                required 
                className="min-h-[80px]"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Benefits *</label>
              <Textarea 
                required 
                className="min-h-[80px]"
                value={formData.benefits} 
                onChange={(e) => setFormData({...formData, benefits: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Documents *</label>
              <Textarea 
                required 
                className="min-h-[80px]"
                value={formData.required_documents} 
                onChange={(e) => setFormData({...formData, required_documents: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Process *</label>
              <Textarea 
                required 
                className="min-h-[80px]"
                value={formData.application_process} 
                onChange={(e) => setFormData({...formData, application_process: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Official Link</label>
                <Input 
                  type="url"
                  placeholder="https://..."
                  value={formData.official_link} 
                  onChange={(e) => setFormData({...formData, official_link: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Beneficiary Type</label>
                <Input 
                  placeholder="e.g. farmer, student"
                  value={formData.beneficiary_type} 
                  onChange={(e) => setFormData({...formData, beneficiary_type: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Income Limit (₹)</label>
                <Input 
                  type="number"
                  min="0"
                  placeholder="Max income"
                  value={formData.income_limit} 
                  onChange={(e) => setFormData({...formData, income_limit: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Age</label>
                <Input 
                  type="number"
                  min="0"
                  value={formData.age_limit_min} 
                  onChange={(e) => setFormData({...formData, age_limit_min: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Age</label>
                <Input 
                  type="number"
                  min="0"
                  value={formData.age_limit_max} 
                  onChange={(e) => setFormData({...formData, age_limit_max: e.target.value})} 
                />
              </div>
            </div>

          </form>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="scheme-form" isLoading={isCreating || isUpdating}>
            {editingId ? 'Save Changes' : 'Create Scheme'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
