import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Link,
  Svg,
  Path,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import resume from "../src/resume.json";

// ---------------------------------------------------------------------------
// Styles — no fontFamily override, so react-pdf uses Helvetica (standard PDF
// base font, metric equivalent of Arial, zero embedding).
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10,
    lineHeight: 1.4,
    letterSpacing: 0.2
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: 'baseline',
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 7
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    alignSelf: 'flex-end',
    marginTop: 9
  },
  icons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    alignSelf: 'flex-start'
  },
  summary: {
    marginBottom: 10,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 12,
  },
  workItem: {
    marginBottom: 12,
  },
  workHeading: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginBottom: 5,
    gap: 6,
  },
  workTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  workDate: {
    fontSize: 9,
    color: "#6b7280",
    top: 1.6
  },
  workSummary: {
    marginBottom: 3,
  },
  highlights: {
    paddingLeft: 12,
    marginTop: 3,
  },
  highlight: {
    marginBottom: 2,
  },
});

// ---------------------------------------------------------------------------
// SVG icons — exact paths from cv.astro, wrapped in clickable Links
// ---------------------------------------------------------------------------

const IconWebsite = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      fill="#374151"
      d="M16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2m-5.15 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56M14.34 14H9.66c-.1-.66-.16-1.32-.16-2s.06-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2M12 19.96c-.83-1.2-1.5-2.53-1.91-3.96h3.82c-.41 1.43-1.08 2.76-1.91 3.96M8 8H5.08A7.92 7.92 0 0 1 9.4 4.44C8.8 5.55 8.35 6.75 8 8m-2.92 8H8c.35 1.25.8 2.45 1.4 3.56A8 8 0 0 1 5.08 16m-.82-2C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2M12 4.03c.83 1.2 1.5 2.54 1.91 3.97h-3.82c.41-1.43 1.08-2.77 1.91-3.97M18.92 8h-2.95a15.7 15.7 0 0 0-1.38-3.56c1.84.63 3.37 1.9 4.33 3.56M12 2C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
    />
  </Svg>
);

const IconLinkedIn = () => (
  <Svg width={16} height={16} viewBox="0 0 256 256">
    <Path
      fill="#0a66c2"
      d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4c-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.91 39.91 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186zM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009s9.851-22.014 22.008-22.016c12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97zM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
    />
  </Svg>
);

const IconGitHub = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      fill="#1f2328"
      d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
    />
  </Svg>
);

const IconMail = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      fill="#374151"
      d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0l-8 5l-8-5zm0 12H4V8l8 5l8-5z"
    />
  </Svg>
);

// ---------------------------------------------------------------------------
// CV document
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM yyyy");
}

const Cv = () => (
  <Document title={`${resume.basics.name} - CV`} author={resume.basics.name}>
    <Page size="A4" style={styles.page}>
      {/* Header: name/label left, icons right */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{resume.basics.name}</Text>
          <Text style={styles.label}>{resume.basics.label}</Text>
        </View>
        <View style={styles.icons}>
          <Link src={resume.basics.url}>
            <IconWebsite />
          </Link>
          <Link src="https://www.linkedin.com/in/mattiaasti/">
            <IconLinkedIn />
          </Link>
          <Link src="https://github.com/mtt87">
            <IconGitHub />
          </Link>
          <Link src="mailto:mattia.asti@gmail.com">
            <IconMail />
          </Link>
        </View>
      </View>

      {/* Summary */}
      <Text style={styles.summary}>{resume.basics.summary}</Text>

      {/* Divider */}
      <View style={styles.hr} />

      {/* Work experience */}
      <View>
        {resume.work.map((work, i) => (
          <View key={i} style={styles.workItem}>
            <View style={styles.workHeading}>
              <Text style={styles.workTitle}>
                {work.position} -{" "}
                {"url" in work && work.url ? (
                  <Link src={work.url} style={{ color: "#111827", textDecoration:'none' }}>
                    {work.name}
                  </Link>
                ) : (
                  work.name
                )}
              </Text>
              <Text style={styles.workDate}>
                {formatDate(work.startDate)} –{" "}
                {work.endDate !== undefined
                  ? formatDate(work.endDate)
                  : "Present"}
              </Text>
            </View>
            <Text style={styles.workSummary}>{work.summary}</Text>
            {"highlights" in work &&
              work.highlights !== undefined &&
              work.highlights.length > 0 && (
                <View style={styles.highlights}>
                  {work.highlights.map((h, j) => (
                    <Text key={j} style={styles.highlight}>
                      {"• "}
                      {h}
                    </Text>
                  ))}
                </View>
              )}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
const outPath = fileURLToPath(
  new URL("../public/mattia_asti.pdf", import.meta.url),
);
console.log(`Generating CV PDF → ${outPath}`);
const buffer = await renderToBuffer(<Cv />);

// Count page objects in the PDF — each page is a /Type /Page entry (not /Pages)
const pageCount = (
  buffer.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []
).length;
if (pageCount > 1) {
  throw new Error(`CV is ${pageCount} pages — content must fit on 1 page.`);
}

writeFileSync(outPath, buffer);
console.log("Done.");
