const { pathDataToPolys } = require("svg-path-to-polygons");

const pathDataToPolysOptions = { tolerance: 5, decimals: 2 };

const TRANSITION_DURATION = "400ms";

const convertPathToPolygon = (item) => {
  if (item.type !== "element") {
    return;
  }
  if (item.name === "svg") {
    const firstChildren = item.children[0];
    const firstChildrenPoints = pathDataToPolys(
      firstChildren.attributes.d,
      pathDataToPolysOptions
    )[0].join(" ");

    const totalChildren = item.children.filter(
      (ch) => ch.name === "path"
    ).length;

    item.children = [
      new item.constructor({
        type: "element",
        name: "polygon",
        attributes: {
          points: firstChildrenPoints,
          style: firstChildren.style.styleValue,
        },
        children: item.children.map((c) => {
          if (c.name === "path") {
            const index = Number(c.attributes.id.split("-")[1]);

            c.attributes.begin =
              index === 1
                ? `0; flama-${totalChildren}.begin + ${TRANSITION_DURATION}`
                : `flama-${index - 1}.begin + ${TRANSITION_DURATION}`;
          }

          return c;
        }),
      }),
    ];

    return;
  }

  if (item.name === "path") {
    const points = pathDataToPolys(
      item.attributes.d,
      pathDataToPolysOptions
    )[0];

    item.name = "animate";
    item.attributes = {
      id: item.attributes.id,
      begin: item.attributes.begin,
      fill: "freeze",
      attributeName: "points",
      dur: TRANSITION_DURATION,
      to: points.join(" "),
    };
  }
};

module.exports = {
  plugins: [
    {
      name: "pathToPolygon",
      type: "perItem",
      fn: convertPathToPolygon,
    },
  ],
};
