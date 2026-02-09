extends Area2D

var game
var hp = 3
var max_hp = 3
var speed = 160.0
var is_boss = false
@onready var hp_label = $HpLabel

func _ready():
	add_to_group("enemy")
	body_entered.connect(_on_body_entered)
	_update_hp_label()
	queue_redraw()

func set_stats(new_hp, new_speed, boss_flag):
	hp = new_hp
	max_hp = new_hp
	speed = new_speed
	is_boss = boss_flag
	_update_hp_label()
	queue_redraw()

func apply_damage(amount):
	hp -= amount
	_update_hp_label()
	queue_redraw()
	if hp <= 0:
		die()

func die():
	if game:
		game.on_enemy_killed(is_boss)
	queue_free()

func _process(delta):
	position.x -= speed * delta
	if position.x < -200:
		queue_free()

func _on_body_entered(body):
	if body.is_in_group("player"):
		if game:
			game.on_player_hit(hp)
		die()

func _draw():
	var size = Vector2(120, 84) if is_boss else Vector2(56, 36)
	var rect = Rect2(-size * 0.5, size)
	var fill = Color(0.95, 0.4, 0.35) if is_boss else Color(0.95, 0.65, 0.3)
	var stroke = Color(0.5, 0.05, 0.05) if is_boss else Color(0.4, 0.2, 0.1)
	draw_rect(rect, fill, true)
	draw_rect(rect, stroke, false, 2.0)
	var ratio = 0.0
	if max_hp > 0:
		ratio = clamp(float(hp) / float(max_hp), 0.0, 1.0)
	var hp_width = size.x * ratio
	var hp_rect = Rect2(rect.position + Vector2(0, -10), Vector2(hp_width, 6))
	draw_rect(hp_rect, Color(0.2, 0.95, 0.3), true)

func _update_hp_label():
	if not is_instance_valid(hp_label):
		return
	hp_label.text = "HP " + str(hp)
