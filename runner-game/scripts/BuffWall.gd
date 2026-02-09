extends Area2D

var game
var speed = 160.0

func _ready():
  body_entered.connect(_on_body_entered)
  queue_redraw()

func _process(delta):
  position.x -= speed * delta
  if position.x < -200:
    queue_free()

func _on_body_entered(body):
  if body.is_in_group("player"):
    body.invuln_time = 0.0
    if body.has_method("take_damage"):
      body.take_damage(body.hp)
    elif game:
      game.on_player_hit(9999)
    queue_free()

func _draw():
  var size = Vector2(40, 260)
  var rect = Rect2(-size * 0.5, size)
  draw_rect(rect, Color(0.9, 0.2, 0.2, 0.35), true)
  draw_rect(rect, Color(0.9, 0.2, 0.2, 0.9), false, 2.0)
