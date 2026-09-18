$ErrorActionPreference = 'Stop'
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$out = Join-Path $root 'RODOS2_User_Manual.pptx'
$shot = Join-Path $root 'manual_ui.png'
$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = -1
$deck = $ppt.Presentations.Add()
$deck.PageSetup.SlideSize = 15

$navy = 0x352716
$blue = 0xD36A24
$light = 0xF7F4EF
$ink = 0x292929
$muted = 0x777777
$green = 0x59944D
$orange = 0x2C82E8
$white = 0xFFFFFF

function Add-Text($slide, $text, $x, $y, $w, $h, $size=20, $color=$ink, $bold=$false, $align=1) {
    $s = $slide.Shapes.AddTextbox(1,$x,$y,$w,$h)
    $s.TextFrame.TextRange.Text = $text
    $s.TextFrame.TextRange.Font.Name = '맑은 고딕'
    $s.TextFrame.TextRange.Font.Size = $size
    $s.TextFrame.TextRange.Font.Color.RGB = $color
    $s.TextFrame.TextRange.Font.Bold = [int]$bold
    $s.TextFrame.TextRange.ParagraphFormat.Alignment = $align
    $s.TextFrame.MarginLeft = 4; $s.TextFrame.MarginRight = 4
    return $s
}
function Add-Box($slide,$x,$y,$w,$h,$fill=$white,$line=$blue,$radius=$true) {
    $kind = if($radius){5}else{1}
    $s=$slide.Shapes.AddShape($kind,$x,$y,$w,$h)
    $s.Fill.ForeColor.RGB=$fill; $s.Line.ForeColor.RGB=$line; $s.Line.Weight=1.25
    return $s
}
function Add-Header($slide,$title,$section='RODOS2 USER MANUAL') {
    $bar=$slide.Shapes.AddShape(1,0,0,960,50); $bar.Fill.ForeColor.RGB=$navy; $bar.Line.Visible=0
    Add-Text $slide $section 28 13 270 24 11 $white $true | Out-Null
    Add-Text $slide $title 28 68 890 48 25 $navy $true | Out-Null
    $ln=$slide.Shapes.AddShape(1,28,118,75,4); $ln.Fill.ForeColor.RGB=$blue; $ln.Line.Visible=0
}
function Add-Footer($slide,$n) {
    Add-Text $slide 'ISO 22166 기반 Information Model Editor' 28 515 500 18 9 $muted | Out-Null
    Add-Text $slide ([string]$n) 900 515 30 18 9 $muted $false 3 | Out-Null
}
function Add-Bullets($slide,$items,$x=55,$y=150,$w=850,$size=18,$gap=48) {
    $i=0
    foreach($item in $items){
        $c=$slide.Shapes.AddShape(9,$x,$y+$i*$gap+5,12,12); $c.Fill.ForeColor.RGB=$blue; $c.Line.Visible=0
        Add-Text $slide $item ($x+24) ($y+$i*$gap) ($w-24) 38 $size $ink | Out-Null
        $i++
    }
}
function New-Slide($title,$section='RODOS2 USER MANUAL') {
    $s=$deck.Slides.Add($deck.Slides.Count+1,12)
    $s.Background.Fill.ForeColor.RGB=$light
    Add-Header $s $title $section
    Add-Footer $s $deck.Slides.Count
    return $s
}
function Add-Step($slide,$n,$title,$body,$x,$y,$w=265) {
    Add-Box $slide $x $y $w 105 $white 0xDDDDDD | Out-Null
    $c=$slide.Shapes.AddShape(9,$x+14,$y+14,30,30); $c.Fill.ForeColor.RGB=$blue; $c.Line.Visible=0
    Add-Text $slide ([string]$n) ($x+14) ($y+17) 30 24 14 $white $true 2 | Out-Null
    Add-Text $slide $title ($x+54) ($y+12) ($w-66) 28 16 $navy $true | Out-Null
    Add-Text $slide $body ($x+18) ($y+50) ($w-36) 45 12 $ink | Out-Null
}

# 1 Cover
$s=$deck.Slides.Add(1,12); $s.Background.Fill.ForeColor.RGB=$navy
$accent=$s.Shapes.AddShape(1,0,0,18,540); $accent.Fill.ForeColor.RGB=$blue; $accent.Line.Visible=0
Add-Text $s 'RODOS2' 64 95 500 50 20 $blue $true | Out-Null
Add-Text $s "Information Model Editor`n사용자 매뉴얼" 64 150 800 145 34 $white $true | Out-Null
Add-Text $s 'New IM · Canvas Composition · Mapping · Execute' 68 320 720 35 17 0xDDDDDD | Out-Null
Add-Text $s 'Robot → Controller → Software 구성 및 정보 유지 가이드' 68 375 760 30 15 $white | Out-Null
Add-Text $s 'Version 1.0  |  2026.08' 68 470 300 20 10 0xBBBBBB | Out-Null

$s=New-Slide '이 매뉴얼에서 다루는 작업'; Add-Bullets $s @('New IM으로 Software / Controller / Robot 생성','Properties·I/O·Services 선택 및 직접 입력','Controller에 Software를 연결하고 묶음 상태로 유지','Controller를 Robot에 연결하고 다중 Controller 구성','저장·불러오기·HW Mapping·Validation·Execute') 55 145 850 17 58

$s=New-Slide '권장 정보 모델 구조' '01. CONCEPT'
Add-Box $s 75 165 810 250 $white 0xDDDDDD | Out-Null
$r=Add-Box $s 110 205 180 150 0xEDE6FA $blue; Add-Text $s 'ROBOT' 145 260 110 30 22 $navy $true 2 | Out-Null
Add-Text $s '→' 306 250 45 40 28 $blue $true 2 | Out-Null
$c=Add-Box $s 365 185 210 190 0xE8F1FF $blue; Add-Text $s "CONTROLLER A`nCONTROLLER B" 395 245 150 65 18 $navy $true 2 | Out-Null
Add-Text $s '→' 590 250 45 40 28 $blue $true 2 | Out-Null
$m=Add-Box $s 650 185 190 190 0xEDF7EC $green; Add-Text $s "SOFTWARE 1`nSOFTWARE 2`nSOFTWARE 3" 675 225 140 95 16 $navy $true 2 | Out-Null
Add-Text $s 'Robot 직속 Software와 Controller 하위 Software를 모두 사용할 수 있습니다.' 130 440 700 25 15 $ink $true 2 | Out-Null

$s=New-Slide '전체 화면 구성' '02. GETTING STARTED'
if(Test-Path $shot){$s.Shapes.AddPicture($shot,0,-1,38,142,650,365)|Out-Null}
Add-Box $s 715 145 205 350 $white 0xDDDDDD | Out-Null
Add-Text $s "① 상단 메뉴`nFile / Edit / View / Launch`n`n② Workspace`n등록·생성된 IM 탐색`n`n③ Canvas`nRobot·Controller·Software 배치`n`n④ Wizard`n속성 선택·직접 입력" 735 170 170 285 15 $ink | Out-Null

$s=New-Slide 'New IM 메뉴' '03. NEW IM'
Add-Step $s 1 'File 열기' '상단 File 메뉴를 선택합니다.' 55 165
Add-Step $s 2 'New IM 선택' 'Software, Recognition, Controller, Robot 중 유형을 선택합니다.' 347 165
Add-Step $s 3 'Wizard 작성' '단계별 정보를 입력하고 마지막 Check에서 완료합니다.' 639 165
Add-Box $s 120 330 720 110 0xFFF7EA $orange | Out-Null
Add-Text $s '권장 순서' 145 350 120 28 17 $navy $true | Out-Null
Add-Text $s 'Software 생성 → Controller에서 Software 연결 → Robot에서 Controller 연결' 145 385 650 28 18 $ink $true | Out-Null

$s=New-Slide 'New Software 생성' '03. NEW IM'
Add-Bullets $s @('General Information에서 이름·제조사·설명을 입력합니다.','IDnType에서 Software 유형과 Module ID를 확인합니다.','Properties / IOVariables / Services는 직접 입력할 수 있습니다.','Executable Form에서 실행 파일, 인자, 환경 설정을 확인합니다.','Check 단계에서 누락 항목을 확인한 뒤 저장합니다.') 55 145 850 16 57

$s=New-Slide 'New Controller 생성' '03. NEW IM'
Add-Step $s 1 '기본 정보' 'Controller 이름과 Module ID를 설정합니다.' 55 155
Add-Step $s 2 'Software 연결' 'IDnType의 swAspects에서 사용할 Software를 선택합니다.' 347 155
Add-Step $s 3 '정보 선택' 'Controller별 Properties, I/O, Services를 선택합니다.' 639 155
Add-Box $s 80 310 800 130 0xE8F1FF $blue | Out-Null
Add-Text $s '유지되는 정보' 105 330 150 25 16 $navy $true | Out-Null
Add-Text $s "Properties · I/O · Services · OS · Compiler/Execution · Libraries · Organization`nController를 Robot으로 이동해도 선택 정보와 Software 목록이 함께 유지됩니다." 105 365 720 55 15 $ink | Out-Null

$s=New-Slide 'Properties · I/O · Services 입력 방식' '03. NEW IM'
Add-Box $s 55 155 400 280 $white $blue | Out-Null; Add-Text $s 'Registry에서 가져오기' 85 180 335 30 20 $blue $true 2 | Out-Null
Add-Bullets $s @('연결된 Software/Controller별 항목 펼치기','필요한 항목을 클릭하여 선택','전체 가져오기 후 불필요한 항목 제거') 85 235 335 14 55
Add-Box $s 505 155 400 280 $white $green | Out-Null; Add-Text $s '직접 입력' 535 180 335 30 20 $green $true 2 | Out-Null
Add-Bullets $s @('Add 버튼으로 새 항목 생성','이름·Type·Unit·Value 직접 작성','가져온 항목과 직접 입력 항목 병행 가능') 535 235 335 14 55

$s=New-Slide 'OS · Compiler · Libraries · Organization' '03. NEW IM'
Add-Bullets $s @('OS: 지원 운영체제 및 버전 정보를 설정합니다.','Compiler/Execution: 컴파일러, 런타임, 실행 환경 정보를 반영합니다.','Libraries: Controller 또는 Software가 요구하는 라이브러리를 선택합니다.','Organization: 제조사·조직·관리 주체 관련 정보를 기록합니다.','선택 버튼의 활성 색상으로 적용 여부를 확인합니다.') 55 145 850 16 58

$s=New-Slide 'New Robot 생성과 Controller 선택' '03. NEW IM'
Add-Step $s 1 'Robot 생성' 'File → New IM → Robot을 선택합니다.' 55 155
Add-Step $s 2 'Controllers 선택' 'IDnType의 Linked Controllers에서 하나 이상 선택합니다.' 347 155
Add-Step $s 3 'Controller별 설정' '각 Controller를 펼쳐 가져올 속성과 기능을 선택합니다.' 639 155
Add-Box $s 110 325 740 95 0xFFF7EA $orange | Out-Null
Add-Text $s 'Controller가 2개 이상이어도 각각의 선택 상태를 독립적으로 유지해야 합니다.' 145 352 670 30 18 $ink $true 2 | Out-Null

$s=New-Slide 'Canvas에 모듈 배치' '04. CANVAS'
Add-Bullets $s @('Workspace/Registry에서 Robot을 Canvas로 드래그합니다.','Controller를 Canvas로 드래그하여 독립적으로 구성할 수 있습니다.','Software는 Canvas 바닥이 아니라 Robot 또는 Controller 위에 놓습니다.','도형: Robot=육각형, Controller=사각형, Software=원','모듈을 이동한 후 저장 상태가 서버에 동기화되는지 확인합니다.') 55 145 850 16 57

$s=New-Slide 'Controller에 Software 연결' '04. CANVAS'
Add-Step $s 1 'Software 선택' 'Registry에서 Software를 드래그합니다.' 55 150
Add-Step $s 2 'Controller에 드롭' 'Controller 사각형 중앙에 놓습니다.' 347 150
Add-Step $s 3 '선택 확인' '연결 Wizard에서 필요한 정보를 선택하고 완료합니다.' 639 150
Add-Box $s 210 320 540 105 0xEDF7EC $green | Out-Null
Add-Text $s "Controller A`n ├ Software 1`n └ Software 2" 350 337 260 70 17 $navy $true | Out-Null

$s=New-Slide 'Software가 포함된 Controller를 Robot에 연결' '04. CANVAS'
Add-Box $s 65 160 350 230 $white $blue | Out-Null; Add-Text $s "이동 전`n`nController A`n├ Software 1`n└ Software 2" 120 190 250 150 18 $ink $true 2 | Out-Null
Add-Text $s '→' 450 245 60 50 34 $blue $true 2 | Out-Null
Add-Box $s 545 160 350 230 $white $green | Out-Null; Add-Text $s "이동 후`n`nRobot`n└ Controller A`n   ├ Software 1`n   └ Software 2" 600 185 250 175 17 $ink $true 2 | Out-Null
Add-Text $s 'Controller를 Robot 중앙으로 이동하고 “Linked to [Robot]” 표시를 확인합니다.' 120 425 720 30 16 $navy $true 2 | Out-Null

$s=New-Slide '다중 Controller 구성' '04. CANVAS'
Add-Box $s 90 155 780 270 $white 0xDDDDDD | Out-Null
Add-Text $s 'ROBOT' 125 260 120 35 22 $navy $true 2 | Out-Null
Add-Text $s "Controller A`n├ SW 1`n└ SW 2" 340 190 180 100 17 $blue $true 2 | Out-Null
Add-Text $s "Controller B`n└ SW 3" 650 210 160 80 17 $green $true 2 | Out-Null
$l1=$s.Shapes.AddLine(245,275,335,240);$l1.Line.ForeColor.RGB=$blue;$l1.Line.EndArrowheadStyle=3
$l2=$s.Shapes.AddLine(245,285,645,250);$l2.Line.ForeColor.RGB=$green;$l2.Line.EndArrowheadStyle=3
Add-Text $s '각 Controller는 자신의 Software 및 선택 정보를 독립적으로 유지합니다.' 150 450 660 25 16 $ink $true 2 | Out-Null

$s=New-Slide '저장과 다시 열기' '05. SAVE & LOAD'
Add-Bullets $s @('Save 또는 Save As로 Configuration을 저장합니다.','Controller에는 parentRobotRef가 저장되어 Robot 연결 관계가 유지됩니다.','Open으로 Configuration을 다시 불러온 뒤 모듈 개수와 연결 표시를 확인합니다.','New Configuration은 현재 Canvas를 초기화하므로 저장 여부를 먼저 확인합니다.','서버 Java 모델 변경 후에는 서버를 재시작해야 합니다.') 55 145 850 16 57

$s=New-Slide 'HW Mapping과 Simulation Mapping' '06. RUN'
Add-Box $s 55 155 400 260 $white $blue | Out-Null; Add-Text $s '실제 HW 실행' 90 185 330 30 20 $blue $true 2 | Out-Null
Add-Bullets $s @('Mapping with HW 열기','Robot의 Docker Agent target(IP) 선택','연결된 Controller는 Robot target 상속') 85 245 335 14 55
Add-Box $s 505 155 400 260 $white $green | Out-Null; Add-Text $s 'Simulation 실행' 540 185 330 30 20 $green $true 2 | Out-Null
Add-Bullets $s @('Mapping with Simulation 열기','Simulation HW 선택','Robot별 namespace 및 pose 확인') 535 245 335 14 55

$s=New-Slide 'Validation과 Execute' '06. RUN'
Add-Step $s 1 '상태 저장' '최신 Canvas 상태가 서버에 저장되었는지 확인합니다.' 55 155
Add-Step $s 2 'Validation' 'Robot, Software, moduleID, target 구성을 검사합니다.' 347 155
Add-Step $s 3 'Execute' '검증 통과 후 실제 실행 요청을 전송합니다.' 639 155
Add-Box $s 100 330 760 100 0xE8F1FF $blue | Out-Null
Add-Text $s '실행 대상 = Robot 직속 Software + 연결된 모든 Controller의 Software' 140 362 680 28 18 $navy $true 2 | Out-Null

$s=New-Slide '자주 발생하는 문제' '07. TROUBLESHOOTING'
Add-Text $s "증상" 55 150 210 28 16 $white $true 2 | Out-Null; $h=$s.Shapes.AddShape(1,55,145,210,40);$h.Fill.ForeColor.RGB=$navy;$h.Line.Visible=0;$h.ZOrder(1)
Add-Text $s "확인 사항" 265 150 640 28 16 $white $true 2 | Out-Null; $h=$s.Shapes.AddShape(1,265,145,640,40);$h.Fill.ForeColor.RGB=$navy;$h.Line.Visible=0;$h.ZOrder(1)
$rows=@(@('Execute가 동작하지 않음','SW 모듈 수, moduleID, HW target, 서버 저장 상태 확인'),@('Controller가 Robot에 안 붙음','Controller 중심을 Robot 중앙에 놓고 Linked 표시 확인'),@('선택 정보가 사라짐','Wizard 완료 후 Save, Open 후 parentRobotRef 확인'),@('화면이 이전 버전임','npm run build → 서버 재시작 → Ctrl+F5'),@('빌드 경고 표시','DEP0176/Browserslist는 경고이며 빌드 실패와 구분'))
$y=185;foreach($row in $rows){Add-Box $s 55 $y 210 55 $white 0xDDDDDD $false|Out-Null;Add-Box $s 265 $y 640 55 $white 0xDDDDDD $false|Out-Null;Add-Text $s $row[0] 65 ($y+13) 190 28 13 $ink $true|Out-Null;Add-Text $s $row[1] 280 ($y+13) 610 30 13 $ink|Out-Null;$y+=55}

$s=New-Slide '권장 작업 체크리스트' '08. CHECKLIST'
Add-Bullets $s @('□ Software IM 생성 및 Module ID 확인','□ Controller 생성 후 Software 연결·정보 선택','□ Robot 생성 후 필요한 Controller 복수 선택','□ Canvas에서 Controller와 Software 구성 확인','□ Controller를 Robot에 연결하고 Linked 표시 확인','□ Save → Mapping → Validation → Execute 순서 준수') 55 140 850 17 52

$s=New-Slide '완료' 'RODOS2 USER MANUAL'
Add-Text $s '안전한 구성 원칙' 80 165 800 38 24 $blue $true 2 | Out-Null
Add-Text $s "정보는 선택 단계에서 명시적으로 구성하고,`nController를 이동할 때는 Software와 선택 정보를 하나의 묶음으로 유지합니다." 115 235 730 90 22 $navy $true 2 | Out-Null
Add-Text $s 'Robot → Controller → Software' 230 375 500 42 26 $green $true 2 | Out-Null

$deck.SaveAs($out,24)
$deck.Close(); $ppt.Quit()
[Runtime.InteropServices.Marshal]::ReleaseComObject($deck) | Out-Null
[Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Output $out
