Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "home#index"

  post "home/update_username", to: "home#update_username"
  post "home/update_language", to: "home#update_language"

  resources :canvases, only: [:create, :show, :destroy]
  post "canvases/:id/rename", to: "canvases#rename"
  get "canvas/:id", to: "canvases#show", as: :canvas

  namespace :api do
    get "canvas/load", to: "canvas#load"
    post "canvas/save", to: "canvas#save"
    delete "canvas/clear", to: "canvas#clear"
  end
end
