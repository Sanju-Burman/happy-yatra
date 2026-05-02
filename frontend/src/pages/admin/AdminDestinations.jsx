import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, TrendingUp, TrendingDown, 
  Search, MapPin, DollarSign, Eye, MoreHorizontal
} from 'lucide-react';
import { 
  adminGetDestinations, adminCreateDestination, 
  adminUpdateDestination, adminDeleteDestination, 
  adminToggleTrending 
} from '@/api.jsx';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', imageUrl: '', averageCost: '', styles: '', 
    tags: '', activities: '', location: '', latitude: '', 
    longitude: '', trending: false, description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await adminGetDestinations(page);
      setDestinations(data.destinations);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to fetch destinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleOpenModal = (dest = null) => {
    if (dest) {
      setEditTarget(dest);
      setFormData({
        name: dest.name,
        imageUrl: dest.imageUrl,
        averageCost: dest.averageCost,
        styles: dest.styles.join(', '),
        tags: dest.tags.join(', '),
        activities: dest.activities.join(', '),
        location: dest.location,
        latitude: dest.latitude,
        longitude: dest.longitude,
        trending: dest.trending || false,
        description: dest.description || ''
      });
    } else {
      setEditTarget(null);
      setFormData({
        name: '', imageUrl: '', averageCost: '', styles: '', 
        tags: '', activities: '', location: '', latitude: '', 
        longitude: '', trending: false, description: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        averageCost: Number(formData.averageCost),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        styles: formData.styles.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
        activities: formData.activities.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editTarget) {
        await adminUpdateDestination(editTarget._id, payload);
        toast.success('Destination updated successfully');
      } else {
        await adminCreateDestination(payload);
        toast.success('Destination created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await adminDeleteDestination(id);
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleToggleTrending = async (id) => {
    // Optimistic update
    setDestinations(prev => prev.map(d => 
      d._id === id ? { ...d, trending: !d.trending } : d
    ));

    try {
      await adminToggleTrending(id);
      toast.success('Trending status toggled');
    } catch (error) {
      toast.error('Failed to toggle trending');
      // Revert if failed
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
          <p className="text-muted-foreground mt-1">Manage your platform's travel destinations.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shadow-sm">
          <Plus size={18} /> Add Destination
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-16 animate-pulse bg-muted/20" />
                    </TableRow>
                  ))
                ) : destinations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No destinations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  destinations.map((dest) => (
                    <TableRow key={dest._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <img 
                          src={dest.imageUrl} 
                          alt={dest.name} 
                          className="h-12 w-12 rounded-lg object-cover shadow-sm bg-muted"
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{dest.name}</TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-1">
                        <MapPin size={14} /> {dest.location}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <span className="text-xs text-muted-foreground mr-0.5">$</span>{dest.averageCost}
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center gap-1 mt-1">
                        <Eye size={14} /> {dest.viewCount || 0}
                      </TableCell>
                      <TableCell>
                        {dest.trending ? (
                          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 gap-1 px-2.5 py-0.5">
                            <TrendingUp size={12} /> Trending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-dashed gap-1 px-2.5 py-0.5">
                             Regular
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleTrending(dest._id)}
                            title="Toggle Trending"
                            className={dest.trending ? 'text-amber-500' : 'text-muted-foreground'}
                          >
                            <TrendingUp size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenModal(dest)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(dest._id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {destinations.length} of {total} results
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page * 20 >= total} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* CRUD Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Destination' : 'Add New Destination'}</DialogTitle>
            <DialogDescription>
              Provide destination details below. URL required for images.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Bali, Indonesia"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input 
                  required 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                  placeholder="Southeast Asia"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input 
                required 
                type="url"
                value={formData.imageUrl} 
                onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Avg Cost ($)</label>
                <Input 
                  required 
                  type="number" 
                  value={formData.averageCost} 
                  onChange={e => setFormData({...formData, averageCost: e.target.value})} 
                  placeholder="1200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude</label>
                <Input 
                  required 
                  type="number" 
                  step="0.000001"
                  value={formData.latitude} 
                  onChange={e => setFormData({...formData, latitude: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude</label>
                <Input 
                  required 
                  type="number" 
                  step="0.000001"
                  value={formData.longitude} 
                  onChange={e => setFormData({...formData, longitude: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Styles (comma-separated)</label>
              <Input 
                required 
                value={formData.styles} 
                onChange={e => setFormData({...formData, styles: e.target.value})} 
                placeholder="Relaxation, Adventure, Cultural"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input 
                  required 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})} 
                  placeholder="Tropical, Beach, Hiking"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Activities (comma-separated)</label>
                <Input 
                  required 
                  value={formData.activities} 
                  onChange={e => setFormData({...formData, activities: e.target.value})} 
                  placeholder="Surfing, Temple Tours, Yoga"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief description of the destination..."
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
               <input 
                 type="checkbox" 
                 id="trending"
                 checked={formData.trending}
                 onChange={e => setFormData({...formData, trending: e.target.checked})}
                 className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
               />
               <label htmlFor="trending" className="text-sm font-medium leading-none">
                 Mark as Trending
               </label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editTarget ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
