import { TextStyle } from "react-native";

// 学習言語の文字に当てるフォント。中国語は PingFang SC にしないと、
// 日本語設定の iPhone では簡体字が日本語の字形（直・骨・教 など）で表示される。
export const TARGET_FONT = "PingFang SC";
export const targetFont: TextStyle = { fontFamily: TARGET_FONT };
