import { input } from "@inquirer/prompts";
import { OPENAI_API_KEY } from "./config.js";
import { ChatManager } from "./lib/ChatManager.js";

if (!OPENAI_API_KEY) {
  console.error("請在 .env 設定 OPENAI_API_KEY（可複製 .env.example）");
  process.exit(1);
}

const chat = new ChatManager();

console.log("單位換算助手 — 輸入 exit 結束\n");
console.log("測試範例：");
console.log("  • 25 度 C 是華氏幾度？");
console.log("  • 10 公里等於幾英里？");
console.log("  • 70 公斤是幾磅？\n");

try {
  while (true) {
    const userQuestion = (await input({ message: "請輸入你的問題：" })).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const reply = await chat.handleUserMessage(userQuestion);
    console.log(`\n${reply}\n`);
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
