shader_type canvas_item;

uniform float pixel_size = 4.0;

void fragment() {
  vec2 uv = UV;
  vec2 tex_size = vec2(textureSize(TEXTURE, 0));
  vec2 px = vec2(pixel_size) / tex_size;
  uv = floor(uv / px) * px + px * 0.5;
  COLOR = texture(TEXTURE, uv);
}
