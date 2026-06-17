import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

const ALIASES = {
  c: "celsius",
  "°c": "celsius",
  celsius: "celsius",
  攝氏: "celsius",
  度c: "celsius",
  f: "fahrenheit",
  "°f": "fahrenheit",
  fahrenheit: "fahrenheit",
  華氏: "fahrenheit",
  度f: "fahrenheit",
  km: "km",
  kilometer: "km",
  kilometers: "km",
  公里: "km",
  mile: "mile",
  miles: "mile",
  英里: "mile",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  公斤: "kg",
  千克: "kg",
  lb: "lb",
  lbs: "lb",
  pound: "lb",
  pounds: "lb",
  磅: "lb",
};

function normalize(unit) {
  const key = String(unit).trim().toLowerCase();
  return ALIASES[key] ?? key;
}

function convertValue(value, from, to) {
  if (from === to) return value;

  if (from === "celsius" && to === "fahrenheit") {
    return (value * 9) / 5 + 32;
  }
  if (from === "fahrenheit" && to === "celsius") {
    return ((value - 32) * 5) / 9;
  }

  if (from === "km" && to === "mile") {
    return value * 0.621371;
  }
  if (from === "mile" && to === "km") {
    return value / 0.621371;
  }

  if (from === "kg" && to === "lb") {
    return value * 2.20462;
  }
  if (from === "lb" && to === "kg") {
    return value / 2.20462;
  }

  return null;
}

async function convertUnit({ value, from_unit, to_unit }) {
  const from = normalize(from_unit);
  const to = normalize(to_unit);
  const result = convertValue(value, from, to);

  if (result === null) {
    return {
      error: `不支援的單位組合：${from_unit} → ${to_unit}（僅支援 攝氏↔華氏、公里↔英里、公斤↔磅）`,
    };
  }

  return {
    value,
    from_unit,
    to_unit,
    result: Number(result.toFixed(6)),
  };
}

export const convertUnitTool = defineTool({
  name: "convert_unit",
  description: "進行單位換算（攝氏↔華氏、公里↔英里、公斤↔磅）",
  fn: convertUnit,
  parameters: z.object({
    value: z.number().describe("要換算的數值，例如 25"),
    from_unit: z.string().describe("原始單位，例如 C、km、kg"),
    to_unit: z.string().describe("目標單位，例如 F、mile、lb"),
  }),
});
