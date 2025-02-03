import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import marked from "marked";
import DOMPurify from "dompurify";

const MarkdownRenderer = ({ markdownText }) => {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const html = DOMPurify.sanitize(marked(markdownText, { breaks: true }));
    setHtmlContent(html);
  }, [markdownText]);

  return (
    <div
      className="markdown-content pl-4 pr-4"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

MarkdownRenderer.propTypes = {
  markdownText: PropTypes.string,
};

export default MarkdownRenderer;
