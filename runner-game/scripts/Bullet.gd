extends Area2D

var game
var speed = 520.0
var damage = 1
var crit_rate = 0.1
var direction = Vector2.RIGHT

func _ready():
	area_entered.connect(_on_area_entered)
	queue_redraw()

func _process(delta):
	position += direction * speed * delta
	if position.x > 1700:
		queue_free()

func _on_area_entered(area):
	if area.has_method("apply_damage"):
		var final_damage = damage
		if randf() < crit_rate:
			final_damage = int(ceil(damage * 2.0))
			if game:
				game.show_message("暴击！-" + str(final_damage))
		area.apply_damage(final_damage)
		queue_free()

func _draw():
	var size = Vector2(12, 4)
	var rect = Rect2(-size * 0.5, size)
	draw_rect(rect, Color(1.0, 0.95, 0.6), true)
