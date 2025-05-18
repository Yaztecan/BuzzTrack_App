import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { auth } from '../firebase/firebase';
import { fetchHives, createHive, Hive } from '../firebase/hives';

export default function HivesScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const userId = user?.uid || '';

  const [hives, setHives] = useState<Hive[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [systemId, setSystemId] = useState('');

  const loadHives = async () => {
    if (!userId) return;
    const data = await fetchHives(userId);
    setHives(data);
  };

  useEffect(() => {
    loadHives();
  }, [userId]);

  const handleCreate = async () => {
    if (!name.trim() || !systemId.trim()) return;
    await createHive(userId, { name, systemId });
    setName('');
    setSystemId('');
    setShowModal(false);
    loadHives();
  };

  const renderItem = ({ item }: { item: Hive }) => (
    <Pressable
      style={styles.hiveCard}
      onPress={() => router.push({ pathname: '/hivedetail', params: { hiveId: item.id } })}
    >
      <View style={styles.cardRow}>
        {/* Left side: Hive name & location */}
        <View style={styles.leftColumn}>
          <Text style={styles.hiveName}>{item.name}</Text>
          <Text style={styles.hiveLocation}>{item.location || 'No location set'}</Text>
        </View>
  
        {/* Right side: Stats */}
        <View style={styles.rightColumn}>
          <Text style={styles.reading}>Temp: {item.latestStats?.temperature ?? '--'}°C</Text>
          <Text style={styles.reading}>Humidity: {item.latestStats?.humidity ?? '--'}%</Text>
          <Text style={styles.reading}>Weight: {item.latestStats?.weight ?? '--'} kg</Text>
        </View>
      </View>
    </Pressable>
  );
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
              <Text style={styles.header}>Your Hives</Text>
            </View>
      <FlatList
        data={hives}
        keyExtractor={(item) => item.id!}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 0 }}
      />

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>

      {/* Modal to add new hive */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Hive</Text>
            <TextInput
              style={styles.input}
              placeholder="Hive Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="System ID"
              value={systemId}
              onChangeText={setSystemId}
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
                onPress={handleCreate}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({  
  headerContainer: {
    paddingTop: 60, 
    paddingBottom: 10,
    backgroundColor: '#F5A124', 
    alignItems:'flex-start',
    justifyContent: 'center',
  },container: {
    flex: 1,
    backgroundColor: '#F5A124',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#5c3d2b',
  },
  hiveCard: {
    backgroundColor: '#F5CB24',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  leftColumn: {
    flex: 1, // or optional sizing
  },
  
  rightColumn: {
    alignItems: 'flex-end',
    // or marginLeft: 20 if you want a bigger gap
  },
  
  hiveName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5c3d2b',
    marginBottom: 4,
  },
  
  hiveLocation: {
    fontSize: 14,
    color: '#5c3d2b',
  },
  
  reading: {
    fontSize: 14,
    color: '#5c3d2b',
    marginBottom: 4,
  },
  readingsRow: {
    marginTop: 8,
    // any other spacing or flex logic
  },
  hiveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5c3d2b',
  },
  hiveSub: {
    fontSize: 14,
    color: '#5c3d2b',
    marginBottom: 8,
  },
  statsContainer: {
    marginTop: 8,
  },
  stat: {
    fontSize: 14,
    color: '#5c3d2b',
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
    color: '#5c3d2b',
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
});
