import { client, DEFAULT_MODEL } from "./openai.js";
import { tools, AVAILABLE_TOOLS } from "./toolRegistry.js";
import { spinner } from "../utils/spinner.js";

const SYSTEM_PROMPT = `你是單位換算助理。使用者問溫度、長度、重量換算時，請呼叫 convert_unit 工具取得結果，再用繁體中文簡潔回答。
支援：攝氏↔華氏、公里↔英里、公斤↔磅。不支援的單位請依工具回傳的 error 說明。`;

export class ChatManager {
  constructor() {
    this.messages = [{ role: "developer", content: SYSTEM_PROMPT }];
  }

  async handleUserMessage(userText) {
    this.messages.push({ role: "user", content: userText });

    while (true) {
      const spin = spinner("思考中...").start();

      const response = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: this.messages,
        tools,
        tool_choice: "auto",
      });

      spin.stop();

      const message = response.choices[0].message;
      this.messages.push(message);

      if (!message.tool_calls?.length) {
        return message.content ?? "";
      }

      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

        const fn = AVAILABLE_TOOLS[fnName];
        const result = fn ? await fn(args) : { error: `未知工具：${fnName}` };

        this.messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }
  }
}
