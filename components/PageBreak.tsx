const PageBreak = () => {
  return (
    <span
      className="hidden print:block print:h-4"
      style={{
        pageBreakAfter: "always",
      }}
    />
  );
};

export default PageBreak;
