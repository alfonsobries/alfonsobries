const addClasses = (node, classes) => {
  if (node.type === "element" && node.name !== "g") {
    node.attributes.class = node.attributes.class
      ? `${node.attributes.class} ${classes}`
      : classes;
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => addClasses(child, classes));
  }
};

module.exports = {
  plugins: [
    {
      name: "addSvgClassesPlugin",
      fn: () => ({
        element: {
          enter: (node) => {
            if (node.name === "svg" && node.attributes.style) {
              const style = node.attributes.style
                .split(";")
                .filter(Boolean)
                .reduce((obj, declaration) => {
                  const [property, value] = declaration.split(":");
                  obj[property.trim()] = value?.trim();
                  return obj;
                }, {});

              delete node.attributes.style;

              Object.assign(node.attributes, style, {
                "vector-effect": "non-scaling-stroke",
              });
            }

            const { id } = node.attributes;

            if (id?.startsWith("Light.")) {
              node.children.forEach((child) => addClasses(child, "dark:hidden"));
            } else if (id?.startsWith("Dark.")) {
              node.children.forEach((child) =>
                addClasses(child, "hidden dark:block")
              );
            }
          },
        },
      }),
    },
  ],
};
