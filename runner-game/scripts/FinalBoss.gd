extends Area2D

var game
var hp = 200
var max_hp = 200
var speed = 0.0
var is_boss = true

@onready var hp_label = $HpLabel
@onready var attack_timer = $AttackTimer

var GuardScene = preload("res://scenes/BossGuard.tscn")
var LaserScene = preload("res://scenes/LaserBeam.tscn")

func _ready():
	add_to_group("enemy")
	body_entered.connect(_on_body_entered)
	attack_timer.timeout.connect(_on_attack_timer_timeout)
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
		game.on_enemy_killed(true)
	queue_free()

func _process(delta):
	# Boss stays in place
	pass

func _on_body_entered(body):
	if body.is_in_group("player"):
		if game:
			game.on_player_hit(6)

func _on_attack_timer_timeout():
	if not game:
		return
	var roll = randi() % 3
	if roll == 0:
		_spawn_guards()
	elif roll == 1:
		_fire_lasers()
	else:
		_bullet_volley()
	attack_timer.wait_time = randf_range(2.5, 4.0)
	attack_timer.start()

func _spawn_guards():
	var count = 2 + randi() % 3
	for i in range(count):
		var guard = GuardScene.instantiate()
		guard.game = game
		var offset_x = -120
		var offset_y = -80 + i * 80
		guard.global_position = global_position + Vector2(offset_x, offset_y)
		game.enemies.add_child(guard)

func _fire_lasers():
	var view_size = get_viewport_rect().size
	var lanes = [
		view_size.y * 0.125,
		view_size.y * 0.375,
		view_size.y * 0.625,
		view_size.y * 0.875
	]
	lanes.shuffle()
	for i in range(2):
		var beam = LaserScene.instantiate()
		beam.global_position = Vector2(view_size.x * 0.5, lanes[i])
		get_tree().current_scene.add_child(beam)

func _bullet_volley():
	var offsets = [-120, -60, 0, 60, 120]
	for yoff in offsets:
		game.spawn_enemy_bullet(global_position + Vector2(-40, yoff))

func _draw():
	var size = Vector2(150, 110)
	var rect = Rect2(-size * 0.5, size)
	draw_rect(rect, Color(0.7, 0.2, 0.25), true)
	draw_rect(rect, Color(0.3, 0.05, 0.07), false, 3.0)
	var ratio = 0.0
	if max_hp > 0:
		ratio = clamp(float(hp) / float(max_hp), 0.0, 1.0)
	var hp_width = size.x * ratio
	var hp_rect = Rect2(rect.position + Vector2(0, -14), Vector2(hp_width, 8))
	draw_rect(hp_rect, Color(0.2, 0.95, 0.3), true)

func _update_hp_label():
	if not is_instance_valid(hp_label):
		return
	hp_label.text = "Boss HP " + str(hp)
