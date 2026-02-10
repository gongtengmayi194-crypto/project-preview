extends CharacterBody2D

var game
var max_hp = 40
var hp = 40
var attack = 2
var fire_rate = 2.0
var extra_shots = 0
var crit_rate = 0.1
var move_speed = 230.0
var shoot_timer = 0.0
var is_dead = false
var touch_active = false
var touch_id = -1
var touch_target_y = 360.0
var invuln_time = 0.0
const INVULN_DURATION = 0.7
const HIT_FLASH_DURATION = 0.18
const INVULN_BLINK_INTERVAL = 0.08
const ACCELERATION = 1350.0
const DECELERATION = 1850.0
@onready var sprite = $Sprite2D
var base_scale = Vector2.ONE
const TARGET_MAX_SIZE = 56.0
var current_velocity_y = 0.0
var hit_flash_time = 0.0
var blink_time = 0.0
var hit_tween: Tween

func _ready():
	add_to_group("player")
	base_scale = sprite.scale
	queue_redraw()

func _input(event):
	if event is InputEventScreenTouch:
		if event.pressed:
			touch_active = true
			touch_id = event.index
			touch_target_y = event.position.y
		elif event.index == touch_id:
			touch_active = false
			touch_id = -1
	elif event is InputEventScreenDrag:
		if event.index == touch_id:
			touch_target_y = event.position.y

func _physics_process(delta):
	if is_dead:
		return
	var target_axis = 0.0
	if touch_active:
		var dy = touch_target_y - global_position.y
		target_axis = clamp(dy / 140.0, -1.0, 1.0)
	else:
		target_axis = Input.get_axis("ui_up", "ui_down")

	var target_speed = target_axis * move_speed
	var approach = DECELERATION
	if abs(target_speed) > abs(current_velocity_y):
		approach = ACCELERATION
	current_velocity_y = move_toward(current_velocity_y, target_speed, approach * delta)

	if abs(target_axis) < 0.02 and abs(current_velocity_y) < 6.0:
		current_velocity_y = 0.0

	velocity = Vector2(0, current_velocity_y)
	move_and_slide()
	global_position.x = 200
	global_position.y = clamp(global_position.y, 80, 640)

func _process(delta):
	if is_dead:
		return

	if hit_flash_time > 0.0:
		hit_flash_time -= delta
		sprite.modulate = Color(1.0, 0.25, 0.25, 1.0)
	elif invuln_time <= 0.0:
		sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

	if invuln_time > 0.0:
		invuln_time -= delta
		blink_time += delta
		if hit_flash_time <= 0.0:
			var blink_phase = int(blink_time / INVULN_BLINK_INTERVAL) % 2
			if blink_phase == 0:
				sprite.modulate = Color(1.0, 0.5, 0.5, 0.48)
			else:
				sprite.modulate = Color(1.0, 0.7, 0.7, 0.82)
		if invuln_time <= 0.0:
			invuln_time = 0.0
			blink_time = 0.0
			if hit_flash_time <= 0.0:
				sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)

	shoot_timer += delta
	var interval = 1.0 / max(fire_rate, 0.1)
	if shoot_timer >= interval:
		shoot_timer = 0.0
		if game:
			game.spawn_bullets(global_position + Vector2(28, 0), attack, extra_shots, crit_rate)

func take_damage(amount):
	if invuln_time > 0.0:
		return
	hp -= amount
	_play_hit_effect()
	invuln_time = INVULN_DURATION
	blink_time = 0.0
	if hp <= 0:
		hp = 0
		is_dead = true
		if game:
			game.on_player_dead()

func _play_hit_effect():
	hit_flash_time = HIT_FLASH_DURATION
	sprite.modulate = Color(1.0, 0.25, 0.25, 1.0)
	if is_instance_valid(hit_tween):
		hit_tween.kill()
	hit_tween = create_tween()
	hit_tween.tween_property(sprite, "scale", base_scale * 0.88, 0.06).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	hit_tween.tween_property(sprite, "scale", base_scale, 0.14).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func set_model(texture, flip_h := false):
	sprite.texture = texture
	sprite.flip_h = flip_h
	_fit_sprite_to_target()
	base_scale = sprite.scale

func _fit_sprite_to_target():
	if sprite.texture == null:
		return
	var size = sprite.texture.get_size()
	if size.x <= 0 or size.y <= 0:
		return
	var max_dim = max(size.x, size.y)
	var scale_factor = TARGET_MAX_SIZE / max_dim
	sprite.scale = Vector2(scale_factor, scale_factor)
