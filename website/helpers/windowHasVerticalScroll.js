const windowHasVerticalScroll = () => {
  return (
    document.body.scrollHeight >
    (window.innerHeight || document.documentElement.clientHeight)
  );
};

export default windowHasVerticalScroll;
