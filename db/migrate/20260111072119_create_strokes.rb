class CreateStrokes < ActiveRecord::Migration[8.0]
  def change
    create_table :strokes do |t|
      t.string :color
      t.integer :size
      t.float :x1
      t.float :y1
      t.float :x2
      t.float :y2
      t.integer :position

      t.timestamps
    end
  end
end
