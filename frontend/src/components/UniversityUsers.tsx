import React, { useState, useEffect } from 'react';
import { User } from '@/services/AuthService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';

interface UniversityUsersProps {
  universityId: string;
  universityName: string;
}

export function UniversityUsers({ universityId, universityName }: UniversityUsersProps) {
  const { getUsersByUniversity, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<'all' | 'student' | 'lecturer'>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const role = selectedRole === 'all' ? undefined : selectedRole;
      const fetchedUsers = await getUsersByUniversity(universityId, role);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [universityId, selectedRole]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{universityName} Users</CardTitle>
          <CardDescription>
            {users.length} users found
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as 'all' | 'student' | 'lecturer')}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="lecturer">Lecturers</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(user.full_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    {user.role}
                  </span>
                  {user.year && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary">
                      Year {user.year}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center p-6 text-muted-foreground">
            No users found for this university
          </div>
        )}
      </CardContent>
    </Card>
  );
} 