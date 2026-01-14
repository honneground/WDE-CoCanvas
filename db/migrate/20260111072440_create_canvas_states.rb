class CreateCanvasStates < ActiveRecord::Migration[8.0]
  def change
    create_table :canvas_states do |t|
      t.text :data

      t.timestamps
    end
  end
end
