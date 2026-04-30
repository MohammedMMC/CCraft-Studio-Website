"use client";

import MDEditor from "@uiw/react-md-editor";

type ProjectDescriptionMarkdownProps = {
  content: string;
};

export default function ProjectDescriptionMarkdown({
  content,
}: ProjectDescriptionMarkdownProps) {
  return (
    <div data-color-mode="dark">
      <MDEditor.Markdown
        source={content}
        components={{ h1: "h2", h2: "h3", h3: "h4", h4: "h5", h5: "h6" }}
        style={{
          backgroundColor: "transparent",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}