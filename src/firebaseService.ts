import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import { DonationItem, ChildNeed, AuditLog } from "./types";
import { INITIAL_DONATIONS, INITIAL_NEEDS, INITIAL_LOGS } from "./data";

// Collection Names
const DONATIONS_COL = "donations";
const NEEDS_COL = "needs";
const LOGS_COL = "logs";

// Helper to seed database if empty
export async function seedDatabaseIfEmpty() {
  try {
    // Check Donations
    const donationsSnapshot = await getDocs(collection(db, DONATIONS_COL));
    if (donationsSnapshot.empty) {
      console.log("Seeding initial donations into Firestore...");
      for (const item of INITIAL_DONATIONS) {
        // Use custom id as document key
        const docId = item.id.replace("#", "REG-");
        await setDoc(doc(db, DONATIONS_COL, docId), item);
      }
    }

    // Check Needs
    const needsSnapshot = await getDocs(collection(db, NEEDS_COL));
    if (needsSnapshot.empty) {
      console.log("Seeding initial needs into Firestore...");
      for (const need of INITIAL_NEEDS) {
        const docId = need.id.replace("#", "NEED-");
        await setDoc(doc(db, NEEDS_COL, docId), need);
      }
    }

    // Check Logs
    const logsSnapshot = await getDocs(collection(db, LOGS_COL));
    if (logsSnapshot.empty) {
      console.log("Seeding initial logs into Firestore...");
      for (const log of INITIAL_LOGS) {
        await setDoc(doc(db, LOGS_COL, log.id), log);
      }
    }
  } catch (error) {
    console.error("Error during Firestore seeding:", error);
  }
}

// Fetch all donations from Firestore
export async function fetchDonations(): Promise<DonationItem[]> {
  try {
    await seedDatabaseIfEmpty();
    const snapshot = await getDocs(collection(db, DONATIONS_COL));
    const items: DonationItem[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as DonationItem);
    });
    return items;
  } catch (error) {
    console.error("Error fetching donations from Firestore, falling back to local:", error);
    return INITIAL_DONATIONS;
  }
}

// Fetch all needs from Firestore
export async function fetchNeeds(): Promise<ChildNeed[]> {
  try {
    const snapshot = await getDocs(collection(db, NEEDS_COL));
    const items: ChildNeed[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as ChildNeed);
    });
    // Order needs by ID or priority
    return items;
  } catch (error) {
    console.error("Error fetching needs from Firestore, falling back to local:", error);
    return INITIAL_NEEDS;
  }
}

// Fetch all logs from Firestore
export async function fetchLogs(): Promise<AuditLog[]> {
  try {
    const snapshot = await getDocs(collection(db, LOGS_COL));
    const items: AuditLog[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as AuditLog);
    });
    // Sort logs descending by timestamp if possible, otherwise keep order
    return items;
  } catch (error) {
    console.error("Error fetching logs from Firestore, falling back to local:", error);
    return INITIAL_LOGS;
  }
}

// Add a donation item to Firestore
export async function saveDonationItem(item: DonationItem): Promise<void> {
  try {
    const docId = item.id.replace("#", "REG-");
    await setDoc(doc(db, DONATIONS_COL, docId), item);
  } catch (error) {
    console.error("Error saving donation item to Firestore:", error);
    throw error;
  }
}

// Save or Update a child need in Firestore
export async function saveNeedItem(need: ChildNeed): Promise<void> {
  try {
    const docId = need.id.replace("#", "NEED-");
    await setDoc(doc(db, NEEDS_COL, docId), need);
  } catch (error) {
    console.error("Error saving need item to Firestore:", error);
    throw error;
  }
}

// Save an Audit Log to Firestore
export async function saveAuditLog(log: AuditLog): Promise<void> {
  try {
    await setDoc(doc(db, LOGS_COL, log.id), log);
  } catch (error) {
    console.error("Error saving audit log to Firestore:", error);
    throw error;
  }
}
