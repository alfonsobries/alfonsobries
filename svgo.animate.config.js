const { pathDataToPolys } = require("svg-path-to-polygons");

const pathDataToPolysOptions = { tolerance: 5, decimals: 2 };

const TRANSITION_DURATION = "400ms";

const convertChildPathToAnimate = (element, index, totalChildren, options) => {
  const id = `${options.id}-${index + 1}`;

  let begin;

  if (index === 0) {
    if (options.effect === "Loop") {
      // The first "frame" should start immediatly after last one finishes so
      // it has an effect of looping (last frame should have the same points as
      // the first one)
      begin = `${options.id}-${totalChildren}.begin + 0s`;
    } else {
      // The first "frame" should start after last one finishes
      begin = `${options.id}-${totalChildren}.begin + ${options.duration}`;
    }
  } else if (index === 1) {
    // The second "frame" should start immediatly or after the first one
    begin = `0; ${options.id}-${index}.begin + ${options.duration}`;
  } else {
    // Start after the previous one
    begin = `${options.id}-${index}.begin + ${options.duration}`;
  }

  // const points = pathDataToPolys(
  //   element.attributes.d,
  //   pathDataToPolysOptions
  // )[0].join(" ");

  // element.name = "animate";

  element.attributes = {
    id,
    begin,
    // fill: "freeze",
    attributeName: "display",
    dur: options.duration,
    // to: points,
  };

  return element;
};

const animateGroup = (group, options) => {
  if (options.effect === "Frame") {
    const frames = Array.from({ length: group.children.length + 1 }).map(
      (_, i) => i
    );

    const seconds = 1;
    const frameTime = seconds / group.children.length;

    group.attributes.id = options.id;
    group.children.map((child, index) => {
      const keyTimes = frames.map((i) => i * frameTime).join(";");
      const values = frames
        .map((i) => (i === index ? "inline" : "none"))
        .join(";");

      const animateChild = new group.constructor({
        type: "element",
        name: "animate",
        attributes: {
          id: `${options.id}-${index + 1}`,
          attributeName: "display",
          values,
          keyTimes,
          dur: options.duration,
          begin: `0s;${options.id}.click`,
          restart: "always",
          fill: index > 0 ? "freeze" : "remove",
        },
      });

      child.children.push(animateChild);
    });

    return group;
  }

  // For getting the initial state
  const firstChildren = group.children[0];
  const firstChildrenPoints = pathDataToPolys(
    firstChildren.attributes.d,
    pathDataToPolysOptions
  )[0].join(" ");
  const totalChildren = group.children.filter(
    (ch) => ch.name === "path"
  ).length;

  // Make the element a polygon
  group.name = "polygon";

  const style = firstChildren.style.styleValue
    .split(";")
    .filter(Boolean)
    .reduce((obj, st) => {
      const [property, value] = st.split(":");

      obj[property] = value;
      return obj;
    }, {});

  style["stroke-width"] = "3px";
  style["vector-effect"] = "non-scaling-stroke";

  // Define the initial points and inherit the style from the first child
  group.attributes = {
    points: firstChildrenPoints,
    ...style,
    ...group.attributes,
  };

  // Add begin attribute to every child
  group.children = group.children.map((child, index) => {
    // If for some reason the children is not a path just return the element
    if (child.name !== "path") {
      return child;
    }

    return convertChildPathToAnimate(child, index, totalChildren, options);
  });

  return group;
};

const handleChildren = (child, options) => {
  // Animate the svg groups
  if (child.name === "g" && child.children.length) {
    const isGroupOfPaths = child.children.every(
      (child) => child.name === "path"
    );
    const isGroupOfGroups = child.children.every((child) => child.name === "g");

    const localOptions = {
      ...options,
      ...getOptionsFromId(child?.attributes?.id),
    };

    if ((isGroupOfPaths || isGroupOfGroups) && localOptions.effect) {
      child = animateGroup(child, localOptions);
    } else {
      child.children = child.children.map((ch) =>
        handleChildren(ch, localOptions)
      );
    }
  }

  return child;
};

const getOptionsFromId = (groupId) => {
  const idParts = groupId ? groupId.split(".") : [];

  const options = {};

  const duration = idParts
    .filter((part) => part.startsWith("Duration"))
    .find(Boolean)
    ?.split(":")[1];

  const effect = idParts
    .filter((part) => part.startsWith("Effect"))
    .find(Boolean)
    ?.split(":")[1];

  const id = idParts
    .filter(
      (part) => !part.startsWith("Effect") && !part.startsWith("Duration")
    )
    .find(Boolean);

  if (duration) {
    options.duration = duration;
  }

  if (effect) {
    options.effect = effect;
  }

  if (id) {
    options.id = id;
  }

  return options;
};

const animateSvg = (root) => {
  root.children = root.children.map((node) => {
    if (node.type === "element" && node.name === "svg") {
      node.children = node.children.map((child) => {
        const options = {
          duration: TRANSITION_DURATION,
          ...getOptionsFromId(child?.attributes?.id),
        };

        return handleChildren(child, options);
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
