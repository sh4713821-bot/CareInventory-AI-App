import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import { DonationItem, ChildNeed, AuditLog, Role, InventoryStockItem } from "./types";
import { INITIAL_DONATIONS, INITIAL_NEEDS, INITIAL_LOGS } from "./data";

// Collection Names
const DONATIONS_COL = "donations";
const NEEDS_COL = "needs";
const LOGS_COL = "logs";
const USERS_COL = "users";
const STOCK_COL = "inventory_stock";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const INITIAL_STOCK: InventoryStockItem[] = [
  {
    id: 'thermal-blankets-winter-jackets-pack',
    name: 'Thermal Blankets & Winter Jackets Pack',
    category: 'Clothing',
    qty: 15,
    unit: 'Packs'
  },
  {
    id: 'baby-formula-stage-1',
    name: 'Baby Formula (Stage 1)',
    category: 'Medical & Nutrition',
    qty: 240,
    unit: 'Units'
  },
  {
    id: 'uht-whole-milk-1l',
    name: 'UHT Whole Milk (1L)',
    category: 'Food',
    qty: 48,
    unit: 'Units'
  },
  {
    id: 'hygiene-kits-type-a',
    name: 'Hygiene Kits (Type A)',
    category: 'Hygiene',
    qty: 156,
    unit: 'Units'
  },
  {
    id: 'rice-5kg-sacks',
    name: 'Rice (5kg Sacks)',
    category: 'Food',
    qty: 85,
    unit: 'Units'
  }
];

export interface DatabaseUser {
  email: string;
  name: string;
  role: Role;
  title: string;
  avatar: string;
  password?: string;
}

const INITIAL_USERS: DatabaseUser[] = [
  {
    email: "manager@ngo.org",
    name: "Sarah Jenkins",
    role: "supervisor",
    title: "Inventory Lead",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHkzZKNH2tP5f7-2AnyIjzV7HfdqStZHIimCMF1mjAVu9oaGSBEHVH3oWCv7nR2eASJpk6PF9Msa_mxxB3ZP-PcjCMxF-23_pIHkxym-xhZM3mskCNyfklBkFUXimeH2o0Ypjyfhed1VfRyD__-EvV9O2JeAeYwnrtyV7vI40_nZJGCi8RxRW2KAFdhZ-vt_HsSmRsxYoaECmtIerSsau8v8J5PeqtwxLqfho1Ith5-6uXwkeYS55rHatUT7uaeHgJ_qZpeyMrg_Jo",
    password: "password123"
  },
  {
    email: "field.staff@ngo.org",
    name: "Sarah Mitchell",
    role: "staff",
    title: "Field Manager",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHY3xmdKvR7x4vWRwU2kvi9D9meFjUDlkniKMKq7Vf4-HNrMkzOKRY68gH986QIzcxLvYh5VfmSTPZ1v80pfR8JjzwpMhS8hE22oFRPSaoZiIVluVNfd_off3AYrwAiZ7wUP4T5l6jdVhHI1hBYw4OP1Cv6tk1gtJcACa4yKUqDB-ZEJZ01emjUc6bEfB_coGOV-M-RCrSz3IIJL49klJtAjku3jxYFF2M3cw_YqDipl5oS-DObMT9jwVThToydgdeps_q6E_Xim8_",
    password: "password123"
  },
  {
    email: "donor@care.org",
    name: "Alexander Reed",
    role: "donor",
    title: "Community Donor",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBClIYQ5HryYAOBT_L-Pr5ljQqT2p_F3XtgVb6g_r-ddSRGsVEyLtmxnpqCvVwHs0j_ubZrxKQgRL6R6lB4oFJmOdvf7KZ845Wd_NtvPY_EI_MPgd_n52TuaQ3TFQkgTWf9QjGWBarmgN39M83jj8VSjtLtVEyc4_JZzEZZOEqQL2hitCqAc0ykLgAG0yjuZAcRg6RtAaMyrfACaB-EM7g6074NZDdF31m20hFKejK797zX7pgeHH76v0WghI1qR38czH_AxiRIDevk",
    password: "password123"
  }
];

// Helper to seed database if empty
export async function seedDatabaseIfEmpty() {
  try {
    // Check Users
    const usersSnapshot = await getDocs(collection(db, USERS_COL));
    if (usersSnapshot.empty) {
      console.log("Seeding initial users into Firestore...");
      for (const user of INITIAL_USERS) {
        const docId = user.email.toLowerCase().trim();
        await setDoc(doc(db, USERS_COL, docId), user);
      }
    }

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

    // Check Inventory Stock
    const stockSnapshot = await getDocs(collection(db, STOCK_COL));
    if (stockSnapshot.empty) {
      console.log("Seeding initial inventory stock into Firestore...");
      for (const stockItem of INITIAL_STOCK) {
        await setDoc(doc(db, STOCK_COL, stockItem.id), stockItem);
      }
    }
  } catch (error) {
    console.error("Error during Firestore seeding:", error);
  }
}

// Fetch all inventory stock from Firestore
export async function fetchInventoryStock(): Promise<InventoryStockItem[]> {
  try {
    await seedDatabaseIfEmpty();
    const snapshot = await getDocs(collection(db, STOCK_COL));
    const items: InventoryStockItem[] = [];
    snapshot.forEach((doc) => {
      items.push(doc.data() as InventoryStockItem);
    });
    return items;
  } catch (error) {
    console.error("Error fetching inventory stock from Firestore, falling back to local:", error);
    return INITIAL_STOCK;
  }
}

// Save or Update an inventory stock item in Firestore
export async function saveInventoryStockItem(item: InventoryStockItem): Promise<void> {
  try {
    await setDoc(doc(db, STOCK_COL, item.id), item);
    
    // TRIGGER: The exact millisecond any item's stock quantity hits 0, trigger an email notification sequence.
    if (item.qty === 0) {
      console.log(`[ALERT] Inventory item ${item.name} has hit 0! Triggering out-of-stock notification to manager.`);
      try {
        const mailCol = collection(db, "mail");
        await addDoc(mailCol, {
          to: "manager@ngo.org",
          message: {
            subject: `[CRITICAL OUT OF STOCK] Alert for Item: ${item.name}`,
            text: `Dear Manager, the item '${item.name}' (Category: ${item.category}) has reached 0 units. The system has automatically pushed it to the Urgent Needs view.`
          },
          createdAt: new Date().toISOString()
        });
        console.log(`[ALERT SUCCESS] Out-of-stock mail document written to Firestore 'mail' collection.`);
      } catch (mailError) {
        console.error("Failed to write to 'mail' collection for Firebase Trigger Email Extension:", mailError);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STOCK_COL}/${item.id}`);
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

// Update a donation tracking status via updateDoc
export async function updateDonationStatus(itemId: string, status: 'Pending' | 'Received' | 'Sorted' | 'Dispatched'): Promise<void> {
  try {
    const docId = itemId.replace("#", "REG-");
    const docRef = doc(db, DONATIONS_COL, docId);
    await updateDoc(docRef, { trackingStatus: status });
    console.log(`[FIRESTORE] Hard updateDoc successful for ${itemId} status -> ${status}`);
  } catch (error) {
    console.error(`Error updating tracking status via updateDoc for ${itemId}:`, error);
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

// Fetch a user by email from Firestore (checks/seeds first to ensure users are initialized)
export async function fetchUserByEmail(email: string): Promise<DatabaseUser | null> {
  try {
    await seedDatabaseIfEmpty();
    const docId = email.toLowerCase().trim();
    const docRef = doc(db, USERS_COL, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DatabaseUser;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user from Firestore:", error);
    throw error;
  }
}

// Register a new user in Firestore
export async function registerUser(user: DatabaseUser): Promise<void> {
  try {
    await seedDatabaseIfEmpty();
    const docId = user.email.toLowerCase().trim();
    const docRef = doc(db, USERS_COL, docId);
    await setDoc(docRef, user);
  } catch (error) {
    console.error("Error registering user in Firestore:", error);
    throw error;
  }
}

