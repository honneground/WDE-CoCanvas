class CanvasesController < ApplicationController
  before_action :set_current_user
  before_action :set_canvas, only: [:show, :destroy, :rename]

  def create
    canvas = current_user.canvas.build(
      name: params[:name],
      width: params[:width] || 720,
      height: params[:height] || 540
    )
    if canvas.save
      CanvasState.create!(canva_id: canvas.id)
      redirect_to canvas_path(canvas)
    else
      redirect_to root_path, alert: "Failed to create canvas"
    end
  end

  def show
    @canvas = @set_canvas
  end

  def rename
    @canvas = @set_canvas
    if @canvas.user_id == current_user.id && @canvas.update(name: params[:name])
      redirect_to root_path, notice: "Canvas renamed"
    else
      redirect_to root_path, alert: "Failed to rename"
    end
  end

  def destroy
    @canvas = @set_canvas
    if @canvas.user_id == current_user.id
      @canvas.destroy
      redirect_to root_path, notice: "Canvas deleted"
    else
      redirect_to root_path, alert: "Not authorized"
    end
  end

  private

  def set_current_user
    unless session[:user_id]
      user = User.create!(username: "Anonymous ##{rand(1000..9999)}", language: "en")
      session[:user_id] = user.id
    end
  end

  def current_user
    @current_user ||= User.find(session[:user_id])
  end

  def set_canvas
    @set_canvas = Canva.find(params[:id])
  end
end
