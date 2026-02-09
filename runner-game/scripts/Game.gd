extends Node2D

@onready var player = $Actors/Player
@onready var enemies = $Actors/Enemies
@onready var bullets = $Actors/Bullets
@onready var walls = $Actors/Walls
@onready var orbs = $Actors/Orbs
@onready var enemy_timer = $EnemyTimer
@onready var wall_timer = $WallTimer
@onready var orb_timer = $OrbTimer
@onready var stage_label = $HUD/StageLabel
@onready var stats_label = $HUD/StatsLabel
@onready var message_label = $HUD/MessageLabel
@onready var message_bg = $HUD/MessageBg
@onready var bgm_player = $BGMPlayer

@onready var settings_overlay = $HUD/SettingsOverlay
@onready var volume_slider = $HUD/SettingsOverlay/SettingsPanel/VolumeSlider
@onready var screen_mode_option = $HUD/SettingsOverlay/SettingsPanel/ScreenModeOption
@onready var resolution_option = $HUD/SettingsOverlay/SettingsPanel/ResolutionOption
@onready var model_option = $HUD/SettingsOverlay/SettingsPanel/ModelOption
@onready var resume_button = $HUD/SettingsOverlay/SettingsPanel/ResumeButton
@onready var quit_button = $HUD/SettingsOverlay/SettingsPanel/QuitButton

@onready var death_overlay = $HUD/DeathOverlay
@onready var death_title = $HUD/DeathOverlay/DeathPanel/DeathTitle
@onready var death_stats = $HUD/DeathOverlay/DeathPanel/DeathStats
@onready var death_hint = $HUD/DeathOverlay/DeathPanel/DeathHint

var stages = [
	{
		"name": "第一关",
		"kill_target": 15,
		"enemy_hp": 3,
		"enemy_speed": 160.0,
		"spawn_interval": 1.2
	},
	{
		"name": "第二关",
		"kill_target": 25,
		"enemy_hp": 5,
		"enemy_speed": 200.0,
		"spawn_interval": 1.0
	},
	{
		"name": "第三关",
		"kill_target": 30,
		"enemy_hp": 8,
		"enemy_speed": 240.0,
		"spawn_interval": 0.85
	}
]

const BOSS_HP = 120
const BOSS_SPEED = 120.0
const ENEMY_SPAWN_X = 1500.0
const WALL_SPAWN_X = 1500.0
const ORB_SPAWN_X = 1500.0
const SPAWN_Y_MIN = 120.0
const SPAWN_Y_MAX = 640.0

var stage_index = 0
var stage_kills = 0
var total_kills = 0
var boss_spawned = false
var boss_alive = false
var game_over = false
var final_stage = false

var message_time = 0.0
var elapsed_time = 0.0

const ENEMY_HP_GROWTH_STEP_SEC = 12.0
const ENEMY_HP_GROWTH_MAX = 30

var EnemyScene = preload("res://scenes/Enemy.tscn")
var ShooterEnemyScene = preload("res://scenes/ShooterEnemy.tscn")
var BossScene = preload("res://scenes/FinalBoss.tscn")
var BulletScene = preload("res://scenes/Bullet.tscn")
var EnemyBulletScene = preload("res://scenes/EnemyBullet.tscn")
var WallScene = preload("res://scenes/BuffWall.tscn")
var OrbScene = preload("res://scenes/BuffOrb.tscn")

var bgm_tracks = [
	preload("res://assets/audio/不再曼波 (哈基米纯享)-哈基米.mp3"),
	preload("res://assets/audio/出哈 (哈基米bgm)-大清第一巴图鲁.mp3"),
	preload("res://assets/audio/打火机 (哈基米南北绿豆)-VT.Shy.mp3"),
	preload("res://assets/audio/基米说(哈基米)-哈基米..mp3"),
	preload("res://assets/audio/蓝莲哈-哈基米.mp3"),
	preload("res://assets/audio/跳楼基（哈基米纯享版）-暴躁小狗.mp3")
]
var bgm_queue = []

var player_models = [
	preload("res://assets/sprites/kaguya.png"),
	preload("res://assets/sprites/iroha.png"),
	preload("res://assets/sprites/yachiyo.png")
]

var resolution_sizes = [
	Vector2i(1280, 720),
	Vector2i(1366, 768),
	Vector2i(1600, 900),
	Vector2i(1920, 1080),
	Vector2i(2560, 1440)
]

func _ready():
	randomize()
	player.game = self
	player.global_position = Vector2(200, 360)
	enemy_timer.timeout.connect(_on_enemy_timer_timeout)
	wall_timer.timeout.connect(_on_wall_timer_timeout)
	orb_timer.timeout.connect(_on_orb_timer_timeout)
	_apply_stage_settings()
	enemy_timer.start()
	wall_timer.start()
	orb_timer.start()

	settings_overlay.visible = false
	death_overlay.visible = false
	message_bg.visible = false

	_setup_settings()
	_init_bgm()
	_apply_model(0)

	show_message("准备开跑！上下键/触摸拖动")

func _process(delta):
	if not game_over:
		elapsed_time += delta
	if message_time > 0.0:
		message_time -= delta
		if message_time <= 0.0:
			message_label.text = ""
			message_bg.visible = false
	_update_hud()

func _unhandled_input(event):
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_ESCAPE:
			_toggle_settings()
		elif event.keycode == KEY_R:
			reset_game()

func _apply_stage_settings():
	var stage = stages[stage_index]
	enemy_timer.wait_time = stage["spawn_interval"]
	wall_timer.wait_time = 1.5
	orb_timer.wait_time = 3.5
	if final_stage:
		stage_label.text = "最终关"
	else:
		stage_label.text = "关卡：" + stage["name"]

func _update_hud():
	if game_over:
		return
	var stage = stages[stage_index]
	var stage_name = stage["name"]
	if final_stage:
		stage_label.text = "最终关"
	else:
		stage_label.text = "关卡：" + stage_name
	var crit_percent = int(player.crit_rate * 100)
	var line1 = "生命：" + str(player.hp) + \
		"  攻击：" + str(player.attack) + \
		"  攻速：" + str(player.fire_rate) + \
		"  暴击率：" + str(crit_percent) + "%" + \
		"  辅助射击：" + str(player.extra_shots)
	var line2 = "当前击败：" + str(stage_kills) + "/" + str(stage["kill_target"])
	stats_label.text = line1 + "\n" + line2

func show_message(text):
	message_label.text = text
	message_time = 2.2
	message_bg.visible = true

func spawn_bullets(origin, damage, extra_shots, crit_rate):
	_spawn_single_bullet(origin, damage, crit_rate)
	if extra_shots <= 0:
		return
	for i in range(extra_shots):
		var offset = (i - (extra_shots - 1) / 2.0) * 16.0
		_spawn_single_bullet(origin + Vector2(0, offset), damage, crit_rate)

func _spawn_single_bullet(pos, damage, crit_rate):
	var bullet = BulletScene.instantiate()
	bullet.global_position = pos
	bullet.damage = damage
	bullet.crit_rate = crit_rate
	bullet.game = self
	bullets.add_child(bullet)

func _on_enemy_timer_timeout():
	if game_over:
		return
	if boss_spawned:
		return
	var stage = stages[stage_index]
	var hp_bonus = _get_time_hp_bonus()
	var enemy_scene = EnemyScene
	if randi() % 4 == 0:
		enemy_scene = ShooterEnemyScene
	var enemy = enemy_scene.instantiate()
	enemy.global_position = Vector2(ENEMY_SPAWN_X, randf_range(SPAWN_Y_MIN, SPAWN_Y_MAX))
	enemy.set_stats(stage["enemy_hp"] + hp_bonus, stage["enemy_speed"], false)
	enemy.game = self
	enemies.add_child(enemy)

func _on_wall_timer_timeout():
	if game_over:
		return
	var wall = WallScene.instantiate()
	wall.global_position = Vector2(WALL_SPAWN_X, randf_range(160.0, 620.0))
	wall.speed = stages[stage_index]["enemy_speed"]
	wall.game = self
	walls.add_child(wall)
	wall_timer.wait_time = randf_range(1.2, 2.1)
	wall_timer.start()

func _on_orb_timer_timeout():
	if game_over:
		return
	var orb = OrbScene.instantiate()
	orb.global_position = Vector2(ORB_SPAWN_X, randf_range(160.0, 620.0))
	orb.speed = stages[stage_index]["enemy_speed"] * 0.9
	var roll = randi() % 4
	if roll == 0:
		var value = 1 + randi() % 2
		orb.buff_type = "attack"
		orb.buff_value = value
		orb.buff_text = "攻击+" + str(value)
	elif roll == 1:
		var value = 1 + randi() % 2
		orb.buff_type = "attack_speed"
		orb.buff_value = float(value)
		orb.buff_text = "攻速+" + str(value)
	elif roll == 2:
		var value = 0.05 + float(randi() % 3) * 0.05
		orb.buff_type = "crit"
		orb.buff_value = value
		orb.buff_text = "暴击率+" + str(int(value * 100)) + "%"
	else:
		orb.buff_type = "extra"
		orb.buff_value = 1
		orb.buff_text = "辅助机+1"
	orb.game = self
	orbs.add_child(orb)
	orb_timer.wait_time = randf_range(3.0, 5.0)
	orb_timer.start()

func apply_orb_buff(buff_type, buff_value, buff_text):
	match buff_type:
		"attack_speed":
			player.fire_rate += buff_value
		"attack":
			player.attack += int(buff_value)
		"crit":
			player.crit_rate = min(1.0, player.crit_rate + buff_value)
		"extra":
			player.extra_shots += int(buff_value)
	show_message("获得增益：" + buff_text)

func on_enemy_killed(is_boss):
	if game_over:
		return
	if is_boss:
		boss_alive = false
		_on_boss_defeated()
		return
	stage_kills += 1
	total_kills += 1
	if not final_stage:
		_check_stage_progress()

func _check_stage_progress():
	var stage = stages[stage_index]
	if stage_kills < stage["kill_target"]:
		return
	if stage_index < stages.size() - 1:
		stage_index += 1
		stage_kills = 0
		_apply_stage_settings()
		show_message("进入" + stages[stage_index]["name"] + "！")
		return
	if not boss_spawned:
		_spawn_final_boss()

func _spawn_final_boss():
	boss_spawned = true
	boss_alive = true
	enemy_timer.stop()
	final_stage = true
	stage_label.text = "最终关"
	var boss_bonus = _get_time_hp_bonus() * 4
	var boss = BossScene.instantiate()
	var view_size = get_viewport_rect().size
	boss.global_position = Vector2(view_size.x - 180, view_size.y * 0.5)
	boss.set_stats(BOSS_HP + boss_bonus, 0.0, true)
	boss.game = self
	enemies.add_child(boss)
	show_message("终极Boss出现！")

func on_player_hit(amount):
	if game_over:
		return
	player.take_damage(amount)
	show_message("受到伤害 -" + str(amount))

func on_player_dead():
	if game_over:
		return
	game_over = true
	enemy_timer.stop()
	wall_timer.stop()
	orb_timer.stop()
	settings_overlay.visible = false
	get_tree().paused = false
	_show_end_screen("你已倒下")

func _on_boss_defeated():
	game_over = true
	enemy_timer.stop()
	wall_timer.stop()
	orb_timer.stop()
	settings_overlay.visible = false
	get_tree().paused = false
	stage_label.text = "关卡：通关"
	_show_end_screen("通关成功")

func reset_game():
	get_tree().reload_current_scene()

func spawn_enemy_bullet(origin):
	var bullet = EnemyBulletScene.instantiate()
	bullet.global_position = origin
	bullets.add_child(bullet)

func _show_end_screen(title_text):
	death_overlay.visible = true
	death_title.text = title_text
	var time_sec = int(elapsed_time)
	var minutes = time_sec / 60
	var seconds = time_sec % 60
	var stage_name = stages[stage_index]["name"]
	death_stats.text = "存活时间：" + str(minutes) + "分" + str(seconds) + "秒\n" + \
		"当前关卡：" + stage_name + "\n" + \
		"总击败：" + str(total_kills)
	death_hint.text = "按 R 重开"
	message_label.text = ""
	message_bg.visible = false

func _get_time_hp_bonus():
	return min(ENEMY_HP_GROWTH_MAX, int(elapsed_time / ENEMY_HP_GROWTH_STEP_SEC))

func _init_bgm():
	bgm_queue = bgm_tracks.duplicate()
	bgm_queue.shuffle()
	if not bgm_player.finished.is_connected(_on_bgm_finished):
		bgm_player.finished.connect(_on_bgm_finished)
	_play_next_bgm()

func _on_bgm_finished():
	_play_next_bgm()

func _play_next_bgm():
	if bgm_queue.is_empty():
		bgm_queue = bgm_tracks.duplicate()
		bgm_queue.shuffle()
	var stream = bgm_queue.pop_front()
	bgm_player.stream = stream
	bgm_player.play()

func _setup_settings():
	screen_mode_option.clear()
	screen_mode_option.add_item("窗口", 0)
	screen_mode_option.add_item("无边框全屏", 1)
	screen_mode_option.add_item("独占全屏", 2)
	screen_mode_option.selected = 0

	resolution_option.clear()
	resolution_option.add_item("1280x720", 0)
	resolution_option.add_item("1366x768", 1)
	resolution_option.add_item("1600x900", 2)
	resolution_option.add_item("1920x1080", 3)
	resolution_option.add_item("2560x1440", 4)
	resolution_option.selected = 0

	model_option.clear()
	model_option.add_item("辉夜姬", 0)
	model_option.add_item("彩叶", 1)
	model_option.add_item("八千代", 2)
	model_option.selected = 0

	volume_slider.value_changed.connect(_on_volume_changed)
	screen_mode_option.item_selected.connect(_on_screen_mode_changed)
	resolution_option.item_selected.connect(_on_resolution_changed)
	model_option.item_selected.connect(_on_model_changed)
	resume_button.pressed.connect(_on_resume_pressed)
	quit_button.pressed.connect(_on_quit_pressed)

	_on_volume_changed(volume_slider.value)

func _toggle_settings():
	if game_over:
		return
	if settings_overlay.visible:
		settings_overlay.visible = false
		get_tree().paused = false
	else:
		settings_overlay.visible = true
		get_tree().paused = true

func _on_resume_pressed():
	settings_overlay.visible = false
	get_tree().paused = false

func _on_quit_pressed():
	get_tree().quit()

func _on_volume_changed(value):
	var linear = clamp(value / 100.0, 0.0, 1.0)
	var bus = AudioServer.get_bus_index("Master")
	if linear <= 0.001:
		AudioServer.set_bus_volume_db(bus, -80.0)
	else:
		AudioServer.set_bus_volume_db(bus, linear_to_db(linear))

func _on_screen_mode_changed(index):
	if index == 0:
		DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_BORDERLESS, false)
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		_apply_resolution()
	elif index == 1:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_BORDERLESS, true)
		DisplayServer.window_set_size(DisplayServer.screen_get_size())
	else:
		DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_BORDERLESS, false)
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_EXCLUSIVE_FULLSCREEN)

func _on_resolution_changed(index):
	_apply_resolution()

func _on_model_changed(index):
	_apply_model(index)

func _apply_model(index):
	if index < 0 or index >= player_models.size():
		return
	player.set_model(player_models[index])

func _apply_resolution():
	if screen_mode_option.selected != 0:
		return
	var size = resolution_sizes[resolution_option.selected]
	DisplayServer.window_set_size(size)
