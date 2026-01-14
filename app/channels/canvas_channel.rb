class CanvasChannel < ApplicationCable::Channel
  def subscribed
    stream_from "canvas_updates"
  end

  def receive(data)
    ActionCable.server.broadcast("canvas_updates", { canvas_data: data["canvas_data"] })
  end
end
