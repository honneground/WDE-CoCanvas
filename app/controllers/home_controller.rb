class HomeController < ApplicationController
  before_action :set_current_user

  def index
    @user = current_user
    @canvases = Canva.order(created_at: :desc)
    @languages = { en: "English", zh: "中文", es: "Español" }
  end

  def update_username
    current_user.update(username: params[:username])
    redirect_to root_path
  end

  def update_language
    current_user.update(language: params[:language])
    redirect_to root_path
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
end
