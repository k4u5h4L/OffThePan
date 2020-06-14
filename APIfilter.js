// jshint esversion:8

exports.validate = (text) => {
    text = text.replace(/, /g, ",");

    text = text.replace(/and/g, ",");

    return text;
};
