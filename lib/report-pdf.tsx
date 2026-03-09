/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import type { ReportTemplate, ReportSection, ReportItem, ItemCondition, ItemRecommendation } from '@/types'

const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 44,
    paddingHorizontal: 34,
    fontFamily: 'Helvetica',
    color: '#1f2937',
    fontSize: 10,
  },
  coverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    minHeight: 56,
  },
  coverLogo: {
    width: 72,
    height: 72,
    objectFit: 'contain',
  },
  coverCompanyBlock: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  coverCompanyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 2,
  },
  coverContact: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.35,
  },
  coverHero: {
    width: '100%',
    height: 265,
    objectFit: 'cover',
    marginTop: 8,
    marginBottom: 14,
    borderRadius: 4,
  },
  coverHeroPlaceholder: {
    width: '100%',
    height: 265,
    marginTop: 8,
    marginBottom: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'solid',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  coverSummary: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 18,
  },
  coverSummaryTitle: {
    fontSize: 24,
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  coverSummarySub: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1.1,
  },
  coverSummaryAddress: {
    fontSize: 18,
    color: '#374151',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  coverSummaryClient: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  coverSummaryDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 14,
  },
  inspectorCard: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 6,
  },
  inspectorPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    objectFit: 'cover',
    marginBottom: 8,
  },
  inspectorPhotoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectorName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  inspectorMeta: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },

  findingsHeader: {
    marginBottom: 10,
  },
  findingsTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  findingsAddress: {
    fontSize: 10,
    color: '#6b7280',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginBottom: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  summaryBullet: {
    width: 10,
    color: '#475569',
    fontSize: 9,
  },
  summaryText: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.3,
  },

  sectionCard: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  itemHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    backgroundColor: '#fafafa',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  itemHeaderName: {
    width: '42%',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  itemHeaderCondition: {
    width: '18%',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  itemHeaderRec: {
    width: '20%',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  itemHeaderComment: {
    width: '20%',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderBottomStyle: 'solid',
  },
  itemName: {
    width: '42%',
    paddingRight: 5,
    fontSize: 9,
    color: '#111827',
  },
  itemCond: {
    width: '18%',
    paddingRight: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  itemRec: {
    width: '20%',
    paddingRight: 4,
    fontSize: 8.5,
  },
  itemComment: {
    width: '20%',
    fontSize: 8.5,
    color: '#475569',
  },
  emptyComment: {
    color: '#9ca3af',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 34,
    right: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

function conditionLabel(c: ItemCondition | null): string {
  switch (c) {
    case 'good': return 'Good'
    case 'fair': return 'Fair'
    case 'poor': return 'Poor'
    case 'not_inspected': return 'Not Inspected'
    default: return 'Not Assessed'
  }
}

function conditionColor(c: ItemCondition | null): string {
  switch (c) {
    case 'good': return '#15803d'
    case 'fair': return '#b45309'
    case 'poor': return '#b91c1c'
    case 'not_inspected': return '#6b7280'
    default: return '#9ca3af'
  }
}

function recommendationLabel(r: ItemRecommendation | null): string {
  switch (r) {
    case 'monitor': return 'Monitor'
    case 'repair': return 'Repair'
    case 'replace': return 'Replace'
    case 'safety_hazard': return 'Safety Hazard'
    case 'none': return 'None'
    default: return 'None'
  }
}

function getIssueItems(sections: ReportSection[]): { sectionName: string; item: ReportItem }[] {
  const issues: { sectionName: string; item: ReportItem }[] = []
  for (const section of sections) {
    for (const item of section.items) {
      if (
        item.condition === 'poor' ||
        item.recommendation === 'safety_hazard' ||
        item.recommendation === 'repair' ||
        item.recommendation === 'replace'
      ) {
        issues.push({ sectionName: section.name, item })
      }
    }
  }
  return issues
}

function formatDateDisplay(dateInput?: string | null): string {
  if (!dateInput) return new Date().toLocaleDateString('en-US')
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ? new Date(`${dateInput}T12:00:00Z`)
    : new Date(dateInput)
  if (Number.isNaN(date.getTime())) return dateInput
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export interface ReportDocumentProps {
  template: ReportTemplate
  branding: {
    companyName?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    logoUrl?: string | null
    inspectorName?: string | null
    inspectorPhotoUrl?: string | null
    defaultCoverPhotoUrl?: string | null
  }
  inspectionMeta: {
    inspectionType?: string | null
    inspectionAddress?: string | null
    clientName?: string | null
    inspectionDate?: string | null
    coverPhotoUrl?: string | null
  }
}

export function ReportDocument({ template, branding, inspectionMeta }: ReportDocumentProps) {
  const issues = getIssueItems(template.sections)
  const companyName = branding.companyName ?? 'Professional Home Inspections LLC'
  const inspectionType = inspectionMeta.inspectionType ?? 'Residential Property Inspection'
  const inspectionAddress = inspectionMeta.inspectionAddress ?? 'Property Address'
  const inspectionDate = formatDateDisplay(inspectionMeta.inspectionDate)
  const coverPhoto = inspectionMeta.coverPhotoUrl || branding.defaultCoverPhotoUrl || null

  return (
    <Document title={template.name}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.coverHeader}>
          {branding.logoUrl
            ? <Image src={branding.logoUrl} style={styles.coverLogo} />
            : <View style={{ width: 72 }} />}

          <View style={styles.coverCompanyBlock}>
            <Text style={styles.coverCompanyName}>{companyName}</Text>
            {branding.phone && <Text style={styles.coverContact}>{branding.phone}</Text>}
            {branding.email && <Text style={styles.coverContact}>{branding.email}</Text>}
            {branding.website && <Text style={styles.coverContact}>{branding.website}</Text>}
          </View>
        </View>

        {coverPhoto
          ? <Image src={coverPhoto} style={styles.coverHero} />
          : (
            <View style={styles.coverHeroPlaceholder}>
              <Text style={styles.placeholderText}>No Cover Photo Set</Text>
            </View>
          )}

        <View style={styles.coverSummary}>
          <Text style={styles.coverSummarySub}>{inspectionType}</Text>
          <Text style={styles.coverSummaryAddress}>{inspectionAddress}</Text>
          {inspectionMeta.clientName && (
            <Text style={styles.coverSummaryClient}>{inspectionMeta.clientName}</Text>
          )}
          <Text style={styles.coverSummaryDate}>{inspectionDate}</Text>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.inspectorCard}>
          {branding.inspectorPhotoUrl
            ? <Image src={branding.inspectorPhotoUrl} style={styles.inspectorPhoto} />
            : (
              <View style={styles.inspectorPhotoPlaceholder}>
                <Text style={styles.placeholderText}>Inspector</Text>
              </View>
            )}
          <Text style={styles.inspectorName}>{branding.inspectorName ?? 'Inspector'}</Text>
          <Text style={styles.inspectorMeta}>Certified Master Inspector</Text>
          {branding.phone && <Text style={styles.inspectorMeta}>{branding.phone}</Text>}
          {branding.email && <Text style={styles.inspectorMeta}>{branding.email}</Text>}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <View style={styles.findingsHeader}>
          <Text style={styles.findingsTitle}>{template.name}</Text>
          <Text style={styles.findingsAddress}>{inspectionAddress}</Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Summary of Key Findings ({issues.length})</Text>
          {issues.length === 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryBullet}>•</Text>
              <Text style={styles.summaryText}>No major repair or safety findings were identified.</Text>
            </View>
          ) : (
            issues.map(({ sectionName, item }) => (
              <View key={item.id} style={styles.summaryRow}>
                <Text style={styles.summaryBullet}>•</Text>
                <Text style={styles.summaryText}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{sectionName}: </Text>
                  {item.name} ({recommendationLabel(item.recommendation)})
                </Text>
              </View>
            ))
          )}
        </View>

        {template.sections.map(section => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
            </View>

            <View style={styles.itemHeader}>
              <Text style={styles.itemHeaderName}>Item</Text>
              <Text style={styles.itemHeaderCondition}>Condition</Text>
              <Text style={styles.itemHeaderRec}>Recommendation</Text>
              <Text style={styles.itemHeaderComment}>Comment</Text>
            </View>

            {section.items.map(item => (
              <View key={item.id} style={styles.itemRow} wrap={false}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={{ ...styles.itemCond, color: conditionColor(item.condition) }}>
                  {conditionLabel(item.condition)}
                </Text>
                <Text style={styles.itemRec}>{recommendationLabel(item.recommendation)}</Text>
                <Text style={item.comment ? styles.itemComment : { ...styles.itemComment, ...styles.emptyComment }}>
                  {item.comment || '—'}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
