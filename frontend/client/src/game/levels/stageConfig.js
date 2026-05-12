import { hellChunks } from "./chunks/hellChunks";
import { caveChunks } from "./chunks/caveChunks";
import { oceanChunks } from "./chunks/oceanChunks";

function hashStringToSeed(str) {
    let hash = 2166136261;

    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function createSeededRandom(seed) {
    return function () {
        seed += 0x6D2B79F5;

        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seededShuffle(array, random) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export function createStageOrder(roomCode) {
    const seed = hashStringToSeed(roomCode);
    const random = createSeededRandom(seed);

    const randomChunksHell = seededShuffle(hellChunks.pool, random).slice(0, 3);

    const randomChunksCave = seededShuffle(caveChunks.pool, random).slice(0, 3);

    const randomChunksOcean = seededShuffle(oceanChunks.pool, random).slice(0, 3);

    

    return [
        hellChunks.start,
        ...randomChunksHell,
        hellChunks.end,

        caveChunks.start,
        ...randomChunksCave,
        caveChunks.end,

        oceanChunks.start,
        ...randomChunksOcean,
        oceanChunks.end,
    ];
}