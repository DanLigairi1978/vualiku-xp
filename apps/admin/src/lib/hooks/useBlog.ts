'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@vualiku/shared';
import { BlogPost } from '@vualiku/shared';

export function useBlog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'blogPosts'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BlogPost[];
            setPosts(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching blog posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const createPost = async (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) => {
        return await addDoc(collection(db, 'blogPosts'), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            publishedAt: data.status === 'published' ? serverTimestamp() : null,
        });
    };

    const updatePost = async (id: string, data: Partial<BlogPost>) => {
        const docRef = doc(db, 'blogPosts', id);
        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp(),
        };

        // Handle publishedAt logic
        if (data.status === 'published') {
            updateData.publishedAt = serverTimestamp();
        }

        await updateDoc(docRef, updateData);
    };

    const deletePost = async (id: string) => {
        await deleteDoc(doc(db, 'blogPosts', id));
    };

    return { posts, loading, createPost, updatePost, deletePost };
}
