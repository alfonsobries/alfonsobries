const addClasses = (item, classes) => {
  if (item.name !== "g") {
    item.addAttr({
      name: "class",
      value: classes,
    });
  }

  if (Array.isArray(item.children)) {
    item.children.forEach((i) => addClasses(i, classes));
  }
};

const addSvgClassesHandler = (item) => {
  if (item.type === "element" && item.name === "svg") {
    const style = item.style.styleValue
      .split(";")
      .filter(Boolean)
      .reduce((obj, st) => {
        const [property, value] = st.split(":");
        obj[property] = value;
        return obj;
      }, {});

    delete item.style;

    style["vector-effect"] = "non-scaling-stroke";

    item.attributes = {
      ...item.attributes,
      ...style,
    };
  }

  if (Array.isArray(item.children)) {
    item.children.forEach(addSvgClassesHandler);
  }

  if (item.attributes?.id) {
    if (item.attributes?.id.startsWith("Light.")) {
      item.children.forEach((i) => addClasses(i, "dark:hidden"));
    } else if (item.attributes?.id.startsWith("Dark.")) {
      item.children.forEach((i) => addClasses(i, "hidden dark:block"));
    }
  }
};

module.exports = {
  plugins: [
    {
      name: "addSvgClassesPlugin",
      type: "perItem",
      fn: addSvgClassesHandler,
    },
  ],
};
