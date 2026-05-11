export const caveChunks = {
    start: {
        key: "cave-start",
        path: new URL("../../../assets/maps/cave-chunks/cave_start.tmj", import.meta.url).href,
    },
    end: {
        key: "cave-end",
        path: new URL("../../../assets/maps/cave-chunks/cave_end.tmj", import.meta.url).href,
    },
    pool: [
        // add all of the other chunks here ex:
        {
            key: "cave-01",
            path: new URL("../../../assets/maps/cave-chunks/cave-01.tmj", import.meta.url).href,
        },
        {
            key: "cave-02",
            path: new URL("../../../assets/maps/cave-chunks/cave-02.tmj", import.meta.url).href,
        },
        {
            key: "cave-03",
            path: new URL("../../../assets/maps/cave-chunks/cave-03.tmj", import.meta.url).href,
        },
    ],
}