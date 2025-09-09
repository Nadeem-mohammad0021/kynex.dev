
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MyAccountPage() {
  const { toast } = useToast();
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            setFullName(user.user_metadata?.full_name ?? '');
        }
        setIsLoading(false);
    }
    fetchUser();
  }, [supabase.auth]);
  
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }
  }

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
        let avatarUrl = user.user_metadata?.avatar_url;
        
        // 1. Upload new avatar if selected
        if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            
            avatarUrl = `${publicUrl}?t=${new Date().getTime()}`; // Add timestamp to bust cache
        }

        // 2. Update user metadata
        const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                avatar_url: avatarUrl,
            }
        });

        if (updateError) throw updateError;
        
        if(updatedUser.user) {
            // Refresh user state to reflect changes
             setUser(updatedUser.user);
             setAvatarFile(null);
             setAvatarPreview(null);
        }

        toast({
            title: "Success",
            description: "Your account has been updated successfully.",
        });

    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Error updating account",
            description: error.message,
        });
    } finally {
        setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return (
        <div className="p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not load user information. Please try signing in again.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Account</CardTitle>
            <CardDescription>View and manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 relative group">
                    <AvatarImage src={avatarPreview || user.user_metadata?.avatar_url} alt={user.email} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        Change
                    </label>
                    <input type="file" id="avatar-upload" accept="image/png, image/jpeg" className="hidden" onChange={handleAvatarChange} />
                </Avatar>
                <div>
                    <h3 className="text-xl font-semibold">{fullName || 'No name provided'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
            </div>
            <div>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <><Loader className="mr-2 text-sm" /> Saving...</> : 'Save Changes'}
                </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
