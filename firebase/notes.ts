import { db } from './firebase'; // Adjust based on your Firebase setup
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';

export interface Note {
  id?: string;
  title: string;
  content: string;
  hiveId?: string;
  pinned?: boolean;
  date?: { seconds: number };
}

/**
 * Creates a new note in Firestore.
 */
export const createNote = async (userId: string, noteData: Omit<Note, 'id'>) => {
  try {
    const notesRef = collection(db, 'users', userId, 'notes');
    const docRef = await addDoc(notesRef, { ...noteData, date: new Date() });
    return docRef.id;
  } catch (err) {
    console.error('Error creating note:', err);
    throw err;
  }
};

/**
 * Fetches all notes for a user from Firestore.
 */
export const fetchNotes = async (userId: string) => {
  try {
    const notesRef = collection(db, 'users', userId, 'notes');
    const snapshot = await getDocs(notesRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Note));
  } catch (err) {
    console.error('Error fetching notes:', err);
    throw err;
  }
};

/**
 * Deletes a note from Firestore.
 */
export const deleteNote = async (userId: string, noteId: string) => {
  try {
    const noteRef = doc(db, 'users', userId, 'notes', noteId);
    await deleteDoc(noteRef);
  } catch (err) {
    console.error('Error deleting note:', err);
    throw err;
  }
};

/**
 * Pins or unpins a note in Firestore.
 */
export const pinNote = async (userId: string, noteId: string, pinned: boolean) => {
  try {
    const noteRef = doc(db, 'users', userId, 'notes', noteId);
    await updateDoc(noteRef, { pinned });
  } catch (err) {
    console.error('Error pinning note:', err);
    throw err;
  }
};

/**
 * Updates an existing note in Firestore.
 */
export const updateNote = async (userId: string, noteId: string, noteData: Partial<Note>) => {
  try {
    const noteRef = doc(db, 'users', userId, 'notes', noteId);
    await updateDoc(noteRef, noteData);
  } catch (err) {
    console.error('Error updating note:', err);
    throw err;
  }
};

