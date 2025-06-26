// firebase/hives.ts

import { 
  collection, 
  addDoc, 
  getDocs, 
  orderBy, 
  query, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// We'll re-export addHive under the alias createHive
export { addHive as createHive };

// Hive interface
export interface Hive {
  id?: string;
  name: string;
  location?: string;
  systemId?: string;
  createdAt?: Timestamp;
  latestStats?: {
    weight?: number;
    temperature?: number;
    humidity?: number;
    timestamp?: Timestamp;
  };
}

// Single measurement doc in the subcollection
export interface StatData {
  weight?: number;
  temperature?: number;
  humidity?: number;
  timestamp: Timestamp;
}

// 1) Add a new Hive
export async function addHive(userId: string, hive: Hive): Promise<void> {
  const userHivesRef = collection(db, 'users', userId, 'hives');
  await addDoc(userHivesRef, {
    ...hive,
    createdAt: Timestamp.now(),
  });
}

// 2) Fetch all Hives, merging their latest measurement from subcollection
export async function fetchHives(userId: string): Promise<Hive[]> {
  // Query top-level hives
  const hivesRef = collection(db, 'users', userId, 'hives');
  const hivesSnap = await getDocs(hivesRef);

  const allHives: Hive[] = [];

  // For each Hive doc, find the newest subcollection doc in /stats
  for (const hiveDoc of hivesSnap.docs) {
    const hiveData = hiveDoc.data() as Omit<Hive, 'id'>;
    const hiveId = hiveDoc.id;

    // Query subcollection /stats -> newest doc
    const statsRef = collection(db, 'users', userId, 'hives', hiveId, 'stats');
    const statsQuery = query(statsRef, orderBy('timestamp', 'desc'), limit(1));
    const statsSnap = await getDocs(statsQuery);

    let latestStats;
    if (!statsSnap.empty) {
      latestStats = statsSnap.docs[0].data();
    }

    allHives.push({
      id: hiveId,
      ...hiveData,
      latestStats,
    });
  }

  return allHives;
}

// 3) Fetch *all* stats for a single Hive (if you need them for charts)
export async function fetchHiveStats(userId: string, hiveId: string): Promise<StatData[]> {
  const statsRef = collection(db, 'users', userId, 'hives', hiveId, 'stats');
  const q = query(statsRef, orderBy('timestamp')); // oldest→newest
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as StatData);
}
