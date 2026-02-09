extends Area2D

var game
var hp = 8
var max_hp = 8
var life_time = 30.0
@onready var shoot_timer = $ShootTimer
@onready var hp_label = $HpLabel

func _ready():
	add_to_group("enemy")
	body_entered.connect(_on_body_entered)
	shoot_timer.timeout.connect(_on_shoot_timer_timeout)
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
		game.on_enemy_killed(false)
	queue_free()

func _process(delta):
	life_time -= delta
	if life_time <= 0:
		queue_free()

func _on_body_entered(body):
	if body.is_in_group("player"):
		if game:
			game.on_player_hit(hp)
		die()

func _on_shoot_timer_timeout():
	if not game:
		return
	game.spawn_enemy_bullet(global_position + Vector2(-24, 0))

func _draw():
	var size = Vector2(48, 32)
	var rect = Rect2(-size * 0.5, size)
	draw_rect(rect, Color(0.6, 0.35, 0.9), true)
	draw_rect(rect, Color(0.25, 0.1, 0.4), false, 2.0)
	var ratio = 0.0
	if max_hp > 0:
		ratio = clamp(float(hp) / float(max_hp), 0.0, 1.0)
	var hp_width = size.x * ratio
	var hp_rect = Rect2(rect.position + Vector2(0, -8), Vector2(hp_width, 5))
	draw_rect(hp_rect, Color(0.2, 0.95, 0.3), true)

func _update_hp_label():
	if not is_instance_valid(hp_label):
		return
	hp_label.text = "HP " + str(hp)
