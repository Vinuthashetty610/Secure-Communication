function hideEncryptedMessage() {
  const imageInput = document.getElementById("imageInput");
  const message = document.getElementById("secretMessage").value;
  const key = document.getElementById("encryptionKey").value;
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  if (!imageInput.files.length || !message || !key) {
    alert("Please upload an image, enter a message, and a key.");
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

      for (let i = 0; i < encrypted.length; i++) {
        data[i * 4] = encrypted.charCodeAt(i);
      }
      data[encrypted.length * 4] = 0;

      ctx.putImageData(imageData, 0, 0);

      const link = document.createElement("a");
      link.download = "stego-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(imageInput.files[0]);
}

function extractEncryptedMessage() {
  const stegoImage = document.getElementById("imageToExtract"); // ✅ fixed ID
  const key = document.getElementById("decryptionKey").value;
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const output = document.getElementById("output");

  if (!stegoImage.files.length || !key) {
    alert("Please upload the stego image and enter the decryption key.");
    return;
  }

  if (!stegoImage.files[0].type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  output.textContent = "⏳ Extracting and decrypting, please wait...";

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
        output.textContent = decrypted
          ? "✅ Decrypted Message: " + decrypted
          : "❌ Incorrect key or corrupted image.";
      } catch (err) {
        output.textContent = "❌ Error decrypting message.";
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(stegoImage.files[0]);
}
