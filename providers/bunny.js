function removeLeadingSlash(path) {
    if (path[0] === '/') {
        path = path.substring(1, path.length);
    }

    return path;
}

// export function getImage(src, { modifiers, baseURL } = {}, { options, nuxtContext, $img }) {
//     console.log("GET IMAGE modifiers", modifiers);
//     console.log("GET IMAGE baseURL", baseURL);
//     console.log("GET IMAGE src", src);
//     console.log("GET IMAGE options", options);
//     console.log("GET IMAGE nuxtContext", nuxtContext);
//     console.log("GET IMAGE $img", $img);

//     // https://support.bunny.net/hc/en-us/articles/360027448392-Bunny-Optimizer-Engine-Documentation

//     const path = removeLeadingSlash(src);
//     const params = new URLSearchParams(modifiers).toString();

//     return {
//         url: `https://bv-pullzone-1.b-cdn.net/${path}?${params}`
//     };
// }

/*
* Bunny Optimizer allows us to use CSS class names to specify image size, for better security:
* https://bunny.net/blog/introducing-bunny-optimizer-image-classes/
*
* Additional docs: https://support.bunny.net/hc/en-us/articles/360027448392-Bunny-Optimizer-Engine-Documentation
*/
export function getImage(src, config) {
    // console.log("GET IMAGE config", config);
    // console.log("GET IMAGE src", src);
    // console.log("GET IMAGE src", arguments[2]);

    const path = removeLeadingSlash(src);

    return {
        url: `https://bv-pullzone-1.b-cdn.net/${path}?class=${config.preset}`
    };
}
