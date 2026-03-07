import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ReportTemplate, ReportSection, ReportItem, ItemCondition, ItemRecommendation } from '@/types'

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937' },
  header: { marginBottom: 20, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: '#1e40af', borderBottomStyle: 'solid' },
  headerTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1e40af', marginBottom: 6 },
  headerMeta: { fontSize: 9.5, color: '#6b7280', marginBottom: 2 },
  legendRow: { flexDirection: 'row', marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { fontSize: 8, color: '#6b7280' },
  sectionContainer: { marginBottom: 8 },
  sectionHeader: { backgroundColor: '#eff6ff', paddingVertical: 5, paddingHorizontal: 10, marginBottom: 2 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  itemRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 2, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid', alignItems: 'flex-start' },
  itemName: { width: '28%', fontSize: 9, paddingRight: 6 },
  condBadge: { width: 38, paddingVertical: 2, paddingHorizontal: 4, borderRadius: 3, marginRight: 4 },
  condText: { fontSize: 7.5, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
  recBadge: { width: 48, paddingVertical: 2, paddingHorizontal: 4, borderRadius: 3, marginRight: 6 },
  recText: { fontSize: 7.5, textAlign: 'center' },
  itemComment: { flex: 1, fontSize: 8.5, color: '#374151', fontStyle: 'italic' },
  noAssessment: { fontSize: 8.5, color: '#9ca3af' },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#e5e7eb', borderTopStyle: 'solid', paddingTop: 6 },
  footerText: { fontSize: 7.5, color: '#9ca3af' },
  summaryBox: { backgroundColor: '#fefce8', borderWidth: 0.5, borderColor: '#fde68a', borderStyle: 'solid', borderRadius: 4, padding: 10, marginBottom: 16 },
  summaryTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#92400e', marginBottom: 6 },
  summaryItem: { flexDirection: 'row', marginBottom: 3 },
  summaryBullet: { width: 8, fontSize: 9, color: '#d97706' },
  summaryText: { flex: 1, fontSize: 9, color: '#374151' },
})

function conditionStyle(c: ItemCondition | null): { bg: string; text: string } {
  switch (c) {
    case 'good': return { bg: '#dcfce7', text: '#15803d' }
    case 'fair': return { bg: '#fef3c7', text: '#b45309' }
    case 'poor': return { bg: '#fee2e2', text: '#b91c1c' }
    case 'not_inspected': return { bg: '#f3f4f6', text: '#6b7280' }
    default: return { bg: '#f3f4f6', text: '#9ca3af' }
  }
}

function recStyle(r: ItemRecommendation | null): { bg: string; text: string } {
  switch (r) {
    case 'monitor': return { bg: '#dbeafe', text: '#1d4ed8' }
    case 'repair': return { bg: '#ffedd5', text: '#c2410c' }
    case 'replace': return { bg: '#fee2e2', text: '#b91c1c' }
    case 'safety_hazard': return { bg: '#ede9fe', text: '#6d28d9' }
    default: return { bg: 'transparent', text: '#9ca3af' }
  }
}

function conditionLabel(c: ItemCondition | null): string {
  switch (c) {
    case 'good': return 'Good'
    case 'fair': return 'Fair'
    case 'poor': return 'Poor'
    case 'not_inspected': return 'N/I'
    default: return '—'
  }
}

function recLabel(r: ItemRecommendation | null): string {
  switch (r) {
    case 'monitor': return 'Monitor'
    case 'repair': return 'Repair'
    case 'replace': return 'Replace'
    case 'safety_hazard': return 'Safety!'
    case 'none': return ''
    default: return ''
  }
}

function getIssueItems(sections: ReportSection[]): { sectionName: string; item: ReportItem }[] {
  const issues: { sectionName: string; item: ReportItem }[] = []
  for (const section of sections) {
    for (const item of section.items) {
      if (item.condition === 'poor' || item.recommendation === 'safety_hazard' || item.recommendation === 'repair' || item.recommendation === 'replace') {
        issues.push({ sectionName: section.name, item })
      }
    }
  }
  return issues
}

export interface ReportDocumentProps {
  template: ReportTemplate
  inspectionAddress?: string
  clientName?: string
  inspectionDate?: string
  inspectorName?: string
}

export function ReportDocument({ template, inspectionAddress, clientName, inspectionDate, inspectorName }: ReportDocumentProps) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const issues = getIssueItems(template.sections)

  return (
    <Document title={template.name}>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home Inspection Report</Text>
          <Text style={styles.headerMeta}>{inspectionAddress ?? 'Property Address Not Specified'}</Text>
          {clientName && <Text style={styles.headerMeta}>Client: {clientName}</Text>}
          <Text style={styles.headerMeta}>Inspection Date: {inspectionDate ?? today}</Text>
          {inspectorName && <Text style={styles.headerMeta}>Inspector: {inspectorName}</Text>}
        </View>

        {/* Condition Legend */}
        <View style={styles.legendRow}>
          {(['good', 'fair', 'poor', 'not_inspected'] as ItemCondition[]).map(c => {
            const s = conditionStyle(c)
            return (
              <View key={c} style={styles.legendItem}>
                <View style={{ ...styles.legendDot, backgroundColor: s.bg, borderWidth: 0.5, borderColor: s.text, borderStyle: 'solid' }} />
                <Text style={{ ...styles.legendText, color: s.text }}>{conditionLabel(c)}</Text>
              </View>
            )
          })}
        </View>

        {/* Issues Summary */}
        {issues.length > 0 && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Items Requiring Attention ({issues.length})</Text>
            {issues.map(({ sectionName, item }) => (
              <View key={item.id} style={styles.summaryItem}>
                <Text style={styles.summaryBullet}>•</Text>
                <Text style={styles.summaryText}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{sectionName}: </Text>
                  {item.name}
                  {item.recommendation && item.recommendation !== 'none'
                    ? ` [${recLabel(item.recommendation)}]`
                    : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sections */}
        {template.sections.map(section => (
          <View key={section.id} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
            </View>
            {section.items.map(item => {
              const cs = conditionStyle(item.condition)
              const rs = recStyle(item.recommendation)
              const showRec = item.recommendation && item.recommendation !== 'none'
              return (
                <View key={item.id} style={styles.itemRow} wrap={false}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.condition ? (
                    <>
                      <View style={{ ...styles.condBadge, backgroundColor: cs.bg }}>
                        <Text style={{ ...styles.condText, color: cs.text }}>{conditionLabel(item.condition)}</Text>
                      </View>
                      {showRec ? (
                        <View style={{ ...styles.recBadge, backgroundColor: rs.bg }}>
                          <Text style={{ ...styles.recText, color: rs.text }}>{recLabel(item.recommendation)}</Text>
                        </View>
                      ) : (
                        <View style={{ width: 52 }} />
                      )}
                      <Text style={styles.itemComment}>{item.comment ?? ''}</Text>
                    </>
                  ) : (
                    <Text style={styles.noAssessment}>Not assessed</Text>
                  )}
                </View>
              )
            })}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{template.name}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
