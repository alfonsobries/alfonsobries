const { pathDataToPolys } = require("svg-path-to-polygons");

const pathDataToPolysOptions = { tolerance: 5, decimals: 2 };

const TRANSITION_DURATION = "400ms";

const convertChildPathToAnimate = (
  elementId,
  element,
  index,
  totalChildren
) => {
  const id = `${elementId}-${index + 1}`;
  const begin =
    index === 0
      ? `0; ${elementId}-${totalChildren}.begin + ${TRANSITION_DURATION}`
      : `${elementId}-${index}.begin + ${TRANSITION_DURATION}`;
  const points = pathDataToPolys(
    element.attributes.d,
    pathDataToPolysOptions
  )[0].join(" ");

  element.name = "animate";

  element.attributes = {
    id,
    begin,
    fill: "freeze",
    attributeName: "points",
    dur: TRANSITION_DURATION,
    to: points,
  };

  return element;
};

const convertGroupToPolygon = (element) => {
  // For getting the initial state
  const firstChildren = element.children[0];
  const firstChildrenPoints = pathDataToPolys(
    firstChildren.attributes.d,
    pathDataToPolysOptions
  )[0].join(" ");
  const totalChildren = element.children.filter(
    (ch) => ch.name === "path"
  ).length;

  const groupId = element.attributes.id;

  // Make the element a polygon
  element.name = "polygon";

  // Define the initial points and inherit the style from the first child
  element.attributes = {
    points: firstChildrenPoints,
    style: firstChildren.style.styleValue,
  };

  // Add begin attribute to every child
  element.children = element.children.map((child, index) => {
    // If for some reason the children is not a path just return the element
    if (child.name !== "path") {
      return child;
    }

    return convertChildPathToAnimate(groupId, child, index, totalChildren);
  });

  return element;
};

const animateSvg = (root) => {
  root.children = root.children.map((node) => {
    if (node.type === "element" && node.name === "svg") {
      node.children = node.children.map((child) => {
        // Animate the svg groups
        if (child.name === "g") {
          return convertGroupToPolygon(child);
        }

        return child;
      });
    }

    return node;
  });

  return root;
};

module.exports = {
  plugins: [
    {
      name: "animateSvg",
      type: "full",
      fn: animateSvg,
    },
  ],
};
