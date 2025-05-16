type Parcel = {
	length: number; // Parcel's length
	width: number; // Parcel's width
	height: number; // Parcel's height
	weight: number;
};

type FreeSpace = {
	x: number; // X-coordinate of the free space
	y: number; // Y-coordinate of the free space
	z: number; // Z-coordinate of the free space
	length: number; // Available length in the space
	width: number; // Available width in the space
	height: number; // Available height in the space
};

type PackedParcel = {
	x: number; // Placement's x-coordinate
	y: number; // Placement's y-coordinate
	z: number; // Placement's z-coordinate
	length: number; // Length of the parcel
	width: number; // Width of the parcel
	height: number; // Height of the parcel
};

type PackingResult = {
	packedParcels: PackedParcel[];
	boundingBox: { length: number; width: number; height: number };
	weight: number;
};

export function binPack3D(parcels: Parcel[]): PackingResult {
	if (!parcels || parcels.length === 0) {
		throw new Error("No parcels provided for packing.");
	}
	let weight: number = 0;

	// Validate parcels
	for (const parcel of parcels) {
		if (parcel.length <= 0 || parcel.width <= 0 || parcel.height <= 0) {
			throw new Error(`Invalid parcel dimensions: ${JSON.stringify(parcel)}`);
		}
		weight = weight + parcel.weight;
	}

	const orientations = (parcel: Parcel): Omit<Parcel, "weight">[] => [
		{ length: parcel.length, width: parcel.width, height: parcel.height },
		{ length: parcel.length, width: parcel.height, height: parcel.width },
		{ length: parcel.width, width: parcel.length, height: parcel.height },
		{ length: parcel.width, width: parcel.height, height: parcel.length },
		{ length: parcel.height, width: parcel.length, height: parcel.width },
		{ length: parcel.height, width: parcel.width, height: parcel.length },
	];

	const freeSpaces: FreeSpace[] = [
		{ x: 0, y: 0, z: 0, length: Infinity, width: Infinity, height: Infinity },
	];

	const packedParcels: PackedParcel[] = [];

	const placeParcel = (parcel: Parcel): boolean => {
		const possiblePlacements: PackedParcel[] = [];

		for (const space of freeSpaces) {
			for (const orientation of orientations(parcel)) {
				if (
					orientation.length <= space.length &&
					orientation.width <= space.width &&
					orientation.height <= space.height
				) {
					possiblePlacements.push({
						x: space.x,
						y: space.y,
						z: space.z,
						length: orientation.length,
						width: orientation.width,
						height: orientation.height,
					});
				}
			}
		}

		if (possiblePlacements.length === 0) return false;

		const bestPlacement = possiblePlacements.reduce((best, current) => {
			const bestVolume = best.length * best.width * best.height;
			const currentVolume = current.length * current.width * current.height;
			return currentVolume < bestVolume ? current : best;
		});

		updateFreeSpaces(bestPlacement);
		packedParcels.push(bestPlacement);
		return true;
	};

	const updateFreeSpaces = (usedSpace: PackedParcel) => {
		const newFreeSpaces: FreeSpace[] = [];

		for (const space of freeSpaces) {
			if (usedSpace.x + usedSpace.length < space.x + space.length) {
				newFreeSpaces.push({
					x: usedSpace.x + usedSpace.length,
					y: space.y,
					z: space.z,
					length: space.x + space.length - (usedSpace.x + usedSpace.length),
					width: space.width,
					height: space.height,
				});
			}
			if (usedSpace.y + usedSpace.width < space.y + space.width) {
				newFreeSpaces.push({
					x: space.x,
					y: usedSpace.y + usedSpace.width,
					z: space.z,
					length: space.length,
					width: space.y + space.width - (usedSpace.y + usedSpace.width),
					height: space.height,
				});
			}
			if (usedSpace.z + usedSpace.height < space.z + space.height) {
				newFreeSpaces.push({
					x: space.x,
					y: space.y,
					z: usedSpace.z + usedSpace.height,
					length: space.length,
					width: space.width,
					height: space.z + space.height - (usedSpace.z + usedSpace.height),
				});
			}
		}

		freeSpaces.splice(0, freeSpaces.length, ...newFreeSpaces);
	};

	for (const parcel of parcels) {
		if (!placeParcel(parcel)) {
			throw new Error(`Parcel does not fit: ${JSON.stringify(parcel)}`);
		}
	}

	const boundingBox = packedParcels.reduce(
		(box, parcel) => ({
			length: Math.max(box.length, parcel.x + parcel.length),
			width: Math.max(box.width, parcel.y + parcel.width),
			height: Math.max(box.height, parcel.z + parcel.height),
		}),
		{ length: 0, width: 0, height: 0 }
	);

	return { packedParcels, boundingBox, weight };
}
