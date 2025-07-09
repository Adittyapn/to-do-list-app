import api from './api';
import type { Checklist, ChecklistItem } from './types';

export const getChecklists = async (): Promise<Checklist[]> => {
  try {
    const response = await api.get('/checklist');
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Gagal mengambil semua checklists:', error);
    return [];
  }
};

export const createChecklist = async (name: string): Promise<void> => {
  try {
    await api.post('/checklist', { name });
  } catch (error) {
    console.error('❌ Gagal membuat checklist:', error);
    throw error;
  }
};

export const deleteChecklistSafely = async (
  checklistId: number
): Promise<void> => {
  try {
    const items = await getChecklistItems(checklistId);

    for (const item of items) {
      await deleteChecklistItem(checklistId, item.id);
    }

    await api.delete(`/checklist/${checklistId}`);
  } catch (error) {
    console.error(
      `❌ Gagal menghapus checklist ${checklistId} secara aman:`,
      error
    );
    throw new Error('Terjadi kesalahan saat menghapus checklist dan isinya.');
  }
};

export const getChecklistItems = async (
  checklistId: number
): Promise<ChecklistItem[]> => {
  try {
    const response = await api.get(`/checklist/${checklistId}/item`);
    return response.data.data || [];
  } catch (error) {
    console.error(
      `❌ Gagal mengambil item untuk checklist ID ${checklistId}:`,
      error
    );
    return [];
  }
};

export const createChecklistItem = async (
  checklistId: number,
  itemName: string
): Promise<void> => {
  try {
    await api.post(`/checklist/${checklistId}/item`, { itemName });
  } catch (error) {
    console.error('❌ Gagal membuat item baru:', error);
    throw error;
  }
};

export const updateChecklistItemStatus = async (
  checklistId: number,
  itemId: number
): Promise<void> => {
  try {
    await api.put(`/checklist/${checklistId}/item/${itemId}`);
  } catch (error) {
    console.error(`❌ Gagal mengubah status item ID ${itemId}:`, error);
    throw error;
  }
};

export const deleteChecklistItem = async (
  checklistId: number,
  itemId: number
): Promise<void> => {
  try {
    await api.delete(`/checklist/${checklistId}/item/${itemId}`);
  } catch (error: any) {
    console.error(`❌ Gagal menghapus item ID ${itemId}:`, error);
    throw error;
  }
};
