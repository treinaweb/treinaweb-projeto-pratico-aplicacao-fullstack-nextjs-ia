import type { ReactNode } from "react";
import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import {
  PROFICIENCY_LABELS,
  RESUME_LABELS,
  formatMonth,
  formatPeriod,
} from "@/lib/resume/labels";
import type { ResumeContent } from "@/lib/validation/resume";

// Built-in Helvetica (WinAnsi): covers Portuguese accents without bundling fonts.
const styles = StyleSheet.create({
  page: {
    paddingVertical: 36,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#27272a",
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    lineHeight: 1.2,
    color: "#000000",
  },
  headline: { fontSize: 12, lineHeight: 1.4, marginTop: 2, color: "#3f3f46" },
  muted: { color: "#52525b" },
  links: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  link: { color: "#52525b", marginRight: 10 },
  section: { marginTop: 14 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#3f3f46",
    paddingBottom: 3,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  item: { marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  strong: { fontFamily: "Helvetica-Bold", color: "#000000" },
  period: { color: "#71717a", marginLeft: 12 },
  bullet: { flexDirection: "row", marginLeft: 6 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1 },
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// Section order here must match components/resumes/resume-view.tsx.
export function ResumeDocument({ content }: { content: ResumeContent }) {
  const { language, contact } = content;
  const labels = RESUME_LABELS[language];
  const contactLine = [contact.email, contact.phone, contact.location].filter(
    Boolean,
  );

  return (
    <Document title={`${contact.name} - ${content.headline}`} author={contact.name}>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.headline}>{content.headline}</Text>
          <Text style={styles.muted}>{contactLine.join(" · ")}</Text>
          {contact.links.length > 0 && (
            <View style={styles.links}>
              {contact.links.map((link) => (
                <Link key={link.url} src={link.url} style={styles.link}>
                  {link.label}
                </Link>
              ))}
            </View>
          )}
        </View>

        {content.summary !== "" && (
          <Section title={labels.summary}>
            <Text>{content.summary}</Text>
          </Section>
        )}

        {content.experiences.length > 0 && (
          <Section title={labels.experiences}>
            {content.experiences.map((item, index) => (
              <View key={index} style={styles.item} wrap={false}>
                <View style={styles.row}>
                  <Text style={styles.strong}>
                    {item.role} · {item.company}
                  </Text>
                  <Text style={styles.period}>
                    {formatPeriod(item.startDate, item.endDate, language)}
                  </Text>
                </View>
                {item.highlights.map((highlight, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={styles.bulletText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Section>
        )}

        {content.education.length > 0 && (
          <Section title={labels.education}>
            {content.education.map((item, index) => (
              <View key={index} style={[styles.row, styles.item]}>
                <Text>
                  <Text style={styles.strong}>{item.degree}</Text> ·{" "}
                  {item.institution}
                </Text>
                <Text style={styles.period}>
                  {formatPeriod(item.startDate, item.endDate, language)}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {content.courses.length > 0 && (
          <Section title={labels.courses}>
            {content.courses.map((item, index) => (
              <Text key={index} style={styles.item}>
                <Text style={styles.strong}>{item.name}</Text>
                {[
                  item.institution,
                  item.completedAt && formatMonth(item.completedAt, language),
                  item.workloadHours && labels.hours(item.workloadHours),
                ]
                  .filter(Boolean)
                  .map((part) => ` · ${part}`)
                  .join("")}
              </Text>
            ))}
          </Section>
        )}

        {content.projects.length > 0 && (
          <Section title={labels.projects}>
            {content.projects.map((item, index) => (
              <View key={index} style={styles.item} wrap={false}>
                <Text>
                  <Text style={styles.strong}>{item.name}</Text>
                  {item.link && (
                    <>
                      {" · "}
                      <Link src={item.link} style={styles.muted}>
                        {item.link}
                      </Link>
                    </>
                  )}
                </Text>
                {item.description !== "" && <Text>{item.description}</Text>}
              </View>
            ))}
          </Section>
        )}

        {content.skills.length > 0 && (
          <Section title={labels.skills}>
            <Text>{content.skills.join(" · ")}</Text>
          </Section>
        )}

        {content.languages.length > 0 && (
          <Section title={labels.languages}>
            <Text>
              {content.languages
                .map(
                  (item) =>
                    `${item.name} (${PROFICIENCY_LABELS[language][item.proficiency]})`,
                )
                .join(" · ")}
            </Text>
          </Section>
        )}
      </Page>
    </Document>
  );
}

export function renderResumePdf(content: ResumeContent) {
  return renderToBuffer(<ResumeDocument content={content} />);
}
