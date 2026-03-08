export interface MediaAsset {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: any; // Firestore Timestamp
    path: string;
}
