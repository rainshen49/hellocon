function $(selector) {
    var result = document.querySelectorAll(selector);
    if (result.length == 1) return result[0]
    else return result
}