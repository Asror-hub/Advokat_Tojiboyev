import { useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Placeholder } from '@tiptap/extensions'
import { useLang } from '../context/LanguageContext'
import Icon from '../components/Icon'
import * as api from './api'
import { RichImage } from './RichImage'
import './richtext.css'

const FONTS = [
  { name: 'Times New Roman', css: 'Times New Roman, serif' },
  { name: 'Georgia', css: 'Georgia, serif' },
  { name: 'Arial', css: 'Arial, sans-serif' },
  { name: 'Verdana', css: 'Verdana, sans-serif' },
  { name: 'Courier New', css: 'Courier New, monospace' },
]
const SIZES = [14, 16, 18, 20, 24, 28, 32, 40]
const IMG_ALIGNS = [
  { id: 'inline', label: 'Qatorda' },
  { id: 'left', label: 'Chapda' },
  { id: 'center', label: 'Markazda' },
  { id: 'right', label: 'O‘ngda' },
]
const IMG_SIZES = [25, 50, 75, 100]

const imageFiles = (list) => [...(list || [])].filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type))

// How wide (in % of the text column) a new picture should start: its own size, at most 100%.
const startWidth = (dataUrl, editor) =>
  new Promise((resolve) => {
    const im = new Image()
    im.onload = () => {
      const col = editor.view.dom.clientWidth || 700
      resolve(Math.max(15, Math.min(100, Math.round((im.naturalWidth / col) * 100))))
    }
    im.onerror = () => resolve(60)
    im.src = dataUrl
  })

function Btn({ active, disabled, title, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      className={`rt-btn${active ? ' on' : ''} ${className}`}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active ? 'true' : undefined}
      // keep the text selection inside the editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const Sep = () => <span className="rt-sep" aria-hidden="true" />

export default function RichEditor({ value, onChange, onBusy, onError }) {
  const { tr } = useLang()
  const fileRef = useRef(null)
  const editorRef = useRef(null)
  const uploadRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyleKit.configure({ backgroundColor: false, lineHeight: false }),
      Placeholder.configure({ placeholder: tr('Maqola matnini shu yerda yozing...') }),
      RichImage,
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? '' : ed.getHTML()),
    editorProps: {
      attributes: { class: 'prose rich rt-doc' },
      handlePaste: (view, event) => {
        const files = imageFiles(event.clipboardData?.files)
        if (!files.length) return false
        event.preventDefault()
        uploadRef.current?.(files, null)
        return true
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false // a picture moved inside the text
        const files = imageFiles(event.dataTransfer?.files)
        if (!files.length) return false
        event.preventDefault()
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? null
        uploadRef.current?.(files, pos)
        return true
      },
    },
  })
  editorRef.current = editor

  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return null
      const style = ed.getAttributes('textStyle')
      return {
        bold: ed.isActive('bold'),
        italic: ed.isActive('italic'),
        underline: ed.isActive('underline'),
        strike: ed.isActive('strike'),
        ul: ed.isActive('bulletList'),
        ol: ed.isActive('orderedList'),
        quote: ed.isActive('blockquote'),
        link: ed.isActive('link'),
        block: ed.isActive('heading', { level: 2 }) ? 'h2' : ed.isActive('heading', { level: 3 }) ? 'h3' : 'p',
        align: ['center', 'right', 'justify'].find((a) => ed.isActive({ textAlign: a })) || 'left',
        font: FONTS.find((f) => (style.fontFamily || '').replace(/["']/g, '').startsWith(f.name))?.css || '',
        size: style.fontSize || '',
        color: style.color || '',
        image: ed.isActive('image') ? ed.getAttributes('image') : null,
        canUndo: ed.can().undo(),
        canRedo: ed.can().redo(),
      }
    },
  })

  // Uploads the pictures one by one and puts each into the text (at `pos` or the cursor).
  uploadRef.current = async (files, pos) => {
    onError('')
    setUploading(true)
    onBusy(true)
    try {
      let at = pos
      for (const file of files) {
        const dataUrl = await api.prepareImage(file)
        const { url } = await api.uploadImage(dataUrl)
        const ed = editorRef.current
        if (!ed || ed.isDestroyed) return
        const attrs = { src: url, alt: '', align: 'center', width: await startWidth(dataUrl, ed) }
        const chain = ed.chain().focus()
        if (at != null) chain.insertContentAt(at, { type: 'image', attrs })
        else chain.insertContent({ type: 'image', attrs })
        chain.run()
        at = null
      }
    } catch (err) {
      onError(err.message)
    } finally {
      setUploading(false)
      onBusy(false)
    }
  }

  if (!editor || !state) return null
  const run = () => editor.chain().focus()

  const setBlock = (v) => {
    if (v === 'p') run().setParagraph().run()
    else run().setHeading({ level: v === 'h2' ? 2 : 3 }).run()
  }
  const setFont = (css) => (css ? run().setFontFamily(css).run() : run().unsetFontFamily().run())
  const setSize = (px) => (px ? run().setFontSize(px).run() : run().unsetFontSize().run())

  const setLink = () => {
    const prev = editor.getAttributes('link').href || 'https://'
    const url = window.prompt(tr('Havola manzili (o‘chirish uchun bo‘sh qoldiring)'), prev)
    if (url === null) return
    const clean = url.trim()
    if (!clean || clean === 'https://') return run().extendMarkRange('link').unsetLink().run()
    const href = /^(https?:|mailto:|tel:)/i.test(clean) ? clean : `https://${clean}`
    return run().extendMarkRange('link').setLink({ href }).run()
  }

  const onPick = (e) => {
    const files = imageFiles(e.target.files)
    e.target.value = ''
    if (files.length) uploadRef.current?.(files, null)
  }

  const img = state.image
  // Changing a picture's settings must keep the picture selected (so more can be changed).
  const setImg = (patch) => {
    const pos = editor.state.selection.from
    run().updateAttributes('image', patch).setNodeSelection(pos).run()
  }

  return (
    <div className="rt">
      <div className="rt-head">
      <div className="rt-bar" role="toolbar" aria-label={tr('Matn muharriri')}>
        <Btn title={tr('Orqaga qaytarish')} disabled={!state.canUndo} onClick={() => run().undo().run()}>
          <Icon name="undo" size={16} />
        </Btn>
        <Btn title={tr('Oldinga qaytarish')} disabled={!state.canRedo} onClick={() => run().redo().run()}>
          <Icon name="redo" size={16} />
        </Btn>
        <Sep />

        <select
          className="rt-select"
          aria-label={tr('Matn turi')}
          value={state.block}
          onChange={(e) => setBlock(e.target.value)}
        >
          <option value="p">{tr('Oddiy matn')}</option>
          <option value="h2">{tr('Sarlavha')}</option>
          <option value="h3">{tr('Kichik sarlavha')}</option>
        </select>
        <select
          className="rt-select"
          aria-label={tr('Shrift')}
          value={state.font}
          onChange={(e) => setFont(e.target.value)}
        >
          <option value="">{tr('Sayt shrifti')}</option>
          {FONTS.map((f) => (
            <option key={f.name} value={f.css} style={{ fontFamily: f.css }}>
              {f.name}
            </option>
          ))}
        </select>
        <select
          className="rt-select narrow"
          aria-label={tr('Shrift o‘lchami')}
          value={state.size}
          onChange={(e) => setSize(e.target.value)}
        >
          <option value="">{tr('Oddiy')}</option>
          {SIZES.map((s) => (
            <option key={s} value={`${s}px`}>
              {s}
            </option>
          ))}
        </select>
        <Sep />

        <Btn title={tr('Qalin')} active={state.bold} onClick={() => run().toggleBold().run()}>
          <b>B</b>
        </Btn>
        <Btn title={tr('Kursiv')} active={state.italic} onClick={() => run().toggleItalic().run()}>
          <i className="rt-serif">I</i>
        </Btn>
        <Btn title={tr('Tagiga chizilgan')} active={state.underline} onClick={() => run().toggleUnderline().run()}>
          <u>U</u>
        </Btn>
        <Btn title={tr('Ustidan chizilgan')} active={state.strike} onClick={() => run().toggleStrike().run()}>
          <s>S</s>
        </Btn>
        <label className="rt-btn rt-color" title={tr('Matn rangi')} onMouseDown={(e) => e.stopPropagation()}>
          <span className="rt-color-a">A</span>
          <span className="rt-color-bar" style={{ background: state.color || '#0a1a30' }} />
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(state.color) ? state.color : '#0a1a30'}
            aria-label={tr('Matn rangi')}
            onChange={(e) => run().setColor(e.target.value).run()}
          />
        </label>
        <Sep />

        <Btn title={tr('Chapga')} active={state.align === 'left'} onClick={() => run().setTextAlign('left').run()}>
          <Icon name="alignLeft" size={16} />
        </Btn>
        <Btn title={tr('Markazga')} active={state.align === 'center'} onClick={() => run().setTextAlign('center').run()}>
          <Icon name="alignCenter" size={16} />
        </Btn>
        <Btn title={tr('O‘ngga')} active={state.align === 'right'} onClick={() => run().setTextAlign('right').run()}>
          <Icon name="alignRight" size={16} />
        </Btn>
        <Btn title={tr('Ikki tomonga')} active={state.align === 'justify'} onClick={() => run().setTextAlign('justify').run()}>
          <Icon name="alignJustify" size={16} />
        </Btn>
        <Sep />

        <Btn title={tr('Nuqtali ro‘yxat')} active={state.ul} onClick={() => run().toggleBulletList().run()}>
          <Icon name="listUl" size={16} />
        </Btn>
        <Btn title={tr('Raqamli ro‘yxat')} active={state.ol} onClick={() => run().toggleOrderedList().run()}>
          <Icon name="listOl" size={16} />
        </Btn>
        <Btn title={tr('Iqtibos')} active={state.quote} onClick={() => run().toggleBlockquote().run()}>
          <Icon name="quote" size={16} />
        </Btn>
        <Btn title={tr('Havola')} active={state.link} onClick={setLink}>
          <Icon name="link" size={16} />
        </Btn>
        <Btn
          title={tr('Formatlashni tozalash')}
          onClick={() => run().unsetAllMarks().clearNodes().unsetTextAlign().run()}
        >
          <Icon name="eraser" size={16} />
        </Btn>
        <Sep />

        <button
          type="button"
          className="rt-add"
          disabled={uploading}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <Icon name="image" size={16} />
          {uploading ? tr('Yuklanmoqda...') : tr('Rasm qo‘shish')}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={onPick} />
      </div>

      {img && (
        <div className="rt-imgbar" role="toolbar" aria-label={tr('Rasm sozlamalari')}>
          <b>{tr('Rasm')}</b>
          {IMG_ALIGNS.map((a) => (
            <Btn key={a.id} active={img.align === a.id} onClick={() => setImg({ align: a.id })} className="txt">
              {tr(a.label)}
            </Btn>
          ))}
          <Sep />
          {IMG_SIZES.map((s) => (
            <Btn key={s} active={Math.round(img.width) === s} onClick={() => setImg({ width: s })} className="txt">
              {s}%
            </Btn>
          ))}
          <Btn title={tr('O‘chirish')} onClick={() => run().deleteSelection().run()} className="danger">
            <Icon name="trash" size={16} />
          </Btn>
        </div>
      )}
      </div>

      <EditorContent editor={editor} className="rt-area" />
    </div>
  )
}
