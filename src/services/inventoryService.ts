import { v4 as uuidv4 } from 'uuid';
import type { InventoryItem, CreateInventoryItem, UpdateInventoryItem } from '../types/inventory';

// Simple in-memory storage for prototyping
let inventoryDB: InventoryItem[] = [];
let isInitialized = false;

// Helper function to save to localStorage
const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('inventoryDB', JSON.stringify(inventoryDB));
  }
};

// Helper function to load from localStorage (with caching)
const loadFromStorage = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    const savedData = localStorage.getItem('inventoryDB');
    if (savedData) {
      try {
        inventoryDB = JSON.parse(savedData);
        isInitialized = true;
      } catch (error) {
        console.error('Failed to parse inventory data from localStorage', error);
        inventoryDB = [];
      }
    }
  }
};

// Load from localStorage on service initialization
loadFromStorage();

// CRUD Operations
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  // Only load from storage if not already initialized
  if (!isInitialized) {
    loadFromStorage();
  }
  await delay(300); // Simulate network delay
  return [...inventoryDB];
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getInventoryItem = async (id: string): Promise<InventoryItem | undefined> => {
  await delay(200);
  return inventoryDB.find(item => item.id === id);
};

export const createInventoryItem = async (data: CreateInventoryItem): Promise<InventoryItem> => {
  await delay(400);
  const now = new Date().toISOString();
  const newItem: InventoryItem = {
    ...data,
    id: uuidv4(),
    stock: data.stock || 0,
    minStockLevel: data.minStockLevel || 0,
    createdAt: now,
    updatedAt: now,
  };
  
  inventoryDB.push(newItem);
  saveToStorage();
  return newItem;
};

export const updateInventoryItem = async (
  id: string, 
  data: UpdateInventoryItem
): Promise<InventoryItem | undefined> => {
  await delay(400);
  const index = inventoryDB.findIndex(item => item.id === id);
  
  if (index === -1) return undefined;
  
  const updatedItem = {
    ...inventoryDB[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  inventoryDB[index] = updatedItem;
  saveToStorage();
  return updatedItem;
};

export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  await delay(300);
  const initialLength = inventoryDB.length;
  inventoryDB = inventoryDB.filter(item => item.id !== id);
  const wasDeleted = inventoryDB.length < initialLength;
  
  if (wasDeleted) {
    saveToStorage();
  }
  
  return wasDeleted;
};

export const searchInventoryItems = async (query: string): Promise<InventoryItem[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return inventoryDB.filter(
    item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.barcode?.toLowerCase().includes(lowerQuery)
  );
};

export const checkLowStockItems = async (): Promise<InventoryItem[]> => {
  await delay(200);
  return inventoryDB.filter(item => item.stock <= item.minStockLevel);
};
