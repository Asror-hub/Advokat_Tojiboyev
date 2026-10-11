import { useRef, useState } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

const ALIGNS = ['inline', 'left', 'center', 'right']
const DRAG_START = 5 // pixels the pointer must move before a press becomes a drag

// The picture as it looks inside the editor.
//  - Press and drag it anywhere in the text: a ghost follows the pointer, a gold line shows
//    where it will land, and the page scrolls when you reach the top or bottom edge.
//  - Drag the two corner dots to resize it.
function ImageView({ node, editor, getPos, selected }) {
  const { src, alt, align, width } = node.attrs
  const imgRef = useRef(null)
  const [lifted, setLifted] = useState(false)

  // Changes the attributes and keeps the picture selected (a plain update drops the selection).
  const updateAttributes = (patch) =>
    editor
      .chain()
      .command(({ tr }) => {
        const pos = getPos()
        if (typeof pos !== 'number') return false
        tr.setNodeMarkup(pos, undefined, { ...tr.doc.nodeAt(pos).attrs, ...patch })
        tr.setSelection(NodeSelection.create(tr.doc, pos))
        return true
      })
      .run()

  // Moves this picture to document position `to` (a position between characters).
  const moveTo = (to) =>
    editor
      .chain()
      .command(({ tr }) => {
        const from = getPos()
        if (typeof from !== 'number') return false
        const picture = tr.doc.nodeAt(from)
        if (to >= from && to <= from + picture.nodeSize) return false // dropped on itself
        // A picture must sit inside a paragraph; snap to the nearest text position.
        const $to = tr.doc.resolve(to)
        let at = $to.parent.inlineContent ? to : TextSelection.near($to).from
        tr.delete(from, from + picture.nodeSize)
        if (at > from) at -= picture.nodeSize
        tr.insert(at, picture)
        tr.setSelection(NodeSelection.create(tr.doc, at))
        return true
      })
      .run()

  const startDrag = (e) => {
    if (e.button !== 0 || e.target.closest('.rt-handle') || !editor.isEditable) return
    const startX = e.clientX
    const startY = e.clientY
    const view = editor.view
    const rect = imgRef.current.getBoundingClientRect()
    let lastX = startX
    let lastY = startY
    let dragging = false
    let target = null
    let ghost = null
    let line = null
    let raf = 0

    const gw = Math.min(rect.width, 240)
    const gh = Math.max(24, (rect.height / rect.width) * gw)

    const update = () => {
      ghost.style.transform = `translate(${lastX - gw / 2}px, ${lastY - gh / 2}px)`
      const hit = view.posAtCoords({ left: lastX, top: lastY })
      target = hit ? hit.pos : null
      if (target == null) {
        line.style.display = 'none'
        return
      }
      const c = view.coordsAtPos(target)
      line.style.display = 'block'
      line.style.transform = `translate(${c.left - 1.5}px, ${c.top}px)`
      line.style.height = `${Math.max(18, c.bottom - c.top)}px`
    }

    // Keeps the page moving while the pointer rests near the top or bottom of the window.
    const frame = () => {
      const head = document.querySelector('.rt-head')?.getBoundingClientRect().bottom || 0
      const top = Math.max(head, 70) + 36
      if (lastY < top) window.scrollBy(0, -Math.min(24, (top - lastY) / 2 + 4))
      else if (lastY > window.innerHeight - 50) window.scrollBy(0, Math.min(24, (lastY - (window.innerHeight - 50)) / 2 + 4))
      update()
      raf = requestAnimationFrame(frame)
    }

    const begin = () => {
      dragging = true
      ghost = document.createElement('img')
      ghost.src = src
      ghost.className = 'rt-ghost'
      ghost.style.width = `${gw}px`
      ghost.style.height = `${gh}px`
      line = document.createElement('div')
      line.className = 'rt-dropline'
      document.body.append(ghost, line)
      document.body.classList.add('rt-grabbing')
      window.getSelection()?.removeAllRanges()
      setLifted(true)
      raf = requestAnimationFrame(frame)
    }

    const finish = (commit) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      window.removeEventListener('keydown', onKey)
      if (!dragging) return
      cancelAnimationFrame(raf)
      ghost.remove()
      line.remove()
      document.body.classList.remove('rt-grabbing')
      setLifted(false)
      if (commit && target != null) moveTo(target)
    }

    function onMove(ev) {
      lastX = ev.clientX
      lastY = ev.clientY
      if (!dragging && Math.hypot(lastX - startX, lastY - startY) >= DRAG_START) begin()
    }
    function onUp() {
      finish(true)
    }
    function onCancel() {
      finish(false)
    }
    function onKey(ev) {
      if (ev.key === 'Escape') finish(false)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    window.addEventListener('keydown', onKey)
  }

  const startResize = (e, dir) => {
    e.preventDefault()
    e.stopPropagation()
    const wrap = imgRef.current?.parentElement
    if (!wrap) return
    // Percent widths are measured against the paragraph that holds the picture.
    const box = wrap.closest('p, h2, h3, li, blockquote') || wrap.closest('.ProseMirror')
    const full = box?.clientWidth || 1
    const startX = e.clientX
    const startW = wrap.getBoundingClientRect().width
    // A centered picture grows on both sides, so the edge follows the pointer at 2x.
    const factor = align === 'center' ? 2 : 1
    const move = (ev) => {
      const w = startW + dir * factor * (ev.clientX - startX)
      updateAttributes({ width: Math.max(8, Math.min(100, Math.round((w / full) * 100))) })
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  return (
    <NodeViewWrapper
      as="span"
      className={`rt-img${selected ? ' sel' : ''}${lifted ? ' lifted' : ''}`}
      data-align={align}
      style={{ width: `${width}%` }}
      onPointerDown={startDrag}
      // no native image drag (our own drag is used instead)
      onDragStart={(e) => e.preventDefault()}
    >
      <img ref={imgRef} src={src} alt={alt || ''} draggable={false} />
      {selected && (
        <>
          <span className="rt-handle l" onPointerDown={(e) => startResize(e, -1)} contentEditable={false} />
          <span className="rt-handle r" onPointerDown={(e) => startResize(e, 1)} contentEditable={false} />
        </>
      )}
    </NodeViewWrapper>
  )
}

// Inline picture: sits in a paragraph, so it can be moved between and inside text.
// Stored as <img src data-align style="width: NN%"> (cleaned again by the server).
export const RichImage = Node.create({
  name: 'image',
  group: 'inline',
  inline: true,
  atom: true,
  // Moving is done by our own pointer drag (smoother than the browser's drag and drop).
  draggable: false,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      align: {
        default: 'center',
        parseHTML: (el) => (ALIGNS.includes(el.getAttribute('data-align')) ? el.getAttribute('data-align') : 'center'),
        renderHTML: (attrs) => ({ 'data-align': attrs.align }),
      },
      width: {
        default: 100,
        parseHTML: (el) => parseFloat(el.style.width) || 100,
        renderHTML: (attrs) => ({ style: `width: ${attrs.width}%` }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView)
  },
})
