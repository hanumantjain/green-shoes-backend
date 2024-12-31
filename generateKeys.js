const crypto = require("crypto");
const fs = require("fs");

// Generate RSA Key Pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // Length of the key in bits
    publicKeyEncoding: {
        type: "spki", // Recommended format for public keys
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs8", // Recommended format for private keys
        format: "pem",
    },
});

// Save keys to files
fs.writeFileSync("private_key.pem", privateKey);
fs.writeFileSync("public_key.pem", publicKey);

console.log("Keys generated and saved to files.");
