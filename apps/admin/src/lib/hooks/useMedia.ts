'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@danligairi1978/shared';
import { MediaAsset } from '@danligairi1978/shared';

export function useMedia() {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'media'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as MediaAsset[];
            setAssets(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching media assets:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const uploadFile = async (file: File) => {
        setUploading(true);
        try {
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storagePath = `media/${fileName}`;
            const storageRef = ref(storage, storagePath);

            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            const assetData = {
                name: file.name,
                url: downloadUrl,
                type: file.type,
                size: file.size,
                path: storagePath,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'media'), assetData);
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const deleteAsset = async (asset: MediaAsset) => {
        try {
            // Delete from Storage
            const storageRef = ref(storage, asset.path);
            await deleteObject(storageRef);

            // Delete from Firestore
            await deleteDoc(doc(db, 'media', asset.id));
        } catch (error) {
            console.error("Deletion failed:", error);
            throw error;
        }
    };

    return { assets, loading, uploading, uploadFile, deleteAsset };
}
