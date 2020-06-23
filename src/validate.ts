// jshint esversion:8

const validate = (text: string) => {
    // const pattern = /^[A-Za-z]+/gim;
    console.log(text);

    if (/^([A-Za-z]+|\s[A-Za-z]+)+$/.test(String(text))) {
        //console.log("Pattern matched");

        return true;
    } else {
        //console.log("Pattern didn't matched");

        return false;
    }
};

export default validate;
