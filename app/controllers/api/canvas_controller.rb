class Api::CanvasController < ApplicationController
  skip_forgery_protection
  before_action :set_canvas

  def load
    if @canvas_state&.data.present?
      render json: { data: @canvas_state.data }
    else
      render json: { data: nil }
    end
  end

  def save
    @canvas_state ||= CanvasState.create!(canva_id: @canvas.id)
    @canvas_state.update(data: params[:data])
    render json: { ok: true }
  end

  def clear
    @canvas_state&.destroy
    render json: { ok: true }
  end

  private

  def set_canvas
    canvas_id = params[:canvas_id]
    if canvas_id
      @canvas = Canva.find(canvas_id)
      @canvas_state = @canvas.canvas_state
    else
      render json: { error: "No canvas specified" }, status: :bad_request
    end
  end
end
