extends Area2D

var charge_time = 1.5
var active_time = 5.0
var damage = 2

@onready var beam_rect = $BeamRect
@onready var collision = $CollisionShape2D

var timer = 0.0
var active = false
var player_inside = false
var tick_timer = 0.0

func _ready():
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	_setup_size()
	_set_charge_visual()

func _process(delta):
	timer += delta
	if not active and timer >= charge_time:
		active = true
		_set_active_visual()
	if active:
		tick_timer += delta
		if player_inside and tick_timer >= 0.6:
			tick_timer = 0.0
			_damage_player()
	if timer >= charge_time + active_time:
		queue_free()

func _setup_size():
	var view_size = get_viewport_rect().size
	var size = Vector2(view_size.x, view_size.y / 4.0)
	beam_rect.size = size
	beam_rect.position = -size * 0.5
	if collision.shape is RectangleShape2D:
		collision.shape.size = size

func _set_charge_visual():
	beam_rect.color = Color(1.0, 0.8, 0.2, 0.25)

func _set_active_visual():
	beam_rect.color = Color(1.0, 0.2, 0.2, 0.45)

func _damage_player():
	var player = get_tree().get_first_node_in_group("player")
	if player and player.has_method("take_damage"):
		player.take_damage(damage)

func _on_body_entered(body):
	if body.is_in_group("player"):
		player_inside = true
		if active:
			_damage_player()

func _on_body_exited(body):
	if body.is_in_group("player"):
		player_inside = false
