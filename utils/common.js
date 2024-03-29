import isObject from 'lodash.isobject';

export const convertEmptyStringsToNull = (obj) => {
    if(isObject(obj)) {
        const objCopy = Object.assign({}, obj);

        Object.keys(objCopy).forEach((key) => {
            if(typeof objCopy[key] === 'string' && !objCopy[key].trim().length) {
                objCopy[key] = null;
            }
        });

        return objCopy;
    }
};


export const getNextAvailableTypeValue = (allTypes) => {
    let highestValue = 0;

    // find the highest value
    allTypes.forEach((obj) => {
        if(obj.value > highestValue) {
            highestValue = obj.value;
        }
    });

    let factor = 0;

    if(highestValue) {
        factor = parseInt(Math.log(highestValue) / Math.log(2), 10); // current factor
        factor++; // what the new factor should be
    }

    return Math.pow(2, factor);
};


export const stripTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, '');
};


export const arrayDiff = (a1, a2) => {
    const a = [];
    const diff = [];

    for (let i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (let i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        }
        else {
            a[a2[i]] = true;
        }
    }

    for (const k in a) {
        diff.push(k);
    }

    return diff;
};


export const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
};


export const isNumber = (val) => {
    return typeof val === 'number' || val instanceof Number;
};


export const isString = (val) => {
    return typeof val === 'string' || val instanceof String;
};


// https://github.com/brandonscript/lodash-uuid/blob/master/index.js
export const isUuid4 = (val) => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return re.test(val);
};

export const isUuid = (val) => {
    const re = /^([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)$/i;
    return re.test(val);
};


// create lighter or darker hex color
// https://www.sitepoint.com/javascript-generate-lighter-darker-color/
export const colorLuminance = (hex, lum) => {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');

    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }

    lum = lum || 0;

    // convert to decimal and change luminosity
    let rgb = '#';
    let c;
    let i;

    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ('00'+c).substr(c.length);
    }

    return rgb;
};


export function in_to_cm(inches) {
    if(!isNumeric(inches)) {
        console.error(`in_to_cm method was not given a numeric value: ${inches}`);
        return null;
    }

    const cm = inches * 2.54;
    return Math.round(cm * 100) / 100;
}


export function cm_to_in(cm) {
    if(!isNumeric(cm)) {
        console.error(`cm_to_in method was not given a numeric value: ${cm}`);
        return null;
    }

    const inches = cm * 0.39370079;
    return Math.round(inches * 100) / 100;
}

