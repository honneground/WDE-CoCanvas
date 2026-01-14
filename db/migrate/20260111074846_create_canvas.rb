class CreateCanvas < ActiveRecord::Migration[8.0]
  def change
    create_table :canvas do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name
      t.integer :width
      t.integer :height

      t.timestamps
    end
  end
end
