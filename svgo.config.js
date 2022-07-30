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
  if (Array.isArray(item.children)) {
    item.children.forEach(addSvgClassesHandler);
  }

  if (item.attributes?.id) {
    if (item.attributes?.id.startsWith("Dia")) {
      item.children.forEach((i) => addClasses(i, "dark:hidden"));
    } else if (item.attributes?.id.startsWith("Noche")) {
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
