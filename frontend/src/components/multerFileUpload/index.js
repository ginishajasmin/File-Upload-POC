import { useState } from "react";
import axios from "axios";

export default function MulterUpload() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const sendToServer = async () => {
        if (!file) return alert("Upload a file first");

        const formData = new FormData();
        formData.append("image", file);

        await axios.post("http://localhost:5000/send-email", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Image sent to email!");
    };

    return (
        <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
            <h3>Handling Frontend File Uploads Using Multer</h3>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={sendToServer}>Send to Email</button>
        </div>
    );
}
