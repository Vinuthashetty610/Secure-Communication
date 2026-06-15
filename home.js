// ==============================
// 🧩 Utility Conversion Functions
// ==============================

// Convert string to binary
function stringToBinary(str) {
  return str.split("")
    .map(c => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

// Convert binary back to string
function binaryToString(bin) {
  return bin.match(/.{1,8}/g)
    .map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join("");
}

// Convert byte array to binary string
function bytesToBinary(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(2).padStart(8, "0"))
    .join("");
}

// ==============================
// 📝 TEXT STEGANOGRAPHY
// ==============================

// 🔐 Hide encrypted text message in image
function hideEncryptedMessage() {
  const fileInput = document.getElementById("imageInput");
  const message = document.getElementById("secretMessage").value.trim();
  const key = document.getElementById("encryptionKey").value.trim();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  if (!fileInput.files.length || !message || !key) {
    alert("Please upload an image, enter a message, and a key!");
    return;
  }

  const encrypted = CryptoJS.AES.encrypt(message, key).toString();

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < encrypted.length && i * 4 < data.length; i++) {
        data[i * 4] = encrypted.charCodeAt(i); // store in red channel
      }
      data[encrypted.length * 4] = 0; // Null terminator

      ctx.putImageData(imageData, 0, 0);

      const link = document.createElement("a");
      link.download = "encrypted-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
}

// 🕵️ Extract and decrypt text message from image
function extractEncryptedMessage() {
  const fileInput = document.getElementById("imageToExtract");
  const key = document.getElementById("decryptionKey").value.trim();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  if (!fileInput.files.length || !key) {
    alert("Please upload an image and enter the decryption key!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let encrypted = "";
      for (let i = 0; i < data.length; i += 4) {
        const charCode = data[i];
        if (charCode === 0) break;
        encrypted += String.fromCharCode(charCode);
      }

      try {
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        alert("🔓 Decrypted Message:\n\n" + (decrypted || "Decryption failed or wrong key."));
      } catch {
        alert("⚠️ Error: Decryption failed. Check your key.");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
}

// ==============================
// 📁 FILE STEGANOGRAPHY
// ==============================

// 📦 Hide a file inside an image (optionally encrypted)
function hideFileInImage() {
  const coverImageInput = document.getElementById("coverImage");
  const fileInput = document.getElementById("fileToHide");
  const key = document.getElementById("fileKey").value.trim();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  if (!coverImageInput.files.length || !fileInput.files.length) {
    alert("Please upload both a cover image and a file to hide!");
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(coverImageInput.files[0]);
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileBytes = new Uint8Array(e.target.result);
      let fileBinary;

      // Encrypt file if key provided
      if (key) {
        const base64 = btoa(String.fromCharCode(...fileBytes));
        const encrypted = CryptoJS.AES.encrypt(base64, key).toString();
        fileBinary = stringToBinary(encrypted);
      } else {
        fileBinary = bytesToBinary(fileBytes);
      }

      // Metadata for retrieval later
      const metadata = `FILE:${file.name}|${fileBytes.length}|ENDMETA|`;
      const metadataBinary = stringToBinary(metadata);
      const fullBinary = metadataBinary + fileBinary;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const totalCapacity = (imageData.data.length / 4) * 3; // 3 bits per pixel

      if (fullBinary.length > totalCapacity) {
        alert("❌ File too large for this image! Use a bigger image or smaller file.");
        return;
      }

      // Embed binary data into LSBs
      let dataIndex = 0;
      for (let i = 0; i < imageData.data.length && dataIndex < fullBinary.length; i += 4) {
        imageData.data[i]     = (imageData.data[i] & 0xFE) | parseInt(fullBinary[dataIndex++] || 0);
        if (dataIndex < fullBinary.length)
          imageData.data[i + 1] = (imageData.data[i + 1] & 0xFE) | parseInt(fullBinary[dataIndex++] || 0);
        if (dataIndex < fullBinary.length)
          imageData.data[i + 2] = (imageData.data[i + 2] & 0xFE) | parseInt(fullBinary[dataIndex++] || 0);
      }

      ctx.putImageData(imageData, 0, 0);

      // Trigger download
      const link = document.createElement("a");
      link.download = "file-stego-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      alert("✅ File successfully hidden in image!");
    };

    reader.readAsArrayBuffer(file);
  };
}
