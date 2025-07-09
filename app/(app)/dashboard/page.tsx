'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle, Edit2 } from 'lucide-react';

import {
  getChecklists,
  createChecklist,
  deleteChecklistSafely,
} from '@/services/dataService';
import { getLoggedInUser, logoutUser } from '@/services/authService';
import type { User, Checklist } from '@/services/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(
    null
  );

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
      router.push('/login');
    } else {
      setUser(loggedInUser);
      fetchChecklists();
    }
  }, [router]);

  const fetchChecklists = async () => {
    setIsLoading(true);
    const data = await getChecklists();
    setChecklists(data);
    setIsLoading(false);
  };

  const showNotification = (
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCreate = async () => {
    if (newChecklistTitle.trim() === '') return;
    try {
      await createChecklist(newChecklistTitle);
      await fetchChecklists();
      setNewChecklistTitle('');
      showNotification('success', 'Checklist baru telah berhasil dibuat.');
    } catch (error) {
      showNotification('error', 'Gagal membuat checklist. Silakan coba lagi.');
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedChecklistId(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedChecklistId) return;
    setDeletingId(selectedChecklistId);
    try {
      await deleteChecklistSafely(selectedChecklistId);
      await fetchChecklists();
      showNotification('success', 'Checklist dan semua isinya telah dihapus.');
    } catch (error: any) {
      showNotification(
        'error',
        error.message || 'Terjadi kesalahan saat menghapus.'
      );
    } finally {
      setDeletingId(null);
      setIsAlertOpen(false);
    }
  };

  const startEditing = () => {
    showNotification(
      'info',
      'Fitur untuk mengubah judul belum didukung oleh API.'
    );
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  if (!user) return <p className='text-center'>Memverifikasi sesi...</p>;

  return (
    <>
      <div className='w-full max-w-4xl mx-auto space-y-8'>
        <div className='flex justify-between items-center'>
          <h2 className='text-3xl font-bold'>Halo, {user.username}!</h2>
          <Button onClick={handleLogout} variant='destructive'>
            Logout
          </Button>
        </div>

        {notification && (
          <Alert
            variant={notification.type === 'error' ? 'destructive' : 'default'}
          >
            {notification.type === 'success' && (
              <CheckCircle className='h-4 w-4' />
            )}
            {notification.type === 'error' && (
              <AlertCircle className='h-4 w-4' />
            )}
            {notification.type === 'info' && (
              <AlertCircle className='h-4 w-4' />
            )}
            <AlertTitle>
              {notification.type === 'success' && 'Berhasil!'}
              {notification.type === 'error' && 'Gagal!'}
              {notification.type === 'info' && 'Informasi'}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Buat Checklist Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex gap-2'>
              <Input
                type='text'
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder='Contoh: Daftar Belanjaan'
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
              <Button
                onClick={handleCreate}
                disabled={newChecklistTitle.trim() === ''}
              >
                Buat
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className='space-y-4'>
          <h3 className='text-2xl font-bold'>Checklist Kamu</h3>
          {isLoading ? (
            <p className='text-muted-foreground'>Memuat checklist...</p>
          ) : checklists.length === 0 ? (
            <p className='text-muted-foreground'>Kamu belum punya checklist.</p>
          ) : (
            <div className='space-y-3'>
              {[...checklists]
                .sort((a, b) => b.id - a.id)
                .map((checklist) => (
                  <Card key={checklist.id} className='p-4'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 flex-1'>
                        <Link
                          href={`/checklist/${checklist.id}`}
                          className='font-medium text-lg text-primary hover:underline flex-1'
                        >
                          {checklist.name}
                        </Link>
                        <Button
                          onClick={startEditing}
                          size='sm'
                          variant='ghost'
                          className='p-1 h-8 w-8'
                        >
                          <Edit2 className='h-4 w-4' />
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleDeleteClick(checklist.id)}
                        variant='ghost'
                        size='sm'
                        disabled={deletingId === checklist.id}
                      >
                        {deletingId === checklist.id ? 'Menghapus...' : 'Hapus'}
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus checklist beserta semua item di
              dalamnya secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
