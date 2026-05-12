export const oceanChunks = {
    start: {
        key: "ocean-start",
        path: new URL("../../../assets/maps/ocean-chunks/ocean_start.tmj", import.meta.url).href,
    },
    // end: {
    //     key: "ocean-end",
    //     path: new URL("../../../assets/maps/ocean-chunks/ocean_end.tmj", import.meta.url).href,
    // },
    pool: [
        // add all of the other chunks here ex:
        {
            key: "ocean-01",
            path: new URL("../../../assets/maps/ocean-chunks/ocean-01.tmj", import.meta.url).href,
        },
        {
            key: "ocean-02",
            path: new URL("../../../assets/maps/ocean-chunks/ocean-02.tmj", import.meta.url).href,
        },
        {
            key: "ocean-03",
            path: new URL("../../../assets/maps/ocean-chunks/ocean-02.tmj", import.meta.url).href,
        },
    ],
}