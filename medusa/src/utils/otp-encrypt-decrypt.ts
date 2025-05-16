import crypto from "crypto";

const algorithm = "aes-256-cbc";
// Use a consistent key and IV instead of generating random ones each time
// In production, these should be stored securely (e.g., environment variables)
const key = Buffer.from("a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6", "utf8");
const iv = Buffer.from("q7r8s9t0u1v2w3x4", "utf8");

export function encryptOtp(otp: string): string {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(otp, "utf8", "hex");
	encrypted += cipher.final("hex");
	return encrypted; // No need to prepend IV since we're using a consistent one
}

export function decryptOtp(encryptedOtp: string) {
	try {
		const decipher = crypto.createDecipheriv(algorithm, key, iv);
		let decrypted = decipher.update(encryptedOtp, "hex", "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	} catch (error) {
		console.error("Decryption error:", error);
	}
}
// ------------------------ old code ------------------------
// import crypto from "crypto";

// const algorithm = "aes-256-cbc";
// const key = crypto.randomBytes(32); // Use a secure key management strategy in production
// const iv = crypto.randomBytes(16); // Initialization vector

// export function encryptOtp(otp: string): string {
// 	const cipher = crypto.createCipheriv(algorithm, key, iv);
// 	let encrypted = cipher.update(otp, "utf8", "hex");
// 	encrypted += cipher.final("hex");
// 	return `${iv.toString("hex")}:${encrypted}`; // Prepend IV for decryption
// }

// export function decryptOtp(encryptedOtp: string): string {
// 	const [ivHex, encrypted] = encryptedOtp.split(":");
// 	const decipher = crypto.createDecipheriv(
// 		algorithm,
// 		key,
// 		Buffer.from(ivHex, "hex")
// 	);
// 	let decrypted = decipher.update(encrypted, "hex", "utf8");
// 	decrypted += decipher.final("utf8");
// 	return decrypted;
// }
