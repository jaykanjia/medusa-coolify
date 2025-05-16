import { promises as fs } from "fs";
import path from "path";
import juice from "juice";
type Props = {
  template: any;
};
export const getCssInEmail = async ({ template }: Props) => {
  const css = await fs.readFile(
    path.join(__dirname, "../../public/css/quill.snow.css"),
    "utf-8"
  );
  const htmlTemplate = `
   <html>
      <head>
      </head>
      <body>
      <div class="quill">
      <div class="ql-container ql-snow">
      <div class="ql-editor" data-gramm="false">
        ${template}
      </div></div></div>
      </body>
      </html>
  `;
  const inlinedTemplate = juice.inlineContent(htmlTemplate, css);

  return inlinedTemplate;
};
