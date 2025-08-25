import { useState } from "react";

export default function S3Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [uploadedKey, setUploadedKey] = useState(null);

  const handleSelect = (e) => {
    setFile(e.target.files?.[0] ?? null);
    setStatus("");
    setUploadedKey(null);
  };

  const upload = async () => {
    if (!file) return;

    try {
      setStatus("Requesting upload URL...");
      const q = new URLSearchParams({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      });
      const presignResp = await fetch(`http://localhost:4000/s3/presign?${q}`);
      const { url, key } = await presignResp.json();

      setStatus("Uploading to S3...");
      const put = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!put.ok) throw new Error(`S3 responded with ${put.status}`);

      setStatus("Done");
      setUploadedKey(key);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
    }
  };

  const viewFile = async () => {
    if (!uploadedKey) return;
    try {
      const resp = await fetch(`http://localhost:4000/s3/view?key=${uploadedKey}`);
      const { url } = await resp.json();
      window.open(url, "_blank"); // open in new tab
    } catch (err) {
      console.error("Failed to fetch view URL", err);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <input type="file" onChange={handleSelect} />
      <button onClick={upload} disabled={!file}>Upload</button>
      <div>{status}</div>
      <button onClick={viewFile} disabled={!uploadedKey}>
        View file
      </button>
    </div>
  );
}
