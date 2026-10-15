// iOS シミュレータに入っている読み上げの声を一覧にする（話せるシリーズの言語選び用・2026-10-15）
import AVFoundation
let vs = AVSpeechSynthesisVoice.speechVoices()
let langs = Set(vs.map { $0.language }).sorted()
print("voices:", vs.count, "languages:", langs.count)
print(langs.joined(separator: " "))
for code in ["sk-SK", "hr-HR", "sr-RS", "bg-BG", "ca-ES", "sl-SI", "lt-LT", "kk-KZ", "bn-IN", "bn-BD", "ta-IN", "te-IN", "kn-IN",
             "fil-PH", "ne-NP", "my-MM", "mn-MN", "fa-IR", "sw-KE", "si-LK", "km-KH", "hi-IN", "he-IL", "uk-UA"] {
    let v = AVSpeechSynthesisVoice(language: code)
    print(code, v.map { "\($0.name) [\($0.language)] q=\($0.quality.rawValue)" } ?? "-")
}
