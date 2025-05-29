exports.formatText = (text) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
}