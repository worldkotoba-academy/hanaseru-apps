import { TextStyle } from "react-native";

// 学習言語の文字に当てるフォント。中国語は PingFang SC（簡体字）／PingFang TC（繁体字）にしないと、
// 日本語設定の iPhone では漢字が日本語の字形（直・骨・教 など）で表示される。
export const TARGET_FONT = "PingFang HK";
export const targetFont: TextStyle = { fontFamily: TARGET_FONT };
