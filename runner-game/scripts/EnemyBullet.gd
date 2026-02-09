extends Area2D

var speed = 420.0
var damage = 2
var direction = Vector2.LEFT

func _ready():
  body_entered.connect(_on_body_entered)
  queue_redraw()

func _process(delta):
  position += direction * speed * delta
  if position.x < -200:
    queue_free()

func _on_body_entered(body):
  if body.is_in_group("player"):
    if body.has_method("take_damage"):
      body.take_damage(damage)
    queue_free()

func _draw():
  var size = Vector2(10, 10)
  var rect = Rect2(-size * 0.5, size)
  draw_rect(rect, Color(1.0, 0.3, 0.3), true)
