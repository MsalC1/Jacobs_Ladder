import { hellChunks } from "./chunks/hellChunks";

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

export function createHellStageOrder() {
    const randomChunks = shuffle(hellChunks.pool).slice(0, 3);

    return [
        hellChunks.start,
        ...randomChunks,
        hellChunks.end,
    ];
}