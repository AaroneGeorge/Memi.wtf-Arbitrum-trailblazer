import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { app } from './firebase';
import constants from '../constants';
import type { Agent } from '@/app/types';

// Initialize Firestore
const db = getFirestore(app);

// Helper function to convert arrays to Firestore-compatible format
const convertArraysToMaps = (data: any) => {
  const converted = { ...data };

  // Convert arrays to objects with numeric keys
  Object.keys(converted).forEach(key => {
    if (Array.isArray(converted[key])) {
      // Special handling for messageExamples
      if (key === 'messageExamples' && converted[key].length > 0) {
        converted[key] = converted[key].reduce((acc: any, example: any, i: number) => {
          acc[i] = example.reduce((msgAcc: any, msg: any, j: number) => {
            msgAcc[j] = msg;
            return msgAcc;
          }, {});
          return acc;
        }, {});
      } else {
        // For other arrays, convert to simple object
        converted[key] = converted[key].reduce((acc: any, item: any, index: number) => {
          acc[index] = item;
          return acc;
        }, {});
      }
    }
  });

  // Handle image field - extract filename or last part of path
  if (converted.image) {
    const imagePath = converted.image.split('/').pop(); // Get the last part of the path
    converted.image = imagePath || converted.image;
  }

  return converted;
};

// Create a new document in a collection
export const createAgent = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const firestoreData = convertArraysToMaps(data);
    await setDoc(docRef, {
      data: firestoreData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docId;
  } catch (error) {
    console.error("Error creating agent:", error);
    throw error;
  }
};

// Update an existing document
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const firestoreData = convertArraysToMaps(data);
    await updateDoc(docRef, {
      data: firestoreData,
      updatedAt: new Date().toISOString()
    });
    return docId;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return docId;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

// List all documents in a collection
export const listDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Convert the nested data structure and handle arrays
      const processedData = data.data ? Object.entries(data.data).reduce((acc: any, [key, value]) => {
        // Convert object-like arrays back to actual arrays
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (Object.keys(value).every(k => !isNaN(Number(k)))) {
            acc[key] = Object.values(value);
          } else {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
        return acc;
      }, {}) : {};

      documents.push({
        id: doc.id,
        ...processedData,
        createdAt: data.createdAt
      });
    });
    return documents;
  } catch (error) {
    console.error("Error listing documents:", error);
    throw error;
  }
};

// Update the getAgentDetails function
export const getAgentDetails = async (agentProfileId: string): Promise<Agent | null> => {
  try {
    const agentsRef = collection(db, constants.AGENTS_COLLECTION);
    const q = query(agentsRef, where("data.agentProfileId", "==", agentProfileId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();

      // Process the nested data structure
      const processedData = data.data ? Object.entries(data.data).reduce((acc: any, [key, value]) => {
        // Handle arrays and array-like objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Check if it's an array-like object (has numeric keys)
          if (Object.keys(value).every(k => !isNaN(Number(k)))) {
            acc[key] = Object.values(value);
          } else if (key === 'clients' || key === 'plugins') {
            // Special handling for clients and plugins arrays
            acc[key] = Object.values(value);
          } else if (key === 'secrets') {
            // Keep secrets as an object
            acc[key] = value;
          } else {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
        return acc;
      }, {}) : {};

      // Ensure the returned data matches the Agent interface
      const agent: Agent = {
        name: processedData.name || '',
        ticker: processedData.ticker || '',
        bio: Array.isArray(processedData.bio) ? processedData.bio : [],
        lore: Array.isArray(processedData.lore) ? processedData.lore : [],
        knowledge: Array.isArray(processedData.knowledge) ? processedData.knowledge : [],
        messageExamples: Array.isArray(processedData.messageExamples) ? processedData.messageExamples : [],
        topics: Array.isArray(processedData.topics) ? processedData.topics : [],
        adjectives: Array.isArray(processedData.adjectives) ? processedData.adjectives : [],
        twitter: processedData.twitter || '',
        profileImage: processedData.profileImage || '',
        owner: processedData.owner || '',
        agentId: processedData.agentId || '',
        agentProfileId: agentProfileId,
        createdAt: data.createdAt || new Date().toISOString(),
        // Add these fields
        clients: Array.isArray(processedData.clients) ? processedData.clients : [],
        secrets: processedData.secrets || {},
        plugins: Array.isArray(processedData.plugins) ? processedData.plugins : []
      };

      console.log("Processed agent data:", agent); // Debug log
      return agent;
    }
    return null;
  } catch (error) {
    console.error("Error fetching agent details:", error);
    throw error;
  }
};

// New interface for UserProfile
export interface UserProfile {
  username: string;
  wallet_address: string;
  network?: string;
  favourite_agents?: string[];
  created_date?: string;
}

// Create or update a user profile
export const createOrUpdateUserProfile = async (wallet_address: string, userData: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, constants.USERS_COLLECTION || 'users', wallet_address);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        wallet_address,
        ...userData,
        created_date: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return wallet_address;
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw error;
  }
};

// Get a user profile by wallet address
export const getUserProfile = async (wallet_address: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, constants.USERS_COLLECTION || 'users', wallet_address);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Get multiple user profiles by wallet addresses
export const getUserProfiles = async (wallet_addresses: string[]): Promise<Record<string, UserProfile>> => {
  try {
    const result: Record<string, UserProfile> = {};
    
    // Use Promise.all to fetch all profiles in parallel
    await Promise.all(
      wallet_addresses.map(async (address) => {
        const profile = await getUserProfile(address);
        if (profile) {
          result[address] = profile;
        }
      })
    );
    
    return result;
  } catch (error) {
    console.error("Error fetching multiple user profiles:", error);
    throw error;
  }
}; 