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
        style={{
          backgroundColor: "transparent",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}