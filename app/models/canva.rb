class Canva < ApplicationRecord
  self.table_name = "canvas"
  belongs_to :user
  has_one :canvas_state, dependent: :destroy
  
  validates :name, :width, :height, :user_id, presence: true
  validates :width, :height, numericality: { greater_than: 0 }
end
