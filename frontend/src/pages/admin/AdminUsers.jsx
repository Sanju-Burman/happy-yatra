import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, Shield, Calendar, ClipboardList, 
  ExternalLink, Search, UserCheck, UserX
} from 'lucide-react';
import { adminGetUsers, adminGetUserSurvey } from '@/api.jsx';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminGetUsers(page);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleViewSurvey = async (user) => {
    setSelectedUser(user);
    setSurveyModalOpen(true);
    setSurveyLoading(true);
    setSurvey(null);
    try {
      const data = await adminGetUserSurvey(user._id);
      setSurvey(data);
    } catch (error) {
      if (error.response?.status === 404) {
        setSurvey(null);
      } else {
        toast.error('Error fetching survey');
      }
    } finally {
      setSurveyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">View and manage registered users.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Survey</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-16 animate-pulse bg-muted/10" />
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail size={14} /> {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 gap-1 capitalize">
                          <Shield size={12} /> {user.role}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 capitalize">
                           <Users size={12} /> {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} /> 
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 text-primary hover:bg-primary/10"
                        onClick={() => handleViewSurvey(user)}
                      >
                        <ClipboardList size={16} /> View Survey
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {users.length} of {total} users
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

      {/* Survey Modal */}
      <Dialog open={surveyModalOpen} onOpenChange={setSurveyModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="text-primary" />
              Survey Results: {selectedUser?.username}
            </DialogTitle>
            <DialogDescription>
              Preferences submitted by this traveler.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {surveyLoading ? (
              <div className="space-y-4 py-8">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            ) : survey ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Travel Style</p>
                    <p className="font-medium text-lg capitalize">{survey.travelStyle}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget Level</p>
                    <p className="font-medium text-lg">
                       {survey.budget === 1 ? 'Budget' : 
                        survey.budget === 2 ? 'Moderate' : 
                        survey.budget === 3 ? 'Expensive' : 'Luxury'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {survey.interests.map((int, i) => (
                      <Badge key={i} variant="secondary">{int}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {survey.activities.map((act, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary">{act}</Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t text-xs text-muted-foreground">
                  Submitted on {new Date(survey.createdAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                 <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                   <UserX size={24} />
                 </div>
                 <p className="text-muted-foreground">No survey results found for this user.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
