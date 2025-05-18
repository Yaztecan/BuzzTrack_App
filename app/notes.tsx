import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';

import { createNote, fetchNotes, deleteNote, pinNote, updateNote, Note } from '../firebase/notes';
import { auth } from '../firebase/firebase';

export default function NotesScreen() {
  const user = auth.currentUser;
  const userId = user?.uid || '';

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // For new note
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hiveId, setHiveId] = useState('');

  // For viewing/editing note
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const loadNotes = async () => {
      setLoading(true);
      try {
        const data = await fetchNotes(userId);
        const sorted = data.sort((a, b) => {
          if (!a.hiveId && b.hiveId) return -1;
          if (a.hiveId && !b.hiveId) return 1;
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          const ad = a.date?.seconds || 0;
          const bd = b.date?.seconds || 0;
          return bd - ad;
        });
        setNotes(sorted);
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [userId]);

  const handleCreateNote = async () => {
    if (!title.trim()) return; // Ensure title is not empty
    try {
      await createNote(userId, { title, content, hiveId });
      const data = await fetchNotes(userId);
      setNotes(data);
      setShowModal(false);
      resetNoteState(); // Reset state after creating the note
    } catch (err) {
      console.error('Error creating note:', err);
    }
  };

  const handleNotePress = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title); // Pre-fill title
    setContent(note.content); // Pre-fill content
    setHiveId(note.hiveId || ''); // Pre-fill hiveId (if it exists)
    setShowPreviewModal(true); // Open the preview interface
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(userId, noteId);
      const updated = notes.filter((n) => n.id !== noteId);
      setNotes(updated);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handlePin = async (noteId: string, pinned: boolean) => {
    try {
      await pinNote(userId, noteId, pinned);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, pinned } : n
        )
      );
    } catch (err) {
      console.error('Error pinning note:', err);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    try {
      await updateNote(userId, selectedNote.id!, { title, content, hiveId });
      const data = await fetchNotes(userId);
      setNotes(data);
      setEditMode(false);
      setSelectedNote(null);
      setShowViewModal(false);
      setTitle('');
      setContent('');
      setHiveId('');
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const resetNoteState = () => {
    setTitle('');
    setContent('');
    setHiveId('');
    setSelectedNote(null);
    setEditMode(false);
  };

  const renderItem = (data: { item: Note }) => {
    const note = data.item;
    const dateStr = note.date
      ? new Date(note.date.seconds * 1000).toLocaleDateString()
      : 'N/A';
  
    return (
      <Pressable onPress={() => handleNotePress(note)}>
        <View style={styles.frontItem}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.noteDate}>{dateStr}</Text>
          {note.hiveId && <Text style={styles.hiveId}>Hive: {note.hiveId}</Text>}
          {note.pinned && (
            <View style={styles.pinIconContainer}>
              <Text style={styles.pinned}>📌</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderHiddenItem = (
    data: { item: Note },
    rowMap: { [key: string]: any }
  ) => {
    const note = data.item;

    const onPin = () => {
      handlePin(note.id!, !note.pinned);
      rowMap[note.id!]?.closeRow();
    };

    const onDelete = () => {
      handleDelete(note.id!);
      rowMap[note.id!]?.closeRow();
    };
    

    return (
      <View style={styles.rowBack}>
        <Pressable
          style={[styles.actionBtn, styles.pinBtn]}
          onPress={onPin}
        >
          <Ionicons name="pin" size={24} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={onDelete}
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>     
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Your Notes</Text>
      </View>
      <SwipeListView
        data={notes}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
        renderHiddenItem={(data, rowMap) => renderHiddenItem(data, rowMap)}
        leftOpenValue={75}
        rightOpenValue={-75}
        disableLeftSwipe={false}
        disableRightSwipe={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      />

<Pressable
  style={styles.fab}
  onPress={() => {
    resetNoteState();
    setShowModal(true);
  }}
>
  <Ionicons name="add" size={24} color="#fff" />
</Pressable>

<Modal
  visible={showModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowModal(false)}
>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.modalBackdrop}
  >
    <ScrollView contentContainerStyle={styles.modalScrollContainer}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Create Note</Text>
         {/* TITLE INPUT */}
         <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#8A8A8A"
            value={title}
            onChangeText={setTitle}
            // iOS suggestion + auto-correct
            autoCorrect={true}               
            autoCapitalize="sentences"       
            textContentType="none"           
            autoComplete="off"               
            keyboardType="default"           
          />

          {/* CONTENT INPUT (MULTILINE) */}
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Content"
            placeholderTextColor="#8A8A8A"
            value={content}
            onChangeText={setContent}
            multiline
            autoCorrect={true}               
            autoCapitalize="sentences"       
            textContentType="none"           
            autoComplete="off"
            keyboardType="default"
          />

          {/* HIVE ID INPUT */}
          <TextInput
            style={styles.input}
            placeholder="Hive ID (optional)"
            placeholderTextColor="#8A8A8A"
            value={hiveId}
            onChangeText={setHiveId}          
            autoCorrect={false}              
            autoCapitalize="none"
            textContentType="none"
            autoComplete="off"
            keyboardType="default"
          />
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.cancelBtn]}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.saveBtn]}
            onPress={handleCreateNote}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</Modal>

<Modal
  visible={showPreviewModal}
  transparent
  animationType="fade"
  onRequestClose={() => {
    setShowPreviewModal(false);
    setEditMode(false);
  }}
>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.modalBackdrop}
  >
    <ScrollView contentContainerStyle={styles.modalScrollContainer}>
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => setShowPreviewModal(false)}>
            <Ionicons name="arrow-back" size={24} color="#5c3d2b" />
          </Pressable>
          <Text style={styles.modalTitle}>{editMode ? 'Edit Note' : 'View Note'}</Text>
          {!editMode && (
            <Pressable onPress={() => setEditMode(true)}>
              <Ionicons name="pencil" size={24} color="#5c3d2b" />
            </Pressable>
          )}
        </View>
        {editMode ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Content"
              value={content}
              onChangeText={setContent}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Hive ID"
              value={hiveId}
              onChangeText={setHiveId}
            />
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelBtn]}
                onPress={() => {
                  setEditMode(false);
                  setShowPreviewModal(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveBtn]}
                onPress={handleUpdateNote}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.noteTitle}>{selectedNote?.title}</Text>
            <Text style={styles.noteDate}>
              {selectedNote?.date ? new Date(selectedNote.date.seconds * 1000).toLocaleDateString() : 'N/A'}
            </Text>
            {selectedNote?.hiveId && <Text style={styles.hiveId}>Hive: {selectedNote.hiveId}</Text>}
            <Text style={styles.noteContent}>{selectedNote?.content}</Text>
          </>
        )}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</Modal>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5A124',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5A124',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#5c3d2b',
  },
  headerContainer: {
    paddingTop: 60, 
    paddingBottom: 10,
    backgroundColor: '#F5A124', 
    alignItems:'flex-start',
    justifyContent: 'center',
  },
  frontItem: {
    backgroundColor: '#F5CB24',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#5c3d2b',
  },
  noteDate: {
    fontSize: 12,
    color: '#5c3d2b',
    marginBottom: 4,
  },
  hiveId: {
    fontSize: 12,
    color: '#5c3d2b',
  },
  pinIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  contentInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pinned: {
    fontSize: 16,
    color: '#F5A124',
    fontWeight: '600',
    marginTop: 4,
  },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBtn: {
    backgroundColor: '#6867AC',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingRight: 120,
  },
  deleteBtn: {
    backgroundColor: '#D11A2A',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 120,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5c3d2b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FDF4D2',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelBtn: {
    backgroundColor: '#ccc',
  },
  saveBtn: {
    backgroundColor: '#5c3d2b',
  },
  buttonText: {
    color: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
});