// jshint esversion: 8

const validate = (text: string) => {
    text = text.replace(/, /g, ",");

    text = text.replace(/,/g, ",+");

    text = text.replace(/\s/g, "%20");

    text = text.replace(/and/g, ",+");

    return text;
};

export default validate;
