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
const WALL_INTERVAL_MIN = 1.32
const WALL_INTERVAL_MAX = 2.28

const ENEMY_HP_GROWTH_STEP_SEC = 12.0
const ENEMY_HP_GROWTH_MAX = 30

const SETTINGS_FILE_PATH = "user://player_settings.cfg"
const DEFAULT_VOLUME_VALUE = 70.0

var stage_index = 0
var stage_kills = 0
var total_kills = 0
var boss_spawned = false
var boss_alive = false
var game_over = false
var final_stage = false

var message_time = 0.0
var elapsed_time = 0.0

var settings_file = ConfigFile.new()
var is_loading_settings = false
var current_volume_value = DEFAULT_VOLUME_VALUE
var current_model_index = 0
var current_screen_mode_index = 0
var current_resolution_index = 0

var EnemyScene = preload("res://scenes/Enemy.tscn")
var ShooterEnemyScene = preload("res://scenes/ShooterEnemy.tscn")
var BossScene = preload("res://scenes/FinalBoss.tscn")
var BulletScene = preload("res://scenes/Bullet.tscn")
var EnemyBulletScene = preload("res://scenes/EnemyBullet.tscn")
var WallScene = preload("res://scenes/BuffWall.tscn")
var OrbScene = preload("res://scenes/BuffOrb.tscn")

var player_models = [
    preload("res://assets/sprites/kaguya.png"),
    preload("res://assets/sprites/iroha.png"),
    preload("res://assets/sprites/yachiyo.png")
]

var player_model_names = [
    "辉夜姬",
    "彩叶",
    "八千代"
]

var player_model_flip_h = [
    false,
    true,
    false
]

var resolution_sizes = [
    Vector2i(1280, 720),
    Vector2i(1366, 768),
    Vector2i(1600, 900),
    Vector2i(1920, 1080),
    Vector2i(2560, 1440)
]

var resolution_labels = [
    "1280x720",
    "1366x768",
    "1600x900",
    "1920x1080",
    "2560x1440"
]

var bgm_tracks = []
var bgm_queue = []

func _ready():
    randomize()
    player.game = self
    player.global_position = Vector2(200, 360)
    enemy_timer.timeout.connect(_on_enemy_timer_timeout)
    wall_timer.timeout.connect(_on_wall_timer_timeout)
    orb_timer.timeout.connect(_on_orb_timer_timeout)

    settings_overlay.visible = false
    death_overlay.visible = false
    message_bg.visible = false

    _setup_settings()
    _init_bgm()
    _apply_stage_settings()

    enemy_timer.start()
    wall_timer.start()
    orb_timer.start()

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
    wall_timer.wait_time = 1.56
    orb_timer.wait_time = 3.5
    if final_stage:
        stage_label.text = "最终关"
    else:
        stage_label.text = "关卡：" + stage["name"]

func _update_hud():
    if game_over:
        return
    var stage = stages[stage_index]
    if final_stage:
        stage_label.text = "最终关"
    else:
        stage_label.text = "关卡：" + stage["name"]
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
    if game_over or boss_spawned:
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
    wall_timer.wait_time = randf_range(WALL_INTERVAL_MIN, WALL_INTERVAL_MAX)
    wall_timer.start()

func _on_orb_timer_timeout():
    if game_over:
        return
    var orb = OrbScene.instantiate()
    orb.global_position = Vector2(ORB_SPAWN_X, randf_range(160.0, 620.0))
    orb.speed = stages[stage_index]["enemy_speed"] * 0.9
    var roll = randi() % 4
    if roll == 0:
        var value_a = 1 + randi() % 2
        orb.buff_type = "attack"
        orb.buff_value = value_a
        orb.buff_text = "攻击+" + str(value_a)
    elif roll == 1:
        var value_s = 1 + randi() % 2
        orb.buff_type = "attack_speed"
        orb.buff_value = float(value_s)
        orb.buff_text = "攻速+" + str(value_s)
    elif roll == 2:
        var value_c = 0.05 + float(randi() % 3) * 0.05
        orb.buff_type = "crit"
        orb.buff_value = value_c
        orb.buff_text = "暴击率+" + str(int(value_c * 100)) + "%"
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
    boss.set_stats(BOSS_HP + boss_bonus, BOSS_SPEED, true)
    boss.game = self
    enemies.add_child(boss)
    show_message("终极Boss出现！")

func on_player_hit(amount):
    if game_over:
        return
    player.take_damage(amount)
    if not player.is_dead:
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
    _save_settings()
    get_tree().reload_current_scene()

func spawn_enemy_bullet(origin):
    if game_over:
        return
    var bullet = EnemyBulletScene.instantiate()
    bullet.global_position = origin
    bullets.add_child(bullet)

func _show_end_screen(title_text):
    death_overlay.visible = true
    death_title.text = title_text
    var time_sec = int(elapsed_time)
    var minutes = time_sec / 60
    var seconds = time_sec % 60
    var stage_name = "最终关" if final_stage else stages[stage_index]["name"]
    death_stats.text = "存活时间：" + str(minutes) + "分" + str(seconds) + "秒\n" + \
        "当前关卡：" + stage_name + "\n" + \
        "总击败：" + str(total_kills)
    death_hint.text = "按 R 重开"
    message_label.text = ""
    message_bg.visible = false

func _get_time_hp_bonus():
    return min(ENEMY_HP_GROWTH_MAX, int(elapsed_time / ENEMY_HP_GROWTH_STEP_SEC))

func _init_bgm():
    _load_bgm_tracks()
    if bgm_tracks.is_empty():
        return
    bgm_queue = bgm_tracks.duplicate()
    bgm_queue.shuffle()
    if not bgm_player.finished.is_connected(_on_bgm_finished):
        bgm_player.finished.connect(_on_bgm_finished)
    _play_next_bgm()

func _load_bgm_tracks():
    bgm_tracks.clear()
    var dir = DirAccess.open("res://assets/audio")
    if dir == null:
        return
    dir.list_dir_begin()
    var file_name = dir.get_next()
    while file_name != "":
        if not dir.current_is_dir():
            var ext = file_name.get_extension().to_lower()
            if ext == "mp3" or ext == "ogg" or ext == "wav":
                var stream = load("res://assets/audio/" + file_name)
                if stream != null:
                    bgm_tracks.append(stream)
        file_name = dir.get_next()
    dir.list_dir_end()

func _on_bgm_finished():
    _play_next_bgm()

func _play_next_bgm():
    if bgm_tracks.is_empty():
        return
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
    screen_mode_option.selected = current_screen_mode_index

    resolution_option.clear()
    for idx in range(resolution_labels.size()):
        resolution_option.add_item(resolution_labels[idx], idx)
    resolution_option.selected = current_resolution_index

    model_option.clear()
    for idx in range(player_model_names.size()):
        model_option.add_item(player_model_names[idx], idx)
    model_option.selected = current_model_index

    volume_slider.value = current_volume_value

    if not volume_slider.value_changed.is_connected(_on_volume_changed):
        volume_slider.value_changed.connect(_on_volume_changed)
    if not screen_mode_option.item_selected.is_connected(_on_screen_mode_changed):
        screen_mode_option.item_selected.connect(_on_screen_mode_changed)
    if not resolution_option.item_selected.is_connected(_on_resolution_changed):
        resolution_option.item_selected.connect(_on_resolution_changed)
    if not model_option.item_selected.is_connected(_on_model_changed):
        model_option.item_selected.connect(_on_model_changed)
    if not resume_button.pressed.is_connected(_on_resume_pressed):
        resume_button.pressed.connect(_on_resume_pressed)
    if not quit_button.pressed.is_connected(_on_quit_pressed):
        quit_button.pressed.connect(_on_quit_pressed)

    _load_settings()

func _load_settings():
    is_loading_settings = true
    var load_result = settings_file.load(SETTINGS_FILE_PATH)
    if load_result == OK:
        current_volume_value = float(settings_file.get_value("audio", "volume", DEFAULT_VOLUME_VALUE))
        current_model_index = int(settings_file.get_value("player", "model_index", 0))
        current_screen_mode_index = int(settings_file.get_value("video", "screen_mode", 0))
        current_resolution_index = int(settings_file.get_value("video", "resolution_index", 0))

    current_volume_value = clamp(current_volume_value, 0.0, 100.0)
    if current_model_index < 0 or current_model_index >= player_models.size():
        current_model_index = 0
    current_screen_mode_index = clamp(current_screen_mode_index, 0, 2)
    current_resolution_index = clamp(current_resolution_index, 0, resolution_sizes.size() - 1)

    volume_slider.value = current_volume_value
    model_option.selected = current_model_index
    screen_mode_option.selected = current_screen_mode_index
    resolution_option.selected = current_resolution_index

    _on_volume_changed(current_volume_value)
    _on_screen_mode_changed(current_screen_mode_index)
    _apply_model(current_model_index)

    is_loading_settings = false
    if load_result != OK:
        _save_settings()

func _save_settings():
    settings_file.set_value("audio", "volume", current_volume_value)
    settings_file.set_value("player", "model_index", current_model_index)
    settings_file.set_value("video", "screen_mode", current_screen_mode_index)
    settings_file.set_value("video", "resolution_index", current_resolution_index)
    settings_file.save(SETTINGS_FILE_PATH)

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
    _save_settings()
    get_tree().quit()

func _on_volume_changed(value):
    current_volume_value = clamp(value, 0.0, 100.0)
    var linear = current_volume_value / 100.0
    var bus = AudioServer.get_bus_index("Master")
    if linear <= 0.001:
        AudioServer.set_bus_volume_db(bus, -80.0)
    else:
        AudioServer.set_bus_volume_db(bus, linear_to_db(linear))
    if not is_loading_settings:
        _save_settings()

func _on_screen_mode_changed(index):
    current_screen_mode_index = clamp(index, 0, 2)
    if current_screen_mode_index == 0:
        DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_BORDERLESS, false)
        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
        _apply_resolution()
    elif current_screen_mode_index == 1:
        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
        DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_BORDERLESS, true)
        DisplayServer.window_set_size(DisplayServer.screen_get_size())
    else:
        DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_BORDERLESS, false)
        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_EXCLUSIVE_FULLSCREEN)
    if not is_loading_settings:
        _save_settings()

func _on_resolution_changed(index):
    current_resolution_index = clamp(index, 0, resolution_sizes.size() - 1)
    _apply_resolution()
    if not is_loading_settings:
        _save_settings()

func _on_model_changed(index):
    _apply_model(index)
    if not is_loading_settings:
        _save_settings()

func _apply_model(index):
    if index < 0 or index >= player_models.size():
        return
    current_model_index = index
    var flip_h = false
    if index < player_model_flip_h.size():
        flip_h = player_model_flip_h[index]
    player.set_model(player_models[index], flip_h)

func _apply_resolution():
    if current_screen_mode_index != 0:
        return
    var size = resolution_sizes[current_resolution_index]
    DisplayServer.window_set_size(size)
