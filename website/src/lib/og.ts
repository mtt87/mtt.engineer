import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const interBold = readFileSync(
  require.resolve("@fontsource/inter/files/inter-latin-700-normal.woff"),
);

const avatarPng = readFileSync(join(process.cwd(), "public/avatar.png"));
const avatarBase64 = `data:image/png;base64,${avatarPng.toString("base64")}`;

export async function generateOgImage(
  title: string,
  description: string,
): Promise<Buffer> {
  const svg = await satori(
    {
      type: "div",
      key: 'container',
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#111",
          padding: "60px",
        },
        children: [
          {
            type: "div",
            key: 'avatar',
            props: {
              style: { display: "flex", alignItems: "center", gap: "16px" },
              children: [
                {
                  type: "img",
                  props: {
                    src: avatarBase64,
                    width: 64,
                    height: 64,
                    style: { borderRadius: "50%" },
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { color: "#9ca3af", fontSize: 28 },
                    children: "mtt.engineer",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            key: 'content',
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      color: "#ffffff",
                      fontSize: 52,
                      lineHeight: 1.2,
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      color: "#9ca3af",
                      fontSize: 28,
                      lineHeight: 1.4,
                    },
                    children: description,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });

  return resvg.render().asPng() as Buffer;
}
