# 塔罗牌图片生成脚本
# 生成78张SVG格式的Rider-Waite风格塔罗牌

$outputBase = "C:\Users\Administrator\.qclaw\workspace\enterprise\tarot-miniprogram\static\tarot-cards"

# 大阿卡纳 (22张)
$majorArcana = @(
    @{id="the_fool"; num=0; name="愚人"; theme="新开始"; symbol="太阳"},
    @{id="the_magician"; num=1; name="魔术师"; theme="创造"; symbol="星星"},
    @{id="the_high_priestess"; num=2; name="女祭司"; theme="直觉"; symbol="月亮"},
    @{id="the_empress"; num=3; name="女皇"; theme="丰盛"; symbol="星星"},
    @{id="the_emperor"; num=4; name="皇帝"; theme="权威"; symbol="太阳"},
    @{id="the_hierophant"; num=5; name="教皇"; theme="传统"; symbol="星星"},
    @{id="the_lovers"; num=6; name="恋人"; theme="爱情"; symbol="星星"},
    @{id="the_chariot"; num=7; name="战车"; theme="胜利"; symbol="星星"},
    @{id="strength"; num=8; name="力量"; theme="勇气"; symbol="星星"},
    @{id="the_hermit"; num=9; name="隐士"; theme="内省"; symbol="星星"},
    @{id="wheel_of_fortune"; num=10; name="命运之轮"; theme="循环"; symbol="星星"},
    @{id="justice"; num=11; name="正义"; theme="平衡"; symbol="星星"},
    @{id="the_hanged_man"; num=12; name="倒吊人"; theme="牺牲"; symbol="星星"},
    @{id="death"; num=13; name="死神"; theme="结束"; symbol="星星"},
    @{id="temperance"; num=14; name="节制"; theme="调和"; symbol="星星"},
    @{id="the_devil"; num=15; name="恶魔"; theme="束缚"; symbol="星星"},
    @{id="the_tower"; num=16; name="塔"; theme="变革"; symbol="星星"},
    @{id="the_star"; num=17; name="星星"; theme="希望"; symbol="星星"},
    @{id="the_moon"; num=18; name="月亮"; theme="幻觉"; symbol="星星"},
    @{id="the_sun"; num=19; name="太阳"; theme="快乐"; symbol="星星"},
    @{id="judgement"; num=20; name="审判"; theme="觉醒"; symbol="星星"},
    @{id="the_world"; num=21; name="世界"; theme="完成"; symbol="星星"}
)

Write-Host "开始生成78张塔罗牌SVG..."

# 大阿卡纳颜色主题
$majorColors = @(
    @{bg="#1a1a2e"; accent="#f0c674"},  # 愚人 - 黄色
    @{bg="#16213e"; accent="#e94560"},  # 魔术师 - 红色
    @{bg="#1a1a2e"; accent="#9b59b6"},  # 女祭司 - 紫色
    @{bg="#1a1a2e"; accent="#27ae60"},  # 女皇 - 绿色
    @{bg="#1a1a2e"; accent="#e67e22"},  # 皇帝 - 橙色
    @{bg="#1a1a2e"; accent="#8e44ad"},  # 教皇 - 深紫
    @{bg="#1a1a2e"; accent="#3498db"},  # 恋人 - 蓝色
    @{bg="#1a1a2e"; accent="#c0392b"},  # 战车 - 深红
    @{bg="#1a1a2e"; accent="#f39c12"},  # 力量 - 金色
    @{bg="#1a1a2e"; accent="#95a5a6"},  # 隐士 - 灰色
    @{bg="#1a1a2e"; accent="#9b59b6"},  # 命运之轮 - 紫色
    @{bg="#1a1a2e"; accent="#f1c40f"},  # 正义 - 黄色
    @{bg="#1a1a2e"; accent="#3498db"},  # 倒吊人 - 蓝色
    @{bg="#1a1a2e"; accent="#2c3e50"},  # 死神 - 深灰
    @{bg="#1a1a2e"; accent="#1abc9c"},  # 节制 - 青色
    @{bg="#1a1a2e"; accent="#e74c3c"},  # 恶魔 - 红色
    @{bg="#1a1a2e"; accent="#e74c3c"},  # 塔 - 红色
    @{bg="#1a1a2e"; accent="#3498db"},  # 星星 - 蓝色
    @{bg="#1a1a2e"; accent="#9b59b6"},  # 月亮 - 紫色
    @{bg="#1a1a2e"; accent="#f39c12"},  # 太阳 - 金色
    @{bg="#1a1a2e"; accent="#e67e22"},  # 审判 - 橙色
    @{bg="#1a1a2e"; accent="#27ae60"}   # 世界 - 绿色
)

$colorIndex = 0
foreach ($card in $majorArcana) {
    $svg = @"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 350">
  <defs>
    <linearGradient id="bg_$($card.id)" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:$($majorColors[$colorIndex].bg);stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0f1a;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow_$($card.id)" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:$($majorColors[$colorIndex].accent);stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:$($majorColors[$colorIndex].accent);stop-opacity:0" />
    </radialGradient>
  </defs>
  <!-- Card Background -->
  <rect width="200" height="350" rx="15" fill="url(#bg_$($card.id))"/>
  <rect width="200" height="350" rx="15" fill="url(#glow_$($card.id))"/>
  <!-- Border -->
  <rect x="5" y="5" width="190" height="340" rx="12" fill="none" stroke="$($majorColors[$colorIndex].accent)" stroke-width="2"/>
  <!-- Card Number (top left) -->
  <text x="15" y="30" font-family="Georgia, serif" font-size="18" fill="$($majorColors[$colorIndex].accent)">$($card.num)</text>
  <!-- Card Name (bottom) -->
  <text x="100" y="335" font-family="Georgia, serif" font-size="14" fill="white" text-anchor="middle">$($card.name)</text>
  <!-- Roman Numeral (top right) -->
  <text x="185" y="30" font-family="Georgia, serif" font-size="14" fill="$($majorColors[$colorIndex].accent)" text-anchor="end">
"@

    $romanNumerals = @("0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI")
    $svg += $romanNumerals[$card.num]

    $svg += @"</text>
  <!-- Center Symbol -->
  <g transform="translate(100, 175)">
    <!-- Mystic Circle -->
    <circle r="55" fill="none" stroke="$($majorColors[$colorIndex].accent)" stroke-width="1" opacity="0.5"/>
    <circle r="45" fill="none" stroke="$($majorColors[$colorIndex].accent)" stroke-width="0.5" opacity="0.3"/>
    <!-- Card-specific symbol (simplified Rider-Waite style) -->
    <text x="0" y="5" font-family="Georgia, serif" font-size="40" fill="$($majorColors[$colorIndex].accent)" text-anchor="middle">
"@

    # 每个大阿卡纳的符号
    $symbols = @{
        "the_fool" = "☉"
        "the_magician" = "☿"
        "the_high_priestess" = "☽"
        "the_empress" = "♀"
        "the_emperor" = "♂"
        "the_hierophant" = "✝"
        "the_lovers" = "☌"
        "the_chariot" = "⚜"
        "strength" = "♌"
        "the_hermit" = "☯"
        "wheel_of_fortune" = "☸"
        "justice" = "⚖"
        "the_hanged_man" = "⊥"
        "death" = "✳"
        "temperance" = "△"
        "the_devil" = "⛧"
        "the_tower" = "⚡"
        "the_star" = "★"
        "the_moon" = "☾"
        "the_sun" = "☼"
        "judgement" = "⚚"
        "the_world" = "◯"
    }
    $svg += $symbols[$card.id]

    $svg += @"</text>
  </g>
  <!-- Decorative stars -->
  <circle cx="30" cy="60" r="2" fill="$($majorColors[$colorIndex].accent)" opacity="0.5"/>
  <circle cx="170" cy="80" r="1.5" fill="$($majorColors[$colorIndex].accent)" opacity="0.4"/>
  <circle cx="40" cy="280" r="1" fill="$($majorColors[$colorIndex].accent)" opacity="0.3"/>
  <circle cx="160" cy="250" r="1.5" fill="$($majorColors[$colorIndex].accent)" opacity="0.4"/>
</svg>"@

    $filePath = "$outputBase\major-arcana\$($card.id).svg"
    [System.IO.File]::WriteAllText($filePath, $svg, [System.Text.Encoding]::UTF8)
    Write-Host "生成: major-arcana/$($card.id).svg"
    $colorIndex++
}

Write-Host "大阿卡纳 22 张完成！"