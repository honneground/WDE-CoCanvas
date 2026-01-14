class User < ApplicationRecord
  has_many :canvas, dependent: :destroy
  
  validates :username, :language, presence: true
  before_create :set_defaults
  
  private
  
  def set_defaults
    self.language ||= "en"
  end
end
