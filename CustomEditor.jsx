import React, { useState } from "react";
import RichTextEditor from "react-rte";

const MAX_CHARACTERS = 1000;

const CustomEditor = ({ onChange }) => {
  const [editorValue, setEditorValue] = useState(RichTextEditor.createEmptyValue());
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState("");

  const handleChange = (value) => {
    const text = value.toString("markdown"); // Extracting plain text
    if (text.length <= MAX_CHARACTERS) {
      setEditorValue(value);
      setCharCount(text.length);
      setError("");
      onChange && onChange(value);
    } else {
      setError(`Character limit exceeded! Max allowed: ${MAX_CHARACTERS}`);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}>
      <RichTextEditor
        value={editorValue}
        onChange={handleChange}
        placeholder="Type here..."
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <span style={{ color: charCount > MAX_CHARACTERS ? "red" : "#555" }}>
          {charCount}/{MAX_CHARACTERS}
        </span>
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>
    </div>
  );
};

export default CustomEditor;
