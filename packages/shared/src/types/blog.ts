export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string; // Markdown or HTML
    coverImage?: string;
    author: string;
    tags: string[];
    status: 'draft' | 'published';
    publishedAt: any; // Firestore Timestamp
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
}
