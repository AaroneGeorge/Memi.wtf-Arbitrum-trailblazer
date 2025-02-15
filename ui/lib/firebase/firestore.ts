import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { app } from './firebase';
import constants from '../constants';

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
      // Convert the map back to arrays when retrieving
      const data = doc.data();
      if (data.data) {
        Object.keys(data.data).forEach(key => {
          if (typeof data.data[key] === 'object' && !Array.isArray(data.data[key])) {
            data.data[key] = Object.values(data.data[key]);
          }
        });
      }
      documents.push({
        id: doc.id,
        ...data
      });
    });
    return documents;
  } catch (error) {
    console.error("Error listing documents:", error);
    throw error;
  }
}; 