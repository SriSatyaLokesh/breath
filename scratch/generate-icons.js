import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const publicDir = path.resolve('public');

function createIcoBuffer(pngBuffers) {
	// pngBuffers: array of { width, height, buffer }
	const count = pngBuffers.length;
	const headerSize = 6;
	const dirEntrySize = 16;
	const dataOffsetStart = headerSize + count * dirEntrySize;

	const header = Buffer.alloc(headerSize);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type 1 = ICO
	header.writeUInt16LE(count, 4); // number of images

	let currentOffset = dataOffsetStart;
	const dirEntries = [];
	const imageBuffers = [];

	for (const img of pngBuffers) {
		const entry = Buffer.alloc(dirEntrySize);
		entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
		entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
		entry.writeUInt8(0, 2); // color palette
		entry.writeUInt8(0, 3); // reserved
		entry.writeUInt16LE(1, 4); // color planes
		entry.writeUInt16LE(32, 6); // bits per pixel
		entry.writeUInt32LE(img.buffer.length, 8); // image size
		entry.writeUInt32LE(currentOffset, 12); // image offset

		dirEntries.push(entry);
		imageBuffers.push(img.buffer);
		currentOffset += img.buffer.length;
	}

	return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function generate() {
	const svgBuffer = fs.readFileSync(svgPath);

	const sizes = [
		{ name: 'favicon-16x16.png', size: 16 },
		{ name: 'favicon-32x32.png', size: 32 },
		{ name: 'favicon-48x48.png', size: 48 },
		{ name: 'pwa-64x64.png', size: 64 },
		{ name: 'pwa-128x128.png', size: 128 },
		{ name: 'apple-touch-icon-152x152.png', size: 152 },
		{ name: 'apple-touch-icon.png', size: 180 },
		{ name: 'pwa-192x192.png', size: 192 },
		{ name: 'pwa-256x256.png', size: 256 },
		{ name: 'pwa-384x384.png', size: 384 },
		{ name: 'pwa-512x512.png', size: 512 }
	];

	const icoPngs = [];

	for (const item of sizes) {
		const buf = await sharp(svgBuffer)
			.resize(item.size, item.size)
			.png()
			.toBuffer();
		
		fs.writeFileSync(path.join(publicDir, item.name), buf);
		console.log(`Generated ${item.name} (${item.size}x${item.size})`);

		if (item.size === 16 || item.size === 32 || item.size === 48) {
			icoPngs.push({ width: item.size, height: item.size, buffer: buf });
		}
	}

	// 12. Maskable Icon (512x512 with 10% bleed area)
	const maskableBuf = await sharp(svgBuffer)
		.resize(410, 410)
		.extend({
			top: 51,
			bottom: 51,
			left: 51,
			right: 51,
			background: '#090502'
		})
		.png()
		.toBuffer();
	fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), maskableBuf);
	console.log('Generated maskable-icon-512x512.png');

	// 13. Create binary favicon.ico containing 16x16, 32x32, 48x48 resolutions
	const icoBuffer = createIcoBuffer(icoPngs);
	fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
	console.log('Generated favicon.ico (16x16, 32x32, 48x48)');

	console.log('\nAll PWA icons and favicon.ico generated successfully!');
}

generate().catch(console.error);
