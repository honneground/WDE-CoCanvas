import { Controller } from "@hotwired/stimulus"
import { setCanvasController } from "channels/canvas_channel"

// Minimal pixel painter with adjustable brush size and color
export default class extends Controller {
  static targets = ["surface", "color", "size", "sizeValue"]

  connect() {
    if (!this.hasSurfaceTarget) return
    setCanvasController(this)
    this.ctx = this.surfaceTarget.getContext("2d")
    this.painting = false
    
    this.canvasWidth = parseInt(this.element.dataset.canvasWidth) || 720
    this.canvasHeight = parseInt(this.element.dataset.canvasHeight) || 540
    
    this.resizeCanvas()

    this.surfaceTarget.addEventListener("pointerdown", this.startPaint)
    this.surfaceTarget.addEventListener("pointerup", this.stopPaint)
    this.surfaceTarget.addEventListener("pointerleave", this.stopPaint)
    this.surfaceTarget.addEventListener("pointermove", this.draw)

    window.addEventListener("resize", this.resizeCanvas)
    this.loadCanvas()
  }

  disconnect() {
    window.removeEventListener("resize", this.resizeCanvas)
  }

  startPaint = event => {
    this.painting = true
    this.lastPoint = this.pointFromEvent(event)
    this.draw(event)
  }

  stopPaint = () => {
    this.painting = false
    this.lastPoint = null
    this.saveCanvas()
  }

  loadCanvas = async () => {
    try {
      const canvasId = this.element.getAttribute("data-canvas-id")
      const response = await fetch(`/api/canvas/load?canvas_id=${canvasId}`)
      const { data } = await response.json()
      if (data) {
        const img = new Image()
        img.onload = () => {
          if (this.ctx && this.hasSurfaceTarget) {
            const ratio = window.devicePixelRatio || 1
            const width = this.canvasWidth
            const height = this.canvasHeight
            this.ctx.setTransform(1, 0, 0, 1, 0, 0)
            this.ctx.scale(ratio, ratio)
            this.ctx.drawImage(img, 0, 0, width, height)
          }
        }
        img.src = data
      }
    } catch (e) {
      console.error("Failed to load canvas:", e)
    }
  }

  saveCanvas() {
    if (!this.hasSurfaceTarget) return
    const data = this.surfaceTarget.toDataURL("image/png")
    const canvasId = this.element.getAttribute("data-canvas-id")
    
    // Save to database
    fetch(`/api/canvas/save?canvas_id=${canvasId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    }).catch(e => console.error("Failed to save canvas:", e))

    // Broadcast to other clients via ActionCable
    this.broadcastCanvasUpdate(data)
  }

  broadcastCanvasUpdate(data) {
    import("channels/consumer").then(({ default: consumer }) => {
      consumer.subscriptions.subscriptions[0].send({ canvas_data: data })
    }).catch(e => console.error("Failed to broadcast:", e))
  }

  updateCanvasFromBroadcast(data) {
    if (!this.ctx || !this.hasSurfaceTarget) return
    const img = new Image()
    img.onload = () => {
      const ratio = window.devicePixelRatio || 1
      const width = this.canvasWidth
      const height = this.canvasHeight
      this.ctx.setTransform(1, 0, 0, 1, 0, 0)
      this.ctx.scale(ratio, ratio)
      this.ctx.drawImage(img, 0, 0, width, height)
    }
    img.src = data
  }

  draw = event => {
    if (!this.painting || !this.ctx) return
    event.preventDefault()
    const point = this.pointFromEvent(event)
    const color = this.hasColorTarget ? this.colorTarget.value : "#2b7bff"
    const size = this.brushSize()

    this.ctx.fillStyle = color
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = size
    this.ctx.lineCap = "round"

    if (this.lastPoint) {
      this.ctx.beginPath()
      this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.ctx.lineTo(point.x, point.y)
      this.ctx.stroke()
    } else {
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2)
      this.ctx.fill()
    }

    this.lastPoint = point
  }

  clear() {
    if (!this.ctx || !this.hasSurfaceTarget) return
    this.ctx.clearRect(0, 0, this.surfaceTarget.width, this.surfaceTarget.height)
    const canvasId = this.element.getAttribute("data-canvas-id")
    fetch(`/api/canvas/clear?canvas_id=${canvasId}`, { method: "DELETE" }).catch(e => console.error("Failed to clear:", e))
  }

  updateSizeFromSlider() {
    if (!this.hasSizeTarget) return
    const value = this.clampSlider(Number(this.sizeTarget.value))
    if (this.hasSizeValueTarget) this.sizeValueTarget.value = value
    this.sizeTarget.value = value
  }

  updateSizeFromInput() {
    if (!this.hasSizeValueTarget) return
    const value = this.ensureMin(Number(this.sizeValueTarget.value))
    if (this.hasSizeTarget) this.sizeTarget.value = this.clampSlider(value)
    this.sizeValueTarget.value = value
  }

  brushSize() {
    if (this.hasSizeValueTarget) return this.ensureMin(Number(this.sizeValueTarget.value))
    if (this.hasSizeTarget) return this.clampSlider(Number(this.sizeTarget.value))
    return 12
  }

  clampSlider(value) {
    const min = 1
    const max = 200
    if (Number.isNaN(value)) return 12
    return Math.min(max, Math.max(min, value))
  }

  ensureMin(value) {
    const min = 1
    if (Number.isNaN(value)) return 12
    return Math.max(min, value)
  }

  resizeCanvas = () => {
    if (!this.hasSurfaceTarget) return
    const ratio = window.devicePixelRatio || 1
    const width = this.canvasWidth
    const height = this.canvasHeight
    this.surfaceTarget.width = width * ratio
    this.surfaceTarget.height = height * ratio
    this.surfaceTarget.style.width = `${width}px`
    this.surfaceTarget.style.height = `${height}px`
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0)
      this.ctx.scale(ratio, ratio)
    }
  }

  pointFromEvent(event) {
    const rect = this.surfaceTarget.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
}
