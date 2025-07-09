'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

import {
  getChecklists,
  getChecklistItems,
  createChecklistItem,
  updateChecklistItemStatus,
  deleteChecklistItem,
} from '@/services/dataService';
import type { Checklist, ChecklistItem } from '@/services/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChecklistDetailPage() {
  const params = useParams<{ id: string }>();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState('');

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const checklistId = params.id ? parseInt(params.id) : 0;

  const refreshData = useCallback(async () => {
    if (!checklistId) {
      setLoading(false);
      return;
    }
    try {
      const allChecklists = await getChecklists();
      const currentChecklist = allChecklists.find((c) => c.id === checklistId);
      const itemsData = await getChecklistItems(checklistId);
      setChecklist(currentChecklist || null);
      setItems(itemsData || []);
    } catch (error) {
      console.error('❌ Gagal memuat data checklist:', error);
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  }, [checklistId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() === '' || !checklistId) return;
    try {
      await createChecklistItem(checklistId, newItemText);
      await refreshData();
      setNewItemText('');
      showNotification('success', 'Item baru berhasil ditambahkan.');
    } catch {
      showNotification('error', 'Tidak dapat menambahkan item baru.');
    }
  };

  const handleToggleStatus = async (itemId: number) => {
    if (!checklistId) return;
    await updateChecklistItemStatus(checklistId, itemId);
    await refreshData();
  };

  const handleDeleteClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setIsAlertOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!checklistId || !selectedItemId) return;
    try {
      await deleteChecklistItem(checklistId, selectedItemId);
      await refreshData();
      showNotification('success', 'Item telah berhasil dihapus.');
    } catch (error) {
      showNotification('error', 'Item tidak dapat dihapus.');
    } finally {
      setIsAlertOpen(false);
    }
  };

  if (loading) return <p className='text-center'>Loading...</p>;
  if (!checklist)
    return <p className='text-center'>Checklist tidak ditemukan.</p>;

  return (
    <>
      <div className='w-full max-w-2xl mx-auto space-y-6'>
        <Button variant='outline' asChild>
          <Link href='/dashboard'>&larr; Kembali ke Dashboard</Link>
        </Button>

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
            <AlertTitle>
              {notification.type === 'success' ? 'Berhasil!' : 'Gagal!'}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className='text-3xl'>{checklist.name}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <form onSubmit={handleAddItem} className='flex gap-2'>
              <Input
                type='text'
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder='Tambah item baru...'
              />
              <Button type='submit'>Tambah</Button>
            </form>
            <div className='space-y-3'>
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center p-3 bg-muted rounded-lg'
                  >
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.itemCompletionStatus}
                      onCheckedChange={() => handleToggleStatus(item.id)}
                      className='mr-3'
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={`flex-grow text-sm font-medium ${
                        item.itemCompletionStatus
                          ? 'line-through text-muted-foreground'
                          : ''
                      }`}
                    >
                      {item.name}
                    </label>
                    <Button
                      onClick={() => handleDeleteClick(item.id)}
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))
              ) : (
                <p className='text-muted-foreground text-center'>
                  Belum ada item.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin ingin menghapus item ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan dan akan menghapus item secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
