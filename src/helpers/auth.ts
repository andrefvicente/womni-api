import { verify, decode } from '@tsndr/cloudflare-worker-jwt';



async function hashPassword(password: string, providedSalt?: Uint8Array): Promise<string> {
	const encoder = new TextEncoder();
	//const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));
	const salt: Uint8Array = providedSalt instanceof Uint8Array
		? providedSalt
		: new Uint8Array(crypto.getRandomValues(new Uint8Array(16))); const keyMaterial = await crypto.subtle.importKey(
			"raw",
			encoder.encode(password),
			{ name: "PBKDF2" },
			false,
			["deriveBits", "deriveKey"]
		);

	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt.buffer as ArrayBuffer,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"]
	);

	const exportedKey = await crypto.subtle.exportKey("raw", key);
	//const hashBuffer = new Uint8Array(exportedKey);

	const hashBuffer = new Uint8Array(exportedKey as ArrayBuffer);
	const hashHex = Array.from(hashBuffer)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	const saltHex = Array.from(salt)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");


	return `${saltHex}:${hashHex}`;
};

async function verifyPassword(storedHash: string, passwordAttempt: string): Promise<boolean> {
	// Validate hash format
	if (!storedHash.includes(":")) {
		throw new Error("Invalid stored hash format");
	}

	const [saltHex, originalHash] = storedHash.split(":");

	// Validate saltHex format
	if (!/^[a-fA-F0-9]+$/.test(saltHex) || saltHex.length % 2 !== 0) {
		throw new Error("Invalid salt format");
	}

	const salt = new Uint8Array(
		saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
	);

	const attemptHashWithSalt = await hashPassword(passwordAttempt, salt);
	const [, attemptHash] = attemptHashWithSalt.split(":");

	return attemptHash === originalHash;
}

async function isAuthenticated(data: any, c: any) {
	const authorization = data.headers["authorization"];

	if (authorization) {
		const token = authorization.replace("Bearer ", "");

		if (!token) {
			const error = new Error("token is required");
			(error as any).status = 401;
			throw error;
		}

		const valid = await verify(String(token), c.env.JWT_SECRET_KEY)

		if (!valid) {
			return { isValid: false }
		}

		const { payload } = decode(String(token));

		console.log(JSON.stringify(payload),"payload");

		const employeeId: string = payload["employeeId"];

		const accountId = data["params"]["accountId"];

		const accounts = await c.env.DB_WOMNI.prepare(`SELECT a.*, ea.role FROM employee_account ea INNER JOIN account a ON(a.id=ea.accountId) WHERE ea.employeeId = ? AND accountId = ?`).bind(employeeId, accountId).run();
		if (accounts.results && accounts.results.length > 0) {
			const { role, partner, account, name ,evt} = accounts.results[0];
			return { role, partner, account, name ,evt};
		} else {
			const error = new Error("unauthorized");
			(error as any).status = 401;
			throw error;

		}
	} else {
		let token = data.query['token'];

		if (!token) {
			token = data.headers["x-womni-token"]
		}
		if (!token) {
			const error = new Error("token is invalid");
			(error as any).status = 401;
			throw error;
		}
		const accounts = await c.env.DB_JINNI.prepare(`SELECT * FROM account a INNER JOIN account_api aa ON (a.id=aa.accountId) WHERE aa.apiKey = ?`).bind(token).run();

		if (accounts.results && accounts.results.length > 0) {
			const { tenant, region, id: accountId, name } = accounts.results[0];
			const { backend }: any = helperRegion.getRegionalData(region);
			return { isValid: true, tenant, accountId, backend, region, tenantName: name };
		}
	}

	return { isValid: false }
}


export {
	isAuthenticated,
	verifyPassword,
	hashPassword
};

