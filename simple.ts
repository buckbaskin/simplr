// create the simple object in the global namespace
// tslint:disable-next-line:no-var-keyword
var simple = simple || {};

// create a generators namespace
simple.generators = {};

// define a class for the web page objects
simple.Element = function() {
    this.children = [];

    // create things that won't be in the diff
    this.silent = {};

    this.tagName = "DIV";
};

simple.Element.prototype.special_keys = {
    hidden: 1, draggable: 1, contentEditable: 1, isContentEditable: 1,
    offsetParent: 1, offsetTop: 1, offsetLeft: 1, offsetWidth: 1,
    offsetHeight: 1, style: 1, innerText: 1, outerText: 1,
    id: 1, className: 1, classList: 1, attributes: 1, innerHTML: 1,
    outerHTML: 1, scrollTop: 1, scrollLeft: 1, scrollWidth: 1, scrollHeight: 1,
    clientTop: 1, clientLeft: 1, clientWidth: 1, clientHeight: 1, tagName: 1,
    text: 1, textContent: 1, title: 1, type: 1, src: 1,
};

simple.Element.prototype.build = function build(html_element) {
    console.log("Element.build(" + html_element + ")");

    this.silent.element = html_element;

    for (let key in html_element) {
        if (html_element.hasOwnProperty(key)) {
            this[key] = html_element[key];
        } else if (this.special_keys[key] === 1) {
            this[key] = html_element[key];
        }
    }

    if (html_element.tagName === "BODY") {
        console.log("BODY: " + html_element.childNodes.length);
    }
    for (let i = html_element.childNodes.length - 1; i >= 0; i--) {
        const child = html_element.childNodes[i];
        this.children.push((new simple.Element()).build(child));
    };
    return this;
};

simple.Element.prototype.render = function render() {
    if (this.tagName === "SCRIPT") {
        return this.renderAsScript();
    }
    let startHtml = "<div>";
    const endHtml = "</div>";

    const innerHtmlList = [];

    for (let i = this.children.length - 1; i >= 0; i--) {
        const child = this.children[i];
        innerHtmlList.push(child.render());
    };
    if (innerHtmlList.length === 0) {
        this.innerHtml = "";
    } else {
        this.innerHtml = innerHtmlList.join("\n");
    }
    if (this.innerHtml === "") {
        this.outerHtml = startHtml + endHtml;
    } else {
        this.outerHtml = startHtml + "\n" + this.innerHtml + "\n" + endHtml;
    }
    return this.outerHtml;
};

simple.Element.prototype.renderAsScript = function renderAsScript() {
    let startHtml = "<script";
    const elements = ["async", "charset", "defer", "src", "type"];
    for (let item in elements) {
        if (this[elements[item]] !== undefined) {
            startHtml += " " + elements[item] + "=\"" + this[elements[item]] + "\"";
        } else {
            console.log("fail check " + elements[item]);
        }
    }
    startHtml += ">";
    const endHtml = "</script>";
    const innerHtmlList = [];
    for (let i = this.children.length - 1; i >= 0; i--) {
        const child = this.children[i];
        console.log("script child " + child);
        innerHtmlList.push(child.render());
    };
    if (innerHtmlList.length === 0) {
        this.innerHtml = "";
    }
    else {
        this.innerHtml = innerHtmlList.join("\n");
    }
    if (this.innerHtml === "") {
        this.outerHtml = startHtml + endHtml;
    }
    else {
        this.outerHtml = startHtml + "\n" + this.innerHtml + "\n" + endHtml;
    }
    return this.outerHtml;
};
simple.Element.prototype.addChild = function addChild(child) {
    console.log("addChild(" + child + ")");
    if (child instanceof simple.Element) {
        this.children.push(child);
    }
    return this;
};

// create the base page object
simple.base = new simple.Element();
// add the document add it's child
simple.base.addChild(new simple.Element().build(document.documentElement));
console.log(simple.base.children);
console.log(simple.base.render());