import consumer from "channels/consumer"

let canvasController = null

export function setCanvasController(controller) {
  canvasController = controller
}

consumer.subscriptions.create("CanvasChannel", {
  connected() {
    console.log("Connected to canvas channel")
  },

  disconnected() {
    console.log("Disconnected from canvas channel")
  },

  received(data) {
    if (canvasController && data.canvas_data) {
      canvasController.updateCanvasFromBroadcast(data.canvas_data)
    }
  }
});
