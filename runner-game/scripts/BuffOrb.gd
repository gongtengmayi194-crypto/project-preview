extends Area2D

var game
var buff_type = ""
var buff_value = 0.0
var buff_text = ""
var speed = 140.0
var life_time = 18.0
var max_life = 18.0
@onready var label = $Label

func _ready():
	body_entered.connect(_on_body_entered)
	label.text = buff_text
	queue_redraw()

func _process(delta):
	position.x -= speed * delta
	life_time -= delta
	var alpha = clamp(life_time / max_life, 0.0, 1.0)
	modulate.a = 0.25 + alpha * 0.55
	if life_time <= 0.0 or position.x < -200:
		queue_free()

func _on_body_entered(body):
	if body.is_in_group("player"):
		if game:
			game.apply_orb_buff(buff_type, buff_value, buff_text)
		queue_free()

func _draw():
	var radius = 28.0
	draw_circle(Vector2.ZERO, radius, Color(0.25, 0.6, 1.0, 0.35))
	draw_circle(Vector2.ZERO, radius, Color(0.25, 0.6, 1.0, 0.9), false, 2.0)
