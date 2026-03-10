'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  ArrowLeft,
  Download,
  Loader2,
  AlertTriangle,
  Camera,
  Mic,
  MicOff,
  Save,
} from 'lucide-react'
import type { ReportTemplate, ReportSection, ReportItem, ItemCondition, ItemRecommendation, Inspection, UserProfile } from '@/types'
import { isDemoMode } from '@/lib/demo'

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

// ─── Condition & Recommendation config ───────────────────────────────────────

const CONDITIONS: { value: ItemCondition; label: string; color: string; bg: string }[] = [
  { value: 'good', label: 'Good', color: 'text-green-700', bg: 'bg-green-100' },
  { value: 'fair', label: 'Fair', color: 'text-amber-700', bg: 'bg-amber-100' },
  { value: 'poor', label: 'Poor', color: 'text-red-700', bg: 'bg-red-100' },
  { value: 'not_inspected', label: 'N/I', color: 'text-gray-500', bg: 'bg-gray-100' },
]

const RECOMMENDATIONS: { value: ItemRecommendation; label: string; color: string; bg: string }[] = [
  { value: 'none', label: 'None', color: 'text-gray-400', bg: 'bg-gray-50' },
  { value: 'monitor', label: 'Monitor', color: 'text-blue-700', bg: 'bg-blue-100' },
  { value: 'repair', label: 'Repair', color: 'text-orange-700', bg: 'bg-orange-100' },
  { value: 'replace', label: 'Replace', color: 'text-red-700', bg: 'bg-red-100' },
  { value: 'safety_hazard', label: 'Safety Hazard', color: 'text-purple-700', bg: 'bg-purple-100' },
]

function conditionConfig(c: ItemCondition | null) {
  return CONDITIONS.find(x => x.value === c) ?? null
}

function recConfig(r: ItemRecommendation | null) {
  return RECOMMENDATIONS.find(x => x.value === r) ?? null
}

const QUICK_DEFECT_PHRASES = [
  'Recommend evaluation by licensed contractor.',
  'Observed active moisture staining; monitor and repair as needed.',
  'Safety concern noted. Correct before occupancy.',
  'Deferred due to limited access at time of inspection.',
  'Component is near end of service life.',
]

// ─── Sortable Item Row ────────────────────────────────────────────────────────

function SortableItemRow({
  item,
  sectionId,
  onUpdate,
  onDelete,
  showAnswerFields,
  readOnlyName,
}: {
  item: ReportItem
  sectionId: string
  onUpdate: (sectionId: string, itemId: string, updates: Partial<ReportItem>) => void
  onDelete: (sectionId: string, itemId: string) => void
  showAnswerFields: boolean
  readOnlyName: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [recording, setRecording] = useState(false)
  const speechRef = useRef<SpeechRecognitionInstance | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const cc = conditionConfig(item.condition)
  const rc = recConfig(item.recommendation)
  const hasIssue = showAnswerFields && (item.recommendation === 'repair' || item.recommendation === 'replace' || item.recommendation === 'safety_hazard' || item.condition === 'poor')

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      {/* Item summary row */}
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg group">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0 touch-none"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
        >
          <span className="text-sm text-gray-800 truncate flex-1">{item.name}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasIssue && <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />}
            {showAnswerFields && cc && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cc.bg} ${cc.color}`}>
                {cc.label}
              </span>
            )}
            {showAnswerFields && rc && rc.value !== 'none' && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>
                {rc.label}
              </span>
            )}
            {expanded
              ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
          </div>
        </button>

        <button
          onClick={() => onDelete(sectionId, item.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity flex-shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="mx-3 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          {/* Item name */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Item Name</label>
            <input
              type="text"
              value={item.name}
              onChange={e => onUpdate(sectionId, item.id, { name: e.target.value })}
              disabled={readOnlyName}
              className="mt-1 w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {showAnswerFields && (
            <>
              {/* Condition & Recommendation row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Condition</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {CONDITIONS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => onUpdate(sectionId, item.id, {
                          condition: item.condition === c.value ? null : c.value,
                        })}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                          item.condition === c.value
                            ? `${c.bg} ${c.color} border-current`
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recommendation</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {RECOMMENDATIONS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => onUpdate(sectionId, item.id, {
                          recommendation: item.recommendation === r.value ? null : r.value,
                        })}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          item.recommendation === r.value
                            ? `${r.bg} ${r.color} border-current font-medium`
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inspector Comment</label>
                <textarea
                  value={item.comment ?? ''}
                  onChange={e => onUpdate(sectionId, item.id, { comment: e.target.value || null })}
                  rows={2}
                  placeholder="Add notes about this item..."
                  className="mt-1 w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {QUICK_DEFECT_PHRASES.map(phrase => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => onUpdate(sectionId, item.id, {
                        comment: item.comment ? `${item.comment} ${phrase}` : phrase,
                      })}
                      className="text-xs px-2 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const recognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition
                      if (!recognitionCtor) return
                      if (recording && speechRef.current) {
                        speechRef.current.stop()
                        setRecording(false)
                        return
                      }
                      const recognition = new recognitionCtor()
                      speechRef.current = recognition
                      recognition.lang = 'en-US'
                      recognition.interimResults = false
                      recognition.maxAlternatives = 1
                      recognition.onresult = event => {
                        const transcript = event.results[0]?.[0]?.transcript?.trim()
                        if (!transcript) return
                        onUpdate(sectionId, item.id, {
                          comment: item.comment ? `${item.comment} ${transcript}` : transcript,
                        })
                      }
                      recognition.onend = () => setRecording(false)
                      recognition.onerror = () => setRecording(false)
                      setRecording(true)
                      recognition.start()
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border ${
                      recording ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {recording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {recording ? 'Stop Dictation' : 'Dictate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Add Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={event => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        const base64 = typeof reader.result === 'string' ? reader.result : ''
                        if (!base64) return
                        onUpdate(sectionId, item.id, {
                          photo_urls: [...item.photo_urls, base64],
                        })
                      }
                      reader.readAsDataURL(file)
                      event.target.value = ''
                    }}
                  />
                </div>
                {item.photo_urls.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {item.photo_urls.map((url, index) => (
                      <div key={`${url.slice(0, 24)}-${index}`} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Inspection item ${index + 1}`} className="h-20 w-full object-cover rounded-md border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => onUpdate(sectionId, item.id, {
                            photo_urls: item.photo_urls.filter((_, i) => i !== index),
                          })}
                          className="absolute top-1 right-1 bg-white/90 text-xs px-1.5 py-0.5 rounded border border-gray-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sortable Section Card ────────────────────────────────────────────────────

function SortableSectionCard({
  section,
  onItemUpdate,
  onItemDelete,
  onItemAdd,
  onSectionDelete,
  onSectionRename,
  onItemsReorder,
  showAnswerFields,
  allowStructureEdits,
  sectionAnchorId,
}: {
  section: ReportSection
  onItemUpdate: (sectionId: string, itemId: string, updates: Partial<ReportItem>) => void
  onItemDelete: (sectionId: string, itemId: string) => void
  onItemAdd: (sectionId: string) => void
  onSectionDelete: (sectionId: string) => void
  onSectionRename: (sectionId: string, name: string) => void
  onItemsReorder: (sectionId: string, event: DragEndEvent) => void
  showAnswerFields: boolean
  allowStructureEdits: boolean
  sectionAnchorId: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingName, setEditingName] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const issueCount = section.items.filter(i =>
    i.condition === 'poor' || i.recommendation === 'repair' || i.recommendation === 'replace' || i.recommendation === 'safety_hazard'
  ).length

  return (
    <div
      ref={setNodeRef}
      id={sectionAnchorId}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm ${isDragging ? 'opacity-50 shadow-xl' : ''}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        {allowStructureEdits && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0 touch-none"
            tabIndex={-1}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}

        <button onClick={() => setCollapsed(c => !c)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </button>

        {editingName && allowStructureEdits ? (
          <input
            autoFocus
            type="text"
            defaultValue={section.name}
            onBlur={e => { onSectionRename(section.id, e.target.value); setEditingName(false) }}
            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
            className="flex-1 text-sm font-semibold text-gray-900 border-b border-blue-400 focus:outline-none bg-transparent"
          />
        ) : allowStructureEdits ? (
          <button
            onClick={() => setEditingName(true)}
            className="flex-1 text-left text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {section.name}
          </button>
        ) : (
          <span className="flex-1 text-left text-sm font-semibold text-gray-900">{section.name}</span>
        )}

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {showAnswerFields && issueCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-200">
              {issueCount} issue{issueCount > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs text-gray-400">{section.items.length} items</span>
          {allowStructureEdits && (
            <button
              onClick={() => onSectionDelete(section.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="py-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={e => onItemsReorder(section.id, e)}
          >
            <SortableContext
              items={section.items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {section.items.map(item => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  sectionId={section.id}
                  onUpdate={onItemUpdate}
                  onDelete={onItemDelete}
                  showAnswerFields={showAnswerFields}
                  readOnlyName={!allowStructureEdits}
                />
              ))}
            </SortableContext>
          </DndContext>

          {allowStructureEdits && (
            <button
              onClick={() => onItemAdd(section.id)}
              className="flex items-center gap-1.5 mx-3 mt-1 mb-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main TemplateEditor ──────────────────────────────────────────────────────

export function TemplateEditor({
  template,
  inspectionContext,
  profileContext,
  mode = 'template',
  reportStatus = 'draft',
}: {
  template: ReportTemplate
  inspectionContext?: Inspection | null
  profileContext?: Partial<UserProfile> | null
  mode?: 'template' | 'report'
  reportStatus?: 'draft' | 'finalized'
}) {
  const [sections, setSections] = useState<ReportSection[]>(template.sections)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(null)
  const [online, setOnline] = useState(true)
  const draftKey = mode === 'report' && inspectionContext?.id
    ? `specthub_report_draft_${inspectionContext.id}`
    : null
  const sectionAnchorPrefix = mode === 'report' && inspectionContext?.id
    ? `report-section-${inspectionContext.id}-`
    : 'template-section-'

  useEffect(() => {
    if (typeof window === 'undefined') return
    setOnline(window.navigator.onLine)
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!draftKey || typeof window === 'undefined') return
    const raw = window.localStorage.getItem(draftKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as { sections?: ReportSection[] }
      if (Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        setSections(parsed.sections)
      }
    } catch {
      // Ignore corrupted local drafts.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  useEffect(() => {
    if (!draftKey || typeof window === 'undefined') return
    window.localStorage.setItem(draftKey, JSON.stringify({ sections, updatedAt: new Date().toISOString() }))
  }, [sections, draftKey])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── Section handlers ──
  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => {
      const oldIndex = prev.findIndex(s => s.id === active.id)
      const newIndex = prev.findIndex(s => s.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function handleSectionDelete(sectionId: string) {
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }

  function handleSectionRename(sectionId: string, name: string) {
    if (!name.trim()) return
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, name: name.trim() } : s))
  }

  function handleAddSection() {
    const name = prompt('Section name:')
    if (!name?.trim()) return
    setSections(prev => [...prev, {
      id: `sec-${Date.now()}`,
      name: name.trim(),
      items: [],
    }])
  }

  // ── Item handlers ──
  const handleItemUpdate = useCallback((sectionId: string, itemId: string, updates: Partial<ReportItem>) => {
    setSections(prev => prev.map(s =>
      s.id !== sectionId ? s : {
        ...s,
        items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
      }
    ))
  }, [])

  const handleItemDelete = useCallback((sectionId: string, itemId: string) => {
    setSections(prev => prev.map(s =>
      s.id !== sectionId ? s : { ...s, items: s.items.filter(i => i.id !== itemId) }
    ))
  }, [])

  function handleAddItem(sectionId: string) {
    const name = prompt('Item name:')
    if (!name?.trim()) return
    setSections(prev => prev.map(s =>
      s.id !== sectionId ? s : {
        ...s,
        items: [...s.items, {
          id: `item-${Date.now()}`,
          name: name.trim(),
          condition: null,
          comment: null,
          recommendation: null,
          photo_urls: [],
        }],
      }
    ))
  }

  const handleItemsReorder = useCallback((sectionId: string, event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      const oldIndex = s.items.findIndex(i => i.id === active.id)
      const newIndex = s.items.findIndex(i => i.id === over.id)
      return { ...s, items: arrayMove(s.items, oldIndex, newIndex) }
    }))
  }, [])

  // ── PDF generation ──
  async function handleGeneratePDF() {
    setGeneratingPDF(true)
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/report-pdf'),
      ])
      const { createElement } = await import('react')
      const inspectionAddress = inspectionContext
        ? `${inspectionContext.address}, ${inspectionContext.city}, ${inspectionContext.state} ${inspectionContext.zip}`
        : 'Inspection Property'
      const clientName = inspectionContext?.client
        ? `${inspectionContext.client.first_name} ${inspectionContext.client.last_name}`
        : undefined
      const docElement = createElement(ReportDocument, {
        template: { ...template, sections },
        branding: {
          companyName: profileContext?.company_name ?? 'Specthub',
          phone: profileContext?.phone ?? null,
          email: profileContext?.email ?? null,
          website: profileContext?.website ?? null,
          logoUrl: profileContext?.logo_url ?? null,
          inspectorName: profileContext?.full_name ?? 'Inspector',
          inspectorPhotoUrl: profileContext?.inspector_photo_url ?? null,
          defaultCoverPhotoUrl: profileContext?.default_cover_photo_url ?? null,
        },
        inspectionMeta: {
          inspectionType: inspectionContext?.inspection_type ?? 'Residential Property Inspection',
          inspectionAddress,
          clientName: clientName ?? null,
          inspectionDate: inspectionContext?.scheduled_date ?? new Date().toISOString().split('T')[0],
          coverPhotoUrl: inspectionContext?.cover_photo_url ?? null,
        },
      })
      // @react-pdf/renderer pdf() requires a Document element — cast needed
      // eslint-disable-next-line
      const blob = await pdf(docElement as Parameters<typeof pdf>[0]).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name.replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setGeneratingPDF(false)
    }
  }

  async function saveReportDraft(silent = false) {
    if (!inspectionContext?.id || mode !== 'report' || isDemoMode()) return
    if (!silent) setSaving(true)
    if (silent) setAutoSaving(true)
    try {
      await fetch(`/api/inspection-reports/${inspectionContext.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          status: reportStatus,
          answers: sections,
        }),
      })
      setLastAutoSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
      if (!silent) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      if (!silent) setSaving(false)
      if (silent) setAutoSaving(false)
    }
  }

  async function handleSave() {
    if (isDemoMode()) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      return
    }
    setSaving(true)
    try {
      if (mode === 'template') {
        const templateSections = sections.map(section => ({
          ...section,
          items: section.items.map(item => ({
            ...item,
            condition: null,
            recommendation: null,
            comment: null,
            photo_urls: [],
          })),
        }))
        await fetch(`/api/reports/${template.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sections: templateSections,
          }),
        })
      } else if (inspectionContext?.id) {
        await saveReportDraft()
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (mode !== 'report' || !inspectionContext?.id || isDemoMode()) return
    if (!online) return
    const timer = window.setTimeout(() => {
      void saveReportDraft(true)
    }, 1200)
    return () => window.clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, mode, inspectionContext?.id, online])

  // ── Summary stats ──
  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)
  const totalIssues = sections.reduce((sum, s) =>
    sum + s.items.filter(i =>
      i.condition === 'poor' || i.recommendation === 'repair' || i.recommendation === 'replace' || i.recommendation === 'safety_hazard'
    ).length, 0)
  const assessed = sections.reduce((sum, s) =>
    sum + s.items.filter(i => i.condition !== null).length, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={mode === 'report' && inspectionContext?.id ? `/inspections/${inspectionContext.id}` : '/reports?tab=templates'} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-base md:text-lg font-bold text-gray-900">{template.name}</h1>
            <p className="text-xs text-gray-400">
              {sections.length} sections · {totalItems} items
              {mode === 'report' && assessed > 0 && ` · ${assessed} assessed`}
              {mode === 'report' && totalIssues > 0 && (
                <span className="text-orange-500 font-medium"> · {totalIssues} issue{totalIssues > 1 ? 's' : ''}</span>
              )}
            </p>
            {mode === 'report' && (
              <div className="text-[11px] mt-1 flex items-center gap-2">
                {!online && <span className="text-red-600 font-medium">Offline mode</span>}
                {online && autoSaving && <span className="text-gray-500">Autosaving draft...</span>}
                {online && !autoSaving && lastAutoSavedAt && (
                  <span className="text-gray-500 inline-flex items-center gap-1">
                    <Save className="h-3 w-3" />
                    Autosaved {lastAutoSavedAt}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {saved && (
            <span className="text-xs md:text-sm text-green-600 font-medium">Saved</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {saving ? 'Saving...' : mode === 'template' ? 'Save Template' : 'Save'}
          </button>
          {mode === 'report' && (
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {generatingPDF
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Download className="h-4 w-4" />}
              Generate PDF
            </button>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-auto px-3 pb-24 md:px-8 md:pb-8 pt-4 md:pt-8">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Issues banner */}
          {mode === 'report' && totalIssues > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-800">
                <span className="font-semibold">{totalIssues} item{totalIssues > 1 ? 's' : ''}</span> flagged for repair, replacement, or safety concern — will appear in PDF summary.
              </p>
            </div>
          )}

          {/* Sections */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map(section => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  onItemUpdate={handleItemUpdate}
                  onItemDelete={handleItemDelete}
                  onItemAdd={handleAddItem}
                  onSectionDelete={handleSectionDelete}
                  onSectionRename={handleSectionRename}
                  onItemsReorder={handleItemsReorder}
                  showAnswerFields={mode === 'report'}
                  allowStructureEdits={mode === 'template'}
                  sectionAnchorId={`${sectionAnchorPrefix}${section.id}`}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add section */}
          {mode === 'template' && (
            <button
              onClick={handleAddSection}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          )}
        </div>
      </div>

      {mode === 'report' && (
        <div className="fixed bottom-0 inset-x-0 md:hidden border-t border-gray-200 bg-white/95 backdrop-blur p-2">
          <div className="flex gap-2 overflow-x-auto">
            {sections.map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  document.getElementById(`${sectionAnchorPrefix}${section.id}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}
                className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white"
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
