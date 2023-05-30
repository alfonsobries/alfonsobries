const capitalize = (str: string): string => {
  if (str.length === 0) {
    return str; // Return empty string if input is empty
  }

  const firstChar = str.charAt(0).toUpperCase(); // Get the first character and capitalize it
  const remainingChars = str.slice(1); // Get the remaining characters

  return firstChar + remainingChars;
};

export default capitalize;
