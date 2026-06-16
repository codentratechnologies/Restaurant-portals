# The Ultimate Step-by-Step Guide: Google Drive File Upload

This guide is written for you as a beginner. It will explain exactly *what* to click, *what* code to write, and *why* we are doing it. 

### Why can't we just upload directly from React?
Google Drive requires a "Secret Key" to upload files. If you put a secret key in your React (Frontend) code, anyone visiting your website can steal it and delete all your files. 
Therefore, we need a **Backend (Server)**. 
1. React sends the image to the Backend.
2. The Backend uses the Secret Key to safely upload it to Google Drive.
3. Google Drive gives a link back to the Backend.
4. The Backend gives the link to React.
5. React saves it to Firebase.

Let's build it step-by-step!

---

## Phase 1: Getting your Google Drive Secret Key

First, we need to create a "Service Account". Think of a Service Account as a robot user that works for your app. It has its own email address and can be given permission to upload files to a specific folder.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. **Create a Project**: Click the dropdown at the very top left (next to the Google Cloud logo) and click **"New Project"**. Name it something like `Restaurant Portal Backend` and click Create.
4. **Enable Drive API**: 
   - In the top search bar, search for **"Google Drive API"**.
   - Click on it, and click the blue **"Enable"** button.
5. **Create the Robot User (Service Account)**:
   - On the left menu, go to **APIs & Services -> Credentials**.
   - Click **"+ CREATE CREDENTIALS"** at the top, then choose **"Service account"**.
   - Name it `drive-uploader` and click **Create and Continue**, then click **Done**.
6. **Download the Secret Key**:
   - In the "Service Accounts" list at the bottom of the page, click on the email address of the account you just created (it looks like `drive-uploader@...iam.gserviceaccount.com`).
   - Copy this email address somewhere safe (you need it in Phase 2).
   - Go to the **"Keys"** tab at the top.
   - Click **"Add Key" -> "Create new key"**.
   - Choose **JSON** and click Create. 
   - A file will download to your computer. Rename this file to `google-key.json`. Keep it safe!

---

## Phase 2: Setting up your Google Drive Folder

We need a place to store the images. 

1. Open your normal Google Drive (drive.google.com).
2. Create a new folder named `Portal Uploads`.
3. **Get the Folder ID**: Look at the URL in your browser. It will look like `https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPQrStUvWxYz`. 
   - The weird string of letters and numbers at the end (`1aBcDeFgHiJkLmNoPQrStUvWxYz`) is your **Folder ID**. Copy this down.
4. **Give the Robot Permission**: 
   - Right-click the folder and select **Share**.
   - In the "Add people" box, paste the **Service Account Email** you copied in Phase 1.
   - Give it **Editor** access and click Send.
5. **Make the folder Public**: 
   - Right-click the folder again and select **Share**.
   - Under "General access", change it from "Restricted" to **"Anyone with the link"**. 
   - This ensures that when the images are uploaded, they can be viewed on your website.

---

## Phase 3: Building the Backend (Node.js Express Server)

Now we will write the server that talks to Google Drive.

1. Create a new folder on your computer (separate from your React app) and name it `backend-server`.
2. Open this folder in VS Code.
3. Open the terminal inside VS Code and run this command to initialize a Node.js project:
   ```bash
   npm init -y
   ```
4. Install the required tools. Run this command:
   ```bash
   npm install express cors multer googleapis
   ```
   *Explanation: `express` makes the server, `cors` lets React talk to it, `multer` handles file uploads, and `googleapis` talks to Google Drive.*
5. Move your `google-key.json` file (from Phase 1) inside this `backend-server` folder.
6. Create a new file named `server.js` and paste the following code into it:

```javascript
// Import the tools we installed
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const stream = require('stream');

const app = express();
app.use(cors()); // Allow our React app to talk to this server

// Set up Multer (this tool takes the file from React and puts it in computer memory)
const upload = multer({ storage: multer.memoryStorage() });

// Connect to Google Drive using our secret key
const auth = new google.auth.GoogleAuth({
  keyFile: './google-key.json', // This must match the name of your JSON file
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

// The Folder ID you copied in Phase 2
const GOOGLE_DRIVE_FOLDER_ID = 'PASTE_YOUR_FOLDER_ID_HERE'; 

// Create a POST API route called '/upload'
app.post('/upload', upload.single('imageFile'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    // Convert the file in memory to a format Google Drive can read (a stream)
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    // Tell Google Drive the name of the file and where to put it
    const fileMetadata = {
      name: file.originalname,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };

    // Tell Google Drive what kind of file it is (e.g. image/jpeg)
    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };

    console.log("Uploading to Google Drive...");
    
    // Upload it!
    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id', // We just need the ID back
    });

    const fileId = driveResponse.data.id;
    
    // Create the public URL so we can show it on the website
    const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    console.log("Upload Success! URL:", publicUrl);

    // Send the URL back to React
    res.json({ url: publicUrl });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Something went wrong");
  }
});

// Start the server on port 5000
app.listen(5000, () => {
  console.log("Backend server is running on http://localhost:5000");
});
```

7. **Start your server**: In the terminal, run `node server.js`. It should say "Backend server is running".

---

## Phase 4: The Frontend (React)

Now we go back to your `admin-portal` or `restaurant-portal` React code.

1. Open your React project.
2. Here is a simple React component you can use to upload the file, get the URL, and save it to Firebase.

```tsx
import React, { useState } from 'react';
// Import Firebase tools (make sure Firebase is set up in your project!)
import { getFirestore, doc, setDoc } from 'firebase/firestore'; 

export const ImageUploader = () => {
  // We use state to keep track of the selected file and loading status
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Firebase database
  const db = getFirestore();

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Package the file to send to our Backend
      // FormData is like a digital envelope for files
      const formData = new FormData();
      // 'imageFile' must match what we wrote in our backend server.js
      formData.append('imageFile', selectedFile);

      // 2. Send it to the backend we built in Phase 3
      console.log("Sending file to backend...");
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      // 3. The backend gives us back the JSON with the URL
      const data = await response.json();
      const googleDriveUrl = data.url;
      console.log("Got URL from Google Drive:", googleDriveUrl);

      // 4. Save that URL to Firebase Firestore
      console.log("Saving to Firebase...");
      
      // Example: Saving to a restaurant document named 'restaurant_123'
      const restaurantDocRef = doc(db, "restaurants", "restaurant_123");
      await setDoc(restaurantDocRef, {
        menuImageUrl: googleDriveUrl
      }, { merge: true });

      alert("Success! Image uploaded and saved to Firebase.");

    } catch (error) {
      console.error("Error during upload:", error);
      alert("Failed to upload. Check the console.");
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>Upload an Image</h3>
      
      {/* Input to select the file */}
      <input 
        type="file" 
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
          }
        }} 
      />
      
      <br /><br />

      {/* Button to trigger the upload */}
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? "Uploading... Please wait..." : "Upload to Google Drive"}
      </button>
    </div>
  );
};
```

### Summary of what happens when you click the button:
1. React puts the file in an envelope (`FormData`) and sends it to `http://localhost:5000/upload`.
2. The Node.js server receives it.
3. Node.js uses `google-key.json` to prove who it is to Google.
4. Node.js uploads the file to the `Portal Uploads` folder using the Folder ID.
5. Google returns a File ID. Node.js creates a `drive.google.com/...` link.
6. Node.js sends that link back to React.
7. React takes that link and saves it to the `restaurants` collection in Firebase. 

And that's it! You have built the entire flow from scratch.
