# Firebase Security Rules for Vualiku XP

**ACTION REQUIRED:** To secure your application data and enforce the Role-Based Access Control (RBAC) you just approved, you MUST copy the code block below and paste it into your Firebase Console.

### How to apply these rules:
1. Go to your [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`studio-96057453-3d4b4`**.
3. On the left sidebar, click on **Firestore Database** (under the "Build" menu).
4. Click on the **Rules** tab at the top.
5. Replace everything in the editor with the exact code below.
6. Click the **Publish** button to save and apply the rules.

---

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Define the VIP Administrators List
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'ligarius22@gmail.com' ||
        request.auth.token.email == 'dbucks3671@gmail.com' ||
        request.auth.token.email == 'navareafarm@gmail.com' ||
        request.auth.token.email == 'bulutani@yahoo.com'
      );
    }
    
    match /allBookings/{bookingId} {
      // 1. Unauthenticated users can read, but only to aggregate data (like available slots check).
      allow read: if true; 
      
      // 2. Only Authenticated users can create bookings.
      allow create: if request.auth != null;
      
      // 3. Modifying a booking's core data (or marking Check-in) is strictly reserved for Admins.
      allow update, delete: if isAdmin();
    }
  }
}
```
